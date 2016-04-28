var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var url = require('url');
var async=require('async');
var Router = require('node-router');
var dateFormat = require('dateformat');

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



    for (var bodyCont in body) {
        var bodyRef = JSON.parse(bodyCont);


        for (var i = 0 ; i < bodyRef.length ; i++) {
            var objContent = bodyRef[i];
            objContent['userIp'] = ip;

            var now = new Date();
            var rightNowStr = dateFormat(now , "yyyy-mm-dd'T'HH:MM:ss.l")



            // --- put to level db ---
            db.put(ip + '_' + objContent['userId'] + '_' +rightNowStr , objContent);



            var result = db.get( ip + '_' + objContent['userId'] +  '_' +rightNowStr );

            console.log(result);

            db.delete(ip + '_' + objContent['userId'] + '_' +rightNowStr);

            var rresult = db.get( ip + '_' + objContent['userId'] + '_' +rightNowStr );

            console.log( rresult );


            /*
            db.put(ip + '_' + bodyRef['userId'] + '-time' , bodyCont  , function (err) {
                if (err) return console.log('Ooops!', err);

                db.get( ip + '_' + bodyRef['userId'] + '-time' , function(err, value)  {

                    console.log('name= ' + value);
                });

            });
            */


        }

    }



    // --- access data rem ---
    /*
    req.on('data', function(chunk) {
        body += chunk;
    });


    req.on('end' , function() {
        console.log('accect body : ' + body);
    });
    */



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
