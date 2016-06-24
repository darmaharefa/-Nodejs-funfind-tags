function unauthorized(res){
	return res.redirect("/login");
};

function auth(req, res, next){
	user = req.cookies.token || "";
	console.log(user);
	if (user != ""){
		return next();
	};
	return unauthorized(res);
};

module.exports = auth;