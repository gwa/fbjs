/* global gwa */
/* global FB */

window.gwa = window.gwa || {};

/**
 * Wrapper for the Facebook API
 *
 * @class Facebook
 * @namespace  gwa
 */
(function( ns ) {

	/**
	 * @method Facebook
	 * @constructor
	 * @param  {String} appid
	 * @param  {String} [channelurl]
	 * @param  {Number} [canvasheight]
	 */
	ns.Facebook = function( appid, channelurl, canvasheight ) {

		var _appid = appid,
			_channelurl = channelurl,
			_canvasheight = canvasheight,
			_api,
			_dispatcher = new gwa.EventDispatcher(),
			_isloggedin = false,
			_iduser,
			_permissions,
			_authresponse;

		return {

			init: function() {
				if (!_appid) {
					throw 'ERROR: no app id set!';
				}
				var p = this,
					e = document.createElement('div');
				e.setAttribute('id', 'gwfb-root');
				document.getElementsByTagName('body')[0].appendChild(e);
				// load fb sdk
				window.fbAsyncInit = function() {
					FB.init({
						appId: _appid,
						status: true,
						cookie: true,
						xfbml: true,
						channelUrl: _channelurl
					});
					if (_canvasheight) {
						FB.Canvas.setSize({height: _canvasheight});
					} else {
						FB.Canvas.setSize();
					}
					_api = FB;
					_dispatcher.dispatch('FB_INIT', p);
				};
				(function() {
					var e = document.createElement('script'); e.async = true;
					e.src = document.location.protocol + '//connect.facebook.net/en_US/all.js';
					document.getElementById('gwfb-root').appendChild(e);
				}());
			},

			on: function( event, func ) {
				return _dispatcher.on(event,func);
			},

			off: function( event, func ) {
				_dispatcher.off(event, func);
				return this;
			},

			getDispatcher: function() {
				return _dispatcher;
			},

			setCanvasHeight: function( height ) {
				if (height) {
					FB.Canvas.setSize({height:height});
				} else {
					FB.Canvas.setSize();
				}
			},

			scrollTo: function( x, y ) {
				FB.Canvas.scrollTo(x, y);
			},

			getLoginStatus: function( onsuccess, onfailure, force ) {
				force = force ? true : false;
				var p = this;
				_api.getLoginStatus(function(response) {
					_isloggedin = false;
					_iduser = null;
					_permissions = null;
					switch (response.status) {
						case 'connected' :
							// is logged in
							_isloggedin = true;
							_iduser = response.authResponse.userID;
							_authresponse = response.authResponse;
							if (typeof(onsuccess) === 'function') {
								onsuccess(response);
							}
							_dispatcher.dispatch('FB_LOGIN_STATUS', p, true, response);
							break;

						default :
							// user is not connected to app
							if (typeof(onfailure) === 'function') {
								onfailure(response);
							}
							_dispatcher.dispatch('FB_LOGIN_STATUS', p, false, response);
							break;
					}
				}, force);
			},

			getPermissions: function() {
				_api.api('/me/permissions', function(response) {
					_permissions = [];
					if (typeof(response.data) !== 'object') {
						return;
					}
					for (var a in response.data) {
						_permissions[a] = response.data[a];
					}
				} );
			},

			/**
			 * Has user granted us the permission passed as an argument.
			 * @param {String} permission
			 * @return {Boolean}
			 * @link http://developers.facebook.com/docs/reference/api/permissions/
			 */
			hasPermission: function( permission ) {
				if (typeof(_permissions) === 'undefined') {
					return false;
				}
				if (typeof(_permissions[permission]) === 'undefined') {
					return false;
				}
				return _permissions[permission] ? true : false;
			},

			/**
			 * @brief Install the app.
			 * @param {String} scope
			 * @param {Function} onsuccess
			 * @param {Function} onfailure
			 */
			login: function( scope, onsuccess, onfailure ) {
				var p = this,
				handler = function(response) {
					switch (response.status) {
						case 'connected' :
							_isloggedin = true;
							_authresponse = response.authResponse;
							_iduser = response.authResponse.userID;
							if (typeof(onsuccess) === 'function') {
								onsuccess(response);
							}
							_dispatcher.dispatch('FB_LOGIN', p, true, response);
							break;

						default :
							if (typeof(onfailure) === 'function') {
								onfailure(response);
							}
							_dispatcher.dispatch('FB_LOGIN', p, false, response);
					}

				};
				_api.login(
					handler,
					{scope: scope}
				);
			},

			fb: function() {
				return _api;
			},

			getAPI: function() {
				return _api;
			},

			setAPI: function( api ) {
				_api = api;
			},

			getUserId: function() {
				return _iduser;
			},

			isLoggedIn: function() {
				return _isloggedin;
			},

			getAccessToken: function() {
				return typeof(_authresponse) === 'object' ? _authresponse.accessToken : null;
			},

			getAuthResponse: function() {
				return _authresponse;
			}
		};
	};

}(window.gwa = window.gwa || {}));
