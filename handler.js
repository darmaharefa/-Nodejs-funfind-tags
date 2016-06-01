var twitter = require('twit'),
    config  = require('./config'),
    handler, home, bot;

var result    = new Array();
var twit      = new twitter(config);

// user_timeline = function(req, res, next) {
//   // https://dev.twitter.com/rest/reference/get/statuses/user_timeline
//   client.get('statuses/user_timeline', { screen_name: 'siberiian', count: 20 }, function(error, tweets, response) {
//     if (!error) {
//     	// console.log(tweets.name);
//       	res.status(200).render('home.html', { title: 'Express', tweets: tweets });
//     }
//     else {
//       res.status(500).json({ error: error });
//     }
//   });
// };

// function getStream(){
//   client.stream('statuses/filter', {track: 'harefatag1, harefatag2'},  function(stream){
//     stream.on('data', function(data) {
//       // console.log(data.text);
//       if (data.entities && data.entities.hashtags.length > 0 ) {
//         saveHastag(data);
//       }
//     });
//     stream.on('error', function(error) {
//       console.log(error);
//     });
//   });
// }

// function saveHastag(data) {
//     var actualHashtag = data.entities.hashtags[0].text.toLowerCase();
//     result.push(data.text);
//     console.log(result);
// }

salam_kenal = function(req, res){
  var stream = twit.stream('user');

  stream.on('follow', followed);

  function followed(event){
    var name        = event.source.name;
    var screenName  = event.source.screen_name;
    auto_twit('Hallo @'+screenName+' Thanks udah follow ya ' + name + ', Kamu kenal #funfindteam ?');
  }
}

function auto_twit(text){
  //Create Random Number
  var r     = Math.random()*100;
  var param = { 
    status: text || 'Holla this is tweet of ' + r + ' from #RizkiRidhoKarnavalInboxPati  '
  };

  function action(error,tweet,response){
    if (error) {
      console.log("Gagal Ngetwit");
      console.log(error);
    }
    else{
      console.log('Berhasil Ngetwit');
    }
  }

  //Post a status to twitter account
    twit.post('statuses/update',param,action);
    return 0;
}

random_twit  = function(req, res){
  auto_twit();
  // setInterval(auto_twit('Hello aja'), 5000);
  res.sendStatus(200);
}

home = function(req, res){
    //Get Favorite List
    twit.get('search/tweets', {q: '#funfindteam'}, function(error, tweets, response) {
        if(error) {console.log("Something Wrong!");}
        else{
          console.log(tweets);
          res.sendStatus(200);
        }
    });
};

handler = {
	home         : home,
	random_twit  : random_twit,
  salam_kenal  : salam_kenal
}

module.exports = handler;