var mongoose = require('mongoose'),
    config   = require("../config");
var Schema = mongoose.Schema;

mongoose.connect("mongodb://admin:admin123@ds023674.mlab.com:23674/team_db");

var userSchema = new Schema({
  user_id             : { type: String, required: true, unique: true },
  oauth_token         : { type: String, required: true, unique: true },
  oauth_token_secret  : { type: String, required: true, unique: true },
  screen_name         : { type: String, required: true, unique: true },
  x_auth_expires      : String,
  premium             : Boolean,
  created_at          : Date,
  updated_at          : Date
});


userSchema.pre('save', function(next) {
  var currentDate = new Date();
  this.updated_at = currentDate;
  if (!this.created_at)
    this.created_at = currentDate;
  next();
});

var User = mongoose.model('User', userSchema);

module.exports = User;