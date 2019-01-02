const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

// overwrite toJSON for user Obj to only return email and id
UserSchema.methods.toJSON = function() {

  var user = this;
  var userObj= user.toObject();

  return _.pick(userObj, ['email', '_id']);

};

UserSchema.methods.generateAuthToken = function() {

  // method to be called on individual user. Signs a token and returns it
  var user = this;
  var access = 'auth';
  var token = jwt.sign({
    _id: user._id.toHexString(), access
  }, 'abc123').toString();

  // add signed tokens to json object
  user.tokens.push({
    access,
    token
  });

  // save user document into db with auth tokens array and return token to use for promise chaining
  return user.save().then(() => {
    return token; // for promise chaining also just a successful value can be passed instead of a promise
  });

};

var User = mongoose.model('User', UserSchema);

module.exports = { User };
