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
      res.render('pages/login.html', {url : uri});
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

      var userdata          = {};

      var usermention_count = 0;
      var hastag_count      = 0;
      var link_count        = 0;
      var replay_count      = 0;
      var retweet_count     = 0;
      var media_count       = 0;
      var smile_count       = 0;
      var sad_count         = 0;
      var tweets            = [];
      var mention_catch     = [];
      var mention_obj       = [];
      var url_catch         = [];
      var url_obj           = [];
      var source_catch      = [];
      var source_obj        = [];


      // Get Last Tweet
      request.get(
        {
          url   : lasttwit,
          oauth : authenticationData,
          json  : true
        }, 
        function(e, r, body){
          if(e){
            console.log(e);
            res.send(404);
          }
          else{
            for(i in body){
              // Ambil tweet dari user
              var tweetObj = body[i];
              tweets.push({text: tweetObj.text});

              // Cek apakah terdapat user_mentions disetiap tweet dari user
              if(body[i].entities.user_mentions.length > 0)
                usermention_count += 1;

              // Cek apakah terdapat hastag disetiap tweet dari user
              if(body[i].entities.hashtags.length > 0)
                hastag_count += 1;

              // Cek apakah terdapat replay disetiap tweet dari user
              if(body[i].in_reply_to_user_id != undefined)
                replay_count += 1;

              // Cek apakah user pernah melakukan retweet status
              if(body[i].is_quote_status === true)
                retweet_count += 1;

              // Cek apakah terdapat tweet dengan menggunakan media (images/photos)
              if(body[i].entities.hasOwnProperty('media'))
                media_count += 1;

              // Cek apakah terdapat url disetiap tweet dari user
              if(body[i].entities.urls.length > 0) {
                link_count += 1;

                // Simpan setiap url yang ada dalam tweet ke dalam array url_catch
                var urls_tmp    = body[i].entities.urls;
                for(var j = 0; j<body[i].entities.urls.length; j++)
                {
                  // Regex untuk mengambil parent domain/url
                  var regXurl    = /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/\n]+)/;
                  var tmp_exec   = regXurl.exec(urls_tmp[j].expanded_url);

                  if(tmp_exec!= null){
                    url_catch.push({key : tmp_exec[0], text : tmp_exec[1], count : 0});
                  }
                }
              }

              // Cek twitter client yang digunakan user
              if(body[i].source != undefined){
                source_catch.push({key : body[i].source, count : 0});
              }

              // Cek apakah terdapat emoticon smile disetiap tweet dari user
              // smile [ :) | ;) | =) | :-) | ;-) | :=) | ;=) ]
              smileRegX = /([-=:;]+)\)/;
              if(smileRegX.test(body[i].text)) {
                smile_count += 1;
              }

              // Cek apakah terdapat emoticon sad disetiap tweet dari user
              // smile [ :( | ;( | =( | :-( | ;-( | :=( | ;=( ]
              smileRegX = /([-=:;]+)\(/;
              if(smileRegX.test(body[i].text)) {
                sad_count += 1;
                console.log(body[i].text);
              }
            }

            countToArrayObject(url_catch,     url_obj);
            countToArrayObject(source_catch,  source_obj);

            userdata.username   = authenticatedData.screen_name;
            userdata.lasttweets = tweets;
            userdata.sadtweet   = sad_count;
            userdata.smiletweet = smile_count;
            userdata.url_obj    = url_obj;
            userdata.source_obj = source_obj;

            res.render('dashboard.html',{'userdata':userdata});
          }
        }
      );
      // Get Detail Follower
      request.get(
        {
          url   : follower,
          oauth : authenticationData,
          json  : true
        },
        function(e, r, body){

          //Twitter Info
          userdata.name             = body.name;
          userdata.description      = body.description;
          userdata.location         = body.location;
          userdata.tweets_count     = body.statuses_count;

          //Followers Info
          userdata.follower         = body.followers_count;
          userdata.following        = body.friends_count;
          userdata.created          = body.created_at;
          userdata.listed           = body.listed_count;
          userdata.followers_ratio  = userdata.follower / userdata.following;
        }
      );

      // Get Mentions Info
      request.get(
        {
          url   : mentions,
          oauth : authenticationData,
          json  : true
        },
        function(e, r, body){
          //Mentions Info
          for(i in body){
            mention_catch.push(
              {
                key   : body[i].user.id,
                nama  : body[i].user.screen_name,
                img   : body[i].user.profile_image_url,
                count : 0
              }
            );     
          }
          countToArrayObject(mention_catch, mention_obj);
        }
      );
    }
  );
};

// Fungsi menghitung data yang sama dalam array
// source   => array tempat menampung data dari twitter
// storage  => array tempat menampung data hasil perhitungan
function countToArrayObject(source, storage){
  for(i=0; i<source.length; i++){
    if(i===0){
      storage.push(source[i]);
      storage[i].count += 1
    }
    if(i>0){
      var cek = 0;
      for(j = 0; j < storage.length; j++){
        if((source[i].key === storage[j].key) === true){
          cek = 1;
          pos = j;
          break;
        } 
      }
      
      if(cek === 0){
        storage.push(source[i]);
        storage[storage.length -1 ].count += 1;
      }
      else{
        storage[pos].count += 1;
      }
    }
  }
}

handler = {
	home         : home,
  login        : login,
  callback     : callback
}

module.exports = handler;