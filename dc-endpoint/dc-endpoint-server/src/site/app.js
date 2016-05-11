var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var url = require('url');
var async=require('async');
var Router = require('node-router');
var dateFormat = require('dateformat');
var config = require('config');

// --- above up all require module  ---


// base route
var router = Router();
var route = router.push;

// environment setting
var PORT = 3000;


var db = require('./module-libs/db');
db.config({
    'driver-type':config.get('db.driver-type'),
    'base-dir':config.get('base.dir')
});

// ---- add middleware (optional ----
route( cookieParser() );

/*only use bodyParser on POST requests*/
route( 'POST' , bodyParser.urlencoded({extended: false}) );


// call output response
function getClientIp(req) {
  return req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;
};

// --- define log file handle
function getLogFile(dateInput) {
    var prefile = dateFormat(dateInput , "yyyymmddHH");
    var min = dateFormat(dateInput , "MM");
    var minVal = parseInt(min);
    var subFileMsg = '';

    if (minVal >= 0 && minVal <= 5) {
        subFileMsg = '1';
    } else if (minVal > 5 && minVal <= 10) {
        subFileMsg = '2';
    } else if (minVal > 10 && minVal <= 15) {
        subFileMsg = '3';
    } else if (minVal > 15 && minVal <= 20) {
        subFileMsg = '4';
    } else if (minVal > 20 && minVal <= 25) {
        subFileMsg = '5';
    } else if (minVal > 25 && minVal <= 30) {
        subFileMsg = '6';
    } else if (minVal > 30 && minVal <= 35) {
        subFileMsg = '7';
    } else if (minVal > 35 && minVal <= 40) {
        subFileMsg = '8';
    } else if (minVal > 40 && minVal <= 45) {
        subFileMsg = '9';
    } else if (minVal > 45 && minVal <= 50) {
        subFileMsg = 'a';
    } else if (minVal > 50 && minVal <= 55) {
        subFileMsg = 'b';
    } else if (minVal > 55 && minVal <= 59) {
        subFileMsg = 'c';
    }

    return prefile+'_'+subFileMsg;
}


/**
 * receive data from client endpoint
 */
route('POST' , '/log/web/collect/v1' , function(req, res, next) {

    res.writeHead(200, {
        "content-type":"text/plain",
        "Access-Control-Allow-Origin":"*"
    });


    var ip = getClientIp(req);
    var body = req.body;

    var now = new Date();
    var rightNowStr = dateFormat(now , "yyyy-mm-dd'T'HH:MM:ss.l");

    var curFile = getLogFile(now);
    var schemes = db.getHisSchemes();


    if (!ip || !body) {
        // --- break the message  ---
        var result = {
            success:false,
            msg:'Could not accept request.'
        }
        res.end(JSON.stringify(result));
    }

    // --- load current file ---
    for (var bodyCont in body) {
        var bodyRef = JSON.parse(bodyCont);

        for (var i = 0 ; i < bodyRef.length ; i++) {
            var objContent = bodyRef[i];

            var scheprefix = objContent['t'];
            db.setScheme(curFile);

            objContent['userIp'] = ip;

            var docKey = ip + '_' + objContent['cid'] + '_' +rightNowStr;

            // --- put to level db ---
            db.put(docKey, objContent);

        }

    }
    // --- access data rem ---

    // --- response service ---
    var result = {
        success:true,
        msg:'OK'
    }

    res.end(JSON.stringify(result));

    var lastDate = new Date();
    console.log('handle time : ' + (lastDate.getTime() - now.getTime()));
});


/**
 *  get handle data
 */
route('GET' , '/log/web/collect/v1' , function(req, res, next) {

    res.writeHead(200, {
        "content-type":"text/plain",
        "Access-Control-Allow-Origin":"*"
    });

    var ip = getClientIp(req);



    var now = new Date();
    var rightNowStr = dateFormat(now , "yyyy-mm-dd'T'HH:MM:ss.l");

    var curFile = getLogFile(now);
    var schemes = db.getHisSchemes();
    var _inst = req.query['_i'];
    var data = req.query['_td'];

    if (!_inst || !data) {
        // --- break the message  ---
        var result = {
            success:false,
            msg:'Could not accept request.'
        }
        res.end(JSON.stringify(result));
    }

    try {

        var bodyRef = JSON.parse(data);

        for (var i = 0 ; i < bodyRef.length ; i++) {
            var objContent = bodyRef[i];
            var scheprefix = objContent['t'];
            db.setScheme(curFile);

            objContent['ci'] = ip;

            var docKey = ip + '_' + objContent['cid'] + '_' +rightNowStr;

            // --- put to level db ---
            db.put(docKey, objContent);

        }


        // --- submit handle --

        db.commit(function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log('Commit completed!');
            }
        });

        db.close();

        // --- response service ---
        var result = {
            success:true,
            msg:'OK'
        }
        res.end("window."+_inst + ".callbackByScriptTag("+JSON.stringify(result)+");");

    } catch (err) {
        console.log(err);

        var result = {
            success:false,
            msg:'Server Error.'
        }
        res.end(JSON.stringify(result));
    }

});



/**
 * create server define
*/
var server = http.createServer(router);

// --- startup server
server.listen(PORT);
console.log("Server runing at port: " + PORT + ".");

// --- create scheduler
var CronJob = require('cron').CronJob;
var job = new CronJob({
    cronTime: '0 0/5 * * * *',
    onTick: function() {

        // --- create file ---
        var now = new Date();
        var curFile = getLogFile(now);
        db.setScheme(curFile);

        // --- update setting ---

    },
    start: false
});
job.start();


/**
 * monitor main thread
 */
process.on('uncaughtException' , (err) => {
    console.log('Caugth exception: ${err}');
});




process.on('exit' , (code) => {
    setTimeout(()=> {
        console.log();
    }, 0);

    console.log('About to exit with code: ' , code);
});