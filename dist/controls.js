(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['Box', 'jQuery'], factory);
    } else {
        var exports = {};
        factory(Box, $);
    }
}(this, function (api, $) {
    var moment;

    api.UI = api.UI || {};

    function Control(element, options) {
        var self = this;
        this.cid = api._.uniqueId('view');
        this.$el = this.$el || $(element);

        this.options = this.options || $.extend({},
            api.UI.Control.defaults,
            this.$el.data(),
            options || {});

        this.p = this.p || Promise.resolve();
        this.p.then(function () {
            var old;
            if (!self.options.domLink) {
                return Promise.resolve();
            }
            old = self.$el.data(self.options.domLink);
            if (old && typeof old.destroy === 'function') {
                old.destroy(); // should decide to destroy
                //  old.$el.empty();
                if (self.options[self.options.domLink]) {
                    self.options[self.options.domLink] = null;
                }
            }
            self.$el.data(self.options.domLink, self);
        }).then(function () {
            return self.initialize();
        });
    }

    var delegateEventSplitter = /^(\S+)\s*(.*)$/;

    $.extend(Control.prototype, api.Events, {
        $: function (selector) {
            return this.$el.find(selector);
        },
        destroy: function () {
            this.trigger('destroy');
            this._removeElement();
            this.stopListening();
            return this.p;
        },
        _removeElement: function () {
            this.$el.remove();
        },
        initialize: function () {
            var self = this,
                pms = Array.prototype.slice.call(arguments);

            if (this.options.events) {
                this.delegateEvents(this.options.events);
            }

            if (this.options.controller) {
                this.p = this.p.then(function () {
                    return api.Utils.require(self.options.controller.src || self.options.controller)
                        .then(function (controller) {
                            if (typeof controller === 'function') {
                                self.controller = new controller(self);
                            } else if (controller && typeof controller.getController === 'function') {
                                // singleton
                                self.controller = controller.getController(self);
                            } else if (controller && typeof controller.init === 'function') {
                                controller.init.call(self, self.$el);
                            }
                        });
                });
            }
            return this.p.then(function () {
                self.trigger('initialized');
                return self.render.apply(self, pms);
            });
        },
        render: function () {
            this.trigger('rendered');
            return this.p;
        },
        show: function () {
            this.trigger('show');
            this.$el.show();
        },
        hide: function () {
            this.trigger('hide');
            this.$el.hide();
        },
        delegateEvents: function (events) {
            events = events || (events = api._.result(this, 'events'));
            if (!events) return this;
            this.undelegateEvents();
            for (var key in events) {
                var method = events[key];
                if (!api._.isFunction(method)) method = this[method];
                if (!method) continue;
                var match = key.match(delegateEventSplitter);
                this.delegate(match[1], match[2], api._.bind(method, this));
            }
            return this;
        },
        delegate: function (eventName, selector, listener) {
            this.$el.on(eventName + '.delegateEvents' + this.cid, selector, listener);
            this.on(eventName, listener);
            return this;
        },
        undelegateEvents: function () {
            if (this.$el) this.$el.off('.delegateEvents' + this.cid);
            this.off();
            return this;
        },
        undelegate: function (eventName, selector, listener) {
            this.$el.off(eventName + '.delegateEvents' + this.cid, selector, listener);
            this.off(eventName, listener);
            return this;
        },
        _setAttributes: function (attributes) {
            this.$el.attr(attributes);
        }
    });
    Control.prototype.constructor = Control;

    api.UI.Control = Control;

    api.UI.Control.defaults = {
        domLink: 'box.control',
        constructorClass: 'box.constructor'
    };

    function View(element, options) {
        this.$el = this.$el || $(element);
        this.options = this.options || $.extend({},
            api.UI.View.defaults,
            this.$el.data(),
            options || {});

        this.$container = this.$el.find(this.options.selectContainer);
        this.$messages = this.$el.find(this.options.messagesContainer);

        this.childrens = [];

        api.UI.Control.call(this, element, this.options);
    }

    View.prototype = Object.create(Control.prototype);
    View.prototype.constructor = View;

    View.prototype.initialize = function () {
        var self = this;
        return api.UI.Control.prototype.initialize.call(this)
            .then(function () {
                return self.loadChildrens();
            });
    };

    View.prototype.showMessage = function (msg) {
        return this.$messages.html(msg);
    };

    View.prototype.cleanChildrens = function () {
        var self = this,
            ij,
            obs = [],
            ofl = $.grep(this.childrens || [],
                function (oi) {
                    return typeof oi.destroy === 'function';
                });
        for (ij = 0; ij < ofl.length; ij++) {
            obs.push(ofl[ij].destroy());
        }

        return $.when.apply($, obs)
            .then(function () {
                var o,
                    i = (self.childrens || []).length;

                while (i--) {
                    o = self.childrens.pop();
                    if (typeof o.destroy === 'function') {
                        o.destroy();
                    }
                    delete o;
                }
                self.childrens = [];
                return Promise.resolve();
            });
    };

    View.prototype.loadChildrens = function (params) {
        var cntps = [],
            self = this;

        this.p = this.p.then(function () {
            self.$container.find(self.options.childControls).each(function (ix, el) {
                var vcn = $(el).data('controller'),
                    vp, vr;

                if (typeof self.options.childConstructor === 'function') {
                    vr = new self.options.childConstructor(el, params);
                    self.childrens.push(vr);
                    if (vr.p) {
                        cntps.push(vr.p);
                    }
                    return;
                }
                if (vcn) {
                    vp = api.Utils.require(vcn)
                        .then(function (cengine) {
                            if (cengine && typeof cengine.init === 'function') {
                                return cengine.init(el, self, params);
                            }
                        })
                        .then(function () {
                            var control = $(el).data(self.options.domLink);
                            if (control) {
                                self.childrens.push(control);
                            }
                        })
                        .catch(function (err) {
                            api.Trace.captureException(err);
                        });
                    cntps.push(vp);
                }
            });
            return Promise.all(cntps);
        });
        return this.p;
    };

    View.prototype.load = function (url, params) {
        var self = this;
        if (params) {
            url = url + '?' + api.Utils.querystring.stringify(params);
        }
        return $.ajax({
            type: "GET",
            url: url,
            dataType: 'html',
            beforeSend: function (xhr) {
                self.showMessage(api.UI.View.defaults.loadingHtml);
                self.$container.css({ opacity: '0.0' });
            }
        })
            .then(function (data) {
                return self.cleanChildrens()
                    .then(function () {
                        self.$messages.hide();
                        self.$container.html(data).delay(50).animate({ opacity: '1.0' }, 300);
                        return self.loadChildrens(params);
                    });
            }, function (xhr, textStatus, thrownError) {
                self.showMessage(api.UI.View.defaults.errorHtml.format({ url: url, status: xhr.status, err: thrownError }));
                self.$container.animate({ opacity: '1.0' }, 300);
            });
    };


    View.prototype.destroy = function () {
        var self = this;

        return this.cleanChildrens()
            .then(function () {
                return api.UI.Control.prototype.destroy.call(self);
            });
    };

    api.UI.View = View;
    api.UI.View.defaults = $.extend({}, api.UI.Control.defaults, {
        loadingHtml: '<h1 class="ajax-loading-animation"><i class="fa fa-cog fa-spin"></i> Loading...</h1>',
        errorHtml: '<h4 class="ajax-loading-error"><i class="fa fa-warning txt-color-orangeDark"></i> Error requesting <span class="txt-color-red">{url}</span>: {status} <span style="text-transform: capitalize;"> {err}</span></h4>',
        selectContainer: 'box-content-container',
        messagesContainer: 'box-messages-container',
        childControls: '[data-controller]'
    });

    function Select(element, options) {

        this.$el = this.$el || $(element);
        this.options = this.options || $.extend({},
            api.UI.Select.defaults,
            this.$el.data(),
            options || {});
        this.options.className = this.options.className || this.$el.data('field-target');
        this.options.field = this.options.field || this.$el.data('bm-field').split('$')[1];
        this.options.parentClass = this.options.parentClass || this.$el.data('bm-field').split('$')[0];
        this.options.searchFor = this.options.searchFor || $(element).data('search-for') || api.UI.Select.defaults.mapSearch[this.options.className] || 'name';
        this.options.relation = this.options.relation || (this.$el.data('field-type') === 'Relation');
        this.options.preload = this.options.preload || !!this.$el.data('preload');

        api.UI.Control.call(this, element,
            $.extend({}, api.UI.Select.defaults, options || {}));
    }

    Select.prototype = Object.create(Control.prototype);
    Select.prototype.constructor = Select;

    Select.prototype.initialize = function () {
        var self = this;

        return api.UI.Control.prototype.initialize.call(this)
            .then(function () {
                return new Promise(function (resolve, reject) {
                    var rz = Promise.resolve(),
                        o = self.options;

                    if (self.query) {
                        return resolve();
                    }
                    this.__initial = [];

                    self.query = o.query || new api.Query(o.className);

                    if (!$.fn.select2) {
                        rz = api.Utils.require(['select2']);
                    }
                    return rz.then(function () {
                        var vq = {};

                        if (typeof o.useMasterKey !== 'undefined') {
                            vq.useMasterKey = o.useMasterKey;
                        }

                        if (o.preload) {
                            return self.query.find(vq)
                                .then(function (ri) {
                                    var rht = $.map(ri, function (ritm) {
                                        return '<option value="' + encodeURI(ritm.id) + '">' + ritm.get(self.options.searchFor) + '</option>';
                                    }).join('');
                                    self.$el.html(rht);
                                    self.$el.select2($.extend({
                                        width: o.relation ? '100%' : o.width,
                                        allowClear: true
                                    }, o));
                                });
                        }

                        self.$el.select2($.extend({
                            width: o.relation ? '100%' : o.width,
                            minimumInputLength: self.options.minimumInputLength || 3,
                            allowClear: self.options.bmRequired ? false : true,
                            placeholder: "Select " + self.options.className,
                            ajax: {
                                delay: 250,
                                transport: function (params, success, failure) {

                                    self.query.matches(self.options.searchFor, new RegExp(params.data.q.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), 'gi'));
                                    self.query.find(vq)
                                        .then(function (rz) {
                                            success(rz);
                                        }, function (err) {
                                            failure(err);
                                        });
                                },
                                processResults: function (data, params) {
                                    return {
                                        results: $.map(data, function (ri) {
                                            return { id: ri.id, text: ri.get(self.options.searchFor) };
                                        })
                                    };
                                }
                            }
                        }, o));

                        if (!self.options.bmRequired) {
                            self.$el.on('select2:unselect', function (evt) {
                                // evt.preventDefault();
                                self.$el.empty();
                            });
                        }
                    }).then(resolve, reject);
                });
            });
    };

    Select.prototype.val = function (val, oq) {
        var self = this;
        if (this.options.preload) {
            self.$el.val(val).trigger('change');
        } else {
            this.p = this.p.then(function () {
                var so,
                    pq = oq || new api.Query(self.options.className);

                self.$el.empty().trigger('change');
                if (!val) {
                    return Promise.resolve();
                }
                if (self.options.relation && !oq) {
                    pq = val.parent.relation(self.options.field).query();
                } else if (typeof val === 'string') {
                    pq.equalTo('objectId', val);
                }
                if (self.options.useMasterKey) {
                    so = { useMasterKey: true };
                }
                return pq.find(so)
                    .then(function (rz) {
                        self.__initial = rz;
                        self.$el.html($.map(rz, function (ri) {
                            return self.options.relation ?
                                '<option value="{id}" selected="selected">{text}</option>'.format({ id: ri.id, text: ri.get(self.options.searchFor) }) :
                                '<option value="{id}" selected="selected">{text}</option>'.format({ id: ri.id, text: ri.get(self.options.searchFor) });
                        }).join('')).trigger('change');
                        /* if (!self.options.bmRequired) {
                             self.$el.data('select2').$container.find('.select2-selection__clear').click(function() {
                                 self.$el.empty().trigger('change');
                             });
                         }*/
                    });
            });
        }

        return this.p;
    };

    Select.prototype.syncRelation = function (parent) {
        var self = this;
        this.p = this.p.then(function () {
            var nvals = self.$el.val();

            if (!self.options.relation || !parent) {
                return Promise.resolve();
            }
            $.each(self.__initial, function (ix, iv) {
                if (nvals.indexOf(iv.id) === -1) {
                    parent.relation(self.options.field).remove(iv);
                }
            });
            $.each(nvals, function (ix, niv) {
                var vf = $.grep(self.__initial, function (ik) {
                    return ik.id === niv;
                });
                if (!vf.length) {
                    parent.relation(self.options.field).add(api.Object.fromJSON({ className: self.options.className, objectId: niv }));
                }
            });
        });

        return this.p;
    };

    Select.prototype.destroy = function () {
        this.$el.select2('destroy');
        return api.UI.Control.prototype.destroy.call(this);
    };

    api.UI.Select = Select;
    api.UI.Select.defaults = $.extend({}, api.UI.Control.defaults, {
        width: '250px',
        mapSearch: { _User: 'username', Files: 'fileName' }
    });


    function DataTable(element, options) {
        this.$el = this.$el || $(element);
        this.options = this.options || $.extend({},
            api.UI.DataTable.defaults,
            this.$el.data(),
            options || {});

        this.options.className = this.options.className || this.$el.data('class-name');
        this.queryOptions = this.options.query || {};
        this.where = this.options.where || {};

        this._include = this.options.include || this.$el.data('query-include');

        this._storageKey = this._storageKey || (this.$el.attr('id') || 'DataSet:' + this.options.className + '#' +
            (this.$el.parents('.jarviswidget').eq(0).attr('id') || '') + ':' + (api.User.current() ? api.User.current().id : '*'));

        api.UI.Control.call(this, element,
            $.extend({}, api.UI.DataTable.defaults, options || {}));
    }

    DataTable.prototype = Object.create(Control.prototype);
    DataTable.prototype.constructor = DataTable;

    DataTable.prototype._exportData = function (e, dt, node, config) {
        var self = this,
            colDefs = dt.settings()[0].aoColumns,
            selFields = dt.columns(':visible')[0].map(function (ci) {
                return dt.settings()[0].aoColumns[ci].field;
            });

        api.CoreManager.getRESTController()
            .request('POST', 'tasks/create',
                {
                    query: self.__qcache,
                    className: self.options.className,
                    items: selFields,
                    title: 'Export ' + self.options.className + ' items',
                    content: 'Export task will be created, when data is ready you will be notified',
                    type: 'export'
                })
            .then(function (job) {
                return api.Utils.require('notification')
                    .then(function () {
                        $.notify({
                            message: 'Export data task created',
                            type: "info",
                            icon: "fa fa-download"
                        }, {timeout: 5000});
                    });
            }, function (err) {
                api.Utils.require('notification')
                    .then(function () {
                        api.Trace.captureException(err);
                    });
            });
    };

    DataTable.prototype.initialize = function () {
        var self = this,
            dtOptions = {
                responsive: true,
                deferRender: true,
                serverSide: true,
                processing: true,
                ajax: function (data, callback, settings) {
                    function _processQuery(rqp) {
                        rqp.limit(data.length);
                        if (data.start) {
                            rqp.skip(data.start);
                        }
                        if (data.order && data.order.length) {
                            var srt = data.columns[data.order[0].column].data;
                            if (data.order[0].dir === 'asc') {
                                rqp.ascending(srt);
                            } else {
                                rqp.descending(srt);
                            }
                        }
                        if (self._include) {
                            rqp.include(self._include);
                        }
                        rqp.find(self.queryOptions).then(function (response) {
                            var dresp = {
                                draw: data.draw,
                                recordsTotal: self.___totalCount || 0,
                                recordsFiltered: self.___count,
                                data: $.map(response, function (ucm) {
                                    var rz = { DT_RowData: ucm };
                                    $.each(data.columns, function (ix, cl) {
                                        var vd, vid;
                                        if (cl.data !== '') {
                                            vd = cl.data.split('.');
                                            vid = (typeof ucm.get(vd[0]) !== 'undefined' ? ucm.get(vd[0]) : ucm[vd[0]]);

                                            if (vd.length > 1) {
                                                rz[vd[0]] = rz[vd[0]] || {};
                                                rz[vd[0]][vd[1]] = vid ? vid.get(vd[1]) : null;
                                            } else {
                                                rz[vd[0]] = vid;
                                            }
                                        }
                                    });
                                    return rz;
                                })
                            };
                            self._records = response;
                            self.trigger('changed', response);
                            callback(dresp);
                        }).catch(function (err) {
                            api.Trace.captureException(err);
                            self.trigger('changed');
                            callback({
                                draw: data.draw,
                                data: [],
                                recordsTotal: 0,
                                recordsFiltered: 0
                            });

                        });
                    }

                    if (self.where && Object.keys(self.where).length) {
                        if (self.where.parentClass && self.where.fieldId && self.where.objectId) {
                            // relationship
                            var vqit = api.Object.fromJSON({
                                className: self.where.parentClass,
                                objectId: self.where.objectId
                            });
                            //vqit.equalTo({objectId : self.where.objectId});
                            rqp = vqit.relation(self.where.fieldId).query();
                            //    rqp.equalTo(self.where.fieldId, vqit); 
                        }
                    }

                    var cf = typeof self.options.getSearchQuery === 'function' ? self.options.getSearchQuery : self.getSearchQuery;
                    cf.call(self, data.search ? data.search.value : undefined)
                        .then(function (rqp) {
                            var qjsn = JSON.stringify(rqp.toJSON());
                            if (self.__qcache === qjsn) {
                                return _processQuery(rqp);
                            }

                            return rqp.count(self.queryOptions)
                                .then(function (count) {
                                    if (!data.search || !data.search.value || data.search.value === '') {
                                        self.___totalCount = count;
                                    }
                                    self.___count = count;
                                    self.__qcache = qjsn;
                                    return _processQuery(rqp);
                                }, function (err) {
                                    self.onError(err);
                                    return callback({
                                        draw: data.draw,
                                        data: [],
                                        recordsTotal: 0,
                                        recordsFiltered: 0,
                                        error: err.message || err
                                    });
                                });
                        });
                }
            };
        $.each(this.options, function (kt, v) {
            if (kt.substring(0, 2) === 'dt') {
                kt = kt.substring(2);
                dtOptions[kt] = v;
            }
        });

        this._requires = ['dataTablesResponsiveBoostrap'];

        if (!dtOptions.columns || !dtOptions.columns.length) {
            dtOptions.columns = dtOptions.columns || this._getColumns();
        }

        if (!dtOptions.order) {
            for (var i = 0; i < dtOptions.columns.length && !dtOptions.order; i++) {
                if (dtOptions.columns[i].sortable) {
                    dtOptions.order = [[i, 'asc']];
                }
            }
        }
        $.each(dtOptions.columns || [], function (ix, cl) {
            cl.defaultContent = cl.defaultContent || '';
        });
        dtOptions.drawCallback = dtOptions.drawCallback || this._drawCallback.bind(this);
        dtOptions.searchDelay = dtOptions.searchDelay || 700;

        this.dtOptions = dtOptions;
        this.$el.on('init.dt', function (evt, settings) {
            var table = new $.fn.dataTable.Api(settings).table(),
                $container = $(table.container());
            $container.find('.dataTables_filter input')
                .unbind() // Unbind previous default bindings
                .bind("input", function (e) { // Bind our desired behavior
                    // If the length is 3 or more characters, or the user pressed ENTER, search
                    if (this.value.length >= 3 || e.keyCode == 13) {
                        // Call the API search function
                        table.search(this.value).draw();
                    }
                    // Ensure we clear the search if they backspace far enough
                    if (this.value == "") {
                        table.search("").draw();
                    }
                    return;
                });
        });
        if (dtOptions.stateSave !== false) {
            dtOptions.stateSave = true;
            dtOptions.stateLoadCallback = dtOptions.stateLoadCallback || function (settings, callback) {
                var od = api.CoreManager.getStorageController().getItem(self._storageKey);
                callback(od ? JSON.parse(od) : od);
            };
            dtOptions.stateSaveCallback = dtOptions.stateSaveCallback || function (settings, data) {
                api.CoreManager.getStorageController().setItem(self._storageKey, JSON.stringify(data));
            };
        }
        if (dtOptions.buttons || this.options.defaultButtons) {
            this._requires.push('datatables.net-buttons-bs');
            this._requires.push('datatables.buttons.colVis');
            this._requires.push('datatables.buttons.print');
            if (this.options.defaultButtons) {
                dtOptions.buttons = dtOptions.buttons || [];
                if (this.options.pageLengthButton !== false) {
                    dtOptions.buttons.push('pageLength');
                }
                if (this.options.colvisButton !== false) {
                    dtOptions.buttons.push({ extend: 'colvis', text: '<i class="fa fa-eye"></i>' });
                }
                if (this.options.printButton !== false) {
                    dtOptions.buttons.push({
                        extend: 'print', text: '<i class="fa fa-print"></i>',
                        exportOptions: {
                            columns: ':visible'
                        }
                    });
                }

                if (this.options.exportButton !== false) {
                    dtOptions.buttons.push({
                        className: 'btn btn-default btn-download',
                        text: '<i class="fa fa-download"></i>',
                        action: self._exportData.bind(self)
                    });
                }
                if (this.options.createNew && (typeof this.options.onCreate === 'function')) {
                    var aclc = 'btn btn-default btn-add';
                    if (this.options.aclCreate && this.options.aclCreate !== '*') {
                        $.each(this.options.aclCreate.split(' '), function (ix, arc) {
                            if (arc) {
                                aclc = aclc + ' req-role-' + arc;
                            }
                        });
                    }
                    dtOptions.buttons.push({
                        className: aclc,
                        text: '<i class="fa fa-plus"></i>',
                        action: self.options.onCreate.bind(self)
                    });
                }

            }
            dtOptions.dom = dtOptions.dom || "<'row'<'col-sm-6'B><'col-sm-6'f>><'row'<'col-sm-12'tr>><'row'<'col-sm-5'i><'col-sm-7'p>>";

        }

        return api.Utils.require(this._requires).then(function () {
            var ams = self._requires.indexOf('moment');
            if (ams !== -1) {
                moment = arguments[ams];
            }
            self.dt = self.$el.DataTable(dtOptions);
        });
    };

    DataTable.prototype._drawCallback = function (settings) {
        var self = this,
            table = new $.fn.dataTable.Api(settings).table(),
            $body = $(table.body());

        $body.find('a.table-cmd-col').each(function () {
            var $el = $(this),
                tr = $el.parents('tr'),
                src = $(tr).hasClass('child') ? $(tr).prev() : tr,
                rdt = table.row(src).data();

            api.Utils.hasAccess(rdt.DT_RowData.getACL()).then(function (access) {
                var edt = access ? self.options.iconButtonEdit : self.options.iconButtonView,
                    acc = access ? self.options.classButtonEdit : self.options.classButtonView;
                $el.addClass(acc).html(edt).show();
            });
        });

        $body.find('.btn').on('click', function (evt) {
            var vd = $(evt.currentTarget).data();

            if (typeof self.options.onAction === 'function') {
                var $el = $(this),
                    tr = $el.parents('tr'),
                    src = $(tr).hasClass('child') ? $(tr).prev() : tr,
                    rdt = table.row(src).data();

                self.options.onAction(vd, rdt.DT_RowData, evt.currentTarget);
                evt.preventDefault();
                return;
            }
            if (api.Router && api.Router.lookup('data', vd)) {
                evt.preventDefault();
                api.Router.navigate(api.Router.lookup('data', vd));
            }
        });
    };

    DataTable.prototype._getColumn = function (iv) {
        var self = this,
            vc = {
                data: iv.field === 'objectId' ? 'id' : iv.field,
                type: iv.type,
                sortable: typeof iv.sortable === 'undefined' ? (['Number', 'Date', 'String', 'Boolean'].indexOf(iv.type) !== -1) : iv.sortable
            };

        if (this.options.columns && this.options.columns[iv.field]) {
            return (typeof this.options.columns[iv.field] === 'function') ? this.options.columns[iv.field](this, iv) : this.options.columns[iv.field];
        }
        if (iv.targetClass) {
            vc.targetClass = iv.targetClass;
        }

        if (iv.field === 'objectId') {
            vc.render = function (data, type, full, meta) {
                return '<a data-object-id=\"' + data + '\" data-field-id="objectId" href="#" class="table-cmd-col ' + self.options.classButtons + '" style="display:none"></a>';
            };
        } else if (iv.type === 'Date') {
            if (self._requires.indexOf('moment') === -1) {
                self._requires.push('moment');
            }

            vc.render = function (data, type, full, meta) {
                if (data && (typeof moment !== 'undefined') && moment(data).isValid()) {
                    return moment(data).format(iv.dateFormat || self.options.dateFormat || 'lll');
                }
                return data || '<i class="fa fa-calendar-o"></i>';
            };
        } else if (iv.type === 'Pointer') {
            vc.render = function (data) {
                return data ? (data.className ? ("<a href=\"#\" data-object-id=\"" + data.id + "\" data-field-id=\"" + iv.field + "\" data-action=\"pointer\" data-target-class=\"" + data.className + "\" class=\"btn " + self.options.classButtons + " \"><i class=\"fa fa-search\"></i></a>" +
                    (data.className === 'Files' ? " <a href=\"" + api.serverURL + "/storage/" + api.applicationId + "/" + data.id + "\" target=\"_blank\"><i class=\"fa fa-download\"></i></a>" : '')) : data) : '';
            };
        } else if (iv.type === 'Relation') {
            vc.render = function (data) {
                if (!data) {
                    return '';
                }
                return '<a href="#"  data-object-id="' + (data.parent ? data.parent.id : '') +
                    '"  data-field-id="' + iv.field + '" data-action="relation" data-target-class="' + (data.targetClassName || iv.targetClass || iv.className) + '"  class="' + self.options.classButtons + ' btn-default"><i class="fa fa-search"></i> view [' + iv.field + '] </a>';
            };
        } else if (iv.type === 'String') {
            vc.render = function (data, to, obj) {
                return ($('<div>' + (data || '') + '</div>').text()).trunc(50, true);
            };
        } else if (iv.type === 'Object') {
            vc.render = function (data) {
                if (!data || !Object.keys(data).length) {
                    return '';
                }
                return '[object]';
            };
        } else if (iv.type === 'Boolean') {
            vc.render = function (data) {
                return data ? '<i class="fa fa-check-square-o"></i>' : '<i class="fa fa-square-o"></i>';
            };
        } else if (iv.type === 'File') {
            vc.render = function (data) {
                data = data && data.toJSON ? data.toJSON() : data;
                return data ? '<a href="' + data.url + '" target="_blank"><i class="fa fa-external-link"></i> ' + (data.name ? data.name.substr(data.name.indexOf('_') + 1) : '') + '</a>' : '';
            };
        } else if (iv.type === 'Array') {
            vc.render = function (data) {
                return data ? '[array]' : '[]';
            };
        } else if (iv.type === 'GeoPoint') {
            vc.render = function (data) {
                return data ? '{geopoint}' : '{geopoint:new}';
            };
        } else if (iv.type === 'Number') {
            vc.render = function (data) {
                return $.isNumeric(data) ? (typeof data.format === 'function' ? data.format() : data) : '';
            };
        }

        if (iv.field && vc.sortable && iv.field.indexOf('.') !== -1) {
            vc.sortable = false;
        }
        return vc;

    };

    DataTable.prototype._getColumns = function () {
        var self = this,
            cols = [];

        this.$('thead th').each(function () {
            var cData = $(this).data(),
                col;

            if (cData.field) {
                col = self._getColumn(cData);
                if (col) {
                    cols.push(col);
                }
                self._colsData = self._colsData || {};
                self._colsData[cData.field] = cData;
            }


        });
        return cols;
    };

    DataTable.prototype.reload = function () {
        this.__qcache = null;
        this.dt.ajax.reload();
    };

    DataTable.prototype.getSearchQuery = function (search) {
        var self = this,
            query = new api.Query(this.options.className),
            vq = [],
            include = [];

        if (this.where) {
            query._where = $.extend({}, this.where);
        }

        $.each(this.dtOptions.columns, function (ix, dc) {
            var vd;

            if (dc.targetClass && dc.mData.indexOf('.') !== -1 && include.indexOf(dc.mData.split('.')[0]) === -1) {
                include.push(dc.mData.split('.')[0]);
            }

            if (search && dc.data && dc.type) {
                switch (dc.type.toLowerCase()) {
                    case 'pointer':
                    case 'string':
                        if (dc.data) {
                            if (dc.data.indexOf('.') === -1) {
                                vq.push(new api.Query(self.options.className).matches(dc.data, new RegExp(search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), 'gi')));
                            } else if (self._colsData[dc.data] && self._colsData[dc.data].targetClass) {
                                vd = dc.data.split('.');
                                vq.push(new api.Query(self.options.className).matchesQuery(vd[0], new api.Query(self._colsData[dc.data].targetClass)
                                    .matches(vd[1], new RegExp(search.replace(/[-\[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), 'gi'))));
                            }
                        }
                        break;
                    case 'num':
                    case 'number':
                        if (dc.data && !isNaN(parseFloat(search, 10))) {
                            vq.push(new api.Query(self.options.className).equalTo(dc.data, parseFloat(search, 10)));
                        } else if (self._colsData[dc.data] && self._colsData[dc.data].targetClass) {
                            vd = dc.data.split('.');
                            vq.push(new api.Query(self.options.className).matchesQuery(vd[0], new api.Query(self._colsData[dc.data].targetClass)
                                .equalTo(vd[1], parseFloat(search, 10))));
                        }
                        break;
                    case 'date':
                        if (dc.data && (typeof moment !== 'undefined') && moment(search).isValid()) {
                            vq.push(new api.Query(self.options.className).equalTo(dc.data, moment(search).toDate()));
                        }
                        break;
                }
            }
        });
        if (this.options.columnsOnly) {
            query.select($.map(this.dtOptions.columns, function (uk) {
                return uk.mData;
            }));
        }
        if (include.length) {
            query.include(include);
        }
        if (vq.length) {
            query._orQuery(vq);
        }
        return Promise.resolve(query);
    };

    DataTable.prototype.onError = function (error) {
        api.Trace.captureException(error);
        if (typeof this.options.onError === 'function') {
            this.options.onError.call(this, error);
        }
    };

    DataTable.render = function ($container, options) {
        api.Utils.render('default/templates/controls/dataset-grid', options)
            .then(function (tht) {
                var rt;
                $container.html(tht);
                rt = new DataTable($container.find('table'), options);
                return rt;
            });
    };

    DataTable.prototype.hide = function () {
        this.trigger('hide');
        $(this.dt.table().container()).hide();
    };

    DataTable.prototype.show = function () {
        this.trigger('show');
        $(this.dt.table().container()).show();
    };

    api.UI.DataTable = DataTable;
    api.UI.DataTable.defaults = $.extend({}, api.UI.Control.defaults, {
        defaultButtons: true,
        classButtons: 'btn btn-xs',
        classButtonEdit: 'btn-success',
        classButtonView: 'btn-default',
        iconButtonEdit: '<i class="fa fa-pencil-square-o"></i>',
        iconButtonView: '<i class="fa fa-search"></i>'
    });

    function PivotTable(element, options) {
        this.$el = $(element);
        this.options = $.extend({}, api.UI.PivotTable.defaults, options || {});
        api.UI.Control.call(this, element, this.options);
    }

    PivotTable.prototype = Object.create(api.UI.Control.prototype);
    PivotTable.prototype.constructor = PivotTable;

    PivotTable.prototype.initialize = function () {
        var self = this;

        return api.Utils.require(['export_renderers', 'c3_renderers',
            'css!' + CDN_ROOT + '/vendor/pivottable/pivot.min.css',
            'css!' + CDN_ROOT + '/vendor/c3/c3.css'])
            .then(function () {
                $.extend($.pivotUtilities.renderers,
                    $.pivotUtilities.c3_renderers,
                    $.pivotUtilities.export_renderers);

                return api.UI.Control.prototype.initialize.call(self);
            });
    };

    PivotTable.prototype.render = function () {
        var self = this;

        return this.getData()
            .then(function (data) {
                var opk = 'box.pivot.' + api.applicationId + '.' + (self.options.className || 'cls'),
                    opts = JSON.parse(api.Storage.getItem(opk) || 'false') || self.options.pivot || {},
                    cntr = self.$(self.options.selectContainer);

                opts.onRefresh = opts.onRefresh || self._onRefresh.bind(self);

                if (!cntr.length) {
                    cntr = self.$el;
                }
                $(cntr).pivotUI(data, opts, true);

                return api.UI.Control.prototype.render.call(this);
            });
    };

    PivotTable.prototype.getData = function () {
        var self = this,
            vp = {};
        if (typeof this.options.getData === 'function') {
            return this.options.getData.call(this);
        }
        if (!this.options.className || !this.options.pipeline) {
            return Promise.resolve([]);
        }
        if (this.options.useMasterKey && api.masterKey) {
            vp = { useMasterKey: true };
        }
        return api.Cloud.run('data_aggregate',
            {
                className: this.options.className,
                pipeline: this.options.pipeline
            }, vp)
            .then(function (data) {
                if (typeof self.options.processData === 'function') {
                    return self.options.processData.call(self, data);
                }
                return self._processData(data);
            });
    };

    PivotTable.prototype._onRefresh = function (config) {
        var opk = 'box.pivot.' + api.applicationId + '.' + (this.options.className || 'cls'),
            config_copy = JSON.parse(JSON.stringify(config));

        if (this.options.noStatus === false) {
            return;
        }
        delete config_copy.aggregators;
        delete config_copy.renderers;
        delete config_copy.rendererOptions;
        delete config_copy.localeStrings;
        api.Storage.setItem(opk, JSON.stringify(config_copy));
    };

    PivotTable.prototype._processData = function (data) {
        var result = api._.map(data, function (ob) {
            var rz = {};
            api._.each(ob, function (ov, ok) {
                if (ok === '_id') {
                    api._.each(ob[ok], function (iv, ik) {
                        rz[ik] = iv;
                    });
                } else {
                    rz[ok] = ov;
                }
            });
            return rz;
        });
        return Promise.resolve(result);
    };

    api.UI.PivotTable = PivotTable;
    api.UI.PivotTable.defaults = {};

    function Editor(element, options) {
        this.$el = this.$el || $(element);
        this.options = this.options || $.extend({},
            api.UI.Editor.defaults,
            $(this.$el).data(),
            options || {});

        this.readOnly = true;
        this.selects = this.selects || {};
        this.files = this.selects || {};

        api.UI.Control.call(this, element);
    }

    Editor.prototype = Object.create(Control.prototype);
    Editor.prototype.constructor = Editor;

    Editor.prototype.initialize = function () {
        var self = this,
            pms = api.UI.Control.prototype.initialize.call(this);

        if (!this.options.readOnly && this.options.removeButtonClass) {
            this.$(this.options.removeButtonClass).click(function (evt) {
                evt.preventDefault();
                if ($(this).hasClass('disabled')) {
                    return;
                }
                if (typeof self.options.onRemove === 'function') {
                    self.options.onRemove(self);
                }
            });
        } else {
            this.$(this.options.removeButtonClass).hide();
        }

        if (this.options.cancelButtonClass) {
            this.$(this.options.cancelButtonClass).click(function (evt) {
                evt.preventDefault();
                self.wire().then(function () {
                    if (typeof self.options.onCancel === 'function') {
                        self.options.onCancel(self);
                    }
                });
            });
        }

        if (!this.options.readOnly && this.options.createButtonClass) {
            this.$(this.options.createButtonClass).click(function (evt) {
                var $this = $(evt.currentTarget);
                evt.preventDefault();
                if ($(this).hasClass('disabled')) {
                    return;
                }
                $this.hide();

                self.update()
                    .then(function () {
                        var vo = self.options.useMasterKey ? { useMasterKey: true } : undefined;
                        self.trigger('saving');
                        return self.model.save({}, vo);
                    })
                    .then(function () {

                        return self._uploadFiles();
                    })
                    .then(function () {
                        if (typeof self.options.onUpdated === 'function') {
                            self.options.onUpdated(self);
                        }

                        self.trigger('saved');
                        api.Utils.require('notification')
                            .then(function () {
                                $.notify({
                                    message: "Updated !",
                                    icon: "fa fa-info-circle"
                                }, { type: "info"});
                            });

                        if (!self.model && self.model.id && self._useEditorLock && api.Socket.hasClient()) {
                            self._timerSync = { className: self.model.className, objectId: self.model.id };
                            self._lockSync();
                        }
                        $this.show();
                    })
                    .catch(function (err) {
                        $this.show();
                        if (typeof self.options.onError === 'function') {
                            self.options.onError(err);
                        }
                        if (!err.validate) {
                            api.Utils.require('notification')
                                .then(function () {
                                    api.Trace.captureException(err);
                                });
                        }
                    });
            });
        } else {
            this.$(this.options.createButtonClass).hide();
        }

        this.$('.input-group-btn .btn').click(function (evt) {
            var $ip = $(evt.currentTarget).parents('.input-group'),
                $input = $ip.find('input'),
                vd = $input.data('bm-field');

            if (vd && vd.split('$')[0] === self.options.className) {
                evt.preventDefault();
                $ip.removeClass('input-group').find('button').hide();
                api.Utils.require(['summernote', 'css!' + CDN_ROOT + '/vendor/summernote/summernote']).then(function () {
                    self.wireSummernote($input);
                    $input.summernote('code', $input.val());
                });
            }

        });

        this.$('select[data-field-target]').each(function () {
            var vd = $(this).data('bm-field'),
                oq = {};
            if (self.options.useMasterKey) {
                oq = { useMasterKey: true };
            }
            if (vd && vd.split('$')[0] === self.options.className) {
                vd = vd.split('$')[1];
                if (self.options.selects && self.options.selects[vd]) {
                    oq = $.extend(oq, self.options.selects[vd]);
                }

                self.selects[vd] = new api.UI.Select(this, oq);
            }
        });

        this.$("input[data-field-type=\"Number\"]").each(function (ix, el) {
            var vd = $(this).data('bm-field');
            if (vd && vd.split('$')[0] === self.options.className) {
                api.Utils.inputDigitsOnly($(this));
            }
        });
        if (this.$("[data-field-type=\"Date\"]").length) {
            pms = pms.then(function () {
                return api.Utils.require(['moment', 'bootstrap-datetimepiker'])
                    .then(function (mnt) {
                        moment = mnt;
                        self.$(".form-group .input-group.date").datetimepicker({ format: self.options.dateFormat });
                    });
            });
        }
        pms = pms.then(function () {
            if (!self.$('.editor-lock .users-open-close').length || !api.Socket.hasClient()) {
                return Promise.resolve();
            }
            self._useEditorLock = true;
            self.$('.editor-lock .users-open-close').click(function (evt) {
                evt.preventDefault();
                $(this).parent().toggleClass('open');
            });

            return api.Socket.client()
                .then(function (socket) {
                    socket.on('edit', function (obj) {
                        self._showLocks(obj);
                    });
                });
        });
        return pms;
    };


    Editor.prototype.wire = function (obj, asParent) {
        var self = this,
            p = Promise.resolve(),

            filter = this.options.bindFilter || '[data-bm-field]';

        if (obj && obj.className && obj.className !== this.options.className) {
            return p;
        }

        this.model = obj;
        this.__files = [];

        if (this.model && this.model.id) {
            this.readOnly = this.options.readOnly;
            if (this.readOnly) {
                this.$('.readonly-field').show();
                this.$(this.options.removeButtonClass).addClass('disabled');
                this.$(this.options.createButtonClass).addClass('disabled');
            } else {
                //  || !api.Utils.hasAccess(this.model.getACL())
                //ACL-check
                this.$(this.options.createButtonClass).html(this.options.updateButtonText);
                // check class ACL for delete
                this.$(this.options.removeButtonClass).removeClass('disabled');
                this.$(this.options.createButtonClass).removeClass('disabled');
            }
        } else {
             //ACL-check
           
            this.readOnly = false;
            this.$('.readonly-field').hide();
            this.$(this.options.removeButtonClass).addClass('disabled');
            this.$(this.options.createButtonClass).html(this.options.createButtonText);
            this.$(this.options.createButtonClass).removeClass('disabled');
        }

        this.$(filter).each(function () {
            var thisEl = this;
            p = p.then(function () {
                return _wireElement.call(thisEl, self, obj);
            });
        });

        p = p.then(function () {
            var ids = [],
                pms = Promise.resolve();

            self.$('.file-placeholder .file-list').empty();

            if (self.__files.length) {
                if (obj) {
                    $.each(self.__files, function (fi, fel) {
                        var vd = $(fel).data().bmField.split('$')[1],
                            vf = obj.get(vd);
                        if (vf) {
                            ids.push(vf.id);
                        }
                    });
                    if (ids.length) {
                        var pq = new api.Query('Files');
                        pq.containedIn('objectId', ids);
                        pms = pq.find();
                    }
                }
                pms = pms.then(function (frez) {
                    return api.Utils.require('Flow')
                        .then(function () {
                            return Promise.all($.map(self.__files, function (flel) {
                                var fdata = $(flel).data(),
                                    vd = fdata.bmField.split('$')[1],
                                    image,
                                    vid, i;

                                if (obj) {
                                    vid = obj.get(vd);
                                    if (vid) {
                                        for (i = 0; !image && i < frez.length; i++) {
                                            if (frez[i].id === vid.id) {
                                                image = frez[i].toJSON();
                                            }
                                        }
                                    }
                                }
                                if (!self.files[fdata.bmField]) {
                                    self.files[fdata.bmField] = {
                                        el: flel,
                                        Flow: new Flow({
                                            target: '/api/storage/upload',
                                            chunkSize: 1024 * 1024,
                                            testChunks: true,
                                            query: {
                                                applicationId: api.applicationId,
                                                className: self.options.className,
                                                role: vd,
                                                contentDisposition: 'attachment'
                                            }
                                        })
                                    };

                                    self.files[fdata.bmField].Flow.assignBrowse($(flel).parents('.btn-default')[0]);
                                    self.files[fdata.bmField].Flow.assignDrop($(flel).parents('.input-file')[0]);

                                }

                                return self.renderImage(image, $(flel));
                            }));
                        });
                });
            }

            return pms;
        });

        return p.then(function () {
            return Promise.all($.map(self.childrens || [], function (cld) {
                return cld.wire(obj, true);
            }));
        }).then(function () {
            self.trigger('wired');
            if (self.model && self.model.id && self._useEditorLock && api.Socket.hasClient()) {
                self._timerSync = { className: self.model.className, objectId: self.model.id };
                self._lockSync();
            }
        });
    };

    Editor.prototype._lockSync = function () {
        var self = this;
        if (!this._timerSync) {
            return self._showLocks();
        }
        Promise.resolve()
            .then(function () {
                if (!self.model || self.model.isNew() || !$.contains(document, self.$el[0])) {
                    self._timerSync.leave = true;
                }
                return api.Socket.client()
                    .then(function (socket) {
                        return new Promise(function (resolve, reject) {
                            socket.emit('edit', self._timerSync, function (rz) {
                                if (self._timerSync.leave) {
                                    delete self._timerSync;
                                }
                                return self._showLocks(rz).then(resolve, reject);
                            });
                        });
                    });
            })
            .then(function () {
                setTimeout(self._lockSync.bind(self), self.options.editSyncTimer);
            },
                function () {
                    setTimeout(this._lockSync.bind(this), self.options.editSyncTimer);
                });
    };

    Editor.prototype._showLocks = function (locks) {
        var lusr = [],
            ls = '';

        if (!locks || !this.model || this.model.id !== locks.object.objectId) {
            this.$('.editor-lock').hide();
            return Promise.resolve();
        }
        $.each(locks, function (lix, lvl) {
            if (lix !== 'object') {
                lusr.push(lvl);
                ls = ls + "<li><i class=\"fa fa-user\"></i> {username}</li>".format(lvl.editor.user);
            }
        });
        if (lusr.length > 1) {
            this.$('.editor-lock').show();
            this.$('.editor-lock .lock-list-body ul').html(ls);
        } else {
            this.$('.editor-lock').hide();
        }
        return Promise.resolve();
    };

    Editor.prototype.addChilds = function (chld) {
        this.childrens = this.childrens || [];
        chld.parent = this;
        this.childrens.push(chld);
    };

    Editor.prototype._uploadFiles = function () {
        var self = this,
            updated = false;

        return Promise.all($.map(this.files,
            function (img) {
                var vf = $(img.el).val();
                if (!vf) {
                    return Promise.resolve();
                }
                return new Promise(function (resolve, reject) {
                    var $pel = $(img.el).parents('.input-file'),
                        finp = $pel.find("input[type=\"file\"]").eq(0);
                    $pel.find('.file-edit').hide();
                    $pel.find('.progress').show();


                    img.Flow.addFile(finp[0].files[0]);

                    img.Flow.off('fileSuccess');
                    img.Flow.on('fileSuccess', function (file, message) {
                        var jsmg = JSON.parse(message),
                            fdb;

                        jsmg.className = jsmg.className || 'Files';
                        fdb = api.Object.fromJSON(jsmg);

                        self.model.set(img.Flow.opts.query.role, fdb);
                        updated = true;
                        $pel.find('.file-edit').show();
                        $pel.find('.file-edit').val('');
                        $pel.find('.progress').hide();
                        $pel.find("input[type=\"file\"]").val('');
                        self.renderImage(fdb.toJSON(), $pel).then(resolve, reject);
                    });

                    img.Flow.off('fileError');
                    img.Flow.on('fileError', function (file, message) {
                        $pel.find('.file-edit').show();
                        $pel.find('.progress').hide();

                        reject(message);
                    });

                    img.Flow.off('fileProgress');
                    img.Flow.on('fileProgress', function (file) {
                        var vfp = Math.floor(file.progress() * 100);
                        $pel.find('.progress span').html(vfp < 95 ? vfp + '%' : 'sending to cloud..');
                        $pel.find('.progress .progress-bar').css({ width: vfp + '%' });
                    });

                    img.Flow.opts.query.objectId = self.model.id;
                    img.Flow.upload();
                });
            }))
            .then(function () {
                var vo = self.options.useMasterKey ? { useMasterKey: true } : undefined;
                if (updated) {
                    self.trigger('saving');
                    return self.model.save({}, vo)
                        .then(function () {
                            self.trigger('saved');
                            return self.model;
                        });
                }
            })
            .catch(function (err) {
                api.Utils.require('notification')
                    .then(function () {
                        api.Trace.captureException(err);
                    });
                if (typeof self.options.onError === 'function') {
                    self.options.onError(err);
                }
            });
    };

    Editor.prototype.renderImage = function (img, $container) {
        var self = this,
            rp = Promise.resolve();

        if (img) {
            var url = (img.url && img.publicRead ? img.url : api.serverURL + '/storage/' + api.applicationId + '/' + img.objectId),
                vm = $container.parents('.file-placeholder').find('.file-list');

            if (!vm.length) {
                $container.parents('.file-placeholder').prepend('<ul class="file-list"></ul>');
                vm = $container.parents('.file-placeholder').find('.file-list');
            }
            vm.empty();
            vm.append(self.options.imageFormat.format({
                display: img.contentType && img.contentType.indexOf('image/') === 0 ? '<img src="' + url + '">' : '<i class="fa fa-file"></i>',
                name: img.fileName,
                id: img.objectId,
                url: url,
                size: img.size.toByteSize()
            }));

            vm.find('a.text-danger:last').click(function (evt) {
                var vd = $container.data();
                evt.preventDefault();
                api.Utils.require('bootstrap-dialog')
                    .then(function () {
                        BootstrapDialog.confirm({
                            title: 'Atenție',
                            type: BootstrapDialog.TYPE_WARNING,
                            message: "<i class='fa fa-trash-o text-danger'></i> Remove <i>" + img.fileName + "</i> ?",
                            closable: true,
                            btnCancelLabel: '<i class="fa fa-ban"></i> Cancel !',
                            btnOKLabel: '<i class="fa fa-trash-o"></i> Delete!',
                            btnOKClass: 'btn-danger',
                            callback: function (result) {
                                if (result) {
                                    var vf = vd.bmField.split('$')[1];
                                    self.model.set(vf, null);
                                    self.renderImage(null, $container);
                                }
                            }
                        });
                    });
            });


        } else {
            $container.parents('.file-placeholder').find('.file-list').remove();
        }
        return rp;
    };

    Editor.prototype.validate = function () {
        var self = this,
            filter = (this.options.bindFilter || '[data-bm-field]') + '[data-bm-required]',
            failed,
            pm = Promise.resolve();

        this.$(filter).each(function () {
            var data = $(this).data(),
                bind = data.bmBind,
                params = [],
                prop,
                val;

            if (!bind) {
                var nm = this.nodeName;
                if (nm === 'IMG') {
                    bind = 'prop';
                    params.push('src');
                } else if (nm === 'INPUT' && this.type === 'checkbox') {
                    bind = 'prop';
                    params.push('checked');
                } else if (nm === 'INPUT' ||
                    nm === 'SELECT' ||
                    nm === 'TEXTAREA') {
                    bind = 'val';
                } else {
                    bind = 'html';
                }
            }
            if ($(this).data('summernote')) {
                bind = 'summernote;code';
            }
            if (bind.indexOf(';') !== -1) {
                bind = bind.split(';');
                params.push(bind[1]);
                bind = bind[0];
            }
            val = $.fn[bind].apply($(this), params);
            if (!val) {

                failed = failed || {
                    field: data.bmField,
                    validate: true,
                    message: data.bmRequiredError || data.bmField.split('$').join(' ') + ' is required'
                };

                pm = pm.then(function () {
                    return api.Utils.require('notification')
                        .then(function () {
                            $.notify({
                                message: data.bmRequiredError || data.bmField.split('$').join(' ') + ' is required',
                                icon: "fa fa-exclamation-circle"
                            }, {
                                type: "danger",
                                timer: 5000
                                });
                        });
                });
            }
        });

        if (failed) {
            pm = pm.then(function () {
                return Promise.reject(failed);
            });
        }
        return pm.then(function () {
            return Promise.all($.map(self.childrens || [], function (chld) {
                return chld.validate();
            }));
        });
    };

    function _wireElement(parent, object, value) {
        var data = $(this).data(),
            bind = data.bmBind,
            defval = data.bmDefault || '',
            params = [],
            changeEvent = 'change',
            filter = parent.options.bindFilter || '[data-bm-field]',
            prop = data.bmField, val,
            prz = Promise.resolve();

        if (data.bmUpdateOnly || !prop || prop.indexOf('$') === -1) {
            return Promise.resolve();
        }

        var nm = this.nodeName;
        prop = prop.split('$');
        if (prop[0] !== parent.options.className) {
            return Promise.resolve();
        }

        prop = prop[1];

        if (!bind) {
            if (nm === 'IMG') {
                bind = 'prop';
                params.push('src');
            } else if (nm === 'INPUT' && this.type === 'checkbox') {
                bind = 'prop';
                params.push('checked');
            } else if (nm === 'INPUT' ||
                nm === 'SELECT' ||
                nm === 'TEXTAREA') {
                bind = 'val';
            } else {
                bind = 'html';
            }
        }

        val = value ? value : (object ? object.get(prop) : defval);
        if (val && val.id && val.className) {
            val = val.id;
        }

        if (typeof val === 'string') {
            if (data.fieldType === 'String' || bind.indexOf('summernote;') === 0) {
                // switch to html
                if (val.trim().match(/^<[a-z][\s\S]*>/i)) {
                    $input = $(this);
                    $input.parents('.input-group').removeClass('input-group').find('button').hide();

                    if (!$(this).data('summernote')) {
                        return api.Utils.require(['summernote', 'css!/vendor/summernote/summernote']).then(function () {
                            parent.wireSummernote($input);
                            $input.summernote('code', val);
                            changeEvent = 'summernote.change';

                            $input.off(changeEvent).on(changeEvent, function () {
                                var self = this,
                                    v = $(this).val();

                                if (typeof parent.trigger === 'function') {
                                    parent.trigger('change', prop, v);
                                }
                                parent.$(filter + '[data-bm-field="' + $(this).data('bm-field') + '"]')
                                    .not(self).each(function () {
                                        _wireElement.call(this, parent, object, v);
                                    });
                            });
                        });
                    }
                    //  parent.wireSummernote($(this), prop);
                }
                if ($(this).data('summernote')) {
                    bind = 'summernote;code';
                    changeEvent = 'summernote.change';
                }
            }
        }
        if (data.fieldTarget === 'Files') {
            parent.__files.push(this);
            return prz;
        }
        if (data.fieldType === 'Date') {
            val = val && (typeof moment !== 'undefined') && moment(val).isValid() ? moment(val).format(parent.options.dateFormat) : val;
        }


        if (data.fieldType === 'Object') {
            val = val ? JSON.stringify(val) : val;
        }
        if (parent.selects && parent.selects[prop]) {
            parent.selects[prop].val(val);
        } else {
            if (data.fieldType === 'Pointer') {
                val = object && (typeof object.get === 'function') && object.get(prop) &&
                    (typeof object.get(prop).get === 'function') ? object.get(prop).get(data.searchFor || 'name') : val;
            }

            if (bind.indexOf(';') !== -1) {
                bind = bind.split(';');
                params.push(bind[1]);
                bind = bind[0];
            }
            params.push(val);

            $.fn[bind].apply($(this), params);
            if (nm === 'INPUT' && this.type === 'checkbox') {
                $(this).trigger('change');
            }
        }

        /* ?? change on subelements */
        if (typeof data.bmWithNoChange === 'undefined') {
            $(this).off(changeEvent).on(changeEvent, function () {
                var self = this,
                    v = $(this).val();

                if (typeof parent.trigger === 'function') {
                    parent.trigger('change', prop, v);
                }
                parent.$(filter + '[data-bm-field="' + $(this).data('bm-field') + '"]')
                    .not(self).each(function () {
                        _wireElement.call(this, parent, object, v);
                    });
            });
        }
        return prz;
    }

    Editor.prototype.wireSummernote = function ($el, field) {
        var self = this;
        if ($el.data('summernote')) {
            return;
        }
        self.options.summernote = self.options.summernote || {};
        api._.defaults(self.options.summernote, {
            height: '300px',
            focus: false,
            tabsize: 2,
            dialogsInBody: true,
            callbacks: {
                onChange: function (vs) {
                    $(this).val(vs);
                },
                onImageUpload: function (files) {
                    var editor = $(this).data('summernote').modules.editor,
                        uploader;

                    api.Utils.require('Flow')
                        .then(function () {
                            if (self.model && !self.model.isNew()) {
                                return;
                            }
                            if (typeof self.save === 'function') {
                                return self.save();
                            }
                            return self.update()
                                .then(function () {
                                    var vo = self.options.useMasterKey ? { useMasterKey: true } : undefined;
                                    return self.model.save({}, vo);
                                })
                                .catch(function (err) {
                                    api.Utils.require('notification')
                                        .then(function () {
                                            api.Trace.captureException(err);
                                        });
                                    if (typeof self.options.onError === 'function') {
                                        self.options.onError(err);
                                    }
                                });

                        })
                        .then(function () {
                            return new Promise(function (resolve, reject) {
                                var vpms = self.options.fileRole ||
                                    $el.data('bm-field') ? $el.data('bm-field').split('$')[1] : false ||
                                    'attachment';

                                editor.saveRange();
                                $el.parent().find('.summer-progress').show();

                                uploader = new Flow({
                                    target: '/api/storage/upload',
                                    chunkSize: 1024 * 1024,
                                    testChunks: true,
                                    query: {
                                        applicationId: api.applicationId,
                                        className: self.model.className,
                                        role: vpms,
                                        objectId: self.model.id
                                    }
                                });

                                uploader.addFile(files[0]);
                                uploader.on('fileSuccess', function (file, message) {
                                    var jsmg = JSON.parse(message),
                                        fdb,
                                        vo = self.options.useMasterKey ? { useMasterKey: true } : undefined;

                                    jsmg.className = jsmg.className || 'Files';

                                    fdb = api.Object.fromJSON(jsmg);
                                    self.model.relation('attachment').add(fdb);
                                    self.trigger('saving');
                                    return self.model.save({}, vo)
                                        .then(function () {
                                            self.trigger('saved');
                                            editor.restoreRange();

                                            editor.insertImage('/api/storage/' + api.applicationId + '/' + jsmg.objectId, jsmg.fileName);
                                            $el.parent().find('.summer-progress').hide();
                                            resolve();
                                        }).catch(function (err) {
                                            reject(err);
                                        });
                                });
                                uploader.on('fileProgress', function (file) {
                                    var vfp = Math.floor(file.progress() * 100);
                                    $el.parent().find('.progress span').html(vfp < 95 ? vfp + '%' : 'sending to cloud..');
                                    $el.parent().find('.progress .progress-bar').css({ width: vfp + '%' });
                                });
                                uploader.on('fileError', function (file, message) {
                                    $el.parent().find('.summer-progress').hide();
                                    reject(message);
                                });
                                uploader.upload();
                            });

                        })
                        .catch(function (err) {
                            api.Utils.require('notification')
                                .then(function () {
                                    api.Trace.captureException(err);
                                });
                            if (typeof self.options.onError === 'function') {
                                self.options.onError(err);
                            }
                        });

                }
            }
        });
        $el.summernote(self.options.summernote);
        $el.parent().css('position', 'relative');
        $el.parent().append(self.options.progressBar);
    };

    Editor.prototype.update = function () {
        var self = this,
            pm,
            filter = this.options.bindFilter || '[data-bm-field]';

        if (!this.model && !this.options.className) {
            return Promise.reject(new Error('Invalid binding'));
        }
        pm = this.validate();

        if (!this.model) {
            if (this.$('input[name="objectId"]').val()) {
                this.model = new api.Object.fromJSON({ className: this.options.className, objectId: this.$('input[name="objectId"]').val() });
            } else {
                this.model = new api.Object(this.options.className);
            }
        }
        this.$(filter).each(function () {
            var data = $(this).data(),
                bind = data.bmBind,
                params = [],
                prop,
                val;

            if (data.bmDisplayOnly || (data.fieldTarget === 'Files' && data.fieldType === "Pointer")) {
                return;
            }

            if (data.bmField.indexOf(';') === -1) {
                prop = data.bmField;
            } else {
                prop = data.bmField.split(';');
            }
            prop = prop.split('$');
            if (prop[0] !== self.options.className) {
                return;
            }
            prop = prop[1];

            if (!bind) {
                var nm = this.nodeName;
                if ((self.options.readOnlyBind || ['P', 'DIV']).indexOf(nm) !== -1) {
                    return;
                }
                if (nm === 'IMG') {
                    bind = 'prop';
                    params.push('src');
                } else if (nm === 'INPUT' && this.type === 'checkbox') {
                    bind = 'prop';
                    params.push('checked');
                } else if (nm === 'INPUT' ||
                    nm === 'SELECT' ||
                    nm === 'TEXTAREA') {
                    bind = 'val';
                } else {
                    bind = 'html';
                }
            }
            if ($(this).data('summernote')) {
                bind = 'summernote;code';
            }

            if (bind.indexOf(';') !== -1) {
                bind = bind.split(';');
                params.push(bind[1]);
                bind = bind[0];
            }
            val = $.fn[bind].apply($(this), params);

            if (data.fieldType === 'Number') {
                var lnm = parseFloat(val);
                val = isNaN(lnm) ? null : lnm;
            } else if (data.fieldType === 'Boolean' && (typeof val === 'string')) {
                val = (val.toLowerCase() === 'true');
            } else if (data.fieldType === "Pointer") {
                val = val ? api.Object.fromJSON({ className: data.fieldTarget, objectId: val }) : null;
            } else if (data.fieldType === 'String') {
                val = val.trim();
            } else if (data.fieldType === 'Date') {
                if (val) {
                    if (typeof moment !== 'undefined' && moment(val, self.options.dateFormat).isValid()) {
                        val = moment(val, self.options.dateFormat).toDate();
                    } else {
                        val = null;
                    }
                } else {
                    val = null;
                }
            } else if (data.fieldType === 'Object') {
                if (val) {
                    val = JSON.parse(val);
                } else {
                    val = null;
                }
            }
            if (data.fieldType === 'Relation') {
                if (self.selects[prop]) {
                    pm = pm.then(function () {
                        return self.selects[prop].syncRelation(self.model);
                    });
                }
            } else {
                self.model.set(prop, val);
            }

        });

        return pm.then(function () {
            return Promise.all($.each(self.childrens || [], function (rms) {
                return rms.update();
            }));
        });
    };

    Editor.prototype.destroy = function () {
        var self = this,
            obs = this.childrens || [];

        $.each(this.selects, function (ip, iv) {
            if (typeof iv.destroy === 'function') {
                obs.push(iv.destroy());
            }
        });

        return $.when.apply($, obs).then(function () {
            return api.UI.Control.prototype.destroy.call(self);
        });
    };


    api.UI.Editor = Editor;
    api.UI.Editor.defaults = $.extend({}, api.UI.Control.defaults, {
        cancelButtonClass: 'footer .btn-default',
        createButtonClass: 'footer .btn-success',
        removeButtonClass: 'footer .btn-danger',
        createButtonText: '<i class="fa fa-plus"></i> Create',
        updateButtonText: '<i class="fa fa-floppy-o"></i> Update',
        imageFormat: '<li data-object-id="{id}"><div class="well well-sm"><span>{display}</span><br><strong>{name}</strong><br>{size}<br><a href="{url}" target="_blank"><i class="fa fa-download"></i> Download</a>  | <a href="#" data-file-id="{id}" class="text-danger"><i class="fa fa-times"></i> Remove</a></div></li>',
        progressBar: '<div class="summer-progress" style="display:none"><div class="progress"><div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="min-width: 2em;"><span>0%</span></div></div>',
        bindFilter: '[data-bm-field]',
        dateFormat: 'DD-MM-YYYY',
        editSyncTimer: 30000
    });


    function DataSet(el, options) {
        this.$el = this.$el || $(el);
        this.options = this.options || $.extend({},
            api.UI.DataSet.defaults,
            this.$el.data(),
            options || {});

        this.options.className = this.options.className || this.$el.data('class-name');

        if (typeof this.options.createNew === 'undefined') {
            this.options.createNew = !!this.$el.data('acl-create');
        }

        api.UI.Control.call(this, el);
    }

    DataSet.prototype = Object.create(Control.prototype);
    DataSet.prototype.constructor = DataSet;

    DataSet.prototype.initialize = function () {
        var self = this,
            bid = this.$el.prop('id'),
            vop = {
                onAction: this.onAction.bind(this),
                onUpdated: function () {
                    self.grid.reload();
                    self.trigger('saved');
                },
                onCreate: function () {
                    var nob = new api.Object(self.options.className);
                    self.wire(nob);
                },
                onCancel: function () {
                    self.grid.show();
                    self.editor.hide();
                    self.trigger('canceled');
                }
            },
            opts = $.extend({}, vop, this.options);

        this.grid = this.options.grid || new DataTable(this.$(this.options.gridId ? this.options.gridId :
            (bid ? '#' + bid + '-table' : 'table.box-table')), opts);

        this.editor = this.options.editor ||
            new Editor(this.$(this.options.editorId ? this.options.editorId : (bid ? '#' + bid + '-form' : 'form.box-editor')), opts);

        api._.defaults(this.editor.options, vop);

        return Promise.all([this.editor.p || Promise.resolve(),
        this.grid.p || Promise.resolve()])
            .then(function () {
                return api.UI.Control.prototype.initialize.call(self);
            });
    };

    DataSet.prototype.onAction = function (cmdAction, cmObj, trigger) {

        if (cmdAction.fieldId &&
            cmdAction.objectId) {
            // edit
            this.wire(cmObj);
        }
    };

    DataSet.prototype.wire = function (cmObj) {
        this.grid.hide();
        this.editor.$el.removeClass('hidden').show();
        this.editor.wire(cmObj);
        this.trigger('wired');
    };

    DataSet.prototype.showGrid = function (reload) {
        this.editor.hide();
        this.grid.show();
        if (reload) {
            this.grid.reload();
        }
    };

    DataSet.prototype.destroy = function () {
        var self = this,
            pds = [];

        if (this.editor && (typeof this.editor.destroy === 'function')) {
            pds.push(this.editor.destroy());
        }
        if (this.grid && (typeof this.grid.destroy === 'function')) {
            pds.push(this.grid.destroy());
        }
        return $.when.apply($, pds).then(function () {
            return api.UI.Control.prototype.destroy.call(self);
        });
    };

    api.UI.DataSet = DataSet;
    api.UI.DataSet.defaults = {};
}));