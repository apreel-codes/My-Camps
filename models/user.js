const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
   email:{
      type: String,
      required: true,
      unique: true
   }
});

UserSchema.plugin(passportLocalMongoose); //this plugin adds on to our email, username field(ensuring that it is unique and not duplicated) and password field

module.exports = mongoose.model('User', UserSchema);