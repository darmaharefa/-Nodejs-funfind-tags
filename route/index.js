var admin = require('./admin'),
	user = require('./user');

var router = function(app){
	admin(app);
	user(app);
};

module.exports = router;