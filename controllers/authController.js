//dependencies
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

//sing up handler
exports.signUp = async (req, res, next) => {
  const newUser = await User.create(req.body);
  //send the new user to the client
  res.status(201).json({
    status: 'success',
    data: {
      user: newUser
    }
  });
};
