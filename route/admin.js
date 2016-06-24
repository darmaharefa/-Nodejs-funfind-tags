var express	= require("express"),
	r 		= express.Router(),
	h		= require("../handler").admin,
	a 		= require("../auth"),
	router;

router = function(app){
	app.use(r);
};

module.exports = router;