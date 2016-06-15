var router 		= require('./routes'),
	nunjucks 	= require('nunjucks'),
	session 	= require('express-session'),
	middleware;

middleware = function(app){
	router(app);
	nunjucks.configure('templates',{
		autoescape: true,
		express: app
	});
};

module.exports = middleware;