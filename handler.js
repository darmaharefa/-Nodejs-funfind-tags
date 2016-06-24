var twitter = require('twit'),
    config  = require('./config'),
    qs      = require('querystring'),
    request = require('request'),
    handler;

//url untuk Request Token dari Twitter
var requestTokenUrl = "https://api.twitter.com/oauth/request_token";

//key dari aplikasi yang didaftarkan di dev.twitter
var CONSUMER_KEY = "5aZ1ISMkEwYyHTSeeae2UJYyb";
var CONSUMER_SECRET = "WdEgjYzYVHRf5WwbZLilvwegL5nADsXnypeWmHm9cxfmj1wKB6";

//object oauth yang digunakan untuk Request token dari Twitter
var oauth = {
  callback        : "http://localhost:3000/signin-with-twitter",
  consumer_key    : CONSUMER_KEY,
  consumer_secret : CONSUMER_SECRET,
}

//variabel untuk menampung oauthToken dan oauthTokenSecreat dari Twitter
var oauthToken = "";
var oauthTokenSecret = "";

home = function(req, res){
    console.log(req.cookies.token);
    res.render('home.html');
}

login = function(req, res){

    var cookie = req.cookies.token;
    console.log(cookie);
    if(cookie === undefined){
      //langkah-1 Mengambil request token
      request.post({url : requestTokenUrl, oauth : oauth}, function (e, r, body){
        if(e){
          res.send("Error, Silahkan coba beberapa saat lagi");
        }
        else {
          //Parsing  Query String yang berisi oauth_token dan oauth_secret.
          var reqData = qs.parse(body);
          console.log(body);
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

profile = function(req, res){
  console.log(req.cookie);
}

dashboard = function(req, res){
  console.log(req.cookies.token);
  res.sendStatus(200);
}

callback  = function(req, res){

  var authReqData     = req.query;
  oauth.token         = authReqData.oauth_token;
  oauth.token_secret  = oauthTokenSecret;
  oauth.verifier      = authReqData.oauth_verifier;

  var accessTokenUrl = "https://api.twitter.com/oauth/access_token";
  console.log(oauth);

  request.post(
    {
      url   : accessTokenUrl , 
      oauth : oauth
    },
    function(e, r, body)
    {
      var authenticatedData = qs.parse(body);
      console.log(authenticatedData);
      console.log(oauth);

      res.cookie(
        'token',authenticatedData.screen_name, {
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        maxAge: 900000,
      });

      oauth.token = "";
      oauth.token_secret = "";
      oauth.verifier = "";

      
      console.log(oauth);

      res.redirect("/dashboard");
    }
  );

  
  // console.log(res.cookies);
  
  
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
		return u.link("http://twitter.com/"+username);
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
  profile      : profile,
  dashboard    : dashboard,
  // analytic     : analytic,
  callback     : callback
}

module.exports = handler;