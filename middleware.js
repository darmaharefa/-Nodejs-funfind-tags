var router 			= require('./routes'),
	nunjucks 		= require('nunjucks'),
	session 		= require('express-session'),
	cookieParser	= require('cookie-parser'),
	middleware;

middleware = function(app){
	app.use(cookieParser());
	router(app);
	nunjucks.configure('templates',{
		autoescape: true,
		express: app
	});
};

module.exports = middleware;