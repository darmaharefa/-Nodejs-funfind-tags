<<<<<<< HEAD
var express		= require("express"),
	middleware	= require("./middleware"),
	app			= express();

app.use(express.static(__dirname + "/public"));

middleware(app);
app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), function(){
	console.log('Listening at ' + app.get('port'));
});
=======

var express		= require("express"),
	middleware	= require("./middleware"),
	app			= express();

app.use(express.static(__dirname + "/templates"));

middleware(app);
app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), function(){
	console.log('Listening at ' + app.get('port'));
});
>>>>>>> 6e5a24b4f0ca3b12ec0a83fed29f557f6771a17d
