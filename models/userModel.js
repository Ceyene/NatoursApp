//dependencies
const mongoose = require('mongoose');
const validator = require('validator');

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
  password: {
    type: String,
    required: [true, 'Please, create your password'], //data validator
    minlength: 14,
    trim: true //removes all white spaces at the beginning and the end
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please, confirm your password'], //data validator
    trim: true //removes all white spaces at the beginning and the end
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
