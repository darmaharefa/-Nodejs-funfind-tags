var router 			= require('./route'),
	nunjucks 		= require('nunjucks'),
	session 		= require('express-session'),
	cookieParser	= require('cookie-parser'),
	bodyParser 		= require('body-parser'),
	middleware;

middleware = function(app){
	app.use(bodyParser.urlencoded({extended: true}));
	app.use(cookieParser());
	router(app);
	nunjucks.configure('templates',{
		autoescape: true,
		express: app
	});
};

module.exports = middleware;