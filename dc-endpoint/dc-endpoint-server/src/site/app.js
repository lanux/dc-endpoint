var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var url = require('url');
var Router = require('node-router');

// base route
var router = Router();
var route = router.push;
//var routes = require('./routes/v1');
//var users = require('./routes/users');


// ---- add middleware (optional ----
route( cookieParser() );

/*only use bodyParser on POST requests*/
route( 'POST' , bodyParser.urlencoded({extended: false}) );


// call output response



/**
 * receive data from client endpoint
 */
route('/pc-pad/collect' , function(req, res, next) {


  res.send('Hello.');

})

/**
 * create server define
 */
var server = http.createServer(router);

// --- startup server
server.listen(3000);


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
