//dependencies
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

//USERS ROUTE HANDLERS
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find(); //awaiting the final query for tours and putting it inside the tours variable

  //SENDING RESPONSE
  res.status(200).json({
    status: 'success',
    results: users.length, //when sending multiple results
    data: {
      users //users: users
    }
  });
});
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined'
  });
};
exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined'
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined'
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined'
  });
};
