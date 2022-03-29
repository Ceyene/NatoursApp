//dependencies
const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

//creating a schema for our db documents
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please, provide your name'], //data validator
    trim: true //removes all white spaces at the beginning and the end
  },
  email: {
    type: String,
    required: [true, 'Please, provide your email'], //data validator
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please, provide a valid email'], //custom data validator
    trim: true //removes all white spaces at the beginning and the end
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please, create your password'], //data validator
    minlength: 14,
    select: false, //don't show it in the response object
    trim: true //removes all white spaces at the beginning and the end
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please, confirm your password'], //data validator -> required as an input, not to be persisted in the db
    trim: true, //removes all white spaces at the beginning and the end
    validate: {
      //this only works on create() and save()
      validator: function(passConf) {
        return passConf === this.password;
      },
      message: 'Passwords are not the same'
    } //custom validator
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date
});

//encrypting passwords -> pre-middleware associated to "save" event
userSchema.pre('save', async function(next) {
  //Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  //encrypting with bcryptjs
  //hash -> async method from bcrypt (there is a sync version, don't use it here)
  this.password = await bcrypt.hash(this.password, 12); //12 is a cost parameter (how CPU intensive the operation will be)

  //remove the value from the confirmPassword field, we won't save it, just used for user's validation at the moment of creating/updating user
  this.passwordConfirm = undefined;

  next();
});

// INSTANCE METHODS //

//Checking if password is valid
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

//Checking if user changed password after JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }

  //if didn't changed the password:
  return false;
};

//Creating a password reset random token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  //saving in the db an encrypted version of it
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  //establishing an expiring date to make it safer
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  //returning the original token
  return resetToken;
};

//creating a model out of the previous schema
const User = mongoose.model('User', userSchema);

module.exports = User;
