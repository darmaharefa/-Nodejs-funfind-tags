var twitter = require('twitter'),
    config  = require('./config'),
    handler, txt, home;



var result = new Array();

var client = new twitter(config);

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

function getStream(){
  client.stream('statuses/filter', {track: 'harefatag1, harefatag2'},  function(stream){
    stream.on('data', function(data) {
      // console.log(data.text);
      if (data.entities && data.entities.hashtags.length > 0 ) {
        saveHastag(data);
      }
    });
    stream.on('error', function(error) {
      console.log(error);
    });
  });
}

function saveHastag(data) {
    var actualHashtag = data.entities.hashtags[0].text.toLowerCase();
    result.push(data.text);
    console.log(result);
}

home = function(req, res){
    getStream();
    res.sendStatus(200);
};

handler = {
	home : home,
	// user_timeline : user_timeline
}

module.exports = handler;