var express		= require("express"),
	middleware	= require("./middleware"),
	app			= express();

middleware(app);
app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), function(){
	console.log('Listening at ' + app.get('port'));
});
