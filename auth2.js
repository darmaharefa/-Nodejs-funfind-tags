function unauthorized(res){
	return res.redirect("/alogin");
};

function auth(req, res, next){
	user = req.cookies.username || "";
	console.log(user);
	if (user === 'weareadmin'){
		return next();
	};
	return unauthorized(res);
};

module.exports = auth;