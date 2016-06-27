var config  		= require('../config'),
    qs      		= require('querystring'),
    request 		= require('request'),
    User    		= require('../model/user'),
	consumerKey     = config.consumer_key,
    consumerSecret 	= config.consumer_secret,
    handler;
