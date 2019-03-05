!function(e,t){if("function"==typeof define&&define.amd)define(["Parse","TraceKit","jQuery","lodash","css","module","require"],t);else{t(Box,$)}}(0,function(e,t,r,n,o,i,s){var a,u=void 0!==i.config().i18n&&i.config().i18n;function c(e){return u&&(a=a||s("i18next"))&&"function"==typeof a.t&&a.t(e)||e}function l(t){var n,o=[],i=new Image;t.stack&&t.stack.length&&(r.each(t.stack,function(e,t){var r=function(e){if(e.url){var t,r,n={file:e.url,line:e.line,col:e.column,func:e.func||"?"},o=function(e){if(e.context){for(var t=e.context,r=~~(t.length/2),n=t.length,o=!1;n--;)if(t[n].length>300){o=!0;break}if(o){if(void 0===e.column)return;return[[],t[r].substr(e.column,50),[]]}return[t.slice(r>2?r-2:0,r),t[r],t.slice(r+1,r>2?r+3:t.length-1)]}}(e);if(o)for(t=["pre_context","context_line","post_context"],r=3;r--;)n[t[r]]=o[r];return n.in_app=!(/(Box|Parse|TraceKit)\./.test(n.function)||/engine\.(min\.)?js$/.test(n.filename)),n}}(t);r&&o.push(r)}),t.stack=o),n={installId:e.Storage.getItem(e.Storage.generatePath("installationId")),trace:t,url:window.location.href},document.referrer&&(n.Referrer=document.referrer),"undefined"!=typeof console&&"function"==typeof console.error&&console.log(n),"string"!=typeof n.trace.message&&delete n.trace.message,r.each(n.trace.stack,function(e,t){"string"!=typeof t.file&&delete t.file});var s=[],a=JSON.stringify(n,function(e,t){if("object"==typeof t&&null!==t){if(-1!==s.indexOf(t))return;s.push(t)}return t});i.src=e.Trace.reportUrl+"?appId="+encodeURIComponent(e.applicationId)+"&jsKey="+encodeURIComponent(e.javaScriptKey)+"&report="+encodeURIComponent(a),r.notify&&(window.scrollTo&&window.scrollTo(0,0),r.notify({title:c("Got an error"),message:c("Hit an error again :( .<br/> But we log and analyze and resolve asap. <br/>")+(t.message?"(<i>"+t.message+"</i>)":""),icon:"fa fa-bug"},{type:"danger",timer:5e3}))}Number.prototype.format||(Number.prototype.format=function(e,t){var r="\\d(?=(\\d{"+(t||3)+"})+"+(e>0?"\\.":"$")+")";return this.toFixed(Math.max(0,~~e)).replace(new RegExp(r,"g"),"$&,")}),Object.unflatten=function(e){"use strict";if(Object(e)!==e||Array.isArray(e))return e;var t=/\.?([^.\[\]]+)|\[(\d+)\]/g,r={};for(var n in e){for(var o,i=r,s="";o=t.exec(n);)i=i[s]||(i[s]=o[2]?[]:{}),s=o[2]||o[1];i[s]=e[n]}return r[""]||r},Object.flatten=function(e){var t={};return function e(r,n){if(Object(r)!==r)t[n]=r;else if(Array.isArray(r)){for(var o=0,i=r.length;o<i;o++)e(r[o],n+"["+o+"]");0===i&&(t[n]=[])}else{var s=!0;for(var a in r)s=!1,e(r[a],n?n+"."+a:a);s&&n&&(t[n]={})}}(e,""),t},Number.prototype.toByteSize=function(){if(!this||0==this)return"0 Byte";var e=parseInt(Math.floor(Math.log(this)/Math.log(1024)));return(this/Math.pow(1024,e)).format(2)+" "+["Bytes","KB","MB","GB","TB"][e]},Number.prototype.toPeriod=function(){var e=this;function t(e){return e>1?"s":""}var r=Math.floor(e/31536e3);if(r)return r+" "+c("year")+t(r);var n=Math.floor((e%=31536e3)/86400);if(n)return n+" "+c("day")+t(n);var o=Math.floor((e%=86400)/3600);if(o)return o+" "+c("day")+t(o);var i=Math.floor((e%=3600)/60);if(i)return i+" "+c("minute")+t(i);var s=e%60;return s+" "+c("second")+t(s)},"function"!=typeof String.prototype.format&&(String.prototype.format=function(){"use strict";var e=this.toString();if(!arguments.length)return e;var t,r=typeof arguments[0],n="string"===r||"number"===r?arguments:arguments[0];for(t in n)e=e.replace(new RegExp("\\{"+t+"\\}","gi"),n[t]);return e}),"function"!=typeof String.prototype.escapeHtmlAttribute&&(String.prototype.escapeHtmlAttribute=function(){"use strict";var e={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;"};return this.toString().replace(/[&<>"'\/]/g,function(t){return e[t]})}),"function"!=typeof String.prototype.escapeHtml&&(String.prototype.escapeHtml=function(){"use strict";var e={"&":"&amp;","<":"&lt;",">":"&gt;"};return this.toString().replace(/[&<>]/g,function(t){return e[t]})}),"function"!=typeof String.prototype.trunc&&(String.prototype.trunc=function(e,t){"use strict";var r=this.length>e,n=r?this.substr(0,e-1):this;return n=t&&r?n.substr(0,n.lastIndexOf(" ")):n,r?n+"&hellip;":n}),"function"!=typeof String.isString&&(String.isString=function(e){return"string"==typeof e||e instanceof String}),function(){"use strict";if(navigator.userAgent.match(/IEMobile\/10\.0/)){var e=document.createElement("style");e.appendChild(document.createTextNode("@-ms-viewport{width:auto!important}")),document.querySelector("head").appendChild(e)}}(),e.serverURL="/api",e.Trace={reportUrl:"/box/trace/error",captureException:function(e,r){if(e&&!(e instanceof Error))return this.captureMessage(e);try{t.report(e,r)}catch(t){if(e!==t)throw t}return this},captureMessage:function(e){return"string"==typeof e&&(e={message:e}),l(e),this}},t.report.subscribe(l.bind(e.Trace)),t.remoteFetching="undefined"==typeof CDN_ROOT||!CDN_ROOT,window.addEventListener("unhandledrejection",function(){console.log(arguments)}),e.Socket={client:function(){return e.__ioSocket?Promise.resolve(e.__ioSocket):e.Utils.require("socket-io").then(function(t){return e._getInstallationId().then(function(r){var n={applicationId:e.applicationId,javaScriptKey:e.CoreManager.get("JAVASCRIPT_KEY"),installationId:r};return e.User.current()&&(n.sessionToken=e.User.current().getSessionToken()),e.__ioSocket=t({autoConnect:!1,query:n}),e.__ioSocket})})},hasClient:function(){return!!e.__ioSocket},emit:function(){var t=Array.prototype.slice.call(arguments);return e.Socket.client().then(function(e){return new Promise(function(r,n){t.push(function(){var e=Array.prototype.slice.call(arguments);r.apply(null,e)}),e.emit.apply(e,t)})})}};var f,d={},p=/\s+/,h=function(e,t,r,n,o){var i,s=0;if(r&&"object"==typeof r){void 0!==n&&"context"in o&&void 0===o.context&&(o.context=n);for(i=Object.keys(r);s<i.length;s++)t=h(e,t,i[s],r[i[s]],o)}else if(r&&p.test(r))for(i=r.split(p);s<i.length;s++)t=e(t,i[s],n,o);else t=e(t,r,n,o);return t};d.on=function(e,t,r){(this._events=h(v,this._events||{},e,t,{context:r,ctx:this,listening:f}),f)&&((this._listeners||(this._listeners={}))[f.id]=f,f.interop=!1);return this},d.listenTo=function(e,t,r){if(!e)return this;var o=e._listenId||(e._listenId=n.uniqueId("l")),i=this._listeningTo||(this._listeningTo={}),s=f=i[o];s||(this._listenId||(this._listenId=n.uniqueId("l")),s=f=i[o]=new x(this,e));var a=g(e,t,r,this);if(f=void 0,a)throw a;return s.interop&&s.on(t,r),this};var v=function(e,t,r,n){if(r){var o=e[t]||(e[t]=[]),i=n.context,s=n.ctx,a=n.listening;a&&a.count++,o.push({callback:r,context:i,ctx:i||s,listening:a})}return e},g=function(e,t,r,n){try{e.on(t,r,n)}catch(e){return e}};d.off=function(e,t,r){return this._events?(this._events=h(y,this._events,e,t,{context:r,listeners:this._listeners}),this):this},d.stopListening=function(e,t,r){var o=this._listeningTo;if(!o)return this;for(var i=e?[e._listenId]:Object.keys(o),s=0;s<i.length;s++){var a=o[i[s]];if(!a)break;a.obj.off(t,r,this),a.interop&&a.off(t,r)}return n.isEmpty(o)&&(this._listeningTo=void 0),this};var y=function(e,t,r,n){if(e){var o,i=n.context,s=n.listeners,a=0;if(t||i||r||!s){for(o=t?[t]:Object.keys(e);a<o.length;a++){var u=e[t=o[a]];if(!u)break;for(var c=[],l=0;l<u.length;l++){var f=u[l];if(r&&r!==f.callback&&r!==f.callback._callback||i&&i!==f.context)c.push(f);else{var d=f.listening;d&&d.off(t,r)}}c.length?e[t]=c:delete e[t]}return e}for(o=Object.keys(s);a<o.length;a++)s[o[a]].cleanup()}};d.once=function(e,t,r){var o=h(m,{},e,t,n.bind(this.off,this));return"string"==typeof e&&null==r&&(t=void 0),this.on(o,t,r)},d.listenToOnce=function(e,t,r){var o=h(m,{},t,r,n.bind(this.stopListening,this,e));return this.listenTo(e,o)};var m=function(e,t,r,o){if(r){var i=e[t]=n.once(function(){o(t,i),r.apply(this,arguments)});i._callback=r}return e};d.trigger=function(e){if(!this._events)return this;for(var t=Math.max(0,arguments.length-1),r=Array(t),n=0;n<t;n++)r[n]=arguments[n+1];return h(_,this._events,e,void 0,r),this};var _=function(e,t,r,n){if(e){var o=e[t],i=e.all;o&&i&&(i=i.slice()),o&&b(o,n),i&&b(i,[t].concat(n))}return e},b=function(e,t){var r,n=-1,o=e.length,i=t[0],s=t[1],a=t[2];switch(t.length){case 0:for(;++n<o;)(r=e[n]).callback.call(r.ctx);return;case 1:for(;++n<o;)(r=e[n]).callback.call(r.ctx,i);return;case 2:for(;++n<o;)(r=e[n]).callback.call(r.ctx,i,s);return;case 3:for(;++n<o;)(r=e[n]).callback.call(r.ctx,i,s,a);return;default:for(;++n<o;)(r=e[n]).callback.apply(r.ctx,t);return}},x=function(e,t){this.id=e._listenId,this.listener=e,this.obj=t,this.interop=!0,this.count=0,this._events=void 0};x.prototype.on=d.on,x.prototype.off=function(e,t){var r;this.interop?(this._events=h(y,this._events,e,t,{context:void 0,listeners:void 0}),r=!this._events):(this.count--,r=0===this.count),r&&this.cleanup()},x.prototype.cleanup=function(){delete this.listener._listeningTo[this.obj._listenId],this.interop||delete this.obj._listeners[this.id]},d.bind=d.on,d.unbind=d.off,e.Events=d,e._=n,e.$=r;var U=e.Object.prototype.set;n.extend(e.Object.prototype,d,{set:function(){var e=["change"].concat(Array.prototype.slice.call(arguments));U.apply(this,arguments),this.trigger.apply(this,e)}});var w=e.CoreManager.getRESTController();if(e.RestController=n.extend({ajax:function(t,r,n){var o=this;return w.ajax(t,r,n).catch(function(t){var r=["error"].concat(Array.prototype.slice.call(arguments));return o.trigger.apply(o,r),e.Trace.captureException(t),Promise.reject(t)})},request:function(t,r,n,o){var i=this;return w.request(t,r,n,o).catch(function(t){var r=["error"].concat(Array.prototype.slice.call(arguments));return i.trigger.apply(i,r),e.Trace.captureException(t),Promise.reject(t)})}},d),e.CoreManager.setRESTController(e.RestController),e.getRouter=function(t,n,o){return e._router?Promise.resolve(e._router):(void 0===n&&(n=!0),o=o||"#!",e.Utils.require("Navigo").then(function(i){var s;return e._router=new i(t,n,o),e._router.events=Object.assign({},d),s=e._router._callLeave,e._router._callLeave=function(){e._router.events.trigger("leave"),s.apply(e._router)},e._router.notFound(function(){e._router._lastRouteResolved&&e._router._lastRouteResolved.url&&r.ajax({type:"GET",url:e._router._lastRouteResolved.url+".html",dataType:"html",beforeSend:function(t){e._router.events.trigger("loading"),e._router.$container&&e._router.$container.css({opacity:"0.0"})}}).then(function(t){e._router.$container&&(e._router.controller&&"function"==typeof e._router.controller.leave?e._router.controller.leave():Promise.resolve()).then(function(){var r;e._router.$container.html(t).delay(50).animate({opacity:"1.0"},300),e._router.events.trigger("loaded"),e._router.updatePageLinks(),(r=e._router.$container.children(":first").data("controller"))&&e.Utils.require(r).then(function(t){e._router.controller=t,e._router.controller&&"function"==typeof e._router.controller.init&&e._router.controller.init(e._router.$container)})})},function(t,r,n){e._router.events.trigger("error"),e._router.$container&&e._router.$container.animate({opacity:"1.0"},300)})}),Promise.resolve(e._router)}))},e._ensureMasterKey=function(t,r){return t&&t.useMasterKey&&(!e.masterKey||r&&!e._fullMasterKey)?e.Cloud.run("_getMasterKey",{full:!!r}).then(function(t){return e.masterKey=t.masterKey,e._fullMasterKey=!!r,Promise.resolve()}):Promise.resolve()},e.Utils={ismobile:/iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()),diff:{VALUE_CREATED:"created",VALUE_UPDATED:"updated",VALUE_DELETED:"deleted",VALUE_UNCHANGED:"unchanged",map:function(t,r){if(e.Utils.isFunction(t)||e.Utils.isFunction(r))throw"Invalid argument. Function given, object expected.";if(e.Utils.isValue(t)||e.Utils.isValue(r))return{type:e.Utils.diff.compareValues(t,r),data:void 0===t?r:t};var n,o={};for(n in t)if(!e.Utils.isFunction(t[n])){var i=void 0;void 0!==r[n]&&(i=r[n]),o[n]=e.Utils.diff.map(t[n],i)}for(n in r)e.Utils.isFunction(r[n])||void 0!==o[n]||(o[n]=e.Utils.map(void 0,r[n]));return o},compareValues:function(t,r){return t===r?e.Utils.diff.VALUE_UNCHANGED:e.Utils.isDate(t)&&e.Utils.isDate(r)&&t.getTime()===r.getTime()?e.Utils.diff.VALUE_UNCHANGED:void 0===t?e.Utils.diff.VALUE_CREATED:void 0===r?e.Utils.diff.VALUE_DELETED:e.Utils.diff.VALUE_UPDATED}},render:function(t,r,n){return Promise.resolve().then(function(){return"undefined"!=typeof dust?dust:(define.amd.dust=!0,e.Utils.require(["dust-helpers","dust.core"]).then(function(t){var r=t[0]||dust;return"object"==typeof exports&&"object"==typeof global?global.dust=global.dust||r:"object"==typeof window&&(window.dust=window.dust||r),r.onLoad=n||function(t,r){e.Utils.require([t]).then(function(e){r(null,e&&e.length?e[0]:null)})},r}))}).then(function(e){return new Promise(function(n,o){e.render(t,r,function(e,t){if(e)return o(e);n(t)})})})},require:function(t){var r=Array.isArray(t),n=r?t:Array.prototype.slice.call(arguments);return new Promise(function(t,o){s(n,function(){var e=Array.prototype.slice.call(arguments);t(r||n.length>1?e:e[0])},function(t){e.Trace.captureException(t),o(t)})})},inputDigitsOnly:function(e){r.each(e,function(e,t){r(t).keydown(function(e){-1!==r.inArray(e.keyCode,[8,9,27,13,110,189,190])||65===e.keyCode&&!0===e.ctrlKey||e.keyCode>=35&&e.keyCode<=39||(e.shiftKey||e.keyCode<48||e.keyCode>57)&&(e.keyCode<96||e.keyCode>105)&&e.preventDefault()})})},upload:function(t,o,i){var s,a=t&&t.files?t.files[0]:t;return a?("function"==typeof o&&(i=o,o={}),s=!!a&&n.extend({role:"attachment",name:a.name,contentType:a.type||"application/octet-stream"},o||{}),e.Cloud.run("createPresignedPost",s).then(function(t){var n,o=new FormData;return e.$.each(t.fields,function(e,t){o.append(e,t)}),o.append("file",a),t.file&&(t.file.className=t.file.className||"Files",n=e.Object.fromJSON(t.file)),new Promise(function(s,u){e.$.ajax({url:t.url,type:"POST",data:o,processData:!1,contentType:!1,success:function(){if(!t.file)return s();if(a.size&&n.set("size",a.size),a.lastModifiedDate&&n.set("lastModified",a.lastModifiedDate),n.set("key",t.fields.key),"public-read"===t.fields.ACL&&n.set("url",t.url+"/"+t.fields.key),0!==(a.type||"").indexOf("image/"))return n.save().then(s,u);var r=new Image;r.onload=function(){(this.naturalWidth||this.width)&&n.set("width",this.naturalWidth||this.width),(this.naturalHeight||this.height)&&n.set("height",this.naturalHeight||this.height),n.save().then(s,u)},r.onerror=function(){n.save().then(s,u)},r.src="public-read"===t.fields.ACL?t.url+"/"+t.fields.key:e.serverURL+"/storage/"+e.appId+"/"+n.id},error:u,xhr:function(){return myXhr=r.ajaxSettings.xhr(),myXhr.upload&&i&&myXhr.upload.addEventListener("progress",function(e){e.lengthComputable&&i(e.loaded,e.total,Math.floor(e.loaded/e.total*100))},!1),myXhr}})})})):Promise.reject("missing file")},validateEmail:function(e){return/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(e)},hookLogout:function(t){r(t||'[data-action="userLogout"]').click(function(t){var n=r(this).attr("href")||r(this).data("redirect");t.preventDefault(),e.User.logOut().then(function(){n?window.location=n:window.location.reload(!0)})})},hookUserUI:function(t){(t||!r(document.body).hasClass("active-user")&&!r(document.body).hasClass("anonymous-user"))&&(e.User.current()?(r(document.body).removeClass("anonymous-user").addClass("active-user"),e.User.current().getRoles().then(function(e){r.each(e,function(e,t){r(document.body).addClass("role-"+t.get("name"))})})):r(document.body).removeClass("active-user").addClass("anonymous-user"))},hexOctet:function(){return Math.floor(65536*(1+Math.random())).toString(16).substring(1)},generateId:function(){var t=e.Utils.hexOctet;return t()+t()+"-"+t()+"-"+t()+"-"+t()+"-"+t()+t()+t()},hasAccess:function(t,r){return r=r||"write",!t||e.masterKey?Promise.resolve(!0):(t="function"==typeof t.toJSON?t.toJSON():t)["*"]&&t["*"][r]?Promise.resolve(!0):e.User.currentAsync().then(function(e){return e?t[e.id]&&t[e.id][r]?Promise.resolve(!0):e.getRoles().then(function(e){var n,o,i=!1;for(n=0;n<e.length&&!i;n++)o="role:"+e[n].getName(),i=i||t[o]&&t[o][r];return Promise.resolve(i)}):Promise.resolve(!1)})},querystring:{parse:function(e){var t={};if("string"==typeof(e=void 0!==e?e:window.location.search)&&e.length>0){"?"===e[0]&&(e=e.substring(1));for(var r=0,n=(e=e.split("&")).length;r<n;r++){var o,i,s=e[r],a=s.indexOf("=");a>=0?(o=s.substr(0,a),i=s.substr(a+1)):(o=s,i=""),i=decodeURIComponent(i),void 0===t[o]?t[o]=i:t[o]instanceof Array?t[o].push(i):t[o]=[t[o],i]}}return t},stringify:function(e){var t=[];if(e&&e.constructor===Object)for(var r in e)if(e[r]instanceof Array)for(var n=0,o=e[r].length;n<o;n++)t.push([encodeURIComponent(r),encodeURIComponent(e[r][n])].join("="));else t.push([encodeURIComponent(r),encodeURIComponent(e[r])].join("="));return t.join("&")}},debounce:function(e,t,r){var n;return function(){var o=this,i=arguments,s=r&&!n;clearTimeout(n),n=setTimeout(function(){n=null,r||e.apply(o,i)},t||250),s&&e.apply(o,i)}},throttle:function(e,t){var r,n;return t=t||250,function(){var o=this,i=+new Date,s=arguments;r&&i<r+t?(clearTimeout(n),n=setTimeout(function(){r=i,e.apply(o,s)},t)):(r=i,e.apply(o,s))}},getValue:function(e,t){for(var r=e.split("."),n=t||window,o=0;void 0!==n&&o<r.length;o+=1)n=n[r[o]];return n}},e.User.prototype.getRoles=function(t){var r=this;return this.__roles?Promise.resolve(this.__roles):new e.Query(e.Role).equalTo("users",r).find(t).then(function(e){return r.__roles=e,Promise.resolve(e)})},e.setVolatileStorage=function(t){var r=void 0===t||!!t,n=r?window.sessionStorage:window.localStorage;window.localStorage.setItem("stg:volatile",r?"yes":"no"),e.CoreManager.setStorageController({async:0,getItem:function(e){return n.getItem(e)},setItem:function(e,t){try{n.setItem(e,t)}catch(e){}},removeItem:function(e){n.removeItem(e)},clear(){n.clear()}})},"yes"===window.localStorage.getItem("stg:volatile")&&e.setVolatileStorage(),"undefined"!=typeof __box){if("function"==typeof __box.ignite)return __box.ignite(e);void 0!==__box.appId&&void 0!==__box.javaScriptKey&&(e._initialize(__box.appId,__box.javaScriptKey,__box.masterKey||__box.readOnlyMasterKey),e.serverURL=__box.serverURL||e.serverURL)}return e.User._registerAuthenticationProvider({getAuthType:function(){return"anonymous"},restoreAuthentication:function(){return!0}}),e});