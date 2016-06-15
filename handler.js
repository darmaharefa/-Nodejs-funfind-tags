var twitter = require('twit'),
    config  = require('./config'),
    qs      = require('querystring'),
    request = require('request'),
    handler;

//URL untuk Request Token dari Twitter
var requestTokenUrl = "https://api.twitter.com/oauth/request_token";

//Key dari aplikasi yang didaftarkan di dev.twitter
var CONSUMER_KEY = "5aZ1ISMkEwYyHTSeeae2UJYyb";
var CONSUMER_SECRET = "WdEgjYzYVHRf5WwbZLilvwegL5nADsXnypeWmHm9cxfmj1wKB6";

//object oauth yang digunakan untuk Request token dari Twitter
var oauth = {
  callback : "http://localhost:3000/signin-with-twitter",
  consumer_key  : CONSUMER_KEY,
  consumer_secret : CONSUMER_SECRET
}

//variabel untuk menampung oauthToken dan oauthTokenSecreat dari Twitter
var oauthToken = "";
var oauthTokenSecret = "";


home = function(req, res){
  //Langkah-1 Mengambil request token
  request.post({url : requestTokenUrl, oauth : oauth}, function (e, r, body){

    if(e){
      res.send("error");
    }
    else {
      //Parsing the Query String containing the oauth_token and oauth_secret.
      console.log(body);
      var reqData = qs.parse(body);
      oauthToken = reqData.oauth_token;
      oauthTokenSecret = reqData.oauth_token_secret;

      //Step-2 Redirecting the user by creating a link
      //and allowing the user to click the link
      var uri = 'https://api.twitter.com/oauth/authenticate'
      + '?' + qs.stringify({oauth_token: oauthToken})
      res.render('index.html', {url : uri});
      }
    });
}

callback  = function(req, res){
  var authReqData = req.query;
  oauth.token = authReqData.oauth_token;
  oauth.token_secret = oauthTokenSecret;
  oauth.verifier = authReqData.oauth_verifier;

  var accessTokenUrl = "https://api.twitter.com/oauth/access_token";
  //Step-3 Converting the request token to an access token
  request.post({url : accessTokenUrl , oauth : oauth}, function(e, r, body){
    var authenticatedData = qs.parse(body);
    console.log(authenticatedData);

  //Make a request to get User's 10 latest tweets
  var apiUrl = "https://api.twitter.com/1.1/statuses/user_timeline.json" + "?"
    + qs.stringify({screen_name: authenticatedData.screen_name, count: 10});

  var authenticationData = {
    consumer_key : CONSUMER_KEY,
    consumer_secret : CONSUMER_SECRET,
    token: authenticatedData.oauth_token,
    token_secret : authenticatedData.oauth_token_secret
  };

  request.get({url : apiUrl, oauth: authenticationData, json:true}, function(e, r, body){

    var tweets = [];
    for(i in body){
      var tweetObj = body[i];
      tweets.push({text: tweetObj.text});
    }
    
    var viewData = {
      username: authenticatedData.screen_name,
      tweets: tweets
    };

    // console.log(viewData);

    res.render("dashboard.html", {'viewData':viewData});

  });

  });
}

handler = {
	home         : home,
  callback     : callback
}

module.exports = handler;