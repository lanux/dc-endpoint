/**
 * check event log lib
 */
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
    var MATracker = function() {
        var _this = this;

        var logQueue = [];




        /**
         * add track record to queue
         * @param obj
         */
        _this.push = function(obj) {


        }



        _this._trackPage = function() {

        }

        _this._trackEvent = function() {

        }


        /**
         *
         * @param command
         * @param type
         * @param eventType
         * @param eventAct
         * @param eventLabel
         */
        _this.track = function(command , type , eventType , eventAct , eventLabel) {

        }






    }



	var TrackerManager = {


		/**
		 *
		 * create

		 使用指定字段创建一个新的跟踪器实例。
		 * 用法
		 * TrackerManager.create([trackingId], [cookieDomain], [name], [fieldsObject]);
		 */
		create:function(trackingId , cookieDomain , name , fieldsObject) {

			console.log(trackingId);

		}
	}


    window.TrackerManager = TrackerManager;






















}));