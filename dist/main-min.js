Number.prototype.format||(Number.prototype.format=function(t,e){var o="\\d(?=(\\d{"+(e||3)+"})+"+(t>0?"\\.":"$")+")";return this.toFixed(Math.max(0,~~t)).replace(new RegExp(o,"g"),"$&,")}),Object.unflatten=function(t){"use strict";if(Object(t)!==t||Array.isArray(t))return t;var e=/\.?([^.\[\]]+)|\[(\d+)\]/g,o={};for(var r in t){for(var n,s=o,i="";n=e.exec(r);)s=s[i]||(s[i]=n[2]?[]:{}),i=n[2]||n[1];s[i]=t[r]}return o[""]||o},Object.flatten=function(t){var e={};return function t(o,r){if(Object(o)!==o)e[r]=o;else if(Array.isArray(o)){for(var n=0,s=o.length;n<s;n++)t(o[n],r+"["+n+"]");0===s&&(e[r]=[])}else{var i=!0;for(var a in o)i=!1,t(o[a],r?r+"."+a:a);i&&r&&(e[r]={})}}(t,""),e},Number.prototype.toByteSize=function(){if(!this)return"0 Byte";var t=parseInt(Math.floor(Math.log(this)/Math.log(1024)));return(this/Math.pow(1024,t)).format(2)+" "+["Bytes","KB","MB","GB","TB"][t]},Number.prototype.toPeriod=function(){var t=this;function e(t){return t>1?"s":""}var o=Math.floor(t/31536e3);if(o)return o+" year"+e(o);var r=Math.floor((t%=31536e3)/86400);if(r)return r+" day"+e(r);var n=Math.floor((t%=86400)/3600);if(n)return n+" hour"+e(n);var s=Math.floor((t%=3600)/60);if(s)return s+" minute"+e(s);var i=t%60;return i+" second"+e(i)},"function"!=typeof String.prototype.format&&(String.prototype.format=function(){"use strict";var t=this.toString();if(!arguments.length)return t;var e,o=typeof arguments[0],r="string"===o||"number"===o?arguments:arguments[0];for(e in r)t=t.replace(new RegExp("\\{"+e+"\\}","gi"),r[e]);return t}),"function"!=typeof String.prototype.escapeHtmlAttribute&&(String.prototype.escapeHtmlAttribute=function(){"use strict";var t={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;"};return this.toString().replace(/[&<>"'\/]/g,function(e){return t[e]})}),"function"!=typeof String.prototype.escapeHtml&&(String.prototype.escapeHtml=function(){"use strict";var t={"&":"&amp;","<":"&lt;",">":"&gt;"};return this.toString().replace(/[&<>]/g,function(e){return t[e]})}),"function"!=typeof String.prototype.trunc&&(String.prototype.trunc=function(t,e){"use strict";var o=this.length>t,r=o?this.substr(0,t-1):this;return r=e&&o?r.substr(0,r.lastIndexOf(" ")):r,o?r+"&hellip;":r}),"function"!=typeof String.isString&&(String.isString=function(t){return"string"==typeof t||t instanceof String}),function(){"use strict";if(navigator.userAgent.match(/IEMobile\/10\.0/)){var t=document.createElement("style");t.appendChild(document.createTextNode("@-ms-viewport{width:auto!important}")),document.querySelector("head").appendChild(t)}}();var CDN_ROOT="undefined"!=typeof __box&&__box.CDN||"",requireBox=requirejs.config({enforceDefine:!1,baseUrl:CDN_ROOT+"/js/",map:{"*":{css:CDN_ROOT+"/vendor/require-css/css.js"}},paths:{app:CDN_ROOT+"/js/",vendor:CDN_ROOT+"/vendor",api:CDN_ROOT+"/vendor/Parse-SDK-JS/parse.min",controls:CDN_ROOT+"/vendor/parse-ui/controls-min",jQuery:document.querySelector&&window.localStorage&&window.addEventListener?CDN_ROOT+"/vendor/jquery/jquery.min":["//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min"],"jquery-ui":CDN_ROOT+"/vendor/jquery-ui/jquery-ui.min",TraceKit:CDN_ROOT+"/js/tracekit",select2:CDN_ROOT+"/vendor/select2/js/select2.full.min","select2-ro":CDN_ROOT+"/vendor/select2/js/i18n/ro",moment:CDN_ROOT+"/vendor/moment/moment.min","moment-locale":CDN_ROOT+"/vendor/moment/moment-with-locales.min",summernote:CDN_ROOT+"/vendor/summernote/summernote",lodash:CDN_ROOT+"/vendor/lodash/lodash.min",Flow:CDN_ROOT+"/vendor/flow.js/flow",Navigo:CDN_ROOT+"/vendor/navigo/navigo",bootstrap:CDN_ROOT+"/vendor/bootstrap/js/bootstrap.min","bootstrap-datetimepiker":CDN_ROOT+"/vendor/eonasdan-bootstrap-datetimepicker/bootstrap-datetimepicker.min","datatables.net":CDN_ROOT+"/vendor/datatables/jquery.dataTables.min","datatables.net-bs":CDN_ROOT+"/vendor/datatables/dataTables.bootstrap.min","datatables.net-responsive":CDN_ROOT+"/js/dataTables.responsive",dataTablesResponsiveBoostrap:CDN_ROOT+"/vendor/datatables-responsive/responsive.bootstrap","datatables.net-buttons":CDN_ROOT+"/vendor/datatables.net-buttons/dataTables.buttons","datatables.buttons.colVis":CDN_ROOT+"/vendor/datatables.net-buttons/buttons.colVis","datatables.buttons.flash":CDN_ROOT+"/vendor/datatables.net-buttons/buttons.flash","datatables.buttons.html5":CDN_ROOT+"/vendor/datatables.net-buttons/buttons.html5","datatables.buttons.print":CDN_ROOT+"/vendor/datatables.net-buttons/buttons.print","datatables.net-buttons-bs":CDN_ROOT+"/vendor/datatables.net-buttons-bs/buttons.bootstrap",dust:CDN_ROOT+"/vendor/dustjs-linkedin/dust-full","dust.core":CDN_ROOT+"/vendor/dustjs-linkedin/dust-core","dust-helpers":CDN_ROOT+"/vendor/dustjs-helpers/dust-helpers.min","socket-io":CDN_ROOT+"/vendor/socket.io-client/socket.io",WebFont:CDN_ROOT+"/vendor/bower-webfontloader/webfont","qrcode.js":CDN_ROOT+"/vendor/qrcode.js/qrcode",ace:CDN_ROOT+"/vendor/ace-builds/src-noconflict/ace","snap.svg":CDN_ROOT+"/vendor/snap.svg/snap.svg-min",photoswipe:CDN_ROOT+"/vendor/photoswipe/photoswipe","photoswipe-ui":CDN_ROOT+"/vendor/photoswipe/photoswipe-ui-default","fusty-factory":CDN_ROOT+"/vendor/fusty-flow.js/fusty-flow-factory","fusty-flow":CDN_ROOT+"/vendor/fusty-flow.js/fusty-flow",easypiechart:CDN_ROOT+"/vendor/jquery.easy-pie-chart/jquery.easypiechart",chartjs:CDN_ROOT+"/vendor/chart.js/Chart",sparkline:CDN_ROOT+"/vendor/sparkline/jquery.sparkline",flot:CDN_ROOT+"/vendor/Flot/jquery.flot",Raphael:CDN_ROOT+"/vendor/raphael/raphael.min",morris:CDN_ROOT+"/vendor/morris.js/morris",spectrum:CDN_ROOT+"/vendor/spectrum/spectrum",pivot:CDN_ROOT+"/vendor/pivottable/pivot",d3_renderers:CDN_ROOT+"/vendor/pivottable/d3_renderers",c3_renderers:CDN_ROOT+"/vendor/pivottable/c3_renderers",export_renderers:CDN_ROOT+"/vendor/pivottable/export_renderers",d3:CDN_ROOT+"/vendor/d3/d3",c3:CDN_ROOT+"/vendor/c3/c3","require-js":CDN_ROOT+"/vendor/require-css/css",notification:CDN_ROOT+"/vendor/remarkable-bootstrap-notify/bootstrap-notify.min",filestack:"//static.filestackapi.com/v3/filestack",tinycolor:CDN_ROOT+"/vendor/tinycolor/tinycolor","bootstrap-dialog":CDN_ROOT+"/vendor/bootstrap3-dialog/js/bootstrap-dialog.min",tinygradient:CDN_ROOT+"/vendor/tinygradient/tinygradient",Rainbowvis:CDN_ROOT+"/vendor/rainbowvis.js/rainbowvis"},shim:{jQuery:{exports:"jQuery"},photoswipe:{deps:["jQuery"]},pivot:{deps:["jquery-ui"],exports:"$.fn.pivotUI"},d3_renderers:{deps:["pivot","d3"]},c3_renderers:{deps:["d3_renderers","c3"]},export_renderers:{deps:["pivot"]},"bootstrap-dialog":{deps:["bootstrap","css!"+CDN_ROOT+"/vendor/bootstrap3-dialog/css/bootstrap-dialog.min.css"]},c3:{deps:["d3","css!"+CDN_ROOT+"/vendor/c3/c3.css"]},"fusty-flow":{deps:["Flow"]},"fusty-factory":{deps:["fusty-flow"]},"photoswipe-ui":{deps:["photoswipe"]},"socket-io":{exports:"io"},morris:{deps:["jQuery","Raphael"],exports:"Morris",init:function(t,e){window.Raphael=e}},"jquery-ui":{deps:["jQuery"]},chartjs:{exports:"Chart"},spectrum:{deps:["jQuery"],exports:"$.fn.spectrum"},"dust-helpers":{deps:["dust.core"]},ace:{exports:"ace"},WebFont:{exports:"WebFont"},"snap.svg":{exports:"Snap"},lodash:{exports:"_"},bootstrap:{deps:["jQuery"],exports:"$.fn.popover"},"bootstrap-datetimepicker":{deps:["bootstrap","moment"],exports:"$.fn.datetimepicker"},select2:{deps:["jQuery","css!"+CDN_ROOT+"/vendor/select2/css/select2.min.css","css!"+CDN_ROOT+"/vendor/select2-bootstrap-theme/select2-bootstrap.min.css"],exports:"$.fn.select2"},"select2-ro":{deps:["select2"]},moment:{exports:"moment"},summernote:{deps:["bootstrap"],exports:"$.fn.summernote"},Flow:{exports:"Flow"},"datatables.net":{deps:["jQuery"],exports:"$.fn.DataTable"},"datatables.net-responsive":{deps:["datatables.net"],exports:"$.fn.DataTable.Responsive"},dataTablesResponsiveBoostrap:{deps:["datatables.net-bs","datatables.net-responsive","css!"+CDN_ROOT+"/vendor/datatables/jquery.dataTables","css!"+CDN_ROOT+"/vendor/datatables/dataTables.bootstrap","css!"+CDN_ROOT+"/vendor/datatables-responsive/responsive.bootstrap"]},"datatables.net-bs":{deps:["datatables.net"]},"datatables.net-buttons":{deps:["datatables.net"],exports:"$.fn.dataTable.Buttons"},"datatables.net-buttons-bs":{deps:["datatables.net-buttons"]},"datatables.buttons.colVis":{deps:["datatables.net-buttons"]},"datatables.buttons.flash":{deps:["datatables.net-buttons"]},"datatables.buttons.html5":{deps:["datatables.net-buttons"]},"datatables.buttons.print":{deps:["datatables.net-buttons"]},easypiechart:{deps:["jQuery"],exports:"$.fn.easyPieChart"},Rainbowvis:{exports:"Rainbow"},blockly:{exports:"Blockly"},blockly_blocks:{deps:["blockly"],exports:"Blockly.Blocks.colour"},blockly_msgs:{deps:["blockly_blocks"]}}});if(define("Box",["api","TraceKit","jQuery","lodash","require"],function(t,e,o,r,n){function s(e){var r,n=[],s=new Image;e.stack&&e.stack.length&&(o.each(e.stack,function(t,e){var o=function(t){if(t.url){var e,o,r={file:t.url,line:t.line,col:t.column,func:t.func||"?"},n=function(t){if(t.context){for(var e=t.context,o=~~(e.length/2),r=e.length,n=!1;r--;)if(e[r].length>300){n=!0;break}if(n){if(void 0===t.column)return;return[[],e[o].substr(t.column,50),[]]}return[e.slice(o>2?o-2:0,o),e[o],e.slice(o+1,o>2?o+3:e.length-1)]}}(t);if(n)for(e=["pre_context","context_line","post_context"],o=3;o--;)r[e[o]]=n[o];return r.in_app=!(/(Box|Parse|TraceKit)\./.test(r.function)||/engine\.(min\.)?js$/.test(r.filename)),r}}(e);o&&n.push(o)}),e.stack=n),r={installId:t.Storage.getItem(t.Storage.generatePath("installationId")),trace:e,url:window.location.href},document.referrer&&(r.Referrer=document.referrer),"undefined"!=typeof console&&"function"==typeof console.error&&console.log(r),"string"!=typeof r.trace.message&&delete r.trace.message,o.each(r.trace.stack,function(t,e){"string"!=typeof e.file&&delete e.file});var i=[],a=JSON.stringify(r,function(t,e){if("object"==typeof e&&null!==e){if(-1!==i.indexOf(e))return;i.push(e)}return e});s.src=t.Trace.reportUrl+"?appId="+encodeURIComponent(t.applicationId)+"&jsKey="+encodeURIComponent(t.javaScriptKey)+"&report="+encodeURIComponent(a),o.notify&&(window.scrollTo&&window.scrollTo(0,0),o.notify({title:"Got an error",message:"Hit an error again :( .<br/> But we log and analyze and resolve asap. <br/>"+(e.message?"(<i>"+e.message+"</i>)":""),icon:"fa fa-bug"},{type:"danger",timer:5e3}))}t.serverURL="/api",t.Trace={reportUrl:"/box/trace/error",captureException:function(t,o){if(t&&!(t instanceof Error))return this.captureMessage(t);try{e.report(t,o)}catch(e){if(t!==e)throw e}return this},captureMessage:function(t){return"string"==typeof t&&(t={message:t}),s(t),this}},e.report.subscribe(s.bind(t.Trace)),e.remoteFetching=!CDN_ROOT,window.addEventListener("unhandledrejection",function(){console.log(arguments)}),t.Socket={client:function(){return t.__ioSocket?Promise.resolve(t.__ioSocket):t.Utils.require("socket-io").then(function(e){return t._getInstallationId().then(function(o){var r={applicationId:t.applicationId,javaScriptKey:t.CoreManager.get("JAVASCRIPT_KEY"),installationId:o};return t.User.current()&&(r.sessionToken=t.User.current().getSessionToken()),t.__ioSocket=e({autoConnect:!1,query:r}),t.__ioSocket})})},hasClient:function(){return!!t.__ioSocket},emit:function(){var e=Array.prototype.slice.call(arguments);return t.Socket.client().then(function(t){return new Promise(function(o,r){e.push(function(){var t=Array.prototype.slice.call(arguments);o.apply(null,t)}),t.emit.apply(t,e)})})}};var i,a={},c=/\s+/,l=function(t,e,o,r,n){var s,i=0;if(o&&"object"==typeof o){void 0!==r&&"context"in n&&void 0===n.context&&(n.context=r);for(s=Object.keys(o);i<s.length;i++)e=l(t,e,s[i],o[s[i]],n)}else if(o&&c.test(o))for(s=o.split(c);i<s.length;i++)e=t(e,s[i],r,n);else e=t(e,o,r,n);return e};a.on=function(t,e,o){(this._events=l(u,this._events||{},t,e,{context:o,ctx:this,listening:i}),i)&&((this._listeners||(this._listeners={}))[i.id]=i,i.interop=!1);return this},a.listenTo=function(t,e,o){if(!t)return this;var n=t._listenId||(t._listenId=r.uniqueId("l")),s=this._listeningTo||(this._listeningTo={}),a=i=s[n];a||(this._listenId||(this._listenId=r.uniqueId("l")),a=i=s[n]=new h(this,t));var c=d(t,e,o,this);if(i=void 0,c)throw c;return a.interop&&a.on(e,o),this};var u=function(t,e,o,r){if(o){var n=t[e]||(t[e]=[]),s=r.context,i=r.ctx,a=r.listening;a&&a.count++,n.push({callback:o,context:s,ctx:s||i,listening:a})}return t},d=function(t,e,o,r){try{t.on(e,o,r)}catch(t){return t}};a.off=function(t,e,o){return this._events?(this._events=l(p,this._events,t,e,{context:o,listeners:this._listeners}),this):this},a.stopListening=function(t,e,o){var n=this._listeningTo;if(!n)return this;for(var s=t?[t._listenId]:Object.keys(n),i=0;i<s.length;i++){var a=n[s[i]];if(!a)break;a.obj.off(e,o,this),a.interop&&a.off(e,o)}return r.isEmpty(n)&&(this._listeningTo=void 0),this};var p=function(t,e,o,r){if(t){var n,s=r.context,i=r.listeners,a=0;if(e||s||o){for(n=e?[e]:Object.keys(t);a<n.length;a++){var c=t[e=n[a]];if(!c)break;for(var l=[],u=0;u<c.length;u++){var d=c[u];if(o&&o!==d.callback&&o!==d.callback._callback||s&&s!==d.context)l.push(d);else{var p=d.listening;p&&p.off(e,o)}}l.length?t[e]=l:delete t[e]}return t}for(n=Object.keys(i);a<n.length;a++)i[n[a]].cleanup()}};a.once=function(t,e,o){var n=l(f,{},t,e,r.bind(this.off,this));return"string"==typeof t&&null==o&&(e=void 0),this.on(n,e,o)},a.listenToOnce=function(t,e,o){var n=l(f,{},e,o,r.bind(this.stopListening,this,t));return this.listenTo(t,n)};var f=function(t,e,o,n){if(o){var s=t[e]=r.once(function(){n(e,s),o.apply(this,arguments)});s._callback=o}return t};a.trigger=function(t){if(!this._events)return this;for(var e=Math.max(0,arguments.length-1),o=Array(e),r=0;r<e;r++)o[r]=arguments[r+1];return l(v,this._events,t,void 0,o),this};var v=function(t,e,o,r){if(t){var n=t[e],s=t.all;n&&s&&(s=s.slice()),n&&b(n,r),s&&b(s,[e].concat(r))}return t},b=function(t,e){var o,r=-1,n=t.length,s=e[0],i=e[1],a=e[2];switch(e.length){case 0:for(;++r<n;)(o=t[r]).callback.call(o.ctx);return;case 1:for(;++r<n;)(o=t[r]).callback.call(o.ctx,s);return;case 2:for(;++r<n;)(o=t[r]).callback.call(o.ctx,s,i);return;case 3:for(;++r<n;)(o=t[r]).callback.call(o.ctx,s,i,a);return;default:for(;++r<n;)(o=t[r]).callback.apply(o.ctx,e);return}},h=function(t,e){this.id=t._listenId,this.listener=t,this.obj=e,this.interop=!0,this.count=0,this._events=void 0};h.prototype.on=a.on,h.prototype.off=function(t,e){var o;this.interop?(this._events=l(p,this._events,t,e,{context:void 0,listeners:void 0}),o=!this._events):(this.count--,o=0===this.count),o&&this.cleanup()},h.prototype.cleanup=function(){delete this.listener._listeningTo[this.obj._listenId],this.interop||delete this.obj._listeners[this.id]},a.bind=a.on,a.unbind=a.off,t.Events=a,t._=r,t.$=o;var y=t.Object.prototype.set;return r.extend(t.Object.prototype,a,{set:function(){var t=["change"].concat(Array.prototype.slice.call(arguments));y.apply(this,arguments),this.trigger.apply(this,t)}}),t.getRouter=function(e,r,n){return t._router?Promise.resolve(t._router):(void 0===r&&(r=!0),n=n||"#!",t.Utils.require("Navigo").then(function(s){var i;return t._router=new s(e,r,n),t._router.events=Object.assign({},a),i=t._router._callLeave,t._router._callLeave=function(){t._router.events.trigger("leave"),i.apply(t._router)},t._router.notFound(function(){t._router._lastRouteResolved&&t._router._lastRouteResolved.url&&o.ajax({type:"GET",url:t._router._lastRouteResolved.url+".html",dataType:"html",beforeSend:function(e){t._router.events.trigger("loading"),t._router.$container&&t._router.$container.css({opacity:"0.0"})}}).then(function(e){t._router.$container&&(t._router.controller&&"function"==typeof t._router.controller.leave?t._router.controller.leave():Promise.resolve()).then(function(){var o;t._router.$container.html(e).delay(50).animate({opacity:"1.0"},300),t._router.events.trigger("loaded"),t._router.updatePageLinks(),(o=t._router.$container.children(":first").data("controller"))&&t.Utils.require(o).then(function(e){t._router.controller=e,t._router.controller&&"function"==typeof t._router.controller.init&&t._router.controller.init(t._router.$container)})})},function(e,o,r){t._router.events.trigger("error"),t._router.$container&&t._router.$container.animate({opacity:"1.0"},300)})}),Promise.resolve(t._router)}))},t.Utils={ismobile:/iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()),isFunction:function(t){return"[object Function]"===Object.prototype.toString.apply(t)},isArray:function(t){return"[object Array]"===Object.prototype.toString.apply(t)},isObject:function(t){return"[object Object]"===Object.prototype.toString.apply(t)},isDate:function(t){return"[object Date]"===Object.prototype.toString.apply(t)},isBoolean:function(t){return"[object Boolean]"===Object.prototype.toString.apply(t)},isNumber:function(t){return"[object Number]"===Object.prototype.toString.apply(t)},isString:function(t){return"[object String]"===Object.prototype.toString.apply(t)},isValue:function(e){return!t.Utils.isObject(e)&&!t.Utilsthis.isArray(e)&&!t.Utils.isFunction(e)},diff:{VALUE_CREATED:"created",VALUE_UPDATED:"updated",VALUE_DELETED:"deleted",VALUE_UNCHANGED:"unchanged",map:function(e,o){if(t.Utils.isFunction(e)||t.Utils.isFunction(o))throw"Invalid argument. Function given, object expected.";if(t.Utils.isValue(e)||t.Utils.isValue(o))return{type:t.Utils.diff.compareValues(e,o),data:void 0===e?o:e};var r,n={};for(r in e)if(!t.Utils.isFunction(e[r])){var s=void 0;void 0!==o[r]&&(s=o[r]),n[r]=t.Utils.diff.map(e[r],s)}for(r in o)t.Utils.isFunction(o[r])||void 0!==n[r]||(n[r]=t.Utils.map(void 0,o[r]));return n},compareValues:function(e,o){return e===o?t.Utils.diff.VALUE_UNCHANGED:t.Utils.isDate(e)&&t.Utils.isDate(o)&&e.getTime()===o.getTime()?t.Utils.diff.VALUE_UNCHANGED:void 0===e?t.Utils.diff.VALUE_CREATED:void 0===o?t.Utils.diff.VALUE_DELETED:t.Utils.diff.VALUE_UPDATED}},getFlow:function(e){return t.Utils.require("Flow").then(function(o){var r=new o(e);return r.support?r:t.Utils.require("fusty-flow").then(function(t){return new t(e)})})},render:function(e,o){return Promise.resolve().then(function(){return"undefined"!=typeof dust?dust:t.Utils.require("dust-helpers").then(function(e){var o=e||dust;return"object"==typeof exports&&"object"==typeof global&&(global.dust=global.dust||o),o.onLoad=function(e,r){var n=o.__templateRoot||__box.CDN||"/";n&&n.lastIndexOf("/")!==n.length-1&&(n+="/"),t.Utils.require([n+e+".js"]).then(function(){r()})},o})}).then(function(t){return new Promise(function(r,n){t.render(e,o,function(t,e){if(t)return n(t);r(e)})})})},require:function(e){var o=Array.isArray(e),r=o?e:Array.prototype.slice.call(arguments);return new Promise(function(e,s){n(r,function(){var t=Array.prototype.slice.call(arguments);e(o||r.length>1?t:t[0])},function(e){t.Trace.captureException(e),s(e)})})},inputDigitsOnly:function(t){o.each(t,function(t,e){o(e).keydown(function(t){-1!==o.inArray(t.keyCode,[8,9,27,13,110,189,190])||65===t.keyCode&&!0===t.ctrlKey||t.keyCode>=35&&t.keyCode<=39||(t.shiftKey||t.keyCode<48||t.keyCode>57)&&(t.keyCode<96||t.keyCode>105)&&t.preventDefault()})})},validateEmail:function(t){return/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(t)},hookLogout:function(e){o(e||'[data-action="userLogout"]').click(function(e){var r=o(this).attr("href")||o(this).data("redirect");e.preventDefault(),t.User.logOut().then(function(){r?window.location=r:window.location.reload(!0)})})},hookUserUI:function(e){(e||!o(document.body).hasClass("active-user")&&!o(document.body).hasClass("anonymous-user"))&&(t.User.current()?(o(document.body).removeClass("anonymous-user").addClass("active-user"),t.User.current().getRoles().then(function(t){o.each(t,function(t,e){o(document.body).addClass("role-"+e.get("name"))})})):o(document.body).removeClass("active-user").addClass("anonymous-user"))},hexOctet:function(){return Math.floor(65536*(1+Math.random())).toString(16).substring(1)},generateId:function(){var e=t.Utils.hexOctet;return e()+e()+"-"+e()+"-"+e()+"-"+e()+"-"+e()+e()+e()},hasAccess:function(e,o){return o=o||"write",!e||t.masterKey?Promise.resolve(!0):(e="function"==typeof e.toJSON?e.toJSON():e)["*"]&&e["*"][o]?Promise.resolve(!0):t.User.currentAsync().then(function(t){return t?e[t.id]&&e[t.id][o]?Promise.resolve(!0):t.getRoles().then(function(t){var r,n,s=!1;for(r=0;r<t.length&&!s;r++)n="role:"+t[r].getName(),s=s||e[n]&&e[n][o];return Promise.resolve(s)}):Promise.resolve(!1)})},querystring:{parse:function(t){var e={};if("string"==typeof(t=void 0!==t?t:window.location.search)&&t.length>0){"?"===t[0]&&(t=t.substring(1));for(var o=0,r=(t=t.split("&")).length;o<r;o++){var n,s,i=t[o],a=i.indexOf("=");a>=0?(n=i.substr(0,a),s=i.substr(a+1)):(n=i,s=""),s=decodeURIComponent(s),void 0===e[n]?e[n]=s:e[n]instanceof Array?e[n].push(s):e[n]=[e[n],s]}}return e},stringify:function(t){var e=[];if(t&&t.constructor===Object)for(var o in t)if(t[o]instanceof Array)for(var r=0,n=t[o].length;r<n;r++)e.push([encodeURIComponent(o),encodeURIComponent(t[o][r])].join("="));else e.push([encodeURIComponent(o),encodeURIComponent(t[o])].join("="));return e.join("&")}},debounce:function(t,e,o){var r;return function(){var n=this,s=arguments,i=o&&!r;clearTimeout(r),r=setTimeout(function(){r=null,o||t.apply(n,s)},e||250),i&&t.apply(n,s)}},throttle:function(t,e){var o,r;return e=e||250,function(){var n=this,s=+new Date,i=arguments;o&&s<o+e?(clearTimeout(r),r=setTimeout(function(){o=s,t.apply(n,i)},e)):(o=s,t.apply(n,i))}},getValue:function(t,e){for(var o=t.split("."),r=e||window,n=0;void 0!==r&&n<o.length;n+=1)r=r[o[n]];return r}},t.User.prototype.getRoles=function(e){var o=this;return this.__roles?Promise.resolve(this.__roles):new t.Query(t.Role).equalTo("users",o).find(e).then(function(t){return o.__roles=t,Promise.resolve(t)})},t.setVolatileStorage=function(e){var o=void 0===e||!e,r=o?window.sessionStorage:window.localStorage;window.localStorage.setItem("stg:volatile",o?"yes":"no"),t.CoreManager.setStorageController({async:0,getItem:function(t){return r.getItem(t)},setItem:function(t,e){try{r.setItem(t,e)}catch(t){}},removeItem:function(t){r.removeItem(t)},clear(){r.clear()}})},"yes"===window.localStorage.getItem("stg:volatile")&&t.setVolatileStorage(),t}),"undefined"!=typeof __box&&"function"==typeof __box.ignite&&requireBox(["Box"],function(t){return __box.ignite(t)}),"function"==typeof document.querySelector){var dsc=document.querySelector("script[data-bootstrap][data-main]")&&document.querySelector("script[data-bootstrap][data-main]").getAttribute("data-bootstrap");dsc&&requireBox([dsc],function(t){t&&"function"==typeof t.ignite&&t.ignite()})}