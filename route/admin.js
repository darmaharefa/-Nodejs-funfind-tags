var express	= require("express"),
	r 		= express.Router(),
	h		= require("../handler").admin,
	a 		= require("../auth2"),
	router;

router = function(app){
	r.get("/weareadmin",a,h.home);
	r.get('/alogin', h.login);
	r.get('/alogout', h.logout);
	r.post('/result', h.result);
	app.use(r);
};

module.exports = router;