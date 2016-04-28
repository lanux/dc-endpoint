var loki = require('lokijs');
var lokiDb = new loki('loki.json');


var DB = function() {
    var _this = this;

    var _conf = {};

    var _cur_driver_type = 'none';


    var __lokiContextMap = {};

    _this.config = function(conf) {

        if (conf['driver-type'] == 'loki') {
            _cur_driver_type = 'loki';
        }

        __lokiContextMap['default-coll'] = lokiDb.addCollection('event-log');


        _conf = conf;

    };


    _this.put = function(key , value ) {

        if (_cur_driver_type = 'loki') {
            _this._put_Loki(key , value );
        }


    };


    _this._put_Loki = function(key , value) {
        // --- append key entry ---
        if (typeof value === 'object') {
            value['_idkey'] = key;
        }
        __lokiContextMap['default-coll'].insert(value);
    };


    _this.get = function(key) {
        var result = null;
        if (_cur_driver_type = 'loki') {
            result = _this._get_Loki(key);
        }
        return result;
    };

    _this._get_Loki = function(key) {
        var result = __lokiContextMap['default-coll'].find({'_idkey': key});
        return result;
    }


    _this.delete = function(key) {

        if (_cur_driver_type = 'loki') {
            _remove_Loki(key);
        }

    };

    _remove_Loki = function(key) {
        __lokiContextMap['default-coll'].removeWhere({'_idkey': key});
    };


    _this.clearAll = function() {

    }


}

module.exports = new DB();