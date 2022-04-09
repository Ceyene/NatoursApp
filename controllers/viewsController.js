//dependencies
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//rendering overview
exports.getOverview = catchAsync(async (req, res, next) => {
  //1) Getting tour data from collection
  const tours = await Tour.find();

  //2) Building template

  //3) Rendering that template using tour data from 1)
  res.status(200).render('overview', {
    title: 'All tours',
    tours //tours: tours
  });
});
//rendering tour
exports.getTour = catchAsync(async (req, res, next) => {
  //1) Getting the data for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });

  //handling errors
  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  //2) Building template
  //3) Rendering template using data from step 1
  res.status(200).render('tour', {
    title: tour.title,
    tour //tour: tour
  });
});
//loggin in user
exports.getLogInForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account'
  });
};
//rendering account page
exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
};
//rendering user's bookings page
exports.getMyTours = catchAsync(async (req, res, next) => {
  //1) Finding all bookings for this user
  const bookings = await Booking.find({ user: req.user.id });
  //2) Finding only tours with the user booking's IDs
  const tourIDs = bookings.map(el => el.tour); //creating an array with tourIDs of this user's bookings
  const tours = await Tour.find({ _id: { $in: tourIDs } }); //finding tours mentioned in the previous array

  //3) Rendering response
  res.status(200).render('overview', {
    title: 'My Tours',
    tours //tours: tours
  });
});
//updating user data from the frontend
exports.updateUserData = catchAsync(async (req, res, next) => {
  //searching user and updating it
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );
  //sending updated user to the client
  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser
  });
});
