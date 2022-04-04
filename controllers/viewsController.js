//dependencies
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

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
  //2) Building template
  //3) Rendering template using data from step 1
  res.status(200).render('tour', {
    title: tour.title,
    tour //tour: tour
  });
});
