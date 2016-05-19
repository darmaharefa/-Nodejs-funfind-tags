var express	= require("express"),
	r 		= express.Router(),
	h		= require("./handler"),
	router;

router = function(app){
	r.get("/", h.home);
	r.get("/acak", h.random_twit);
	r.get("/follow", h.salam_kenal);
	app.use(r);
};

module.exports = router;