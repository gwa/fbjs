var gw = typeof(gw)=='object' ? gw : {};

gw.FBApp = (function() {

	var _currentview;

	// public interface
	var obj = {

		init : function ( preload, callback )
		{
			var channelURL = typeof(fb_channel_url)!='undefined' ? fb_channel_url : null;
			var canvasheight = typeof(fb_canvas_height)!='undefined' ? fb_canvas_height : 800;
			if (!preload) {
				if (typeof(callback)=='function') {
					gw.Facebook.addEventListener( 'FB_INIT', callback );
				}
				gw.Facebook.init( fb_app_id, canvasheight, channelURL );
				return;
			}
			var pl = new gw.Preloader(preload).addEventListener( 'COMPLETE', function () {
				$('#holder').addClass('loading');
				if (typeof(callback)=='function') {
					gw.Facebook.addEventListener( 'FB_INIT', callback );
				}
				gw.Facebook.init( fb_app_id, canvasheight, channelURL );
			} ).load();
		},

		/**
		 * @param String part
		 * @param String params (optional)
		 * @param Object data makes it a POST request (optional)
		 * @param Function callback (optional)
		 * @param jQuery holder (optional)
		 */
		loadView : function ( part, params, data, callback, holder )
		{
			if (typeof(holder)=='undefined') {
				holder = $('#holder');
			}
			var view = fbappconfig.views[part], path;
			if (typeof(view)=='undefined') {
				view = { path:part };
			}
			path = gwbaseurl+'view/'+view.path+'/';
			if (params) {
				path = path+'-/'+params+'/';
			}
			var onload = function () {
				_currentview = part;

				// parse viewlinks
				// viewlinks are A elements with class "viewlink" and a link to a named anchor.
				holder.find('a.viewlink').click( function(ev){
					ev.preventDefault();
					$(this).addClass('loading').unbind();
					var l=$(this).attr('href');
					l=l.substring(l.indexOf('#')+1).split('|');
					if (l[1]) {
						obj.loadView(l[0],l[1]);
					} else {
						obj.loadView(l[0]);
					}
				} );

				if (typeof(_gaq)!='undefined') {
					_gaq.push(['_trackEvent', 'FBAppView', part]);
				}
				if (typeof(view.onload)=='function') {
					view.onload( holder );
				}
				if (typeof(callback)=='function') {
					callback( holder );
				}

				// set height, with a little to spare
				gw.Facebook.setCanvasHeight($('#wrapper').height()+100);
				gw.Facebook.scrollTo(0, 0);
			};
			if (typeof(data)=='object') {
				holder.load(path, data, onload);
			} else {
				holder.load(path, onload);
			}
		}

	};

	return obj;

})();



/**
 * jQuery plugin. Requires jQuery, obviously.
 * Creates a button that needs particular FB permissions to work.
 * If user does not have permissions, button functions as install button, opening permissions window in a popup.
 */
if (typeof(jQuery)!='undefined') {
	(function( $ ) {
	$.fn.FBPermissionsButton = function( scope, func, errorhandler ) {

		return this.each( function () {

			var btn = $(this);

			// called after user has clicked button and installed app with scope
			var installhandler = function (success,errorstr) {
				gw.Facebook.removeEventListener( 'FB_INSTALL', installhandler );
				switch (success) {
					case true :
						if (typeof(_gaq)!='undefined') _gaq.push(['_trackEvent', 'FBPermissionsButton', 'success']);
						// if installed, we need to check the login status to get the id and token to perform further api calls
						btn.unbind().click( function (ev) { ev.preventDefault(); } ); // disable button while getting status
						gw.Facebook.getLoginStatus(
							function () { btn.removeClass('loading'); loginhandler(); func(); },
							function () { btn.removeClass('loading'); errorhandler('error_fb_login'); },
							true
						);
						break;
					case false :
						if (typeof(_gaq)!='undefined') _gaq.push(['_trackEvent', 'FBPermissionsButton', errorstr]);
						errorhandler(errorstr);
						btn.removeClass('loading');
						break;
				}
			};

			// if user is logged in, button triggers passed function.
			var loginhandler = function () {
				// button now calls func when clicked
				btn.unbind().click( function (ev) { ev.preventDefault(); func(); } );
			};

			// called if user is NOT logged in. Makes send button an install button.
			var notloginhandler = function () {
				gw.Facebook.makeInstallButton( btn, scope );
				btn.click( function () {
					gw.Facebook.addEventListener('FB_INSTALL', installhandler);
					// also adds loading class on click
					$(this).addClass('loading');
				} );
			};

			// disable button initially
			btn.click( function (ev) { ev.preventDefault(); } );
			gw.Facebook.getLoginStatus( loginhandler, notloginhandler );

		} );

	};
	})( jQuery );
}