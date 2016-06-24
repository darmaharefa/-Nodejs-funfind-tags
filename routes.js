var express	= require("express"),
	r 		= express.Router(),
	h		= require("./handler"),
	a 		= require("./auth"),
	router;

router = function(app){
	r.get("/", h.home);
	r.get("/dashboard",a,h.dashboard);
	r.get("/login", h.login);
	r.get("/profile", h.profile);
	r.get("/signin-with-twitter",h.callback);
	app.use(r);
};

module.exports = router;