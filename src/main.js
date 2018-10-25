(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['Parse', 'TraceKit', 'jQuery', 'lodash', 'css', 'require'], factory);
    } else {
        var exports = {};
        factory(Box, $);
    }
}(this, function (api, TraceKit, $, _, rq, require) {
    if (!Number.prototype.format) {
        Number.prototype.format = function (n, x) {
            var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
            return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
        };
    }

    Object.unflatten = function (data) {
        "use strict";
        if (Object(data) !== data || Array.isArray(data))
            return data;
        var regex = /\.?([^.\[\]]+)|\[(\d+)\]/g,
            resultholder = {};
        for (var p in data) {
            var cur = resultholder,
                prop = "",
                m;
            while (m = regex.exec(p)) {
                cur = cur[prop] || (cur[prop] = (m[2] ? [] : {}));
                prop = m[2] || m[1];
            }
            cur[prop] = data[p];
        }
        return resultholder[""] || resultholder;
    };

    Object.flatten = function (data) {
        var result = {};
        function recurse(cur, prop) {
            if (Object(cur) !== cur) {
                result[prop] = cur;
            } else if (Array.isArray(cur)) {
                for (var i = 0, l = cur.length; i < l; i++)
                    recurse(cur[i], prop + "[" + i + "]");
                if (l === 0)
                    result[prop] = [];
            } else {
                var isEmpty = true;
                for (var p in cur) {
                    isEmpty = false;
                    recurse(cur[p], prop ? prop + "." + p : p);
                }
                if (isEmpty && prop)
                    result[prop] = {};
            }
        }
        recurse(data, "");
        return result;
    };

    Number.prototype.toByteSize = function () {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (!this) return '0 Byte';
        var i = parseInt(Math.floor(Math.log(this) / Math.log(1024)));
        return (this / Math.pow(1024, i)).format(2) + ' ' + sizes[i];
    };

    Number.prototype.toPeriod = function () {
        var temp = this;
        function numberEnding(number) {
            return (number > 1) ? 's' : '';
        }
        var years = Math.floor(temp / 31536000);
        if (years) {
            return years + ' year' + numberEnding(years);
        }
        var days = Math.floor((temp %= 31536000) / 86400);
        if (days) {
            return days + ' day' + numberEnding(days);
        }
        var hours = Math.floor((temp %= 86400) / 3600);
        if (hours) {
            return hours + ' hour' + numberEnding(hours);
        }
        var minutes = Math.floor((temp %= 3600) / 60);
        if (minutes) {
            return minutes + ' minute' + numberEnding(minutes);
        }
        var seconds = temp % 60;
        return seconds + ' second' + numberEnding(seconds);
    };

    if (typeof String.prototype.format !== 'function') {
        String.prototype.format = function () {
            'use strict';
            var str = this.toString();
            if (!arguments.length) {
                return str;
            }

            var arg,
                argt = typeof arguments[0],
                args = (("string" === argt || "number" === argt) ? arguments : arguments[0]);
            for (arg in args) {
                str = str.replace(new RegExp("\\{" + arg + "\\}", "gi"), args[arg]);
            }
            return str;
        };
    }

    if (typeof String.prototype.escapeHtmlAttribute !== 'function') {
        String.prototype.escapeHtmlAttribute = function () {
            'use strict';
            var entityMap = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': '&quot;',
                "'": '&#39;',
                "/": '&#x2F;'
            },
                str = this.toString();

            return str.replace(/[&<>"'\/]/g, function (s) {
                return entityMap[s];
            });
        };
    }
    if (typeof String.prototype.escapeHtml !== 'function') {
        String.prototype.escapeHtml = function () {
            'use strict';
            var entityMap = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;"
            },
                str = this.toString();

            return str.replace(/[&<>]/g, function (s) {
                return entityMap[s];
            });
        };
    }

    if (typeof String.prototype.trunc !== 'function') {
        String.prototype.trunc =
            function (n, useWordBoundary) {
                'use strict';
                var toLong = this.length > n,
                    s_ = toLong ? this.substr(0, n - 1) : this;
                s_ = useWordBoundary && toLong ? s_.substr(0, s_.lastIndexOf(' ')) : s_;
                return toLong ? s_ + '&hellip;' : s_;
            };
    }

    if (typeof String.isString !== 'function') {
        String.isString = function (tvl) {
            return typeof tvl === 'string' || tvl instanceof String;
        };
    }

    (function () {
        'use strict';

        if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
            var msViewportStyle = document.createElement('style');
            msViewportStyle.appendChild(
                document.createTextNode(
                    '@-ms-viewport{width:auto!important}'
                )
            );
            document.querySelector('head').appendChild(msViewportStyle);
        }

    })();

    api.serverURL = '/api';

    function _extractContextFromFrame(frame) {
        // immediately check if we should even attempt to parse a context
        if (!frame.context) {
            return;
        }

        var context = frame.context,
            pivot = ~~(context.length / 2),
            i = context.length, isMinified = false;

        while (i--) {
            if (context[i].length > 300) {
                isMinified = true;
                break;
            }
        }

        if (isMinified) {
            // The source is minified and we don't know which column. Fuck it.
            if (typeof frame.column === 'undefined') {
                return;
            }

            return [
                [],  // no pre_context
                context[pivot].substr(frame.column, 50), // grab 50 characters, starting at the offending column
                []   // no post_context
            ];
        }

        return [
            context.slice(pivot > 2 ? pivot - 2 : 0, pivot),    // pre_context
            context[pivot],             // context_line
            context.slice(pivot + 1, pivot > 2 ? pivot + 3 : context.length - 1)    // post_context
        ];
    }

    function _normalizeFrame(frame) {
        if (!frame.url) {
            return;
        }
        // normalize the frames data
        var keys,
            normalized = {
                file: frame.url,
                line: frame.line,
                col: frame.column,
                'func': frame.func || '?'
            }, context = _extractContextFromFrame(frame), i;

        if (context) {
            keys = ['pre_context', 'context_line', 'post_context'];
            i = 3;
            while (i--) {
                normalized[keys[i]] = context[i];
            }
        }

        normalized.in_app = !( // determine if an exception came from outside of our app
            /(Box|Parse|TraceKit)\./.test(normalized['function']) ||
            /engine\.(min\.)?js$/.test(normalized.filename)
        );

        return normalized;
    }

    function _sendImgRequest(stackInfo) {
        var frames = [],
            img = new Image(),
            snddata;

        if (stackInfo.stack && stackInfo.stack.length) {
            $.each(stackInfo.stack, function (ix, stack) {
                var frame = _normalizeFrame(stack);
                if (frame) {
                    frames.push(frame);
                }
            });
            stackInfo.stack = frames;
        }
        snddata = {
            installId: api.Storage.getItem(api.Storage.generatePath('installationId')),
            trace: stackInfo,
            url: window.location.href
        };

        if (document.referrer) {
            snddata.Referrer = document.referrer;
        }
        if ((typeof console !== 'undefined') && (typeof console.error === 'function')) {
            console.log(snddata);
        }
        if (typeof snddata.trace.message !== 'string') {
            delete snddata.trace.message;
        }
        $.each(snddata.trace.stack, function (ix, skv) {
            if (typeof skv.file !== 'string') {
                delete skv.file;
            }
        });
        var cache = [],
            jserr = JSON.stringify(snddata, function (key, value) {
                if (typeof value === 'object' && value !== null) {
                    if (cache.indexOf(value) !== -1) {
                        // Circular reference found, discard key
                        return;
                    }
                    // Store value in our collection
                    cache.push(value);
                }
                return value;
            });
        img.src = api.Trace.reportUrl + '?appId=' + encodeURIComponent(api.applicationId) + '&jsKey=' + encodeURIComponent(api.javaScriptKey) + '&report=' + encodeURIComponent(jserr);
        if ($.notify) {
            if (window.scrollTo) {
                window.scrollTo(0, 0);
            }
            $.notify({
                title: "Got an error",
                message: "Hit an error again :( .<br/> But we log and analyze and resolve asap. <br/>" + (stackInfo.message ? '(<i>' + stackInfo.message + '</i>)' : ''),
                icon: "fa fa-bug"
            }, {
                    type: 'danger',
                    timer: 5000
                });
        }
    }
    api.Trace = {
        reportUrl: '/box/trace/error',
        captureException: function (ex, options) {
            if (ex && !(ex instanceof Error)) {
                return this.captureMessage(ex);
            }

            try {
                TraceKit.report(ex, options);
            } catch (ex1) {
                if (ex !== ex1) {
                    throw ex1;
                }
            }
            return this;
        },
        captureMessage: function (msg) {
            // Fire away!
            if (typeof msg === 'string') {
                msg = { message: msg };
            }
            _sendImgRequest(msg);

            return this;
        }
    };

    // initialize defaults on engine
    TraceKit.report.subscribe(_sendImgRequest.bind(api.Trace));
    TraceKit.remoteFetching = typeof CDN_ROOT === 'undefined' || !CDN_ROOT;

    window.addEventListener('unhandledrejection', function () {
        console.log(arguments);
    });


    api.Socket = {
        client: function () {
            if (api.__ioSocket) {
                return Promise.resolve(api.__ioSocket);
            }
            return api.Utils.require('socket-io')
                .then(function (io) {
                    return api._getInstallationId()
                        .then(function (installationId) {
                            var options = {
                                applicationId: api.applicationId,
                                javaScriptKey: api.CoreManager.get('JAVASCRIPT_KEY'),
                                installationId: installationId
                            };


                            if (api.User.current()) {
                                options.sessionToken = api.User.current().getSessionToken();
                            }
                            api.__ioSocket = io({ autoConnect: false, query: options });

                            return api.__ioSocket;
                        });

                });
        },
        hasClient: function () {
            return !!api.__ioSocket;
        },
        emit: function () {
            var vs = Array.prototype.slice.call(arguments);
            return api.Socket.client()
                .then(function (socket) {
                    return new Promise(function (resolve, reject) {
                        vs.push(function () {
                            var vis = Array.prototype.slice.call(arguments);
                            resolve.apply(null, vis);
                        });
                        socket.emit.apply(socket, vs);
                    });
                });
        }
    };

    var Events = {};
    var eventSplitter = /\s+/;

    // A private global variable to share between listeners and listenees.
    var _listening;

    // Iterates over the standard `event, callback` (as well as the fancy multiple
    // space-separated events `"change blur", callback` and jQuery-style event
    // maps `{event: callback}`).
    var eventsApi = function (iteratee, events, name, callback, opts) {
        var i = 0, names;
        if (name && typeof name === 'object') {
            // Handle event maps.
            if (callback !== void 0 && 'context' in opts && opts.context === void 0) opts.context = callback;
            for (names = Object.keys(name); i < names.length; i++) {
                events = eventsApi(iteratee, events, names[i], name[names[i]], opts);
            }
        } else if (name && eventSplitter.test(name)) {
            // Handle space-separated event names by delegating them individually.
            for (names = name.split(eventSplitter); i < names.length; i++) {
                events = iteratee(events, names[i], callback, opts);
            }
        } else {
            // Finally, standard events.
            events = iteratee(events, name, callback, opts);
        }
        return events;
    };

    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    Events.on = function (name, callback, context) {
        this._events = eventsApi(onApi, this._events || {}, name, callback, {
            context: context,
            ctx: this,
            listening: _listening
        });

        if (_listening) {
            var listeners = this._listeners || (this._listeners = {});
            listeners[_listening.id] = _listening;
            // Allow the listening to use a counter, instead of tracking
            // callbacks for library interop
            _listening.interop = false;
        }

        return this;
    };

    // Inversion-of-control versions of `on`. Tell *this* object to listen to
    // an event in another object... keeping track of what it's listening to
    // for easier unbinding later.
    Events.listenTo = function (obj, name, callback) {
        if (!obj) return this;
        var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
        var listeningTo = this._listeningTo || (this._listeningTo = {});
        var listening = _listening = listeningTo[id];

        // This object is not listening to any other events on `obj` yet.
        // Setup the necessary references to track the listening callbacks.
        if (!listening) {
            this._listenId || (this._listenId = _.uniqueId('l'));
            listening = _listening = listeningTo[id] = new Listening(this, obj);
        }

        // Bind callbacks on obj.
        var error = tryCatchOn(obj, name, callback, this);
        _listening = void 0;

        if (error) throw error;
        // If the target obj is not Backbone.Events, track events manually.
        if (listening.interop) listening.on(name, callback);

        return this;
    };

    // The reducing API that adds a callback to the `events` object.
    var onApi = function (events, name, callback, options) {
        if (callback) {
            var handlers = events[name] || (events[name] = []);
            var context = options.context, ctx = options.ctx, listening = options.listening;
            if (listening) listening.count++;

            handlers.push({ callback: callback, context: context, ctx: context || ctx, listening: listening });
        }
        return events;
    };

    // An try-catch guarded #on function, to prevent poisoning the global
    // `_listening` variable.
    var tryCatchOn = function (obj, name, callback, context) {
        try {
            obj.on(name, callback, context);
        } catch (e) {
            return e;
        }
    };

    // Remove one or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    Events.off = function (name, callback, context) {
        if (!this._events) return this;
        this._events = eventsApi(offApi, this._events, name, callback, {
            context: context,
            listeners: this._listeners
        });

        return this;
    };

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    Events.stopListening = function (obj, name, callback) {
        var listeningTo = this._listeningTo;
        if (!listeningTo) return this;

        var ids = obj ? [obj._listenId] : Object.keys(listeningTo);
        for (var i = 0; i < ids.length; i++) {
            var listening = listeningTo[ids[i]];

            // If listening doesn't exist, this object is not currently
            // listening to obj. Break out early.
            if (!listening) break;

            listening.obj.off(name, callback, this);
            if (listening.interop) listening.off(name, callback);
        }
        if (_.isEmpty(listeningTo)) this._listeningTo = void 0;

        return this;
    };

    // The reducing API that removes a callback from the `events` object.
    var offApi = function (events, name, callback, options) {
        if (!events) return;

        var context = options.context, listeners = options.listeners;
        var i = 0, names;

        // Delete all event listeners and "drop" events.
        if (!name && !context && !callback) {
            for (names = Object.keys(listeners); i < names.length; i++) {
                listeners[names[i]].cleanup();
            }
            return;
        }

        names = name ? [name] : Object.keys(events);
        for (; i < names.length; i++) {
            name = names[i];
            var handlers = events[name];

            // Bail out if there are no events stored.
            if (!handlers) break;

            // Find any remaining events.
            var remaining = [];
            for (var j = 0; j < handlers.length; j++) {
                var handler = handlers[j];
                if (
                    callback && callback !== handler.callback &&
                    callback !== handler.callback._callback ||
                    context && context !== handler.context
                ) {
                    remaining.push(handler);
                } else {
                    var listening = handler.listening;
                    if (listening) listening.off(name, callback);
                }
            }

            // Replace events if there are any remaining.  Otherwise, clean up.
            if (remaining.length) {
                events[name] = remaining;
            } else {
                delete events[name];
            }
        }

        return events;
    };

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, its listener will be removed. If multiple events
    // are passed in using the space-separated syntax, the handler will fire
    // once for each event, not once for a combination of all events.
    Events.once = function (name, callback, context) {
        // Map the event into a `{event: once}` object.
        var events = eventsApi(onceMap, {}, name, callback, _.bind(this.off, this));
        if (typeof name === 'string' && context == null) callback = void 0;
        return this.on(events, callback, context);
    };

    // Inversion-of-control versions of `once`.
    Events.listenToOnce = function (obj, name, callback) {
        // Map the event into a `{event: once}` object.
        var events = eventsApi(onceMap, {}, name, callback, _.bind(this.stopListening, this, obj));
        return this.listenTo(obj, events);
    };

    // Reduces the event callbacks into a map of `{event: onceWrapper}`.
    // `offer` unbinds the `onceWrapper` after it has been called.
    var onceMap = function (map, name, callback, offer) {
        if (callback) {
            var once = map[name] = _.once(function () {
                offer(name, once);
                callback.apply(this, arguments);
            });
            once._callback = callback;
        }
        return map;
    };

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    Events.trigger = function (name) {
        if (!this._events) return this;

        var length = Math.max(0, arguments.length - 1);
        var args = Array(length);
        for (var i = 0; i < length; i++) args[i] = arguments[i + 1];

        eventsApi(triggerApi, this._events, name, void 0, args);
        return this;
    };

    // Handles triggering the appropriate event callbacks.
    var triggerApi = function (objEvents, name, callback, args) {
        if (objEvents) {
            var events = objEvents[name];
            var allEvents = objEvents.all;
            if (events && allEvents) allEvents = allEvents.slice();
            if (events) triggerEvents(events, args);
            if (allEvents) triggerEvents(allEvents, [name].concat(args));
        }
        return objEvents;
    };

    // A difficult-to-believe, but optimized internal dispatch function for
    // triggering events. Tries to keep the usual cases speedy (most internal
    // Backbone events have 3 arguments).
    var triggerEvents = function (events, args) {
        var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
        switch (args.length) {
            case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
            case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
            case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
            case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
            default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args); return;
        }
    };

    // A listening class that tracks and cleans up memory bindings
    // when all callbacks have been offed.
    var Listening = function (listener, obj) {
        this.id = listener._listenId;
        this.listener = listener;
        this.obj = obj;
        this.interop = true;
        this.count = 0;
        this._events = void 0;
    };

    Listening.prototype.on = Events.on;

    // Offs a callback (or several).
    // Uses an optimized counter if the listenee uses Backbone.Events.
    // Otherwise, falls back to manual tracking to support events
    // library interop.
    Listening.prototype.off = function (name, callback) {
        var cleanup;
        if (this.interop) {
            this._events = eventsApi(offApi, this._events, name, callback, {
                context: void 0,
                listeners: void 0
            });
            cleanup = !this._events;
        } else {
            this.count--;
            cleanup = this.count === 0;
        }
        if (cleanup) this.cleanup();
    };

    // Cleans up memory bindings between the listener and the listenee.
    Listening.prototype.cleanup = function () {
        delete this.listener._listeningTo[this.obj._listenId];
        if (!this.interop) delete this.obj._listeners[this.id];
    };

    // Aliases for backwards compatibility.
    Events.bind = Events.on;
    Events.unbind = Events.off;

    api.Events = Events;
    api._ = _;
    api.$ = $;

    var objectSet = api.Object.prototype.set;
    _.extend(api.Object.prototype, Events,
        {
            set: function () {
                var varg = ['change'].concat(Array.prototype.slice.call(arguments));

                objectSet.apply(this, arguments);
                this.trigger.apply(this, varg);
            }
        });
    api.getRouter = function (root, useHash, hash) {
        if (api._router) {
            return Promise.resolve(api._router);
        }
        if (typeof useHash === 'undefined') {
            useHash = true;
        }
        hash = hash || '#!';
        return api.Utils.require('Navigo')
            .then(function (Navigo) {
                var olv;

                api._router = new Navigo(root, useHash, hash);
                api._router.events = Object.assign({}, Events);
                olv = api._router._callLeave;

                api._router._callLeave = function () {
                    api._router.events.trigger('leave');
                    olv.apply(api._router);
                };

                api._router.notFound(function () {
                    if (api._router._lastRouteResolved && api._router._lastRouteResolved.url) {
                        $.ajax({
                            type: "GET",
                            url: api._router._lastRouteResolved.url + '.html',
                            dataType: 'html',
                            beforeSend: function (xhr) {
                                api._router.events.trigger('loading');
                                if (api._router.$container) {
                                    api._router.$container.css({ opacity: '0.0' });
                                }
                            }
                        })
                            .then(function (data) {
                                var pms;
                                if (api._router.$container) {

                                    if (api._router.controller &&
                                        (typeof api._router.controller.leave === 'function')) {
                                        pms = api._router.controller.leave();
                                    } else {
                                        pms = Promise.resolve();
                                    }

                                    pms.then(function () {
                                        var cdt;
                                        api._router.$container.html(data)
                                            .delay(50)
                                            .animate({ opacity: '1.0' }, 300);
                                        api._router.events.trigger('loaded');
                                        api._router.updatePageLinks();

                                        cdt = api._router.$container.children(':first').data('controller');
                                        if (cdt) {
                                            api.Utils.require(cdt)
                                                .then(function (ctrler) {
                                                    api._router.controller = ctrler;
                                                    if (api._router.controller && (typeof api._router.controller.init === 'function')) {
                                                        api._router.controller.init(api._router.$container);
                                                    }
                                                });
                                        }
                                    });
                                }
                            }, function (xhr, textStatus, thrownError) {
                                api._router.events.trigger('error');
                                if (api._router.$container) {
                                    api._router.$container.animate({ opacity: '1.0' }, 300);
                                }
                            });
                    }
                });
                return Promise.resolve(api._router);
            });
    };
    api.Utils = {
        ismobile: (/iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase())),
        isFunction: function (obj) {
            return Object.prototype.toString.apply(obj) === '[object Function]';
        },
        isArray: function (obj) {
            return Object.prototype.toString.apply(obj) === '[object Array]';
        },
        isObject: function (obj) {
            return Object.prototype.toString.apply(obj) === '[object Object]';
        },
        isDate: function (obj) {
            return Object.prototype.toString.apply(obj) === '[object Date]';
        },
        isBoolean: function (obj) {
            return Object.prototype.toString.apply(obj) === '[object Boolean]';
        },
        isNumber: function (obj) {
            return Object.prototype.toString.apply(obj) === '[object Number]';
        },
        isString: function (obj) {
            return Object.prototype.toString.apply(obj) === '[object String]';
        },
        isValue: function (obj) {
            return !api.Utils.isObject(obj) && !api.Utilsthis.isArray(obj) && !api.Utils.isFunction(obj);
        },
        diff: {
            VALUE_CREATED: 'created',
            VALUE_UPDATED: 'updated',
            VALUE_DELETED: 'deleted',
            VALUE_UNCHANGED: 'unchanged',
            map: function (obj1, obj2) {
                if (api.Utils.isFunction(obj1) || api.Utils.isFunction(obj2)) {
                    throw 'Invalid argument. Function given, object expected.';
                }
                if (api.Utils.isValue(obj1) || api.Utils.isValue(obj2)) {
                    return {
                        type: api.Utils.diff.compareValues(obj1, obj2),
                        data: (obj1 === undefined) ? obj2 : obj1
                    };
                }

                var key, diff = {};
                for (key in obj1) {
                    if (api.Utils.isFunction(obj1[key])) {
                        continue;
                    }

                    var value2 = undefined;
                    if ('undefined' != typeof (obj2[key])) {
                        value2 = obj2[key];
                    }

                    diff[key] = api.Utils.diff.map(obj1[key], value2);
                }
                for (key in obj2) {
                    if (api.Utils.isFunction(obj2[key]) || ('undefined' != typeof (diff[key]))) {
                        continue;
                    }

                    diff[key] = api.Utils.map(undefined, obj2[key]);
                }

                return diff;

            },
            compareValues: function (value1, value2) {
                if (value1 === value2) {
                    return api.Utils.diff.VALUE_UNCHANGED;
                }
                if (api.Utils.isDate(value1) && api.Utils.isDate(value2) && value1.getTime() === value2.getTime()) {
                    return api.Utils.diff.VALUE_UNCHANGED;
                }
                if ('undefined' == typeof (value1)) {
                    return api.Utils.diff.VALUE_CREATED;
                }
                if ('undefined' == typeof (value2)) {
                    return api.Utils.diff.VALUE_DELETED;
                }

                return api.Utils.diff.VALUE_UPDATED;
            }
        },
        render: function (template, object, onLoad) {
            return Promise.resolve()
                .then(function () {
                    if (typeof dust !== 'undefined') {
                        return dust;
                    } 
                    return api.Utils.require('dust-helpers')
                        .then(function (dcore) {
                            var dlnk = dcore || dust;
                            if (typeof exports === 'object' && typeof global === 'object') {
                                global.dust = global.dust || dlnk;
                            }
                            dlnk.onLoad = onLoad || function (name, cb) {
                                api.Utils.require([name])
                                    .then(function (arz) {
                                        cb(null, arz && arz.length ? arz[0] : null);
                                    });
                            };
                            return dlnk;
                        });
                })
                .then(function (dust) {
                    return new Promise(function (resolve, reject) {
                        dust.render(template, object, function (err, thtml) {
                            if (err) {
                                return reject(err);
                            }
                            resolve(thtml);
                        });
                    });
                });
        },
        require: function (reqs) {
            var isArray = Array.isArray(reqs),
                args = isArray ? reqs : Array.prototype.slice.call(arguments);
            return new Promise(function (resolve, reject) {

                require(args, function () {
                    var cpms = Array.prototype.slice.call(arguments);
                    resolve(isArray || args.length > 1 ? cpms : cpms[0]);
                }, function (err) {
                    api.Trace.captureException(err);
                    reject(err);
                });
            });
        },
        inputDigitsOnly: function (elm) {
            $.each(elm, function (ix, el) {
                $(el).keydown(function (e) {
                    if ($.inArray(e.keyCode, [8, 9, 27, 13, 110, 189, 190]) !== -1 ||
                        (e.keyCode === 65 && e.ctrlKey === true) ||
                        (e.keyCode >= 35 && e.keyCode <= 39)) {
                        return;
                    }
                    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                        e.preventDefault();
                    }
                });
            });
        },
        validateEmail: function (email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        },
        hookLogout: function (selector) {
            $(selector || '[data-action="userLogout"]').click(function (evt) {
                var url = $(this).attr('href') || $(this).data('redirect');
                evt.preventDefault();
                api.User.logOut()
                    .then(function () {
                        if (url) {
                            window.location = url;
                        } else {
                            window.location.reload(true);
                        }
                    });
            });
        },
        hookUserUI: function (force) {
            if (!force &&
                ($(document.body).hasClass('active-user') || $(document.body).hasClass('anonymous-user'))) {
                return;
            }
            if (api.User.current()) {
                $(document.body).removeClass('anonymous-user').addClass('active-user');
                api.User.current().getRoles()
                    .then(function (urls) {
                        $.each(urls, function (ix, uri) {
                            $(document.body).addClass('role-' + uri.get('name'));
                        });
                    });
            } else {
                $(document.body).removeClass('active-user').addClass('anonymous-user');
            }
        },
        hexOctet: function () {
            return Math.floor(
                (1 + Math.random()) * 0x10000
            ).toString(16).substring(1);
        },
        generateId: function () {
            var hexOctet = api.Utils.hexOctet;
            return (
                hexOctet() + hexOctet() + '-' +
                hexOctet() + '-' +
                hexOctet() + '-' +
                hexOctet() + '-' +
                hexOctet() + hexOctet() + hexOctet()
            );
        },
        hasAccess: function (acl, access) {
            access = access || 'write';
            if (!acl || api.masterKey) {
                return Promise.resolve(true);
            }
            acl = typeof acl.toJSON === 'function' ? acl.toJSON() : acl;
            if (acl['*'] && acl['*'][access]) {
                return Promise.resolve(true);
            }
            return api.User.currentAsync()
                .then(function (us) {
                    if (!us) {
                        return Promise.resolve(false);
                    }
                    if (acl[us.id] && acl[us.id][access]) {
                        return Promise.resolve(true);
                    }
                    return us.getRoles()
                        .then(function (roles) {
                            var i, acc = false, rn;
                            for (i = 0; i < roles.length && !acc; i++) {
                                rn = 'role:' + roles[i].getName();
                                acc = acc || (acl[rn] && acl[rn][access]);
                            }
                            return Promise.resolve(acc);
                        });
                });
        },
        querystring: {
            parse: function (string) {
                var parsed = {};
                string = (string !== undefined) ? string : window.location.search;

                if (typeof string === "string" && string.length > 0) {
                    if (string[0] === '?') {
                        string = string.substring(1);
                    }

                    string = string.split('&');

                    for (var i = 0, length = string.length; i < length; i++) {
                        var element = string[i],
                            eqPos = element.indexOf('='),
                            keyValue, elValue;

                        if (eqPos >= 0) {
                            keyValue = element.substr(0, eqPos);
                            elValue = element.substr(eqPos + 1);
                        }
                        else {
                            keyValue = element;
                            elValue = '';
                        }

                        elValue = decodeURIComponent(elValue);

                        if (parsed[keyValue] === undefined) {
                            parsed[keyValue] = elValue;
                        }
                        else if (parsed[keyValue] instanceof Array) {
                            parsed[keyValue].push(elValue);
                        }
                        else {
                            parsed[keyValue] = [parsed[keyValue], elValue];
                        }
                    }
                }

                return parsed;
            },
            stringify: function (obj) {
                var string = [];

                if (!!obj && obj.constructor === Object) {
                    for (var prop in obj) {
                        if (obj[prop] instanceof Array) {
                            for (var i = 0, length = obj[prop].length; i < length; i++) {
                                string.push([encodeURIComponent(prop), encodeURIComponent(obj[prop][i])].join('='));
                            }
                        }
                        else {
                            string.push([encodeURIComponent(prop), encodeURIComponent(obj[prop])].join('='));
                        }
                    }
                }

                return string.join('&');
            }
        },
        debounce: function (func, wait, immediate) {
            var timeout;
            return function () {
                var context = this, args = arguments;
                var later = function () {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait || 250);
                if (callNow) func.apply(context, args);
            };
        },
        throttle: function (fn, threshhold) {
            threshhold = threshhold || 250;
            var last,
                deferTimer;
            return function () {
                var context = this;

                var now = +new Date(),
                    args = arguments;
                if (last && now < last + threshhold) {
                    // hold on to it
                    clearTimeout(deferTimer);
                    deferTimer = setTimeout(function () {
                        last = now;
                        fn.apply(context, args);
                    }, threshhold);
                } else {
                    last = now;
                    fn.apply(context, args);
                }
            };
        },
        getValue: function (namespace, parent) {
            var parts = namespace.split('.'),
                current = parent || window;

            for (var i = 0; typeof current !== 'undefined' && i < parts.length; i += 1) {
                current = current[parts[i]];
            }
            return current;
        }

    };

    api.User.prototype.getRoles = function (options) {
        var self = this;
        if (this.__roles) {
            return Promise.resolve(this.__roles);
        }
        return (new api.Query(api.Role)).equalTo("users", self).find(options)
            .then(function (roles) {
                self.__roles = roles;
                return Promise.resolve(roles);
            });

    };

    api.setVolatileStorage = function (volatile) {
        var vlt = (typeof volatile === 'undefined' || !volatile),
            storage = vlt ? window.sessionStorage : window.localStorage;

        window.localStorage.setItem('stg:volatile', vlt ? 'yes' : 'no');
        api.CoreManager.setStorageController({
            async: 0,
            getItem: function (path) {
                return storage.getItem(path);
            },
            setItem: function (path, value) {
                try {
                    storage.setItem(path, value);
                } catch (e) {
                }
            },
            removeItem: function (path) {
                storage.removeItem(path);
            },
            clear() {
                storage.clear();
            }
        });
    };
    if (window.localStorage.getItem('stg:volatile') === 'yes') {
        api.setVolatileStorage();
    }

    if (typeof __box !== 'undefined') {
        if (typeof __box.ignite === 'function') {
            return __box.ignite(api);
        }
        if (typeof __box.appId !== 'undefined' && typeof __box.javaScriptKey !== 'undefined') {
            api._initialize(__box.appId, __box.javaScriptKey, __box.masterKey || __box.readOnlyMasterKey);
            api.serverURL = __box.serverURL || api.serverURL;
        }
    }

    api.User._registerAuthenticationProvider({
        getAuthType: function () { return 'anonymous'; },
        restoreAuthentication: function () { return true; }
    });

    return api;
}));