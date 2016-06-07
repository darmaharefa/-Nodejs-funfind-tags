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
  res.render('home.html');
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
        + qs.stringify({screen_name: authenticatedData.screen_name, count: 100});

      //Get jumlah follower user
      var follower = "https://api.twitter.com/1.1/users/show.json" + "?"
        + qs.stringify({screen_name: authenticatedData.screen_name});

      var mentions =  "https://api.twitter.com/1.1/statuses/mentions_timeline.json" + "?"
        + qs.stringify({count : 30});


      var authenticationData = {
        consumer_key    : CONSUMER_KEY,
        consumer_secret : CONSUMER_SECRET,
        token           : authenticatedData.oauth_token,
        token_secret    : authenticatedData.oauth_token_secret
      };

      // Get Last Tweet
      request.get(
        {
          url : lasttwit,
          oauth: authenticationData,
          json:true
        }, 
        function(e, r, body){
          // var tweets = [];
          var usermention_count = 0;
          var hastag_count      = 0;
          var link_count        = 0;

          for(i in body){
            // var tweetObj = body[i];

            // tweets.push({text: tweetObj.text});

            // Cek apakah terdapat user_mentions disetiap tweet dari user
            if(body[i].entities.user_mentions.length > 0)
              usermention_count += 1;

            // Cek apakah terdapat hastag disetiap tweet dari user
            if(body[i].entities.hashtags.length > 0)
              hastag_count += 1;

            // Cek apakah terdapat url disetiap tweet dari user
            if(body[i].entities.urls.length > 0)
              link_count += 1;

          }
            console.log(usermention_count);
            console.log(hastag_count);
            console.log(link_count);

          // userdata.username   = authenticatedData.screen_name;
          // userdata.lasttweets = tweets;
          // console.log(userdata);
        }
      );

      // // Get Detail Follower
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

      // // Get Mentions Info
      // request.get(
      //   {
      //     url   : mentions,
      //     oauth : authenticationData,
      //     json  : true
      //   },
      //   function(e, r, body){
      //     //Mentions Info
      //     var usermention = [];

      //     for(i=0; i<body.length; i++){
      //       if(i===0)
      //         usermention.push(
      //           {
      //             id    : body[i].user.id,
      //             nama  : body[i].user.screen_name,
      //             // img   : body[i].user.profile_image_url,
      //             count : 1
      //           }
      //         );
      //       if(i>0){
      //         var cek = 0;
      //         for(j = 0; j < usermention.length; j++){
      //           if((body[i].user.id  === usermention[j].id) === true){
      //             cek = 1;
      //             pos = j;
      //             break;
      //           } 
      //         }
              
      //         if(cek === 0){
      //           usermention.push(
      //             {
      //               id    : body[i].user.id,
      //               nama  : body[i].user.screen_name,
      //               // img   : body[i].user.profile_image_url,
      //               count : 1
      //             }
      //           );
      //         }
      //         else{
      //           usermention[pos].count += 1;
      //         }
      //       }
      //     }
      //     // console.log(usermention);
      //     userdata.mentions = usermention;
      //     console.log(userdata);
      //     res.render('dashboard.html',{'userdata':userdata});
      //   }
      // )
    }
  );
};

handler = {
	home         : home,
  login        : login,
  callback     : callback
}

module.exports = handler;