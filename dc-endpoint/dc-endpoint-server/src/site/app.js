var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var url = require('url');
var async=require('async');
var Router = require('node-router');
var dateFormat = require('dateformat');
var CronJob = require('cron').CronJob;

// base route
var router = Router();
var route = router.push;

// environment setting
var PORT = 3000;


var db = require('./module-libs/db');
db.config({
    'driver-type':'loki'
});
//var users = require('./routes/users');



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
    if (minVal > 0 && minVal <= 10) {
        subFileMsg = '1';
    } else if (minVal > 10 && minVal <= 20) {
        subFileMsg = '2';
    } else if (minVal > 20 && minVal <= 30) {
        subFileMsg = '3';
    } else if (minVal > 30 && minVal <= 40) {
        subFileMsg = '4';
    } else if (minVal > 40 && minVal <= 50) {
        subFileMsg = '5';
    } else if (minVal > 50 && minVal <= 59) {
        subFileMsg = '6';
    }

    return prefile+'_'+subFileMsg;
}


/**
 * receive data from client endpoint
 */
route('/pc-pad/collect/v1' , function(req, res, next) {

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


    // --- load current file ---
    for (var bodyCont in body) {
        var bodyRef = JSON.parse(bodyCont);

        for (var i = 0 ; i < bodyRef.length ; i++) {
            var objContent = bodyRef[i];

            var scheprefix = objContent['t'];
            db.setScheme(scheprefix+"_" + curFile);

            objContent['userIp'] = ip;

            var docKey = ip + '_' + objContent['userId'] + '_' +rightNowStr;

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

})

/**
 * create server define
 */
var server = http.createServer(router);

// --- startup server
server.listen(PORT);
console.log("Server runing at port: " + PORT + ".");



// --- start cron job service ---

var job = new CronJob({
    cronTime: '5 * * * * *',
    onTick : function () {
        // --- run event ---
        var schemes = db.getHisSchemes();

        // --- skip function
        if (schemes.length == 0 ) {
            return;
        }
        console.log("-----------");

        // --- save cvs ---
        for (var i = 0 ; i < schemes.length ; i++) {
            var allDoc = db.getAllFromScheme(schemes[i]);
            console.log(allDoc);


            // --- append csv or other destion object ---

        }




    },
    start:false
});
job.start();

/*
var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
*/
