var fs = require("fs");


var DB = function() {
    var _this = this;

    var _conf = {};

    var _cur_driver_type = 'none';


    var _basedir = '.';

    _this.config = function(conf) {

         if (conf['driver-type'] == 'file') {
            _cur_driver_type = 'file';
            if (!conf['base-dir']) {
                throw new Error('Please set parameter "base-dir"');
            }

            _basedir = conf['base-dir'];
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



        return schemes;
    };

    _this.removeExistedScheme = function(schemeName) {

    };



    _this.put = function(key , value ) {
        if (_cur_driver_type == 'file') {
            _put_forFile(key , value);
        }
    };



    /**
     * use put file api
     * @param key
     * @param value
     * @private
     */
    _put_forFile = function(key , value) {
        _file_tmpKeyMap[key] = value;
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

        var result;

    };

    /**
     *
     * @param schemeName 指定特定的 scheme
     */
    _this.getAllFromScheme = function(schemeName) {

        return [];

    };


    _this.commit = function(handleMap) {
        try {
            if (_cur_driver_type == 'file') {
                _writeTmpContentToFile(handleMap);
            }
        } catch (err) {
            handleMap(err);
        }


    };


    var _file_tmpKeyMap = {};

    // --- pub all file
    function _writeTmpContentToFile(handle) {

        var linecontent = '';

        for (var i in _file_tmpKeyMap) {

            linecontent = linecontent + i + '=>' + JSON.stringify(_file_tmpKeyMap[i])+'\r\n';
        }


        // --- execute content first

        if (linecontent.length  == 0) {
            if (handle) {
                handle();
            }
            return ;
        }
        // execute another funciton

        // --- write all content to file ---
        var path = _basedir + '/'+ __currentFile;
        fs.exists(path , function(exists) {
            if (exists) {
                fs.appendFile(path , linecontent , {encoding:'utf-8'} , function(err) {
                    if (err) {
                       handle(err);
                    }
                    // --- clean all object ---
                    _file_tmpKeyMap = {};
                });
            } else {
                fs.writeFile(path , linecontent , {encoding:'utf-8'} , function(err) {
                    if (err) {
                        handle(err);
                    }
                    // --- clean all object ---
                    _file_tmpKeyMap = {};
                });

            }
        });

    }


    _this.close = function() {

    };




}

module.exports = new DB();