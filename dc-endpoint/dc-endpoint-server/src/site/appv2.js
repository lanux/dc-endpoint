const cluster = require('cluster');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const dateFormat = require('dateformat');
const config = require('config');
const async=require('async');

const PORT =+process.env.PORT || 3000;


// --- pre define method ---
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


var db = require('./module-libs/db');
db.config({
    'driver-type':config.get('db.driver-type'),
    'base-dir':config.get('base.dir')
});


// ---- check if muster --
if (cluster.isMaster) {

    cluster.fork();

    cluster.on('disconnect' , (worker) => {
        console.error('disconnect');
        cluster.fork;
    });
}
else {
    // --- the worker ---- run handle
    const domain = require('domain');
    const http = require('http');
    var Router = require('router');
    var finalhandler = require('finalhandler');

    // base route middler ware
    var router = Router();
    router.use( cookieParser() );
    /*only use bodyParser on POST requests*/
    router.use(  bodyParser.urlencoded({extended: false}) );

    // --- define mapping method ---
    router.get('/log/web/collect/v1', function (req, res , next) {
        // with respond with the the params that were passed in
        res.writeHead(200, {
            "content-type":"text/plain; charset=utf-8",
            "Access-Control-Allow-Origin":"*"
        });

        try {

            var ip = getClientIp(req);

            var now = new Date();
            var rightNowStr = dateFormat(now , "yyyy-mm-dd'T'HH:MM:ss.l");

            var curFile = getLogFile(now);
            var schemes = db.getHisSchemes();

            if (!req.query) {
                var result = {
                    success:false,
                    msg:'Could not accept request.'
                }
                res.end(JSON.stringify(result));
                return;
            }

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


    // --- define second handl mapping ---
    router.post('/log/web/collect/v1' , function (req, res , next) {
        res.writeHead(200, {
            "content-type":"text/plain; charset=utf-8",
            "Access-Control-Allow-Origin":"*"
        });

        try {

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

        } catch(error) {
            console.log(err);

            var result = {
                success:false,
                msg:'Server Error.'
            }
            res.end(JSON.stringify(result));
        }

    });







    // --- create server ---

    /**
     * create server define
     */
    var server = http.createServer((req,res) => {

        // --- create domain catch error ----
        var d = domain.create();

        d.on('error' , (er) => {

            console.error('error' , er.stack);

            try {

                // stop taking new requests.
                server.close();

                // Let the master know we're dead.  This will trigger a
                // 'disconnect' in the cluster master, and then it will fork
                // a new worker.
                cluster.worker.disconnect();

                res.statusCode = 500;
                res.setHeader('content-type', 'text/plain');
                res.end('Oops, there was a problem!\n');

            } catch (er2) {
                console.error('Error sending 500!', er2.stack);
            }
        });

        d.add(req);
        d.add(res);

        // --- run handler ---
        d.run(()=> {
            router(req , res , finalhandler(req, res));
        });

    });

// --- startup server
    server.listen(PORT);
    console.log("Server runing at port: " + PORT + ".");


    // --- create scheduler
    var CronJob = require('cron').CronJob;
    var job = new CronJob({
        cronTime: '* */5 * * * *',
        onTick: function() {

            try {
                // --- create file ---
                var now = new Date();
                var curFile = getLogFile(now);
                db.setScheme(curFile);

                // --- update setting ---
            } catch (error) {
                console.err(error);

            }

        },
        start: false
    });
    job.start();

}