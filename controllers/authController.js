//dependencies
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

//creating JWT
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

//sing up handler
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  //creating new JWT for logging in the new user
  const token = signToken(newUser._id);

  //sending the new user to the client
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1) checking email and password exist
  if (!email || !password) {
    return next(new AppError('Please, provide email and password', 400));
  }
  //2) checking if user exists && password valid
  const user = await User.findOne({ email }).select('+password');
  //const correct = await user.correctPassword(password, user.password);

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  //3) sending token to the client
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token
  });
});
