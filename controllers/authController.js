//dependencies
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

//sing up handler
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });
  //send the new user to the client
  res.status(201).json({
    status: 'success',
    data: {
      user: newUser
    }
  });
});
