!function(t,e){if("function"==typeof define&&define.amd)define(["Parse","TraceKit","jQuery","lodash","css","module","require"],e);else{e(Box,$)}}(0,function(t,e,r,n,o,i,a){var s,c=void 0!==i.config().i18n&&i.config().i18n;function u(t){return c?(s=s||a("i18next")).t(t):t}function l(e){var n,o=[],i=new Image;e.stack&&e.stack.length&&(r.each(e.stack,function(t,e){var r=function(t){if(t.url){var e,r,n={file:t.url,line:t.line,col:t.column,func:t.func||"?"},o=function(t){if(t.context){for(var e=t.context,r=~~(e.length/2),n=e.length,o=!1;n--;)if(e[n].length>300){o=!0;break}if(o){if(void 0===t.column)return;return[[],e[r].substr(t.column,50),[]]}return[e.slice(r>2?r-2:0,r),e[r],e.slice(r+1,r>2?r+3:e.length-1)]}}(t);if(o)for(e=["pre_context","context_line","post_context"],r=3;r--;)n[e[r]]=o[r];return n.in_app=!(/(Box|Parse|TraceKit)\./.test(n.function)||/engine\.(min\.)?js$/.test(n.filename)),n}}(e);r&&o.push(r)}),e.stack=o),n={installId:t.Storage.getItem(t.Storage.generatePath("installationId")),trace:e,url:window.location.href},document.referrer&&(n.Referrer=document.referrer),"undefined"!=typeof console&&"function"==typeof console.error&&console.log(n),"string"!=typeof n.trace.message&&delete n.trace.message,r.each(n.trace.stack,function(t,e){"string"!=typeof e.file&&delete e.file});var a=[],s=JSON.stringify(n,function(t,e){if("object"==typeof e&&null!==e){if(-1!==a.indexOf(e))return;a.push(e)}return e});i.src=t.Trace.reportUrl+"?appId="+encodeURIComponent(t.applicationId)+"&jsKey="+encodeURIComponent(t.javaScriptKey)+"&report="+encodeURIComponent(s),r.notify&&(window.scrollTo&&window.scrollTo(0,0),r.notify({title:u("Got an error"),message:u("Hit an error again :( .<br/> But we log and analyze and resolve asap. <br/>")+(e.message?"(<i>"+e.message+"</i>)":""),icon:"fa fa-bug"},{type:"danger",timer:5e3}))}Number.prototype.format||(Number.prototype.format=function(t,e){var r="\\d(?=(\\d{"+(e||3)+"})+"+(t>0?"\\.":"$")+")";return this.toFixed(Math.max(0,~~t)).replace(new RegExp(r,"g"),"$&,")}),Object.unflatten=function(t){"use strict";if(Object(t)!==t||Array.isArray(t))return t;var e=/\.?([^.\[\]]+)|\[(\d+)\]/g,r={};for(var n in t){for(var o,i=r,a="";o=e.exec(n);)i=i[a]||(i[a]=o[2]?[]:{}),a=o[2]||o[1];i[a]=t[n]}return r[""]||r},Object.flatten=function(t){var e={};return function t(r,n){if(Object(r)!==r)e[n]=r;else if(Array.isArray(r)){for(var o=0,i=r.length;o<i;o++)t(r[o],n+"["+o+"]");0===i&&(e[n]=[])}else{var a=!0;for(var s in r)a=!1,t(r[s],n?n+"."+s:s);a&&n&&(e[n]={})}}(t,""),e},Number.prototype.toByteSize=function(){if(!this)return"0 Byte";var t=parseInt(Math.floor(Math.log(this)/Math.log(1024)));return(this/Math.pow(1024,t)).format(2)+" "+["Bytes","KB","MB","GB","TB"][t]},Number.prototype.toPeriod=function(){var t=this;function e(t){return t>1?"s":""}var r=Math.floor(t/31536e3);if(r)return r+" year"+e(r);var n=Math.floor((t%=31536e3)/86400);if(n)return n+" day"+e(n);var o=Math.floor((t%=86400)/3600);if(o)return o+" hour"+e(o);var i=Math.floor((t%=3600)/60);if(i)return i+" minute"+e(i);var a=t%60;return a+" second"+e(a)},"function"!=typeof String.prototype.format&&(String.prototype.format=function(){"use strict";var t=this.toString();if(!arguments.length)return t;var e,r=typeof arguments[0],n="string"===r||"number"===r?arguments:arguments[0];for(e in n)t=t.replace(new RegExp("\\{"+e+"\\}","gi"),n[e]);return t}),"function"!=typeof String.prototype.escapeHtmlAttribute&&(String.prototype.escapeHtmlAttribute=function(){"use strict";var t={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;"};return this.toString().replace(/[&<>"'\/]/g,function(e){return t[e]})}),"function"!=typeof String.prototype.escapeHtml&&(String.prototype.escapeHtml=function(){"use strict";var t={"&":"&amp;","<":"&lt;",">":"&gt;"};return this.toString().replace(/[&<>]/g,function(e){return t[e]})}),"function"!=typeof String.prototype.trunc&&(String.prototype.trunc=function(t,e){"use strict";var r=this.length>t,n=r?this.substr(0,t-1):this;return n=e&&r?n.substr(0,n.lastIndexOf(" ")):n,r?n+"&hellip;":n}),"function"!=typeof String.isString&&(String.isString=function(t){return"string"==typeof t||t instanceof String}),function(){"use strict";if(navigator.userAgent.match(/IEMobile\/10\.0/)){var t=document.createElement("style");t.appendChild(document.createTextNode("@-ms-viewport{width:auto!important}")),document.querySelector("head").appendChild(t)}}(),t.serverURL="/api",t.Trace={reportUrl:"/box/trace/error",captureException:function(t,r){if(t&&!(t instanceof Error))return this.captureMessage(t);try{e.report(t,r)}catch(e){if(t!==e)throw e}return this},captureMessage:function(t){return"string"==typeof t&&(t={message:t}),l(t),this}},e.report.subscribe(l.bind(t.Trace)),e.remoteFetching="undefined"==typeof CDN_ROOT||!CDN_ROOT,window.addEventListener("unhandledrejection",function(){console.log(arguments)}),t.Socket={client:function(){return t.__ioSocket?Promise.resolve(t.__ioSocket):t.Utils.require("socket-io").then(function(e){return t._getInstallationId().then(function(r){var n={applicationId:t.applicationId,javaScriptKey:t.CoreManager.get("JAVASCRIPT_KEY"),installationId:r};return t.User.current()&&(n.sessionToken=t.User.current().getSessionToken()),t.__ioSocket=e({autoConnect:!1,query:n}),t.__ioSocket})})},hasClient:function(){return!!t.__ioSocket},emit:function(){var e=Array.prototype.slice.call(arguments);return t.Socket.client().then(function(t){return new Promise(function(r,n){e.push(function(){var t=Array.prototype.slice.call(arguments);r.apply(null,t)}),t.emit.apply(t,e)})})}};var f,p={},d=/\s+/,h=function(t,e,r,n,o){var i,a=0;if(r&&"object"==typeof r){void 0!==n&&"context"in o&&void 0===o.context&&(o.context=n);for(i=Object.keys(r);a<i.length;a++)e=h(t,e,i[a],r[i[a]],o)}else if(r&&d.test(r))for(i=r.split(d);a<i.length;a++)e=t(e,i[a],n,o);else e=t(e,r,n,o);return e};p.on=function(t,e,r){(this._events=h(g,this._events||{},t,e,{context:r,ctx:this,listening:f}),f)&&((this._listeners||(this._listeners={}))[f.id]=f,f.interop=!1);return this},p.listenTo=function(t,e,r){if(!t)return this;var o=t._listenId||(t._listenId=n.uniqueId("l")),i=this._listeningTo||(this._listeningTo={}),a=f=i[o];a||(this._listenId||(this._listenId=n.uniqueId("l")),a=f=i[o]=new x(this,t));var s=v(t,e,r,this);if(f=void 0,s)throw s;return a.interop&&a.on(e,r),this};var g=function(t,e,r,n){if(r){var o=t[e]||(t[e]=[]),i=n.context,a=n.ctx,s=n.listening;s&&s.count++,o.push({callback:r,context:i,ctx:i||a,listening:s})}return t},v=function(t,e,r,n){try{t.on(e,r,n)}catch(t){return t}};p.off=function(t,e,r){return this._events?(this._events=h(y,this._events,t,e,{context:r,listeners:this._listeners}),this):this},p.stopListening=function(t,e,r){var o=this._listeningTo;if(!o)return this;for(var i=t?[t._listenId]:Object.keys(o),a=0;a<i.length;a++){var s=o[i[a]];if(!s)break;s.obj.off(e,r,this),s.interop&&s.off(e,r)}return n.isEmpty(o)&&(this._listeningTo=void 0),this};var y=function(t,e,r,n){if(t){var o,i=n.context,a=n.listeners,s=0;if(e||i||r){for(o=e?[e]:Object.keys(t);s<o.length;s++){var c=t[e=o[s]];if(!c)break;for(var u=[],l=0;l<c.length;l++){var f=c[l];if(r&&r!==f.callback&&r!==f.callback._callback||i&&i!==f.context)u.push(f);else{var p=f.listening;p&&p.off(e,r)}}u.length?t[e]=u:delete t[e]}return t}for(o=Object.keys(a);s<o.length;s++)a[o[s]].cleanup()}};p.once=function(t,e,r){var o=h(m,{},t,e,n.bind(this.off,this));return"string"==typeof t&&null==r&&(e=void 0),this.on(o,e,r)},p.listenToOnce=function(t,e,r){var o=h(m,{},e,r,n.bind(this.stopListening,this,t));return this.listenTo(t,o)};var m=function(t,e,r,o){if(r){var i=t[e]=n.once(function(){o(e,i),r.apply(this,arguments)});i._callback=r}return t};p.trigger=function(t){if(!this._events)return this;for(var e=Math.max(0,arguments.length-1),r=Array(e),n=0;n<e;n++)r[n]=arguments[n+1];return h(_,this._events,t,void 0,r),this};var _=function(t,e,r,n){if(t){var o=t[e],i=t.all;o&&i&&(i=i.slice()),o&&b(o,n),i&&b(i,[e].concat(n))}return t},b=function(t,e){var r,n=-1,o=t.length,i=e[0],a=e[1],s=e[2];switch(e.length){case 0:for(;++n<o;)(r=t[n]).callback.call(r.ctx);return;case 1:for(;++n<o;)(r=t[n]).callback.call(r.ctx,i);return;case 2:for(;++n<o;)(r=t[n]).callback.call(r.ctx,i,a);return;case 3:for(;++n<o;)(r=t[n]).callback.call(r.ctx,i,a,s);return;default:for(;++n<o;)(r=t[n]).callback.apply(r.ctx,e);return}},x=function(t,e){this.id=t._listenId,this.listener=t,this.obj=e,this.interop=!0,this.count=0,this._events=void 0};x.prototype.on=p.on,x.prototype.off=function(t,e){var r;this.interop?(this._events=h(y,this._events,t,e,{context:void 0,listeners:void 0}),r=!this._events):(this.count--,r=0===this.count),r&&this.cleanup()},x.prototype.cleanup=function(){delete this.listener._listeningTo[this.obj._listenId],this.interop||delete this.obj._listeners[this.id]},p.bind=p.on,p.unbind=p.off,t.Events=p,t._=n,t.$=r;var U=t.Object.prototype.set;n.extend(t.Object.prototype,p,{set:function(){var t=["change"].concat(Array.prototype.slice.call(arguments));U.apply(this,arguments),this.trigger.apply(this,t)}});var S=t.CoreManager.getRESTController();if(t.RestController=n.extend({ajax:function(e,r,n){var o=this;return S.ajax(e,r,n).catch(function(e){var r=["error"].concat(Array.prototype.slice.call(arguments));return o.trigger.apply(o,r),t.Trace.captureException(e),Promise.reject(e)})},request:function(e,r,n,o){var i=this;return S.request(e,r,n,o).catch(function(e){var r=["error"].concat(Array.prototype.slice.call(arguments));return i.trigger.apply(i,r),t.Trace.captureException(e),Promise.reject(e)})}},p),t.CoreManager.setRESTController(t.RestController),t.getRouter=function(e,n,o){return t._router?Promise.resolve(t._router):(void 0===n&&(n=!0),o=o||"#!",t.Utils.require("Navigo").then(function(i){var a;return t._router=new i(e,n,o),t._router.events=Object.assign({},p),a=t._router._callLeave,t._router._callLeave=function(){t._router.events.trigger("leave"),a.apply(t._router)},t._router.notFound(function(){t._router._lastRouteResolved&&t._router._lastRouteResolved.url&&r.ajax({type:"GET",url:t._router._lastRouteResolved.url+".html",dataType:"html",beforeSend:function(e){t._router.events.trigger("loading"),t._router.$container&&t._router.$container.css({opacity:"0.0"})}}).then(function(e){t._router.$container&&(t._router.controller&&"function"==typeof t._router.controller.leave?t._router.controller.leave():Promise.resolve()).then(function(){var r;t._router.$container.html(e).delay(50).animate({opacity:"1.0"},300),t._router.events.trigger("loaded"),t._router.updatePageLinks(),(r=t._router.$container.children(":first").data("controller"))&&t.Utils.require(r).then(function(e){t._router.controller=e,t._router.controller&&"function"==typeof t._router.controller.init&&t._router.controller.init(t._router.$container)})})},function(e,r,n){t._router.events.trigger("error"),t._router.$container&&t._router.$container.animate({opacity:"1.0"},300)})}),Promise.resolve(t._router)}))},t.Utils={ismobile:/iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()),isFunction:function(t){return"[object Function]"===Object.prototype.toString.apply(t)},isArray:function(t){return"[object Array]"===Object.prototype.toString.apply(t)},isObject:function(t){return"[object Object]"===Object.prototype.toString.apply(t)},isDate:function(t){return"[object Date]"===Object.prototype.toString.apply(t)},isBoolean:function(t){return"[object Boolean]"===Object.prototype.toString.apply(t)},isNumber:function(t){return"[object Number]"===Object.prototype.toString.apply(t)},isString:function(t){return"[object String]"===Object.prototype.toString.apply(t)},isValue:function(e){return!t.Utils.isObject(e)&&!t.Utilsthis.isArray(e)&&!t.Utils.isFunction(e)},diff:{VALUE_CREATED:"created",VALUE_UPDATED:"updated",VALUE_DELETED:"deleted",VALUE_UNCHANGED:"unchanged",map:function(e,r){if(t.Utils.isFunction(e)||t.Utils.isFunction(r))throw"Invalid argument. Function given, object expected.";if(t.Utils.isValue(e)||t.Utils.isValue(r))return{type:t.Utils.diff.compareValues(e,r),data:void 0===e?r:e};var n,o={};for(n in e)if(!t.Utils.isFunction(e[n])){var i=void 0;void 0!==r[n]&&(i=r[n]),o[n]=t.Utils.diff.map(e[n],i)}for(n in r)t.Utils.isFunction(r[n])||void 0!==o[n]||(o[n]=t.Utils.map(void 0,r[n]));return o},compareValues:function(e,r){return e===r?t.Utils.diff.VALUE_UNCHANGED:t.Utils.isDate(e)&&t.Utils.isDate(r)&&e.getTime()===r.getTime()?t.Utils.diff.VALUE_UNCHANGED:void 0===e?t.Utils.diff.VALUE_CREATED:void 0===r?t.Utils.diff.VALUE_DELETED:t.Utils.diff.VALUE_UPDATED}},render:function(e,r,n){return Promise.resolve().then(function(){return"undefined"!=typeof dust?dust:(define.amd.dust=!0,t.Utils.require("dust-helpers").then(function(e){var r=e||dust;return"object"==typeof exports&&"object"==typeof global&&(global.dust=global.dust||r),r.onLoad=n||function(e,r){t.Utils.require([e]).then(function(t){r(null,t&&t.length?t[0]:null)})},r}))}).then(function(t){return new Promise(function(n,o){t.render(e,r,function(t,e){if(t)return o(t);n(e)})})})},require:function(e){var r=Array.isArray(e),n=r?e:Array.prototype.slice.call(arguments);return new Promise(function(e,o){a(n,function(){var t=Array.prototype.slice.call(arguments);e(r||n.length>1?t:t[0])},function(e){t.Trace.captureException(e),o(e)})})},inputDigitsOnly:function(t){r.each(t,function(t,e){r(e).keydown(function(t){-1!==r.inArray(t.keyCode,[8,9,27,13,110,189,190])||65===t.keyCode&&!0===t.ctrlKey||t.keyCode>=35&&t.keyCode<=39||(t.shiftKey||t.keyCode<48||t.keyCode>57)&&(t.keyCode<96||t.keyCode>105)&&t.preventDefault()})})},upload:function(e,o,i){var a,s=e&&e.files?e.files[0]:e;return s?("function"==typeof o&&(i=o,o={}),a=!!s&&n.extend({role:"attachment",name:s.name,contentType:s.type||"application/octet-stream"},o||{}),t.Cloud.run("createPresignedPost",a).then(function(e){var n,o=new FormData;return t.$.each(e.fields,function(t,e){o.append(t,e)}),o.append("file",s),e.file&&(e.file.className=e.file.className||"Files",n=t.Object.fromJSON(e.file)),new Promise(function(a,c){t.$.ajax({url:e.url,type:"POST",data:o,processData:!1,contentType:!1,success:function(){if(!e.file)return a();s.size&&n.set("size",s.size),s.lastModifiedDate&&n.set("lastModified",s.lastModifiedDate),n.set("key",e.fields.key),"public-read"===e.fields.ACL&&n.set("url",e.url+"/"+e.fields.key),a(n)},error:c,xhr:function(){return myXhr=r.ajaxSettings.xhr(),myXhr.upload&&i&&myXhr.upload.addEventListener("progress",function(t){t.lengthComputable&&i(t.loaded,t.total,Math.floor(t.loaded/t.total*100))},!1),myXhr}})})})):Promise.reject("missing file")},validateEmail:function(t){return/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(t)},hookLogout:function(e){r(e||'[data-action="userLogout"]').click(function(e){var n=r(this).attr("href")||r(this).data("redirect");e.preventDefault(),t.User.logOut().then(function(){n?window.location=n:window.location.reload(!0)})})},hookUserUI:function(e){(e||!r(document.body).hasClass("active-user")&&!r(document.body).hasClass("anonymous-user"))&&(t.User.current()?(r(document.body).removeClass("anonymous-user").addClass("active-user"),t.User.current().getRoles().then(function(t){r.each(t,function(t,e){r(document.body).addClass("role-"+e.get("name"))})})):r(document.body).removeClass("active-user").addClass("anonymous-user"))},hexOctet:function(){return Math.floor(65536*(1+Math.random())).toString(16).substring(1)},generateId:function(){var e=t.Utils.hexOctet;return e()+e()+"-"+e()+"-"+e()+"-"+e()+"-"+e()+e()+e()},hasAccess:function(e,r){return r=r||"write",!e||t.masterKey?Promise.resolve(!0):(e="function"==typeof e.toJSON?e.toJSON():e)["*"]&&e["*"][r]?Promise.resolve(!0):t.User.currentAsync().then(function(t){return t?e[t.id]&&e[t.id][r]?Promise.resolve(!0):t.getRoles().then(function(t){var n,o,i=!1;for(n=0;n<t.length&&!i;n++)o="role:"+t[n].getName(),i=i||e[o]&&e[o][r];return Promise.resolve(i)}):Promise.resolve(!1)})},querystring:{parse:function(t){var e={};if("string"==typeof(t=void 0!==t?t:window.location.search)&&t.length>0){"?"===t[0]&&(t=t.substring(1));for(var r=0,n=(t=t.split("&")).length;r<n;r++){var o,i,a=t[r],s=a.indexOf("=");s>=0?(o=a.substr(0,s),i=a.substr(s+1)):(o=a,i=""),i=decodeURIComponent(i),void 0===e[o]?e[o]=i:e[o]instanceof Array?e[o].push(i):e[o]=[e[o],i]}}return e},stringify:function(t){var e=[];if(t&&t.constructor===Object)for(var r in t)if(t[r]instanceof Array)for(var n=0,o=t[r].length;n<o;n++)e.push([encodeURIComponent(r),encodeURIComponent(t[r][n])].join("="));else e.push([encodeURIComponent(r),encodeURIComponent(t[r])].join("="));return e.join("&")}},debounce:function(t,e,r){var n;return function(){var o=this,i=arguments,a=r&&!n;clearTimeout(n),n=setTimeout(function(){n=null,r||t.apply(o,i)},e||250),a&&t.apply(o,i)}},throttle:function(t,e){var r,n;return e=e||250,function(){var o=this,i=+new Date,a=arguments;r&&i<r+e?(clearTimeout(n),n=setTimeout(function(){r=i,t.apply(o,a)},e)):(r=i,t.apply(o,a))}},getValue:function(t,e){for(var r=t.split("."),n=e||window,o=0;void 0!==n&&o<r.length;o+=1)n=n[r[o]];return n}},t.User.prototype.getRoles=function(e){var r=this;return this.__roles?Promise.resolve(this.__roles):new t.Query(t.Role).equalTo("users",r).find(e).then(function(t){return r.__roles=t,Promise.resolve(t)})},t.setVolatileStorage=function(e){var r=void 0===e||!!e,n=r?window.sessionStorage:window.localStorage;window.localStorage.setItem("stg:volatile",r?"yes":"no"),t.CoreManager.setStorageController({async:0,getItem:function(t){return n.getItem(t)},setItem:function(t,e){try{n.setItem(t,e)}catch(t){}},removeItem:function(t){n.removeItem(t)},clear(){n.clear()}})},"yes"===window.localStorage.getItem("stg:volatile")&&t.setVolatileStorage(),"undefined"!=typeof __box){if("function"==typeof __box.ignite)return __box.ignite(t);void 0!==__box.appId&&void 0!==__box.javaScriptKey&&(t._initialize(__box.appId,__box.javaScriptKey,__box.masterKey||__box.readOnlyMasterKey),t.serverURL=__box.serverURL||t.serverURL)}return t.User._registerAuthenticationProvider({getAuthType:function(){return"anonymous"},restoreAuthentication:function(){return!0}}),t});