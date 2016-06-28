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

	    var userdata        = {};

		var url_catch       = [];
		var url_obj        	= [];
		var url_final		= [];

		var hashtag_catch	= [];
		var hashtag_obj 	= [];
		var hashtag_final	= [];

		var mention_catch	= [];
		var mention_obj 	= [];
		var mention_final	= [];

	   
	    request.get(
	      {
	        url   : ut,
	        oauth : authenticationData,
	        json  : true
	      }, 
	      function(e, r, body){
	        if(e){
	        	res.sendStatus(404);
	        }
	        else{
	          	var profile              = {};
	          	var analisis			 = 
	          	{
	          		usermention_count	 : 0,
	          		hashtag_count		 : 0,
	          		replay_count		 : 0,
	          		retweet_count		 : 0,
	          		media_count			 : 0,
	          		link_count			 : 0
	          	};
	          	var monthTweet			 = [0,0,0,0,0,0,0,0,0,0,0,0];
	          	var dayTweet			 = [0,0,0,0,0,0,0];

	          	//Twitter Info
	          	profile.name             = body[0].user.name;
	          	profile.screen_name      = body[0].user.screen_name;
	          	profile.img              = body[0].user.profile_image_url;
	          	profile.background_img   = body[0].user.profile_background_image_url;
	          	profile.description      = body[0].user.description;
	          	profile.location         = body[0].user.location;
	          	profile.tweets_count     = body[0].user.statuses_count;
	          	profile.created          = body[0].user.created_at.parseCreated();
	          	profile.statuses_count   = body[0].user.statuses_count;

	          	//Followers Info
	          	profile.follower         = body[0].user.followers_count;
	          	profile.following        = body[0].user.friends_count;
	         	profile.listed           = body[0].user.listed_count;
	          	profile.followers_ratio  = (profile.follower / profile.following).toFixed(2);


	          	for(i in body){
	            	var tweetObj = body[i];

                	// Cek apakah terdapat replay disetiap tweet dari user
              		if(tweetObj.in_reply_to_user_id != undefined)
                		analisis.replay_count += 1;

                	// Cek apakah user pernah melakukan retweet status
	              	if(tweetObj.is_quote_status === true)
	                	analisis.retweet_count += 1;


		            // Cek apakah terdapat tweet dengan menggunakan media (images/photos)
		            if(body[i].entities.hasOwnProperty('media'))
		            	analisis.media_count += 1;


					// Cek apakah terdapat url disetiap tweet dari user
	              	if(body[i].entities.urls.length > 0) {
	                	analisis.link_count += 1;

	                	// Simpan setiap url yang ada dalam tweet ke dalam array url_catch
	                	var urls_tmp    = body[i].entities.urls;
	                	for(var j = 0; j<body[i].entities.urls.length; j++)
	                	{
	                 		 // Regex untuk mengambil parent domain/url
	                  		var regXurl    = /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/\n]+)/;
	                  		var tmp_exec   = regXurl.exec(urls_tmp[j].expanded_url);

	                  		if(tmp_exec!= null){
	                   			url_catch.push(
	                   				{
	                   					value 		: 1,
	                   					color		: getRandomColor(),
									    highlight	: this.color,
	                   					label 		: tmp_exec[1],
	                   					key 		: tmp_exec[0],
	                   				}
	                   			);
	                  		}
	                	}
	                }

	                // Cek apakah terdapat hashtag disetiap tweet dari user
              		if(tweetObj.entities.hashtags.length > 0){
                		analisis.hashtag_count += 1;

                		// Simpan setiap url yang ada dalam tweet ke dalam array url_catch
	                	var hashtag_tmp    = body[i].entities.hashtags;
	                	for(var j = 0; j<hashtag_tmp.length; j++)
	                	{
                   			hashtag_catch.push(
                   				{
                   					value 		: 1,
                   					color		: getRandomColor(),
								    highlight	: this.color,
                   					label 		: "#"+hashtag_tmp[j].text,
                   					key 		: hashtag_tmp[j].text,
                   				}
                   			);
	                	}
                		
              		}

              		 // Cek apakah terdapat hashtag disetiap tweet dari user
              		if(tweetObj.entities.user_mentions.length > 0){
                		analisis.usermention_count += 1;

                		// Simpan setiap url yang ada dalam tweet ke dalam array url_catch
	                	var usermention_tmp    = body[i].entities.user_mentions;
	                	for(var j = 0; j<usermention_tmp.length; j++)
	                	{
                   			mention_catch.push(
                   				{
                   					value 		: 1,
                   					color		: getRandomColor(),
								    highlight	: this.color,
                   					label 		: usermention_tmp[j].screen_name,
                   					key 		: usermention_tmp[j].name
                   				}
                   			);
	                	}
                		
              		}

            		// Hitung jumlah tweet tiap bulan
            		if(tweetObj.created_at !== null) {
	            		bulan = tweetObj.created_at.split(" ")[1];
	            		if(bulan==="Jan")
							monthTweet[0]+=1;
						else if(bulan==="Feb")
							monthTweet[1]+=1;
						else if(bulan==="Mar")
							monthTweet[2]+=1;
						else if(bulan==="Apr")
							monthTweet[3]+=1;
						else if(bulan==="May")
							monthTweet[4]+=1;
						else if(bulan==="Jun")
							monthTweet[5]+=1;
						else if(bulan==="Jul")
							monthTweet[6]+=1;
						else if(bulan==="Aug")
							monthTweet[7]+=1;
						else if(bulan==="Sep")
							monthTweet[8]+=1;
						else if(bulan==="Oct")
							monthTweet[9]+=1;
						else if(bulan==="Nov")
							monthTweet[10]+=1;
						else if(bulan==="Des")
							monthTweet[11]+=1;
            		}

            		// Hitung jumlah tweet tiap hari
            		if(tweetObj.created_at !== null) {
	            		hari = tweetObj.created_at.split(" ")[0];
	            		if(bulan==="Mon")
							dayTweet[0]+=1;
						else if(hari==="Tue")
							dayTweet[1]+=1;
						else if(hari==="Wed")
							dayTweet[2]+=1;
						else if(hari==="Thu")
							dayTweet[3]+=1;
						else if(hari==="Fri")
							dayTweet[4]+=1;
						else if(hari==="Sat")
							dayTweet[5]+=1;
						else if(hari==="Sun")
							dayTweet[6]+=1;
            		}

                }

                countToArrayObject(url_catch,url_obj);
                countToArrayObject(hashtag_catch,hashtag_obj);
                countToArrayObject(mention_catch,mention_obj);

                toStringfy(url_obj, url_final);
                toStringfy(hashtag_obj, hashtag_final);
                toStringfy(mention_obj, mention_final);

                // console.log(url_catch);
                // console.log(url_obj);
                userdata.dayTweet 		= dayTweet;
                userdata.monthTweet 	= monthTweet;
	          	userdata.analisis   	= analisis;
	          	userdata.profile 		= profile;

	          	userdata.url_obj		= url_obj;
	          	userdata.url_final		= url_final;

	          	userdata.hashtag_obj 	= hashtag_obj;
	          	userdata.hashtag_final	= hashtag_final;

	          	userdata.mention_obj 	= mention_obj;
	          	userdata.mention_final	= mention_final;


	          	console.log(userdata);

	          	res.render('prof.html',{'userdata':userdata});
	      	}
	    });
	});
}

account = function(req, res){
	console.log(req.cookies.token);
	var cookie = req.cookies.token;

	User.find({user_id : cookie}, function (err, docs) {
	    if (!docs.length)
	      res.redirect("/login");

	  	console.log(docs[0].created_at.toString());
	  	userdata 				= {};
	  	userdata.name  			= docs[0].screen_name;

	  	var temp 				= docs[0].created_at.toString();
	  	temp 					= temp.split(" ");
	  	userdata.created_at 	= temp[2]+" "+temp[1]+" "+temp[3];

	  	userdata.premium		= false;
	  	if(docs[0].premium)
	  		userdata.premium	= true;

	  	console.log(userdata);

	  	res.render("account.html",{"userdata":userdata});
	 
	});
}

premium = function(req, res){
	console.log(req.cookies.token);
	var cookie = req.cookies.token;

	User.find({user_id : cookie}, function (err, docs) {
	    if (!docs.length)
	      res.redirect("/login");

	  	userdata 				= {};

	  	userdata.premium		= false;
	  	if(docs[0].premium)
	  		userdata.premium	= true;

	  	res.render("premium.html",{"userdata":userdata});
	});

	 
}



// Fungsi menghitung data yang sama dalam array
// source   => array tempat menampung data dari twitter
// storage  => array tempat menampung data hasil perhitungan
function countToArrayObject(source, storage){
  for(i=0; i<source.length; i++){
    if(i===0){
      source[i].value += 1;
      storage.push(source[i]);
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
        storage[storage.length -1 ].value += 1;
        storage.push(source[i]);
      }
      else{
        storage[pos].value += 1;
      }
    }
  }
}

function toStringfy(source, storage){
	for(var i = 0; i<source.length;i++){
		storage.push(JSON.stringify(source[i]));
	}
}

String.prototype.parseCreated = function(){
  tmp = this.split(" ");
  return tmp[2]+" "+tmp[1]+" "+tmp[5];
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


handler = {
	profile     : profile,
	account		: account,
	premium 	: premium
}

module.exports = handler;