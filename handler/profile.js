var config  		= require('../config'),
    qs      		= require('querystring'),
    request 		= require('request'),
    User    		= require('../model/user'),
	consumerKey     = config.consumer_key,
    consumerSecret 	= config.consumer_secret,
    handler;

profile = function(req, res){
	console.log(req.cookies.token);
	var cookie = req.cookies.token;

	User.find({user_id : cookie}, function (err, docs) {
	    if (!docs.length)
	      res.redirect("/login");

	    var ut = "https://api.twitter.com/1.1/statuses/user_timeline.json" + "?"
	    + qs.stringify({screen_name: docs[0].screen_name, count: 10});

	    var authenticationData = {
	      consumer_key    : consumerKey,
	      consumer_secret : consumerSecret,
	      token           : docs[0].oauth_token,
	      token_secret    : docs[0].oauth_token_secret
	    };

	    var userdata          = {};
	   
	    request.get(
	      {
	        url   : ut,
	        oauth : authenticationData,
	        json  : true
	      }, 
	      function(e, r, body){
	        if(e){
	          res.send(404);
	        }
	        else{
	          var usertimeline         = [];
	          var profile              = {};

	          //Twitter Info
	          profile.name             = body[0].user.name;
	          profile.screen_name      = body[0].user.screen_name;
	          profile.img              = body[0].user.profile_image_url;
	          profile.description      = body[0].user.description;
	          profile.location         = body[0].user.location;
	          profile.tweets_count     = body[0].user.statuses_count;
	          profile.created          = body[0].user.created_at;
	          profile.statuses_count   = body[0].user.statuses_count;

	          //Followers Info
	          profile.follower         = body[0].user.followers_count;
	          profile.following        = body[0].user.friends_count;
	          profile.listed           = body[0].user.listed_count;
	          profile.followers_ratio  = (profile.follower / profile.following).toFixed(2);

	          for(i in body){
	            var tweetObj = body[i];
	            usertimeline.push(
	            {
	              text            : tweetObj.text.parseURL().parseHashtag().parseUsername(),
	              name            : tweetObj.user.name,
	              screen_name     : tweetObj.user.screen_name,
	              img             : tweetObj.user.profile_image_url,
	              created_at      : tweetObj.created_at.parseDate(),
	              source          : tweetObj.source.parseSource(),
	              retweet_count   : tweetObj.retweet_count,
	              favorite_count  : tweetObj.favorite_count
	            });
	          }
	          userdata.profile      = profile;
	          userdata.usertimeline = usertimeline;
	          res.render('profile.html',{'userdata':userdata});
	      }}
	    );
	});
}

handler = {
	profile     : profile
}

module.exports = handler;
