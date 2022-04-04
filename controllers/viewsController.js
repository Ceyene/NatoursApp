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
exports.getTour = (req, res) => {
  res.status(200).render('tour', {
    title: 'The Forest Hiker Tour'
  });
};
