var express	= require("express"),
	r 		= express.Router(),
	h		= require("../handler").user,
	pr 		= require("../handler").profile,
	a 		= require("../handler").akun,
	auth 	= require("../auth"),
	router;

router = function(app){
	r.get("/", h.home);
	r.get("/dashboard",auth,h.dashboard);
	r.get("/profile",auth,pr.profile);
	r.get("/account",auth,pr.account);
	r.get("/premium",auth,pr.premium);
	r.get("/login", h.login);
	r.get("/logout", h.logout);
	r.get("/callback",h.callback);
	app.use(r);
};

module.exports = router;