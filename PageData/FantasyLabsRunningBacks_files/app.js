

(function(_w, _s){

	var document = _w.document,
		app = {},
		startTimeMS = 0,
		_logMessage = function(m) {
			if (!app.logging)
				return;
			if (app.timing) {
				if (startTimeMS == 0)
					startTimeMS = (new Date()).getTime();
				var t = (new Date()).getTime();
				m = '[AdButler] ' + m + ' (' + (t - startTimeMS) + ' ms)';
			}
			else
				m = '[AdButler] ' + m;
			_w.console && _w.console.log && _w.console.log(m);
		};


	app = {
		ads: [],
		pixels: {},
		requests: {},
		domains: {},

		protocol: 'http:',
		pageKey: false,

		logging: false,
		timing: false,

		// states
		initialized: false,

		init: function() {
			app.initialized = true;

			app.logging = app.isBoolean(_w.AdButlerAppLogging) ? _w.AdButlerAppLogging : app.logging;

			_logMessage('app.init()');
			app.initRND();
			app.ads = app.ads ? app.ads : [];
			app.protocol = (document.location.protocol == 'https:' ? 'https:' : 'http:');

			if (app.ads && app.ads.length > 0)
			{
				for (var i = 0; i < app.ads.length; i++)
					app.ads[i].handler.call(null, app.ads[i].opt);
				app.ads = [];
			}

			app.ads.push = app.registerByPush;
		},

		registerByPush: function(request) {
			_logMessage('app.registerByPush()');
			return request.handler.call(null, request.opt);
		},

		register: function(account, zone, size, div, opt) {
			_logMessage('app.register('+account+', '+zone+', '+size.join('x')+', '+div+')');
			var request = {
				ID: account,
				size: size.join('x'),
				setID: zone,
				type: 'async',
				domid: div,
				place: opt.place,
				pid: app.pageKey,
				sw: (_s.width ? _s.width : 0),
				sh: _s.height ? _s.height : 0,
				spr: _w.devicePixelRatio ? _w.devicePixelRatio : 1,
				rnd: opt.rnd ? opt.rnd : app.rnd
			};
			if (opt.keywords && opt.keywords.length)
				request.kw = opt.keywords;
			if (opt.extraData && opt.extraData.length)
				request.extra = encodeURIComponent(opt.extraData);
			if (opt.click && opt.click.length)
				request.click = opt.click;
			if (opt.rcb)
				request.rcb = opt.rcb;

			app.setAccountDomain(account, opt.domain);
			app.setRequestMeta(request);

			app.load(opt.domain, request);
		},

		initRND: function () {
			if (window.rnd) {
				app.pageKey = app.rnd = window.rnd;
			}
			else {
				window.rnd = app.rnd = app.pageKey = app.randomNumber();
			}
		},

		load: function(domain, request) {
			_logMessage('app.load() --> '+request.domid+' ['+request.size+']');

			var src = [app.protocol + '//' + domain + '/adserve/'];
			for (var key in request)
				src.push(key+'='+request[key]);

			var el = document.getElementById(request.domid),
				s = document.createElement('script');
			s.async = true;
			s.type = 'text/javascript';
			s.src = src.join(';');
			el.parentElement.insertBefore(s, el);
		},

		placePlainMarkup: function(div, html) {
			_logMessage('app.placePlainHTML('+div+', *html)');

			var contentDiv = document.getElementById(div);
			if (typeof(contentDiv) != 'undefined')
				contentDiv.innerHTML = html;

			if (app.isString(app.pixels[div]))
				app.placePixel(div, app.pixels[div]);
		},

		placeIframeMarkup: function(zone, place, size, div, html, opts) {
			_logMessage('app.placeIframeHTML('+zone+', '+place+', '+size.join('x')+', '+div+', *html)');

			var contentDiv = document.getElementById(div),
				width = size.length === 2 ? size[0] : 0,
				height = size.length === 2 ? size[1] : 0;

			if (!app.isObject(opts)) {
				opts = {
					responsive: 'fixed'
				};
			}

			contentDiv.innerHTML = '';

			var contentDocument, wrapperFrame;
			wrapperFrame = document.createElement("iframe");
			wrapperFrame.id = 'placement_'+zone+'_'+place+'_iframe';
			wrapperFrame.frameBorder = 0;
			wrapperFrame.scrolling = "no";
			wrapperFrame.noresize = "noresize";
			wrapperFrame.marginheight = 0;
			wrapperFrame.marginwidth = 0;
			wrapperFrame.height = height;
			wrapperFrame.width = width;

			contentDiv.appendChild(wrapperFrame);

			if (wrapperFrame.attachEvent) {
				wrapperFrame.attachEvent('onload', function() {
					return app.handleIframeHTMLOnLoad(div, zone, place);
				});
			} else {
				wrapperFrame.onload = function() {
					return app.handleIframeHTMLOnLoad(div, zone, place);
				};
			}

			html = "<!DOCTYPE HTML><html><head><style>html,body{padding:0;margin:0;}</style></head><body>" + html + "</body></html>";
			if (/msie/.test(navigator.userAgent.toLowerCase()) || _w.opera) {
				wrapperFrame.contentWindow.contents = html;
				return wrapperFrame.src = "javascript:window[\"contents\"]";
			} else {
				contentDocument = wrapperFrame.contentDocument;
				contentDocument.open();
				contentDocument.write(html);
				contentDocument.close();
				return wrapperFrame;
			}
		},

		handleIframeHTMLOnLoad: function(div, zone, place) {
			_logMessage('app.handleIframeHTMLOnLoad('+div+', '+zone+', '+place+')');

			var ifrm = document.getElementById('placement_' + zone + '_' + place + '_iframe');
			if (ifrm !== null && ifrm.readyState !== "complete" && app.isString(ifrm.readyState)) {
				return setTimeout((function() {
					return app.handleIframeHTMLOnLoad(div, zone, place);
				}), 50);
			}
			else {
				app.placeRegisteredPixels(div);
			}
		},

		registerPixel: function(div, url) {
			_logMessage('app.registerPixel('+div+', *url)');

			app.pixels[div] = url;
		},

		placeRegisteredPixels: function(div) {
			if (app.isString(app.pixels[div]))
				app.placePixel(div, app.pixels[div]);
		},

		placePixel: function(div, url) {
			_logMessage('app.placePixel('+div+', '+url+')');
			if (url.length === 0)
				return;

			var container, pixel;
			container = document.getElementById(div);
			if (container !== null) {
				pixel = document.createElement('img');
				pixel.setAttribute("height", "0");
				pixel.setAttribute("width", "0");
				pixel.setAttribute("border", "0");
				pixel.setAttribute("style", "display:none;");
				pixel.setAttribute("src", url);
				return container.appendChild(pixel);
			}
		},

		queuePlacementRefresh: function(div, rct, delay){
			_logMessage('app.queuePlacementRefresh('+div+', '+rct+', '+delay+')');
			var request = app.getRequestMeta(div),
				domain = app.getAccountDomain(request.ID);
			request.rct = rct;
			setTimeout(function(){ app.load(domain, request); }, delay);
		},

		randomNumber: function() {
			return Math.floor(Math.random()*10e6);
		},

		getZoneMeta: function(zone) {
			if (!app.isObject(app.zoneMeta[zone]))
				app.zoneMeta[zone] = {
					place: 0,
					key: app.randomNumber()
				};
			else
				app.zoneMeta[zone].place++;
			return app.zoneMeta[zone];
		},

		setAccountDomain: function(ID, domain) {
			app.domains[ID] = domain;
		},

		getAccountDomain: function(ID) {
			return app.domains[ID];
		},

		setRequestMeta: function(request) {
			app.requests[request.domid] = request;
		},

		getRequestMeta: function(domid) {
			return app.requests[domid];
		},

		isArray: function(obj) {
			return typeof(obj) === "array";
		},

		isObject: function(obj) {
			return typeof(obj) === "object";
		},

		isString: function(obj) {
			return typeof(obj) === "string";
		},

		isBoolean: function(obj) {
			return typeof(obj) === "boolean";
		}
	};

	if (_w.AdButler && _w.AdButler.initialized) {
		if (_w.AdButler.logging) {
			_logMessage('app initialized a second time, carrying on as usual.');
		}
		return;
	}

	if (_w.AdButler) {
		app.ads = _w.AdButler.ads || [];
		app.domain = _w.AdButler.domain || false;
	}

	_w.AdButler = app;

	app.init();

}(window, screen));

