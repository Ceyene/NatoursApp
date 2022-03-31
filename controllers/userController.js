//dependencies
const AppError = require('../utils/appError');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const { deleteOne, updateOne, getOne, getAll } = require('./handlerFactory');

//filtering data object
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  //first, returning an array with the key names of the object
  //then, iterating through it
  Object.keys(obj).forEach(el => {
    //if the key is included in the array, add it to the new object (with name and value)
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

//USERS ROUTE HANDLERS
exports.updateMe = catchAsync(async (req, res, next) => {
  //updating currently authenticated user
  //1) Creating error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please, use /updateMyPassword',
        400
      )
    );
  }
  //2) Filtering out unwanted field names that aren't allowed to be updated
  //only update certain information, not everything inside the req.body -> if user tries to modify the role to admin, it shouldn't be able to do it
  const filteredBody = filterObj(req.body, 'name', 'email'); //filtering data to be updated

  //3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });
  //can't use save() in this case, because it will validate that all the required fields are present in the req.body
  //and passwords can't be updated by this controller, so it will always fail
  //instead use fincByIdAndUpdate()

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  //deleting currently authenticated user

  //finding user by id and adding property of active with false value
  await User.findByIdAndUpdate(req.user.id, { active: false });

  //sending response to client
  res.status(204).json({
    status: 'success',
    data: null
  });
});
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please, use /signup instead.'
  });
};
exports.getAllUsers = getAll(User);
exports.getUser = getOne(User);
exports.updateUser = updateOne(User); //admin use only
exports.deleteUser = deleteOne(User); //admin use only
