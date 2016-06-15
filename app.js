var express		= require("express"),
	middleware	= require("./middleware"),
	app			= express();

app.use(express.static(__dirname + "/public"));

middleware(app);
app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), function(){
	console.log('Listening at ' + app.get('port'));
});
