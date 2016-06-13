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
  res.render('index.html');
}

login = function(req, res){
  //Langkah-1 Mengambil request token
  request.post({url : requestTokenUrl, oauth : oauth}, function (e, r, body){

    if(e){
      res.send("Error, Silahkan coba beberapa saat lagi");
    }
    else {
      //Parsing  Query String yang berisi oauth_token dan oauth_secret.
      var reqData = qs.parse(body);
      oauthToken = reqData.oauth_token;
      oauthTokenSecret = reqData.oauth_token_secret;

      //Langkah-2 Redirect user ke link yang telah dibuat
      var uri = 'https://api.twitter.com/oauth/authenticate'
      + '?' + qs.stringify({oauth_token: oauthToken})
      res.render('login.html', {url : uri});
      }
    });
}

callback  = function(req, res){
  var authReqData = req.query;
  oauth.token = authReqData.oauth_token;
  oauth.token_secret = oauthTokenSecret;
  oauth.verifier = authReqData.oauth_verifier;

  var accessTokenUrl = "https://api.twitter.com/oauth/access_token";
  //Langkah-3 Convert request token menjadi access token
  //access token akan dipakai untuk berinteraksi dengan API Twitter

  userdata = {};


  request.post(
    {
      url   : accessTokenUrl , 
      oauth : oauth
    },
    function(e, r, body)
    {
      var authenticatedData = qs.parse(body);
      // console.log(authenticatedData);

      //Get 10 Twit terakhir dari user yang melakukan sign in
      var lasttwit = "https://api.twitter.com/1.1/statuses/user_timeline.json" + "?"
        + qs.stringify({screen_name: authenticatedData.screen_name, count: 10});

      //Get jumlah follower user
      var follower = "https://api.twitter.com/1.1/users/show.json" + "?"
        + qs.stringify({screen_name: authenticatedData.screen_name});

      var mentions =  "https://api.twitter.com/1.1/statuses/mentions_timeline.json";


      var authenticationData = {
        consumer_key    : CONSUMER_KEY,
        consumer_secret : CONSUMER_SECRET,
        token           : authenticatedData.oauth_token,
        token_secret    : authenticatedData.oauth_token_secret
      };

      // request.get(
      //   {
      //     url : lasttwit,
      //     oauth: authenticationData,
      //     json:true
      //   }, 
      //   function(e, r, body){
      //     var tweets = [];
      //     for(i in body){
      //       var tweetObj = body[i];

      //       tweets.push({text: tweetObj.text});
      //     }

      //     userdata.username   = authenticatedData.screen_name;
      //     userdata.lasttweets = tweets;
      //     console.log(userdata);
      //     res.render('dashboard.html',{'userdata':userdata})
      //   }
      // );

      // request.get(
      //   {
      //     url   : follower,
      //     oauth : authenticationData,
      //     json  : true
      //   },
      //   function(e, r, body){

      //     //Twitter Info
      //     userdata.name             = body.name;
      //     userdata.description      = body.description;
      //     userdata.location         = body.location;
      //     userdata.tweets_count     = body.statuses_count;

      //     //Followers Info
      //     userdata.follower         = body.followers_count;
      //     userdata.following        = body.friends_count;
      //     userdata.created          = body.created_at;
      //     userdata.listed           = body.listed_count;
      //     userdata.followers_ratio  = userdata.follower / userdata.following;
      //     console.log(userdata);
      //   }
      // );

      request.get(
        {
          url   : mentions,
          oauth : authenticationData,
          json  : true
        },
        function(e, r, body){
          //Mentions Info
          var usermention = [];
          for(i in body){
            usermention.push(
              {
                id    : body[i].user.id, 
                name  : body[i].user.screen_name,
                img   : body[i].user.profile_image_url
              }
            );
          }
          console.log(usermention);
        }
      )
    }
  );
};

handler = {
	home         : home,
  login        : login,
  callback     : callback
}

module.exports = handler;