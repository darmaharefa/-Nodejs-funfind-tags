<<<<<<< HEAD
var express	= require("express"),
	r 		= express.Router(),
	h		= require("./handler"),
	router;

router = function(app){
	r.get("/", h.home);
	r.get("/login", h.login);
	// r.get("/analytic", h.analytic);
	r.get("/signin-with-twitter",h.callback);
	app.use(r);
};

=======

var express	= require("express"),
	r 		= express.Router(),
	h		= require("./handler"),
	router;

router = function(app){
	r.get("/", h.home);
	r.get("/signin-with-twitter",h.callback);
	app.use(r);
};


>>>>>>> 6e5a24b4f0ca3b12ec0a83fed29f557f6771a17d
module.exports = router;