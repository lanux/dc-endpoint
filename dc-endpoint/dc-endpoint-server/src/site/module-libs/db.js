var fs = require("fs");


var DB = function() {
    var _this = this;

    var _conf = {};

    var _cur_driver_type = 'none';


    var __lokiContextMap = {};

    var _basedir = '.';

    _this.config = function(conf) {

         if (conf['driver-type'] == 'file') {
            _cur_driver_type = 'file';
            if (!conf['base-dir']) {
                throw new Error('Please set parameter "base-dir"');
            }

            _basedir = conf['base-dir'] + '/tracker';
            fs.exists(_basedir , function(exists) {
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

    var __currentSchemeName = '', __currentFile = '';

    _this.setScheme = function(schemeName) {

        if (_cur_driver_type == 'file') {
            __currentFile = schemeName + '.txt';

            // --- set lock file message ---
            var path = _basedir + '/lock';

            fs.writeFile(path , __currentFile , {encoding:'utf-8'} , function(err) {
                if (err) {
                    console.log(err);
                }
            });

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

        if (_cur_driver_type == 'file') {
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

        fs.exists(path , function(exists) {
            if (exists) {

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

    function _get_File(key ,handler) {
        var path = _basedir + '/'+ __currentFile;
        fs.exists(path , function(exists) {
            if (exists) {

                fs.readFile(path , 'utf8', function(err ,data) {
                    if (err) {
                        console.log(err);
                    }

                    if (handler) {
                        handler(data);
                    }


                });

            }
        });

    };



    _this.get = function(key ,  handler) {
        var result = null;
        if (_cur_driver_type = 'file') {
            result = _get_File(key , handler);
        }
        return result;
    };


    /**
     * delete entry by key
     * @param key
     */
    _this.delete = function(key) {

        if (_cur_driver_type = 'file') {
            _remove_File(key);
        }

    };

    _remove_File = function(key) {

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