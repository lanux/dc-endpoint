var loki = require('lokijs');
var fs = require("fs");
var lokiDb = new loki('loki.json');



var DB = function() {
    var _this = this;

    var _conf = {};

    var _cur_driver_type = 'none';


    var __lokiContextMap = {};

    var _basedir = '.';

    _this.config = function(conf) {

        if (conf['driver-type'] == 'loki') {
            _cur_driver_type = 'loki';
        }
        else if (conf['driver-type'] == 'file') {
            _cur_driver_type = 'file';
            if (!conf['base-dir']) {
                throw new Error('Please set parameter "base-dir"');
            }

            _basedir = conf['base-dir'] + '/tracker';
            fs.exists(_basedir , (exists) => {
                if (!exists)  {
                    fs.mkdir(_basedir, 777 , function(err , folder) {
                        if (err) {
                            throw err;
                        }
                    });
                }
            });

        }

        _conf = conf;

    };

    var __currentSchemeName = '', __currentCollection = null;

    var __currentFile = '';
    _this.setScheme = function(schemeName) {
        if (_cur_driver_type == 'loki') {

            // --- get and check collection ---
            var existedCollection = __lokiContextMap[schemeName];
            if ( !existedCollection ) {
                // --- set currentcollection  ---
                existedCollection = lokiDb.addCollection(schemeName);
            }
            __currentCollection = existedCollection;

        }
        else if (_cur_driver_type == 'file') {
            __currentFile = schemeName + '.txt';
        }
        __currentSchemeName = schemeName;
    };

    /**
     * get all existed scheme
     */
    _this.getHisSchemes = function() {
        var schemes = [];

        if (_cur_driver_type == 'loki') {

            var listSches = lokiDb.listCollections();
            if (listSches.length < 1) {
                return schemes;
            }
            for (var i=0;i < listSches.length;i++) {
                if ( __currentSchemeName != listSches[i]['name'] ) {
                    schemes.push( listSches[i]['name'] );
                }
            }



        }

        return schemes;
    };

    _this.removeExistedScheme = function(schemeName) {

    };



    _this.put = function(key , value ) {

        if (_cur_driver_type == 'loki') {
            _this._put_Loki(key , value );
        }
        else if (_cur_driver_type == 'file') {
            _put_File(key , value);
        }
    };

    /**
     * use put file api
     * @param key
     * @param value
     * @private
     */
    _put_File = function(key , value) {
        var linecontent = key + '=>' + JSON.stringify(value)+'\r\n';
        var path = _basedir + '/'+ __currentFile;

        fs.exists(path , (exists) => {
            if (exists)  {

                fs.appendFile(path , linecontent , {encoding:'utf-8'} , function(err) {
                    if (err) {
                        console.log(err);
                    }
                    console.log('Append key : "' + key +'" saved.');
                });

            } else {

                fs.writeFile(path , linecontent , {encoding:'utf-8'} , function(err) {
                    if (err) {
                        console.log(err);
                    }
                    console.log('Create key : "' + key +'" saved.');
                });

            }

        });



    };



    _this._put_Loki = function(key , value) {
        // --- append key entry ---
        if (typeof value === 'object') {
            value['_idkey'] = key;
        }
        __currentCollection.insert(value);
    };


    _this.get = function(key) {
        var result = null;
        if (_cur_driver_type = 'loki') {
            result = _this._get_Loki(key);
        }
        return result;
    };

    _this._get_Loki = function(key) {
        var result = __currentCollection.find({'_idkey': key});
        return result;
    }


    _this.delete = function(key) {

        if (_cur_driver_type = 'loki') {
            _remove_Loki(key);
        }

    };

    _remove_Loki = function(key) {
        __currentCollection.removeWhere({'_idkey': key});
    };


    _this.clearAll = function() {

    };

    /**
     *
     * @param schemeName 指定特定的 scheme
     * @param key
     */
    _this.getFromScheme = function(schemeName , key) {

        var result = null;
        if (_cur_driver_type = 'loki') {

            var refColl = __lokiContextMap[schemeName];
            result = refColl.find({'_idkey': key});

        }

        var result;

    };

    /**
     *
     * @param schemeName 指定特定的 scheme
     */
    _this.getAllFromScheme = function(schemeName) {

        if (_cur_driver_type = 'loki') {

            var refColl = __lokiContextMap[schemeName];

        }

        return [];

    }


}

module.exports = new DB();