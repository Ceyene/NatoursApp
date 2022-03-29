//dependencies
const express = require('express');
const { route } = require('express/lib/application');
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan
} = require('./../controllers/tourController');
const { protect, restrictTo } = require('./../controllers/authController');

//TOURS ROUTER
const router = express.Router();

//PARAM MIDDLEWARES
//validating id
//router.param('id', checkID);

//ALIAS FOR POPULAR SEARCH
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

//AGGREGATION PIPELINE: Getting tours by groups according price and ratings
router.route('/tour-stats').get(getTourStats);
//AGGREGATION PIPELINE: Getting tours by months of the year
router.route('/monthly-plan/:year').get(getMonthlyPlan);

//ROUTES
//tours routes
router
  .route('/')
  .get(protect, getAllTours)
  .post(createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
