/**
 * check event log lib
 */

/**
 * append function function
 */

(function (factory) {
    "use strict";

    var globalConf = {
        port:80
    };


    factory(globalConf);
}(function(_globalConf) {
    "use strict";

    // ---- utils object ----
    var Utils = {};

    // --- set cookie ---
    Utils.setCookie = function(c_name, value, expiredays, path, domain, secure) {
        var exdate = new Date(); // 获取当前时间
        exdate.setDate(exdate.getDate() + expiredays);　 // 过期时间
        document.cookie = c_name + "=" + // cookie名称
            escape(value) + // 将cookie值进行编码
            ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString()) + // 设置过期时间
            ((path == null) ? ';path=/' : ';path=' + path) + // 设置访问路径
            ((domain == null) ? '' : ';domain=' + domain) + // 设置访问域
            ((secure == null) ? '' : ';secure=' + secure);　 // 设置是否加密
    };

    // --- get cookie ---
    Utils.getCookie = function(c_name) {
        if (document.cookie.length>0) {
            var  c_start=document.cookie.indexOf(c_name + "=");
            if (c_start!=-1) {
                c_start=c_start + c_name.length+1
                var c_end=document.cookie.indexOf(";",c_start);
                if (c_end==-1) {
                    c_end=document.cookie.length;
                }
                return decodeURIComponent(document.cookie.substring(c_start,c_end));
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

    Utils.setSession = function(key , value) {
        var result = JSON.stringify(value);
        window.sessionStorage.setItem(key ,result );
    };

    /**
     * get message for key
     * @param key
     * @returns {Object}
     */
    Utils.getSession = function(key) {
        var v = window.sessionStorage.getItem(key);
        var result = eval('(' + v + ')');;
        return result;
    }

    Utils.removeLocal = function(key) {
        var result = window.localStorage.removeItem(key);
        return result;
    };

    Utils.checkBrowser = function() {
        var ua = navigator.userAgent, bro = 'unknown' ;

        if (ua.indexOf('Trident/') > -1) {
            bro = 'MSIE';
        }

        return bro;

    };

    Utils.dateformat = function(date , fmt) {
        var o = {
            "M+" : date.getMonth()+1,                 //月份
            "d+" : date.getDate(),                    //日
            "H+" : date.getHours(),                   //小时
            "m+" : date.getMinutes(),                 //分
            "s+" : date.getSeconds(),                 //秒
            "q+" : Math.floor((date.getMonth()+3)/3), //季度
            "S"  : date.getMilliseconds(),            //毫秒
        };

        if (fmt) {
            if(/(y+)/.test(fmt)) {
                fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
            }


            for(var k in o) {
                if(new RegExp("("+ k +")").test(fmt)) {
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
                }
            }
        } else {
            // ---- use default ---
            var defFmt = date.getFullYear();
            defFmt = defFmt + (o["M+"] < 10 ? ('0' + o["M+"]):(''+o["M+"])) + (o["d+"] < 10 ? ('0' + o["d+"]):(''+o["d+"]));
            defFmt = defFmt + 'T';
            defFmt = defFmt + (o["H+"] < 10 ? ('0' + o["H+"]):(''+o["H+"]))+ ':'+ (o["m+"] < 10 ? ('0' + o["m+"]):(''+o["m+"])) + ':' + (o["s+"] < 10 ? ('0' + o["s+"]):(''+o["s+"]));
            defFmt = defFmt + '.' +(o["S"] < 100?( (o["S"] < 10) ?'00' + o["S"]:'0' + o["S"] ):(''+o["S"]));

            var timezoneLoc = date.toString().indexOf('GMT');
            defFmt = defFmt + date.toString().substring(timezoneLoc+3 , timezoneLoc+8);

            fmt = defFmt;

        }


        return fmt;
    };

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

    Utils.addHandler = function(element , type , handler) {
        if (element.addEventListener) {
            element.addEventListener(type , handler , false);
        }
        else if (element.attachEvent) {
            element.attachEvent("on" + type, handler);
        } else {
            element["on" + type] = handler;
        }
    };



    // ==================== define Tracker Class ======================


    /***
     * create Tracker Class for Collect wetsite
     * @param _instId
     * @param _argHost
     * @constructor
     */
    var Tracker = function(_instId , _argHost) {
        // --- define variable handle ----
        var ___UID = "uid", ___CID = "cid", ___DATA_REFERRER = "dr", __SCREEN_RE, _this = this,___queue = [] ;
        var _host = _argHost['protocol'] + _argHost['host'] + (_argHost['port'] ? ':' + _argHost['port'] : '');
        var _devicePath = {
            'pc':'/web',
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


        // ============ private method area ================


        /**
         * left page set
         * @private
         */
        function _leavePageView(evt) {

            // --- call and define event
            // --- sent event handle ---
            var ori = evt['target'];
            var timeStamp = evt.timeStamp;
            var charset = ori.charset;

            var leaveTime = new Date();
            //leaveTime.setMilliseconds(timeStamp);
            //leaveTime.setTime( timeStamp );


            var pageOutRef = {
                'charset': charset,
                'timestamp' : timeStamp,
                'lt':Utils.dateformat(new Date())
            };

            var browser = Utils.checkBrowser();


            if (browser == 'MSIE') {
                pageOutRef['url'] = window.location.href;
            } else {
                pageOutRef['url'] = ori.URL;
            }
            pageOutRef['page'] = location.pathname;

            try {
                _sendPageOut(pageOutRef);

                // --- check send ajax lock ---
                _triggerSendToServer({
                    'req-type':1  // --- use ajax handle --
                });

            } catch (e) {
                if (window.console) {
                    console.log(e);
                }
            }

        }


        function _resizeScreenView() {

        };


        /***
         * eventRef 事件关联对像
         * @param eventRef
         * @private
         */
        function _sendEvent(eventRef) {

            var rt = new Date();

            // --- push to queue ---
            var queue = {
                'dp': location.pathname,
                'dh' : document.location.origin,
                'ds' : document.location.search,
                't':'event',
                'lang': _clientEnvInfo['lang'],
                'cvt' : Utils.getCookie('cvt'),
                'req-time':Utils.dateformat(new Date()),
                'ec' : eventRef['eventCategory'],
                'ea' : eventRef['eventAction']
            };
            queue[___CID] = Utils.getCookie(___CID);

            if (Utils.getCookie(___UID)) {
                queue[___UID] = Utils.getCookie(___UID);
            }

            if (eventRef['eventLabel']) {
                queue['el'] = eventRef['eventLabel'];
            }

            if ( eventRef['eventValue'] ) {
                queue['ev'] = eventRef['eventValue'];
            }
            _this.addQueue(queue);

        };

        /**
         *
         * @param pageOutRef
         * @private
         */
        function _sendPageOut(pageOutRef) {
            // --- push to queue
            var queue = {
                'dp': pageOutRef['page'],
                'dh' : document.location.origin,
                'ds' : document.location.search,
                't' : 'pageview',
                'pa' : 'out',
                'lang': _clientEnvInfo['lang'],
                'cvt' : Utils.getCookie('cvt'),
                'req-time' : pageOutRef['lt']
            }
            queue[___CID] = Utils.getCookie(___CID);

            if (Utils.getCookie(___UID)) {
                queue[___UID] = Utils.getCookie(___UID);
            }

            // --- get referrrer ---
            _this.addQueue(queue);
        };

        /**
         * load and count page view
         * @param pageRef
         * @private
         */
        function _sendPageView(pageRef) {
            // --- push to queue
            var queue = {
                'dp': pageRef['page'],
                'dh' : document.location.origin,
                'ds' : document.location.search,
                'lang': _clientEnvInfo['lang'],
                'cvt' : Utils.getCookie('cvt'),
                't' : 'pageview',
                'pa' : 'in',
                'req-time' : Utils.dateformat(new Date())
            }
            queue[___CID] = Utils.getCookie(___CID);
            if (Utils.getCookie(___UID)) {
                queue[___UID] = Utils.getCookie(___UID);
            }

            var dr = _this.lastReferrer;
            if (dr) {
                // --- get from other referrer ----
                queue['dr'] = dr;
            }

            // --- append title ---
            if (pageRef['title']) {
                queue['title'] = pageRef['title'];
            }

            if (pageRef['ul']) {
                queue['ul'] = pageRef['ul'];
            }


            // --- get referrrer ---
            _this.addQueue(queue);

            // fire sent to server
            _triggerSendToServer({});

        };

        /**
         *  define and call screen view
         * @private
         */
        function _sendScreenView() {
            // --- push to queue ---
            var queue = {
                'dp': location.pathname,
                'dh' : document.location.origin,
                'ds' : document.location.search,
                'lang': _clientEnvInfo['lang'],
                'cvt' : Utils.getCookie('cvt'),
                't':'screenview',
                'cei' : _clientEnvInfo
            };
            queue[___CID] = Utils.getCookie(___CID);

            if (Utils.getCookie(___UID)) {
                queue[___UID] = Utils.getCookie(___UID);
            }

            // --- get referrrer ---
            _this.addQueue(queue);

        };

        /**
         *
         * define user ref object
         * @param userRef
         * @private
         */
        function _sentUser(userRef) {
            var queue = {
                't':'user',
                'act': userRef['action'],
                'lang': _clientEnvInfo['lang'],
                'cvt' : Utils.getCookie('cvt'),
                'req-time':Utils.dateformat(new Date()),
                'uid' : userRef['account']
            };
            queue[___CID] = Utils.getCookie(___CID);


            if (userRef['action'] == 'bind') {
                Utils.setCookie(___UID , userRef['account']);
            }
            else if (userRef['action'] == 'unbind') {
                Utils.setCookie(___UID , userRef['account'] , -7);
            }


            // --- get referrrer ---
            _this.addQueue(queue);


            // --- trigger event ---
            // --- check send ajax lock ---
            _triggerSendToServer({
                'req-type':0  // --- use script tag handle --
            });
        };

        /**
         *  private trigger handle
         * @param argRef
         * @private
         */
        function _triggerSendToServer(argRef) {
            // --- sent to server ---

            // --- use ajax ---
            if (argRef['req-type'] == 1) {
                _sendToServer(_xhr);
            }

            // --- use script tag --
            else {
                _sentServerByScriptTag();
            }
        };


        // --- private method ---
        var _xhr = _XHR();
        _xhr.locked = 0;
        // --- send to server ----
        function _sendToServer() {

            var _localXhr = arguments[0];
            var url = _host + '/log' +  _devicePath['pc'] +  _pathMap['COLLECT'] + _version;
            if (___queue.length == 0) {
                return ;
            }
            // --- check the lock  ,if lock , not invoke message ---
            var queStr = JSON.stringify(___queue);

            url = url + '?' + '_i=' + _gconf['inst'] + '&_ti=' + _instId + '&_td=' + encodeURIComponent(queStr)

            _localXhr.open('GET' , url , false);

            _localXhr.onreadystatechange = function(domObj) {

                // --- request complete  ---
                if (_localXhr.readyState == 4) {
                    // --- remote queue ---
                    if (_localXhr.status == 200) {
                        _localXhr.locked = 0;
                        // ---  success message ---
                        ___queue =  [];
                    }
                }
                // --- not init method
                else if (_localXhr.readyState != 4) {
                    _localXhr.locked = 1;
                }


            };

            // --- fire event ---
            _localXhr.send();

        };

        // --- inner method ---
        function _XHR() {
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


        /**
         * load server for script
         * @private
         */
        function _sentServerByScriptTag() {

            var url = _host + '/log' + _devicePath['pc'] +  _pathMap['COLLECT'] + _version;
            if (___queue.length == 0) {
                return ;
            }

            // --- sent ---
            // --- check the lock  ,if lock , not invoke message ---
            var queStr = JSON.stringify(___queue);

            url = url + '?' + '_i=' + _gconf['inst'] + '&_ti=' + _instId + '&_td=' + encodeURIComponent(queStr);

            var elemTag = document.createElement('script');
            var curTags = document.getElementsByTagName('script');

            var secTag = null, hasOne = 0;
            if (curTags.length > 2) {

                for (var i = 0 ; i < curTags.length ; i++) {
                    var tmpTag = curTags[i];
                    var scrtagSrc = tmpTag.src;
                    if (scrtagSrc) {
                        var keyworkInd = scrtagSrc.indexOf('collect') > -1;

                        if ( keyworkInd && scrtagSrc.indexOf('_i='+_gconf['inst']) > -1 ) {
                            secTag = tmpTag;
                            hasOne = 1;
                            break;
                        }
                    }
                }
            }

            if (!secTag) {
                secTag = curTags[1];
            }


            elemTag.async = 'true';
            elemTag.src = url;

            // --- update older script tag
            if (hasOne) {
                // --- clear tag first --
                secTag.parentNode.replaceChild(elemTag ,  secTag);
            }
            else {
                secTag.parentNode.insertBefore(elemTag , secTag);
            }
        };

        // ============ public method area ================

        /**
         * define client endpoint
         */
        _this.init = function() {
            // --- get the user current message id ---
            var clientDevId = Utils.getCookie(___CID);
            var clientVisiteTimes = 1;
            var trackerInstanceActivity  = 1;
            // --- create new clinet id ---
            if (!clientDevId) {
                clientDevId = Utils.genUUID();

                // --- reset time ---
                clientVisiteTimes = 1;

                Utils.setCookie('cvt' , clientVisiteTimes , 365);
                Utils.setCookie('_tia' , trackerInstanceActivity);

            } else {
                // --- exit client id ---
                var trackerInstanceActivity = Utils.getCookie('_tia');

                if( !trackerInstanceActivity ) {
                    // ---- mark account type ---
                    var cvtFromCookie = Utils.getCookie('cvt');
                    console.log(cvtFromCookie);
                    cvtFromCookie = cvtFromCookie? parseInt(cvtFromCookie?cvtFromCookie:0) + 1:parseInt(1) ;
                    clientVisiteTimes = cvtFromCookie;
                    trackerInstanceActivity = 1;
                    Utils.setCookie('cvt' , clientVisiteTimes , 365);
                    Utils.setCookie('_tia' , trackerInstanceActivity);
                }

            }
            // --- one year ---
            Utils.setCookie(___CID , clientDevId , 365);
            _clientInfo[___CID] = clientDevId;

            // --- get uid from account ---
            var accountName = Utils.getCookie(___UID);
            var buyerStr = Utils.getCookie('buyer');
            if ( accountName ) {
                // --- --- binding clientInfo object ---
                _clientInfo[___UID] = accountName;

                // --- check string and remove ---
                if (!buyerStr) {
                    // --- remove value ---
                    Utils.setCookie(___UID , accountName , -7);
                    delete _clientInfo[___UID];
                }


            } else {
                // --- geth from other uid ---
                try {

                    if (buyerStr) {
                        var buyerArrs = buyerStr.split('&');
                        for (var i = 0 ; i < buyerArrs.length ; i++) {
                            var loc = buyerArrs[i].indexOf('account:');
                            if (loc > -1) {
                                accountName =  buyerArrs[i].substring(loc+8);
                                break;
                            }
                        }

                        if (accountName) {
                            _clientInfo[___UID] = accountName;
                            Utils.setCookie(___UID , _clientInfo[___UID]);
                        }
                    }


                } catch(err) {
                    if (window.console) {
                        console.log('UID is empty.');
                    }
                }



            }


            if (_this.supportSessionStorage) {
                // --- save to last url ---
                Utils.getSession('lastUrl');
            }


            // --- get client nav info ---
            _clientEnvInfo['bro_acn'] = navigator.appCodeName;
            _clientEnvInfo['bro_name'] = navigator.appName;
            _clientEnvInfo['lang'] = navigator.language;
            _clientEnvInfo['pf'] = navigator.platform;
            _clientEnvInfo['ua'] = navigator.userAgent;

            // --- for chrome ---
            if (navigator.hardwareConcurrency) {
                _clientEnvInfo['cups'] = navigator.hardwareConcurrency;
            }

            // --- reset screen size ---
            _clientEnvInfo['sr'] = screen.width + 'x' + screen.height ;
            _clientEnvInfo['vp'] = screen.availWidth + 'x' + screen.availHeight;


            // --- get last referrer url ---
            _this.lastReferrer = document.referrer;




        };


        /**
         *
         * @param queueObj
         */
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


        var _priv_plugins = {};
        _this.bindPlugins = function(plugins) {
            _priv_plugins = plugins;
        };


        /**
         *
         * @param command
         * @param type --- one of the follow value "pageview" , "screenview" , "event" , "biz", "transaction" , "item" , "exception"
         * @param eventType
         * @param eventAct
         * @param eventLabel
         */
        _this.track = function(command) {


            command = command.toLowerCase();

            // --- hitType mapping ---

            if (command.indexOf(':') > -1) {
                // --- get the command message
                var pluginCmds = command.split(":");

                // --- call plugin ---
                var pluginInst = _priv_plugins[pluginCmds[0]];

                // --- call event ---
                pluginInst.triggerEvent(pluginCmds[1] );





            } else {

                // --- use  default plugin ---

                if (command === 'send') {
                    var hitTypeObj = arguments[1];
                    var hitType = "";
                    var argsAppend = {};

                    if (typeof arguments[1] === 'object') {
                        hitType = hitTypeObj['hitType'];
                        if (hitType == 'event') {
                            argsAppend['eventCategory'] = hitTypeObj['eventCategory'];
                            argsAppend['eventLabel'] = hitTypeObj['eventLabel'];
                            argsAppend['eventAction'] = hitTypeObj['eventAction'];
                            argsAppend['eventValue'] = hitTypeObj['eventValue'];
                        }
                        else if (hitType === 'biz') {
                            argsAppend['bizCategory'] = hitTypeObj['bizCategory'];
                            argsAppend['bizLabel'] = hitTypeObj['bizLabel'];
                            argsAppend['bizAction'] = hitTypeObj['bizAction'];
                            argsAppend['bizValue'] = hitTypeObj['bizValue'];
                        }
                        else if (hitType === 'pageview') {
                            argsAppend['page'] = hitTypeObj['page'];
                        }
                        else if ( hitType === 'user') {
                            argsAppend['action'] = hitTypeObj['action'];
                            argsAppend['account'] = hitTypeObj['account'];
                        }

                    } else if (typeof arguments[1] === 'string') {
                        hitType = arguments[1];
                        if (hitType === 'event') {
                            argsAppend['eventCategory'] = arguments[2];
                            argsAppend['eventAction'] = arguments[3];
                            argsAppend['eventLabel'] = arguments[4];
                            argsAppend['eventValue'] = arguments[5];
                        }
                        else if (hitType === 'biz') {
                            argsAppend['bizCategory'] = arguments[2];
                            argsAppend['bizLabel'] = arguments[3];
                            argsAppend['bizAction'] = arguments[4];
                            argsAppend['bizValue'] = arguments[5];
                        }
                        else if (hitType === 'pageview') {
                            argsAppend['page'] = arguments[2];
                        }
                        else if (hitType === 'user') {
                            argsAppend['action'] = arguments[2]
                            argsAppend['account'] = arguments[3];
                        }
                    }


                    // --- invoke hit type event ---
                    if (hitType === 'pageview') {

                        if (!argsAppend['page']) {
                            argsAppend['page'] = location.pathname;
                        }

                        // --- mark page view ---
                        _sendPageView(argsAppend);

                        // --- add new event and mark leave page ---
                        //_leavePageView(argsAppend);
                        // --- fire send page record ---

                    }

                    else if (hitType === 'screenview') {
                        _sendScreenView();

                        _resizeScreenView();

                    }
                    // --- add event to handle ---
                    else if (hitType === 'event') {

                        _sendEvent(argsAppend);

                    }
                    // --- add business event to handle ---
                    else if (hitType === 'biz') {
                        //_this._sendBiz(argsAppend);
                    }

                    else if (hitType === 'user') {
                        _sentUser(argsAppend);
                    }
                }

            }
        };

        /**
         * invoke by callback script tag
         */
        _this.callbackByScriptTag = function(serverRes) {

            if ( serverRes.success ) {
                // --- clear queue ---
                ___queue =  [];

            }
            else {
                // --- output error message ---
                if (window.console) {
                    console.log(serverRes.msg);
                }
            }

        }



        // ========= pre define event code area ===================
        Utils.addHandler(document,'scroll' , function() {
            _triggerSendToServer({'req-type':0});
        });
        Utils.addHandler(window,'resize' , function() {
            _triggerSendToServer({'req-type':0});
        });
        Utils.addHandler(window,'beforeunload' , function(evt) {
            _leavePageView(evt);
        });



        // --- trigger scheudler ---
        try {
            var iId = setInterval(_triggerSendToServer , 5000 , {});
        } catch (Error) {

            //console.log(Error);

        }

    }


    // ============== Define Tracker Manager Handle ===========================

    /**
     *
     * @type {{_trackerInst: {}, init: TrackerManager.init, create: TrackerManager.create, _reg_plugins: {}, register: TrackerManager.register, getScriptHost: TrackerManager.getScriptHost, loadPlugin: TrackerManager.loadPlugin}}
     */
    var TrackerManager = {

        /**
         * binding instance handle ---
         */
        _trackerInst : {

        },


        init:function() {

            // --- load plugin
            var elemTag = document.createElement('script');
            var curTags = document.getElementsByTagName('script');

            var secTag = null, hasOne = 0;
            if (curTags.length > 1) {

                for (var i = 0 ; i < curTags.length ; i++) {
                    var tmpTag = curTags[i];
                    var scrtagSrc = tmpTag.src;
                    if (scrtagSrc) {
                        var keyworkInd = scrtagSrc.indexOf('/analytics/v1/web.js') > -1;

                        if ( keyworkInd ) {
                            secTag = tmpTag;
                            break;
                        }
                    }
                }
            }

            this._scriptTag = secTag;

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
                var host = TrackerManager.getScriptHost();

                if (!_globalConf['port'] || _globalConf['port'] == 80 ) {
                    delete host['port'];
                } else {
                    host['port'] = _globalConf['port'];
                }

                _inst = new Tracker(trackingId , host);
                _thisManager[trackingId] = _inst;
            }

            _inst.init();

            // --- bind all load plugins ---
            _inst.bindPlugins(_thisManager._reg_plugins);



            return _inst;

        },

        // --- register plugin ---
        _reg_plugins : {},
        register : function(pluginName , constructor) {
            var _this = this;

            if (!_this._reg_plugins[pluginName]) {
                _this._reg_plugins[pluginName] = new constructor();
            }

        },

        /**
         * remove registed plugin by name
         * @param pluginName
         */
        unregister : function(pluginName) {

        },



        // --- get script host url --
        getScriptHost : function() {

            var src = this._scriptTag.src;

            var beginContentInd = src.indexOf('//');
            var protocol = src.substring(0 , beginContentInd+2);
            src = src.substring(beginContentInd+2);
            var hostStr = src.substring(0 , src.indexOf('/'));

            var host = {
                protocol : protocol
            }

            if (hostStr.indexOf(':') > -1) {
                var hostArray = hostStr.split(':');
                host['host'] = hostArray[0];
                host['port'] = hostArray[1];
            } else {
                host['host'] = hostStr;
            }

            return host;
        },


        loadPlugin : function(pluginName) {

            // --- check plugin load first



            // --- load plugin
            var elemTag = document.createElement('script');

            var secTag = this._scriptTag;


            var path = secTag.src.substring(0 , secTag.src.lastIndexOf('/')) + '/plugins/' + pluginName + '.js';

            // --- append node ---
            elemTag.async = 'true';
            elemTag.src = path;

            // --- update older script tag
            secTag.parentNode.appendChild(elemTag);
        }



    };


    // ========== main program ===================

    // --- check and load global varaible ---
    var _gconf = {
        'channel': 'MA_PORTAL',
        'inst': '_tracker'
    };

    if (_aconf) {
        for (var i = 0 ; i < _aconf.length ; i++) {
            var arg = _aconf[i];
            _gconf[arg[0]] = arg[1];
        }
    };


    /**
     * main program ,  创建的时需要指定特定的来源 ，如是 MA PORTAL , MA APPS , WECHAT , WEBO
     */
     try {
         if (TrackerManager) {

             TrackerManager.init();


             // --- register plugins ---
             if (_gconf['plugins']) {
                 var pluginNames = _gconf['plugins'].split(',');
                 for (var i = 0 ; i < pluginNames.length ; i++) {
                     TrackerManager.loadPlugin(pluginNames[i]);
                 }
             }

            var _tracker = TrackerManager.create(_gconf['channel']);

             // --- check inst name --
             if (window[_gconf['inst']]) {
                 // --- tracker instance name is existed ---
                 alert('Tracker instance name['+_gconf['inst']+'] has been existed. Please change another inst name. ');
                 return ;

             }
             else {
                 window[_gconf['inst']] = _tracker;
             }


             // --- fire trigger event ---
             window[_gconf['inst']].track('send','screenview');

             window[_gconf['inst']].track('send','pageview');

             window.TrackerManager = TrackerManager;

         }


         // --- bind event ---
         /**
          * access call back handler facade
          */
         window.callbackByScriptTag = function(serverRes) {

             // --- check the inst ---
             if (window[_gconf['inst']]) {
                 // --- call inst event ---
                 window[_gconf['inst']].callbackByScriptTag(serverRes);
             }
             else {
                 // --- use window response ---
                 if ( !serverRes.success ) {
                     // --- clear queue ---
                     // --- output error message ---
                     if (window.console) {
                         console.log(serverRes.msg);
                     }
                 }

             }


         }


     } catch (e) {

         if (window.console) {
             console.log(e);
         }

     }



}));
