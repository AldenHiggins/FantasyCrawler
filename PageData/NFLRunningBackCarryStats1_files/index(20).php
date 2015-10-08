/*
YUI 3.10.3 (build 655e25f)
Copyright 2013 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add("datasource-get",function(e,t){var n=function(){n.superclass.constructor.apply(this,arguments)};e.DataSource.Get=e.extend(n,e.DataSource.Local,{_defRequestFn:function(t){var n=this.get("source"),r=this.get("get"),i=e.guid().replace(/\-/g,"_"),s=this.get("generateRequestCallback"),o=t.details[0],u=this;return this._last=i,YUI.Env.DataSource.callbacks[i]=function(n){delete YUI.Env.DataSource.callbacks[i],delete e.DataSource.Local.transactions[t.tId];var r=u.get("asyncMode")!=="ignoreStaleResponses"||u._last===i;r&&(o.data=n,u.fire("data",o))},n+=t.request+s.call(this,i),e.DataSource.Local.transactions[t.tId]=r.script(n,{autopurge:!0,onFailure:function(n){delete YUI.Env.DataSource.callbacks[i],delete e.DataSource.Local.transactions[t.tId],o.error=new Error(n.msg||"Script node data failure"),u.fire("data",o)},onTimeout:function(n){delete YUI.Env.DataSource.callbacks[i],delete e.DataSource.Local.transactions[t.tId],o.error=new Error(n.msg||"Script node data timeout"),u.fire("data",o)}}),t.tId},_generateRequest:function(e){return"&"+this.get("scriptCallbackParam")+"=YUI.Env.DataSource.callbacks."+e}},{NAME:"dataSourceGet",ATTRS:{get:{value:e.Get,cloneDefaultValue:!1},asyncMode:{value:"allowAll"},scriptCallbackParam:{value:"callback"},generateRequestCallback:{value:function(){return this._generateRequest.apply(this,arguments)}}}}),YUI.namespace("Env.DataSource.callbacks")},"3.10.3",{requires:["datasource-local","get"]});

;/*
YUI 3.10.3 (build 655e25f)
Copyright 2013 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add("datasource-polling",function(e,t){function n(){this._intervals={}}n.prototype={_intervals:null,setInterval:function(t,n){var r=e.later(t,this,this.sendRequest,[n],!0);return this._intervals[r.id]=r,e.later(0,this,this.sendRequest,[n]),r.id},clearInterval:function(e,t){e=t||e,this._intervals[e]&&(this._intervals[e].cancel(),delete this._intervals[e])},clearAllIntervals:function(){e.each(this._intervals,this.clearInterval,this)}},e.augment(e.DataSource.Local,n)},"3.10.3",{requires:["datasource-local"]});

;/*
YUI 3.10.3 (build 655e25f)
Copyright 2013 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add("datasource-function",function(e,t){var n=e.Lang,r=function(){r.superclass.constructor.apply(this,arguments)};e.mix(r,{NAME:"dataSourceFunction",ATTRS:{source:{validator:n.isFunction}}}),e.extend(r,e.DataSource.Local,{_defRequestFn:function(e){var t=this.get("source"),n=e.details[0];if(t)try{n.data=t(e.request,this,e)}catch(r){n.error=r}else n.error=new Error("Function data failure");return this.fire("data",n),e.tId}}),e.DataSource.Function=r},"3.10.3",{requires:["datasource-local"]});

;/*
YUI 3.10.3 (build 655e25f)
Copyright 2013 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add("cache-base",function(e,t){var n=e.Lang,r=e.Lang.isDate,i=function(){i.superclass.constructor.apply(this,arguments)};e.mix(i,{NAME:"cache",ATTRS:{max:{value:0,setter:"_setMax"},size:{readOnly:!0,getter:"_getSize"},uniqueKeys:{value:!1},expires:{value:0,validator:function(t){return e.Lang.isDate(t)||e.Lang.isNumber(t)&&t>=0}},entries:{readOnly:!0,getter:"_getEntries"}}}),e.extend(i,e.Base,{_entries:null,initializer:function(e){this.publish("add",{defaultFn:this._defAddFn}),this.publish("flush",{defaultFn:this._defFlushFn}),this._entries=[]},destructor:function(){this._entries=[]},_setMax:function(e){var t=this._entries;if(e>0){if(t)while(t.length>e)t.shift()}else e=0,this._entries=[];return e},_getSize:function(){return this._entries.length},_getEntries:function(){return this._entries},_defAddFn:function(e){var t=this._entries,r=e.entry,i=this.get("max"),s;this.get("uniqueKeys")&&(s=this._position(e.entry.request),n.isValue(s)&&t.splice(s,1));while(i&&t.length>=i)t.shift();t[t.length]=r},_defFlushFn:function(e){var t=this._entries,r=e.details[0],i;r&&n.isValue(r.request)?(i=this._position(r.request),n.isValue(i)&&t.splice(i,1)):this._entries=[]},_isMatch:function(e,t){return!t.expires||new Date<t.expires?e===t.request:!1},_position:function(e){var t=this._entries,n=t.length,r=n-1;if(this.get("max")===null||this.get("max")>0)for(;r>=0;r--)if(this._isMatch(e,t[r]))return r;return null},add:function(e,t){var i=this.get("expires");this.get("initialized")&&(this.get("max")===null||this.get("max")>0)&&(n.isValue(e)||n.isNull(e)||n.isUndefined(e))&&this.fire("add",{entry:{request:e,response:t,cached:new Date,expires:r(i)?i:i?new Date((new Date).getTime()+this.get("expires")):null}})},flush:function(e){this.fire("flush",{request:n.isValue(e)?e:null})},retrieve:function(e){var t=this._entries,r=t.length,i=null,s;if(r>0&&(this.get("max")===null||this.get("max")>0)){this.fire("request",{request:e}),s=this._position(e);if(n.isValue(s))return i=t[s],this.fire("retrieve",{entry:i}),s<r-1&&(t.splice(s,1),t[t.length]=i),i}return null}}),e.Cache=i},"3.10.3",{requires:["base"]});

;/*
YUI 3.10.3 (build 655e25f)
Copyright 2013 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add("datasource-cache",function(e,t){function r(t){var n=t&&t.cache?t.cache:e.Cache,r=e.Base.create("dataSourceCache",n,[e.Plugin.Base,e.Plugin.DataSourceCacheExtension]),i=new r(t);return r.NS="tmpClass",i}var n=function(){};e.mix(n,{NS:"cache",NAME:"dataSourceCacheExtension"}),n.prototype={initializer:function(e){this.doBefore("_defRequestFn",this._beforeDefRequestFn),this.doBefore("_defResponseFn",this._beforeDefResponseFn)},_beforeDefRequestFn:function(t){var n=this.retrieve(t.request)||null,r=t.details[0];if(n&&n.response)return r.cached=n.cached,r.response=n.response,r.data=n.data,this.get("host").fire("response",r),new e.Do.Halt("DataSourceCache extension halted _defRequestFn")},_beforeDefResponseFn:function(e){e.response&&!e.cached&&this.add(e.request,e.response)}},e.namespace("Plugin").DataSourceCacheExtension=n,e.mix(r,{NS:"cache",NAME:"dataSourceCache"}),e.namespace("Plugin").DataSourceCache=r},"3.10.3",{requires:["datasource-local","plugin","cache-base"]});

;/*
YUI 3.10.3 (build 655e25f)
Copyright 2013 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add("dataschema-json",function(e,t){var n=e.Lang,r=n.isFunction,i=n.isObject,s=n.isArray,o=e.DataSchema.Base,u;u={getPath:function(e){var t=null,n=[],r=0;if(e){e=e.replace(/\[\s*(['"])(.*?)\1\s*\]/g,function(e,t,i){return n[r]=i,".@"+r++}).replace(/\[(\d+)\]/g,function(e,t){return n[r]=parseInt(t,10)|0,".@"+r++}).replace(/^\./,""),t=e.split(".");for(r=t.length-1;r>=0;--r)t[r].charAt(0)==="@"&&(t[r]=n[parseInt(t[r].substr(1),10)])}return t},getLocationValue:function(e,t){var n=0,r=e.length;for(;n<r;n++){if(!(i(t)&&e[n]in t)){t=undefined;break}t=t[e[n]]}return t},apply:function(t,n){var r=n,s={results:[],meta:{}};if(!i(n))try{r=e.JSON.parse(n)}catch(o){return s.error=o,s}return i(r)&&t?(s=u._parseResults.call(this,t,r,s),t.metaFields!==undefined&&(s=u._parseMeta(t.metaFields,r,s))):s.error=new Error("JSON schema parse failure"),s},_parseResults:function(e,t,n){var r=u.getPath,i=u.getLocationValue,o=r(e.resultListLocator),a=o?i(o,t)||t[e.resultListLocator]:t;return s(a)?s(e.resultFields)?n=u._getFieldValues.call(this,e.resultFields,a,n):n.results=a:e.resultListLocator&&(n.results=[],n.error=new Error("JSON results retrieval failure")),n},_getFieldValues:function(t,n,i){var s=[],a=t.length,f,l,c,h,p,d,v,m,g=[],y=[],b=[],w,E;for(f=0;f<a;f++)c=t[f],h=c.key||c,p=c.locator||h,d=u.getPath(p),d&&(d.length===1?g.push({key:h,path:d[0]}):y.push({key:h,path:d,locator:p})),v=r(c.parser)?c.parser:e.Parsers[c.parser+""],v&&b.push({key:h,parser:v});for(f=n.length-1;f>=0;--f){E={},w=n[f];if(w){for(l=y.length-1;l>=0;--l){d=y[l],m=u.getLocationValue(d.path,w);if(m===undefined){m=u.getLocationValue([d.locator],w);if(m!==undefined){g.push({key:d.key,path:d.locator}),y.splice(f,1);continue}}E[d.key]=o.parse.call(this,u.getLocationValue(d.path,w),d)}for(l=g.length-1;l>=0;--l)d=g[l],E[d.key]=o.parse.call(this,w[d.path]===undefined?w[l]:w[d.path],d);for(l=b.length-1;l>=0;--l)h=b[l].key,E[h]=b[l].parser.call(this,E[h]),E[h]===undefined&&(E[h]=null);s[f]=E}}return i.results=s,i},_parseMeta:function(e,t,n){if(i(e)){var r,s;for(r in e)e.hasOwnProperty(r)&&(s=u.getPath(e[r]),s&&t&&(n.meta[r]=u.getLocationValue(s,t)))}else n.error=new Error("JSON meta data retrieval failure");return n}},e.DataSchema.JSON=e.mix(u,o)},"3.10.3",{requires:["dataschema-base","json"]});

;/*
YUI 3.10.3 (build 655e25f)
Copyright 2013 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add("datasource-jsonschema",function(e,t){var n=function(){n.superclass.constructor.apply(this,arguments)};e.mix(n,{NS:"schema",NAME:"dataSourceJSONSchema",ATTRS:{schema:{}}}),e.extend(n,e.Plugin.Base,{initializer:function(e){this.doBefore("_defDataFn",this._beforeDefDataFn)},_beforeDefDataFn:function(t){var n=t.data&&(t.data.responseText||t.data),r=this.get("schema"),i=t.details[0];return i.response=e.DataSchema.JSON.apply.call(this,r,n)||{meta:{},results:n},this.get("host").fire("response",i),new e.Do.Halt("DataSourceJSONSchema plugin halted _defDataFn")}}),e.namespace("Plugin").DataSourceJSONSchema=n},"3.10.3",{requires:["datasource-local","plugin","dataschema-json"]});

;/*
YUI 3.10.3 (build 655e25f)
Copyright 2013 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add("datatype-xml-format",function(e,t){var n=e.Lang;e.mix(e.namespace("XML"),{format:function(e){try{if(!n.isUndefined(e.getXml))return e.getXml();if(!n.isUndefined(XMLSerializer))return(new XMLSerializer).serializeToString(e)}catch(t){return e&&e.xml?e.xml:n.isValue(e)&&e.toString?e.toString():""}}}),e.namespace("DataType"),e.DataType.XML=e.XML},"3.10.3");

;/*
YUI 3.10.3 (build 655e25f)
Copyright 2013 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add("datasource-xmlschema",function(e,t){var n=function(){n.superclass.constructor.apply(this,arguments)};e.mix(n,{NS:"schema",NAME:"dataSourceXMLSchema",ATTRS:{schema:{}}}),e.extend(n,e.Plugin.Base,{initializer:function(e){this.doBefore("_defDataFn",this._beforeDefDataFn)},_beforeDefDataFn:function(t){var n=this.get("schema"),r=t.details[0],i=e.XML.parse(t.data.responseText)||t.data;return r.response=e.DataSchema.XML.apply.call(this,n,i)||{meta:{},results:i},this.get("host").fire("response",r),new e.Do.Halt("DataSourceXMLSchema plugin halted _defDataFn")}}),e.namespace("Plugin").DataSourceXMLSchema=n},"3.10.3",{requires:["datasource-local","plugin","datatype-xml","dataschema-xml"]});

;/*
YUI 3.10.3 (build 655e25f)
Copyright 2013 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add("dataschema-array",function(e,t){var n=e.Lang,r={apply:function(e,t){var i=t,s={results:[],meta:{}};return n.isArray(i)?e&&n.isArray(e.resultFields)?s=r._parseResults.call(this,e.resultFields,i,s):s.results=i:s.error=new Error("Array schema parse failure"),s},_parseResults:function(t,r,i){var s=[],o,u,a,f,l,c,h,p;for(h=r.length-1;h>-1;h--){o={},u=r[h],a=n.isObject(u)&&!n.isFunction(u)?2:n.isArray(u)?1:n.isString(u)?0:-1;if(a>0)for(p=t.length-1;p>-1;p--)f=t[p],l=n.isUndefined(f.key)?f:f.key,c=n.isUndefined(u[l])?u[p]:u[l],o[l]=e.DataSchema.Base.parse.call(this,c,f);else a===0?o=u:o=null;s[h]=o}return i.results=s,i}};e.DataSchema.Array=e.mix(r,e.DataSchema.Base)},"3.10.3",{requires:["dataschema-base"]});

;/*
YUI 3.10.3 (build 655e25f)
Copyright 2013 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add("datasource-arrayschema",function(e,t){var n=function(){n.superclass.constructor.apply(this,arguments)};e.mix(n,{NS:"schema",NAME:"dataSourceArraySchema",ATTRS:{schema:{}}}),e.extend(n,e.Plugin.Base,{initializer:function(e){this.doBefore("_defDataFn",this._beforeDefDataFn)},_beforeDefDataFn:function(t){var n=e.DataSource.IO&&this.get("host")instanceof e.DataSource.IO&&e.Lang.isString(t.data.responseText)?t.data.responseText:t.data,r=e.DataSchema.Array.apply.call(this,this.get("schema"),n),i=t.details[0];return r||(r={meta:{},results:n}),i.response=r,this.get("host").fire("response",i),new e.Do.Halt("DataSourceArraySchema plugin halted _defDataFn")}}),e.namespace("Plugin").DataSourceArraySchema=n},"3.10.3",{requires:["datasource-local","plugin","dataschema-array"]});

;/*
YUI 3.10.3 (build 655e25f)
Copyright 2013 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add("dataschema-text",function(e,t){var n=e.Lang,r=n.isString,i=n.isUndefined,s={apply:function(e,t){var n=t,i={results:[],meta:{}};return r(t)&&e&&r(e.resultDelimiter)?i=s._parseResults.call(this,e,n,i):i.error=new Error("Text schema parse failure"),i},_parseResults:function(t,n,s){var o=t.resultDelimiter,u=r(t.fieldDelimiter)&&t.fieldDelimiter,a=t.resultFields||[],f=[],l=e.DataSchema.Base.parse,c,h,p,d,v,m,g,y,b;n.slice(-o.length)===o&&(n=n.slice(0,-o.length)),c=n.split(t.resultDelimiter);if(u)for(y=c.length-1;y>=0;--y){p={},d=c[y],h=d.split(t.fieldDelimiter);for(b=a.length-1;b>=0;--b)v=a[b],m=i(v.key)?v:v.key,g=i(h[m])?h[b]:h[m],p[m]=l.call(this,g,v);f[y]=p}else f=c;return s.results=f,s}};e.DataSchema.Text=e.mix(s,e.DataSchema.Base)},"3.10.3",{requires:["dataschema-base"]});

;/*
YUI 3.10.3 (build 655e25f)
Copyright 2013 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add("datasource-textschema",function(e,t){var n=function(){n.superclass.constructor.apply(this,arguments)};e.mix(n,{NS:"schema",NAME:"dataSourceTextSchema",ATTRS:{schema:{}}}),e.extend(n,e.Plugin.Base,{initializer:function(e){this.doBefore("_defDataFn",this._beforeDefDataFn)},_beforeDefDataFn:function(t){var n=this.get("schema"),r=t.details[0],i=t.data.responseText||t.data;return r.response=e.DataSchema.Text.apply.call(this,n,i)||{meta:{},results:i},this.get("host").fire("response",r),new e.Do.Halt("DataSourceTextSchema plugin halted _defDataFn")}}),e.namespace("Plugin").DataSourceTextSchema=n},"3.10.3",{requires:["datasource-local","plugin","dataschema-text"]});

;/*
YUI 3.10.3 (build 655e25f)
Copyright 2013 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add("jsonp",function(e,t){function r(){this._init.apply(this,arguments)}var n=e.Lang.isFunction;r.prototype={_init:function(t,r){this.url=t,this._requests={},this._timeouts={},r=n(r)?{on:{success:r}}:r||{};var i=r.on||{};i.success||(i.success=this._defaultCallback(t,r)),this._config=e.merge({context:this,args:[],format:this._format,allowCache:!1},r,{on:i})},_defaultCallback:function(){},send:function(){function u(e,r){return n(e)?function(n){var o=!0,u="_requests";r?(++t._timeouts[s],--t._requests[s]):(t._requests[s]||(o=!1,u="_timeouts"),--t[u][s]),!t._requests[s]&&!t._timeouts[s]&&delete YUI.Env.JSONP[s],o&&e.apply(i.context,[n].concat(i.args))}:null}var t=this,r=e.Array(arguments,0,!0),i=t._config,s=t._proxy||e.guid(),o;return i.allowCache&&(t._proxy=s),t._requests[s]===undefined&&(t._requests[s]=0),t._timeouts[s]===undefined&&(t._timeouts[s]=0),t._requests[s]++,r.unshift(t.url,"YUI.Env.JSONP."+s),o=i.format.apply(t,r),i.on.success?(YUI.Env.JSONP[s]=u(i.on.success),e.Get.js(o,{onFailure:u(i.on.failure),onTimeout:u(i.on.timeout,!0),timeout:i.timeout,charset:i.charset,attributes:i.attributes,async:i.async}).execute(),t):t},_format:function(e,t){return e.replace(/\{callback\}/,t)}},e.JSONPRequest=r,e.jsonp=function(t,n){var r=new e.JSONPRequest(t,n);return r.send.apply(r,e.Array(arguments,2,!0))},YUI.Env.JSONP||(YUI.Env.JSONP={})},"3.10.3",{requires:["get","oop"]});

;/*
YUI 3.10.3 (build 655e25f)
Copyright 2013 Yahoo! Inc. All rights reserved.
Licensed under the BSD License.
http://yuilibrary.com/license/
*/

YUI.add("jsonp-url",function(e,t){var n=e.JSONPRequest,r=e.Object.getValue,i=function(){};e.mix(n.prototype,{_pattern:/\bcallback=(.*?)(?=&|$)/i,_template:"callback={callback}",_defaultCallback:function(t){var n=t.match(this._pattern),s=[],o=0,u,a,f;if(n){u=n[1].replace(/\[(['"])(.*?)\1\]/g,function(e,t,n){return s[o]=n,".@"+o++}).replace(/\[(\d+)\]/g,function(e,t){return s[o]=parseInt(t,10)|0,".@"+o++}).replace(/^\./,"");if(!/[^\w\.\$@]/.test(u)){a=u.split(".");for(o=a.length-1;o>=0;--o)a[o].charAt(0)==="@"&&(a[o]=s[parseInt(a[o].substr(1),10)]);f=r(e.config.win,a)||r(e,a)||r(e,a.slice(1))}}return f||i},_format:function(e,t){var n=this._template.replace(/\{callback\}/,t),r;return this._pattern.test(e)?e.replace(this._pattern,n):(r=e.slice(-1),r!=="&"&&r!=="?"&&(e+=e.indexOf("?")>-1?"&":"?"),e+n)}},!0)},"3.10.3",{requires:["jsonp"]});
