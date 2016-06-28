var config  		= require('../config'),
    qs      		= require('querystring'),
    request 		= require('request'),
    User    		= require('../model/user'),

home = function(req, res){
	// console.log(req.cookies.token);
	// var cookie = req.cookies.token;
	User.find({}, function (err, docs) {
	    if (!docs.length)
	      res.redirect("/login");

	  	userdata	= {};
	  	user 		= docs;

	  	userdata.user 	= user;

	  	// console.log(userdata);

	  	res.render("admin.html",{"userdata":userdata});
	 
	});
}


login = function(req, res){
	res.render('alogin.html');
};

logout = function(req, res){
	res.clearCookie('username', {path: '/weareadmin'});
	res.redirect("/alogin");
};

result = function(req, res){
	console.log(req.body.username);
	var username = req.body.username;
	var pass = req.body.password;
	if (username==="weareadmin" && pass==="weareadmin"){
		res.cookie('username','weareadmin', {
			domain: 'localhost',
			path: '/weareadmin',
			httpOnly: true,
			maxAge: 900000
		});
		res.redirect("/weareadmin");
	}else{
		res.redirect("/alogin");
	};
};

handler = {
	home: home,
	login: login,
	logout: logout,
	result: result
};

module.exports = handler;

