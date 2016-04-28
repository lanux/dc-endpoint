/**
 * check event log lib
 */

/**
 * append function function
 */
Date.prototype.format = function(fmt) {
	var o = {
		"M+" : this.getMonth()+1,                 //月份
		"d+" : this.getDate(),                    //日
		"H+" : this.getHours(),                   //小时
		"m+" : this.getMinutes(),                 //分
		"s+" : this.getSeconds(),                 //秒
		"q+" : Math.floor((this.getMonth()+3)/3), //季度
		"S"  : this.getMilliseconds()             //毫秒
	};

	if(/(y+)/.test(fmt)) {
		fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
	}

	for(var k in o) {
		if(new RegExp("("+ k +")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
		}
	}
	return fmt;
};


(function (factory) {
	"use strict";
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	}
	else if(typeof module !== 'undefined' && module.exports) {
		module.exports = factory(require('jquery'));
	}
	else {
		factory(jQuery);
	}
}(function($, undefined) {
	"use strict";



	// ---- client info object ---


	// ---- utils object ----
	var Utils = function() {
		var _this = this;
	}

	// --- set cookie ---
	Utils.setCookie = function(c_name, value, expiredays, path, domain, secure) {
		var exdate = new Date(); // 获取当前时间
		exdate.setDate(exdate.getDate() + expiredays);　 // 过期时间
		document.cookie = c_name + "=" + // cookie名称
		escape(value) + // 将cookie值进行编码
		((expiredays == null) ? "" : ";expires=" + exdate.toGMTString()) + // 设置过期时间
		((path == null) ? '/' : ';path=' + path) + // 设置访问路径
		((domain == null) ? '' : ';domain=' + domain) + // 设置访问域
		((secure == null) ? '' : ';secure=' + secure);　 // 设置是否加密
	};

	// --- get cookie ---
	Utils.getCookie = function(c_name) {
		if (document.cookie.length>0)
		{
			var  c_start=document.cookie.indexOf(c_name + "=")
			if (c_start!=-1)
			{
				c_start=c_start + c_name.length+1
				var c_end=document.cookie.indexOf(";",c_start)
				if (c_end==-1) c_end=document.cookie.length
				return unescape(document.cookie.substring(c_start,c_end))
			}
		}
		return "";
	};

	Utils.setLocal = function(key, value) {
		var result = JSON.stringify(value);
		window.localStorage.setItem(key ,result );
	};


	Utils.getLocal = function(key) {
		var v = window.localStorage.getItem(key);
		var result = eval('(' + v + ')');;
		return result;
	};

	Utils.removeLocal = function(key) {
		var result = window.localStorage.removeItem(key);
		return result;
	}





	/**
	 * example : Utils.genUUID(32, 10)
	 * 
	 * @param len
	 * @param radix
	 * @returns {string}
	 */
	Utils.genUUID = function(len, radix) {
		var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
		var uuid = [], i;
		radix = radix || chars.length;

		if (len) {
			// Compact form
			for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
		} else {
			// rfc4122, version 4 form
			var r;

			// rfc4122 requires these characters
			uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
			uuid[14] = '4';

			// Fill in random data. At i==19 set the high bits of clock sequence as
			// per rfc4122, sec. 4.1.5
			for (i = 0; i < 36; i++) {
				if (!uuid[i]) {
					r = 0 | Math.random()*16;
					uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
				}
			}
		}

		return uuid.join('');
	};








    // set the tracker class ---
    var Tracker = function() {
        var ___ACC_NAME = "uid", ___USER_ID = "cid", ___DATA_REFERRER = "dr", __SCREEN_RE;

		var _this = this;

        var ___queue = [];

		_this.host = 'http://localhost:3000';
		
		var _devicePath = {
			'pc':'/pc-pad',
			'mobile':'/mobile'
		}, _pathMap = {
			'COLLECT':'/collect'
		}, _version = '/v1';



		var _curPageInfo = {};
		var _clientEnvInfo = {};
		var _clientInfo = {};


		// --- check local storage rec ---
		_this.supportLocalStorage = window.localStorage ? true : false;
		_this.supportSessionStorage = window.sessionStorage ? true : false;

		_this.loadPageInfo = function() {



			// --- get client nav info ---
			_clientEnvInfo['browser_appCodeName'] = navigator.appCodeName;
			_clientEnvInfo['browser_name'] = navigator.appName;
			_clientEnvInfo['browser_ver'] = navigator.appVersion;
			_clientEnvInfo['lang'] = navigator.language;
			_clientEnvInfo['platform'] = navigator.platform;
			_clientEnvInfo['userAgent'] = navigator.userAgent;




			// --- for chrome ---
			if (navigator.hardwareConcurrency) {
				_clientEnvInfo['cups'] = navigator.hardwareConcurrency;
			}

			// --- reset screen size ---
			_clientEnvInfo['scr_h'] = screen.height;
			_clientEnvInfo['scr_w'] = screen.width;
			_clientEnvInfo['scr_avai_h'] = screen.availHeight;
			_clientEnvInfo['scr_avai_w'] = screen.availWidth;



			// --- get last referrer url ---
			var lastReferrer = document.referrer;

		};

		/**
		 * define client endpoint
		 */
		_this.initClientEndpoint = function() {
			// --- get the user current message id ---
			var userId = Utils.getCookie(___USER_ID);
			if (!userId) {
				userId = Utils.genUUID();
			}
			// --- one year ---
			Utils.setCookie(___USER_ID , userId , 365);
			_clientInfo[___USER_ID] = userId;


			var accountName = Utils.getCookie(___ACC_NAME);
			if ( accountName ) {
				// --- --- binding clientInfo object ---
				_clientInfo[___ACC_NAME] = accountName;
			}

			// ---- store access url record ---
			var _accHist = "URLHIST-" + userId;

			var urlHistArray = Utils.getLocal(_accHist);
			if (!urlHistArray || typeof urlHistArray === 'undefined') {
				urlHistArray = [];
			}

			// --- put url Hist tp local store ---
			var rec = {
				'req-time' : new Date().format("yyyy-MM-dd HH:mm:ss"),
				'url' : window.location.href,
				'origin' : window.location.origin,
				'pathname' : window.location.pathname,
				'hostname' : window.location.hostname,
				'hash' : window.location.hash
			};

			urlHistArray.push(rec);
			Utils.setLocal(_accHist, urlHistArray);

		};





        /**
         * add track record to queue
         * @param obj
         */
        _this.push = function(obj) {


        };



        _this._trackPage = function() {

        };

        _this._trackEvent = function() {

        };


		/**
		 * load and count page view
		 */
		_this.sendPageView = function() {

		};
		
		/**
		 * @param eventRef 事件关联对像
		 * @param eventCategory 事件分类 {}
		 * @param eventAction 关注定义事件动作
		 * @param eventLabel 定义事件标签
		 * @param eventValue 定义事件传送的值
		 * 
		 */
		_this.sendEvent = function(eventRef) {

			// --- push to queue ---
			var queue = {
				'dl':  window.location.href,
				't':'event',
				'req-time' : new Date().format("yyyy-MM-dd HH:mm:ss"),
				'ec' : eventRef['eventCategory'],
				'ea' : eventRef['eventAction']
			};
			queue[___USER_ID] = Utils.getCookie(___USER_ID);

			if (eventRef['eventLabel']) {
				queue['el'] = eventRef['eventLabel'];
			}

			if ( eventRef['eventValue'] ) {
				queue['ev'] = eventRef['eventValue'];
			}

			_this.addQueue(queue);

		};


		_this.addQueue = function(queueObj) {
			//var queStr = JSON.stringify(queueObj);
			___queue.push( queueObj );
		};

		_this.getAllQueue = function() {
			return ___queue;
		};

		_this.resetQueue = function() {
			___queue = [];
		};


        /**
         *
         * @param command
         * @param type --- one of the follow value "pageview" , "screenview" , "event" , "transaction" , "item" , "exception"
         * @param eventType
         * @param eventAct
         * @param eventLabel
         */
        _this.track = function(command) {

			command = command.toLowerCase();

			// --- hitType mapping ---

			//console.log(arguments);




			if (command.indexOf(':') > -1) {
				// --- get the command message

			} else {

				// --- use  default plugin ---

				if (command === 'send') {
					var hitTypeObj = arguments[0];
					var hitType = "";
					var argsAppend = {};
					if (typeof arguments[0] === 'object') {
						hitType = hitTypeObj['hitType'];
						if (hitType === 'event') {
							argsAppend['eventCategory'] = hitTypeObj['eventCategory'];
							argsAppend['eventLabel'] = hitTypeObj['eventLabel'];
							argsAppend['eventAction'] = hitTypeObj['eventAction'];
							argsAppend['eventValue'] = hitTypeObj['eventValue'];
						}

					} else if (typeof arguments[0] === 'string') {
						hitType = arguments[1];
						if (hitType === 'event') {
							argsAppend['eventCategory'] = arguments[1];
							argsAppend['eventAction'] = arguments[2];
							argsAppend['eventLabel'] = arguments[3];
							argsAppend['eventValue'] = arguments[4];
						}
					}


					// --- invoke hit type event ---
					if (hitType === 'pageview') {

						// --- mark page view ---
						_this.sendPageView();

						// --- fire send page record ---
						sendToServer();


					}
					// --- add event to handle ---
					else if (hitType === 'event') {
						_this.sendEvent(argsAppend);

					}





				}

				// --- add plugin
				else if (command === 'provide') {

				}



			}



        };

		// --- inner method ---
		function XHR() {
			var xhr;
			try {xhr = new XMLHttpRequest();}
			catch(e) {
				var IEXHRVers =["Msxml3.XMLHTTP","Msxml2.XMLHTTP","Microsoft.XMLHTTP"];
				for (var i=0,len=IEXHRVers.length;i< len;i++) {
					try {xhr = new ActiveXObject(IEXHRVers[i]);}
					catch(e) {continue;}
				}
			}
			return xhr;
		}




		var _xhr = XHR();



		// --- send to server ----
		var sendToServer = function() {
			var url = _this.host + _devicePath['pc'] +  _pathMap['COLLECT'] + _version;


			if (___queue.length == 0) {
				return ;
			}

			var queStr = JSON.stringify(___queue);

			_xhr.open('POST' , url , true);

			_xhr.onreadystatechange = function(domObj) {
				// --- request complete  ---
				if (_xhr.readyState == 4) {
					// --- remote queue ---
					___queue =  [];
				}
			};

			_xhr.setRequestHeader('content-type','application/x-www-form-urlencoded');
			_xhr.send(queStr);

		};



		// --- trigger scheudler ---
		try {
			var iId = setInterval(sendToServer , 5000);
		} catch (Error) {

			//console.log(Error);

		}









    }



	var TrackerManager = {

		/**
		 * binding instance handle ---
		 */
		_trackerInst : {

		},


		/**
		 *
		 * create

		 使用指定字段创建一个新的跟踪器实例。
		 * 用法
		 * TrackerManager.create([trackingId], [cookieDomain], [name], [fieldsObject]);
		 */
		create:function(trackingId , cookieDomain , name , fieldsObject) {
			var _thisManager = this;

			var _inst = _thisManager[trackingId];

			if (!_inst) {
				_inst = new Tracker(trackingId);
				_thisManager[trackingId] = _inst;
			}

			_inst.initClientEndpoint();

			// ---- load current page info ---
			_inst.loadPageInfo();



			return _inst;

		}
	}


    window.TrackerManager = TrackerManager;




}));
