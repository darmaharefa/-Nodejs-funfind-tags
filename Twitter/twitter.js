var twit = require('twitter'),
	twitter = new twit({
		consumer_key: 'RgKVGIpeM38nvAljHmOIcZgu2',
		consumer_secret: 'cX1oxhS9veOpwPnnECdba62FsOy0LGsNHl7OEtTJz4GYCx8SNX',
		access_token_key: '1688905356-8RHE2C6YJSvKplnNyykbMHgcXzaKcqqSll1QLkt',
		access_token_secret:'w9LQCQuAEWQn81KwAOhDqeUyn3I4EmhSrSkf2k2UulpZy'
	});

var count = 0,
	tweets = [];

twitter.get('search/tweets', {q: '#supermanzzz'}, function(error, tweets, response){
  if(error) throw error;
  console.log(tweets);  // The favorites. 
  console.log(response);  // Raw response object. 
});