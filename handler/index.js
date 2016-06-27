var admin 	= require('./admin'),
	user 	= require('./user'),
	profile	= require('./profile'),
	handler;

handler = {
	admin	: admin,
	user	: user,
	profile : profile
};

module.exports = handler;