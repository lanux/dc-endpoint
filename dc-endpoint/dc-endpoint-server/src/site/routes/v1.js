var Router = require('node-router');

// base route
var router = Router();
var route = router.push;


route('/hello' , function(req, res, next) {

  res.send('Hello.');

})




module.exports = router;
