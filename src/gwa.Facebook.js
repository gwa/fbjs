/* global gwa */
/* global FB */

window.gwa = window.gwa || {};

/**
 * Wrapper for the Facebook API.
 *
 * ## Events
 *
 * - `FB_INIT`
 * - `FB_LOGIN_STATUS`
 * - `FB_LOGIN`
 * - `FB_ME`
 * - `FB_PERMISSIONS`
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
			_fb,
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
				e.setAttribute('id', 'fb-root');
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
					_fb = FB;
					_dispatcher.dispatch('FB_INIT', p);
				};
				(function() {
					var e = document.createElement('script'); e.async = true;
					e.src = document.location.protocol + '//connect.facebook.net/en_US/all.js';
					document.getElementById('fb-root').appendChild(e);
				}());
			},

			/**
			 * Attach event listener
			 * @method on
			 * @param  {String} event
			 * @param  {Function} func
			 * @return {Number}
			 */
			on: function( event, func ) {
				return _dispatcher.on(event, func);
			},

			/**
			 * Detach event listener
			 * @method off
			 * @param  {String} event
			 * @param  {Function} func
			 */
			off: function( event, func ) {
				_dispatcher.off(event, func);
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
				_fb.getLoginStatus(function(response) {
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

			readPermissions: function() {
				var p = this;
				_fb.api('/me/permissions', function(response) {
					_permissions = [];
					if (typeof(response.data) !== 'object') {
						return;
					}
					for (var a in response.data) {
						_permissions[a] = response.data[a];
					}
					_dispatcher.dispatch('FB_READ_PERMISSIONS', p, _permissions);
				} );
			},

			/**
			 * Has user granted us the permission passed as an argument?
			 * Call `readPermissions` first.
			 * @param {String} permission
			 * @return {Boolean}
			 * @link http://developers.facebook.com/docs/reference/api/permissions/
			 */
			hasPermission: function( permission ) {
				if (typeof(_permissions) === 'undefined') {
					throw 'read permissions first';
				}
				if (typeof(_permissions[permission]) === 'undefined') {
					return false;
				}
				return _permissions[permission] ? true : false;
			},

			/**
			 * Is the user logged in?
			 * @method isLoggedIn
			 * @return {Boolean}
			 */
			isLoggedIn: function() {
				return _isloggedin;
			},

			/**
			 * Shows the login popup.
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
				_fb.login(
					handler,
					{scope: scope}
				);
			},

			/**
			 * Fetches data for currently login in user.
			 * @method me
			 */
			me: function() {
				var p = this;
				_fb.api('me/', function(response) {
					_dispatcher.dispatch('FB_ME', p, response);
				});
			},

			getUserId: function() {
				return _iduser;
			},

			fb: function() {
				return _fb;
			},

			/**
			 * Used for mocking out.
			 * @method setFB
			 * @param  {Object} fb
			 */
			setFB: function( fb ) {
				_fb = fb;
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
