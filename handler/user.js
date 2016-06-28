var config  = require('../config'),
    qs      = require('querystring'),
    request = require('request'),
    User    = require('../model/user'),
    handler;

var requestTokenUrl     = "https://api.twitter.com/oauth/request_token",
    consumerKey         = config.consumer_key,
    consumerSecret      = config.consumer_secret,
    oauthToken          = "",
    oauthTokenSecret    = "";

var oauth = {
  callback        : "http://localhost:3000/callback",
  consumer_key    : consumerKey,
  consumer_secret : consumerSecret,
}

home = function(req, res){
  var cookie = req.cookies.token;
  console.log("Cookie di home "+cookie);
  res.render('home.html');
  // res.render('prof.html');
}

login = function(req, res){
    var cookie = req.cookies.token;
    console.log("Cookie di login = "+cookie);
    if(cookie === undefined){
      request.post({url : requestTokenUrl, oauth : oauth}, function (e, r, body){
        if(e){
          res.render('error.html');
        }
        else {
          var reqData = qs.parse(body);
          oauthToken = reqData.oauth_token;
          oauthTokenSecret = reqData.oauth_token_secret;

          var uri = 'https://api.twitter.com/oauth/authenticate'
          + '?' + qs.stringify({oauth_token: oauthToken})
          res.render('login.html', {url : uri});
        }
      });
    }
    else{
      res.redirect("/dashboard");
    }
}

callback  = function(req, res){
  var authData                  = req.query;
  oauth.token                   = authData.oauth_token;
  oauth.token_secret            = authData.oauth_token_secret;
  oauth.verifier                = authData.oauth_verifier;

  var accessTokenUrl            = "https://api.twitter.com/oauth/access_token";
  // console.log(globalAuthData);

  request.post(
    {
      url   : accessTokenUrl ,
      oauth : oauth
    },
    function(e, r, body)
    {
      var authenticatedData = qs.parse(body);

      User.find({user_id : authenticatedData.user_id}, function (err, docs) {
        if (docs.length === 0){
          console.log("User belum ada di database");
          var user = new User({
            user_id             : authenticatedData.user_id,
            oauth_token         : authenticatedData.oauth_token,
            oauth_token_secret  : authenticatedData.oauth_token_secret,
            screen_name         : authenticatedData.screen_name,
            x_auth_expires      : authenticatedData.x_auth_expires,
            premium             : 0
          });

          user.save(function(err) {
            if (err){
              console.log("Gagal disimpan");
            }
            else{
              console.log('User berhasil disimpan!');
            }
          });
        }
        else
        {
          console.log("User di database sudah ada!");
        }

      });

      res.cookie(
        'token',authenticatedData.user_id, {
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        maxAge: 900000,
      });


      oauth.token           = "";
      oauth.token_secret    = "";
      oauth.verifier        = "";

      res.redirect("/dashboard");
    }
  );
  // console.log(res.cookies);
};

dashboard = function(req, res){
  var cookie            = req.cookies.token;
  console.log("Cookie di dashboard "+cookie);

  User.find({user_id : cookie}, function (err, docs) {
    if (docs.length===0){
      console.log("data user tidak ada, length = "+docs.length);
      res.redirect("/login");
    }
    else{
      // Get 10 Twit terakhir dari user yang melakukan sign in
      var ut = "https://api.twitter.com/1.1/statuses/user_timeline.json" + "?"
      + qs.stringify({user_id: cookie, count: 10});

      // Get 10 Twit terakhir dari home / orang yang difollow
      var ht = "https://api.twitter.com/1.1/statuses/home_timeline.json" + "?"
        + qs.stringify({count: 10});


      var authenticationData = {
        consumer_key    : consumerKey,
        consumer_secret : consumerSecret,
        token           : docs[0].oauth_token,
        token_secret    : docs[0].oauth_token_secret
      };

      var userdata          = {};
      var profile           = {};
      var usertimeline      = [];
      var hometimeline      = [];

      // request Home Timeline
      request.get(
        {
          url   : ht,
          oauth : authenticationData,
          json  : true
        },
        function(e, r, body){
          if(e){
            res.send(404);
          }
          else{
            for(i in body){
              // Ambil tweet dari user
              var tweetObj = body[i];
              hometimeline.push(
                {
                  text            : tweetObj.text.parseURL().parseHashtag().parseUsername(),
                  name            : tweetObj.user.name,
                  screen_name     : tweetObj.user.screen_name,
                  img             : tweetObj.user.profile_image_url,
                  created_at      : tweetObj.created_at.parseDate(),
                  source          : tweetObj.source.parseSource(),
                  retweet_count   : tweetObj.retweet_count,
                  favorite_count  : tweetObj.favorite_count
                }
              );
            }
            userdata.hometimeline  = hometimeline;
          }
        }
      );

       // request User Timeline
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
              // Ambil tweet dari user
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

            userdata.profile         = profile;
            userdata.usertimeline    = usertimeline;
            res.render('dash.html',{'userdata':userdata});
          }
        }
      );
    }
  });
}

logout = function(req, res){
  res.clearCookie('token', {path: '/'});
  res.redirect("/dashboard");
};

// Fungsi untuk parsing twitter URLs dari text
// data tweet dari api adalah plain text
// parsing URLs dari plain text dan diubah ke tag html <a href="">
String.prototype.parseURL = function() {
  return this.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function(url) {
    return url.link(url);
  });
};

// Fungsi untuk parsing twitter hastag dari text
// data tweet dari api adalah plain text
// parsing hastag dari plain text dan diubah ke link http://search.twitter.com/search?q="+hastag
String.prototype.parseHashtag = function() {
  return this.replace(/[#]+[A-Za-z0-9-_]+/g, function(t) {
    var tag = t.replace("#","%23")
    return t.link("https://twitter.com/search?q="+tag);
  });
};

// Fungsi untuk parsing twitter @mention dari text
// data tweet dari api adalah plain text
// parsing @mention dari plain text dan diubah ke link http://twitter.com/"+username
String.prototype.parseUsername = function() {
  return this.replace(/[@]+[A-Za-z0-9-_]+/g, function(u) {
    var username = u.replace("@","")
    return u.link("https://twitter.com/"+username);
  });
};

// Fungsi untuk parsing twitter created_at menjadi format date umum
// contoh data tweet dari api = "Fri Jun 10 15:02:50 +0000 2016"
// parsing created_at dan diubah menjadi "15:02:50 - 10 Jun 2016"
String.prototype.parseDate = function(){
  tmp = this.split(" ");
  return tmp[3]+" - "+tmp[2]+" "+tmp[1]+" "+tmp[5];
}

// Fungsi untuk parsing source textcontent dari anchor (a href tag)
// contoh data tweet dari api = "<a href="http://www.google.com/" rel="nofollow">Google</a>"
// parsing source dan hasil menjadi "Google"
String.prototype.parseSource = function(){
  return /<a [^>]+>([^<]+)<\/a>/.exec(this)[1];
}

handler = {
  home         : home,
  login        : login,
  dashboard    : dashboard,
  callback     : callback,
  logout       : logout
}

module.exports = handler;
