var twitter = require('twitter'),
	handler, txt,
	home;


var client = new twitter({
  consumer_key: 'RgKVGIpeM38nvAljHmOIcZgu2',
		consumer_secret: 'cX1oxhS9veOpwPnnECdba62FsOy0LGsNHl7OEtTJz4GYCx8SNX',
		access_token_key: '1688905356-8RHE2C6YJSvKplnNyykbMHgcXzaKcqqSll1QLkt',
		access_token_secret:'w9LQCQuAEWQn81KwAOhDqeUyn3I4EmhSrSkf2k2UulpZy'
});

txt = "Hello World";

user_timeline = function(req, res, next) {
  // https://dev.twitter.com/rest/reference/get/statuses/user_timeline
  client.get('statuses/user_timeline', { screen_name: 'siberiian', count: 20 }, function(error, tweets, response) {
    if (!error) {
    	// console.log(tweets.name);
      	res.status(200).render('home.html', { title: 'Express', tweets: tweets });
    }
    else {
      res.status(500).json({ error: error });
    }
  });
};

home = function(req, res){
	res.render("home.html",{'data':txt});
};

handler = {
	home : home,
	user_timeline : user_timeline
}

module.exports = handler;