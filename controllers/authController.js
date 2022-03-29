//dependencies
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

//sing up handler
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  //creating new JWT for logging in the new user
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  //sending the new user to the client
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});

exports.logIn = (req, res, next) => {
  const { email, password } = req.body;

  //1) checking email and password exist
  if (!email || !password) {
    return next(new AppError('Please, provide email and password', 400));
  }
  //2) checking if user exists && password valid
  const user = User.findOne({ email });
  //3) sending token to the client
  const token = '';
  res.status(200).json({
    status: 'success',
    token
  });
};
