var express	= require("express"),
	r 		= express.Router(),
	h		= require("../handler").user,
	p 		= require("../handler").profile,
	auth 	= require("../auth"),
	router;

router = function(app){
	r.get("/", h.home);
	r.get("/dashboard",auth,h.dashboard);
	r.get("/profile",auth,p.profile);
	r.get("/login", h.login);
	r.get("/callback",h.callback);
	app.use(r);
};

module.exports = router;