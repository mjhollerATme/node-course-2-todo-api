const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

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
  // generate token from user id and access method
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

// statics = model method as opposed to instance method
UserSchema.statics.findByToken = function(token) {
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, 'abc123'); // returns decoded data
  } catch(e) {
    return Promise.reject(); // short version to return a rejected promise
  }

  return User.findOne({
    '_id': decoded._id, // user id saved in decoded token
    'tokens.token': token,
    'tokens.access': 'auth'
  })
};

// statics = model method as opposed to instance method
UserSchema.statics.findByCredentials = function(email, password) {
  var User = this;

  return User.findOne({email}).then((user) => {
    if(!user){
      return Promise.reject(`User with email ${email} not found`);
    }
    return new Promise((resolve, reject) => {

      bcrypt.compare(password, user.password, (err, res) => {
        if(res){
          resolve(user);
        }else{
          reject('Password not valid');
        }
      });

    });
  });

};

UserSchema.pre('save', function(next) {

  var user = this;
  if( user.isModified('password') ){

    bcrypt.genSalt(10, (err, salt) => {
      if(err) return console.log("could not generate salt");
      bcrypt.hash(user.password, salt, (err, hash) => {

        if(err) return console.log("could not hash password");
        user.password = hash;
        next();

      });
    });

  }else{
    next();
  }

});

var User = mongoose.model('User', UserSchema);

module.exports = { User };
