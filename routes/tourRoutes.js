//dependencies
const express = require('express');
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
  uploadTourImages,
  resizeTourImages
} = require('./../controllers/tourController');
const { protect, restrictTo } = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

//TOURS ROUTER
const router = express.Router();

//PARAM MIDDLEWARES
//validating id
//router.param('id', checkID);

//NESTED ROUTES - redirects to reviewRoutes.js
router.use('/:tourId/reviews', reviewRouter);

//ALIAS FOR POPULAR SEARCH
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

//AGGREGATION PIPELINE: Getting tours by groups according price and ratings
router.route('/tour-stats').get(getTourStats);
//AGGREGATION PIPELINE: Getting tours by months of the year
router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

//GEOSPATIAL QUERIES: Searching tours within a certain distance of a specified point and a specified unit
//with parameters would be: /tours-within?distance=25&center=-40,45,unit=km
//in this way it will be: /tours-within/25/center/-40,45/unit/km
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);

//GEOSPATIAL AGGREGATION: Calculating distances to all tours from a certain point
router.route('/distances/:latlng/unit/:unit').get(getDistances);

//ROUTES
//tours routes
router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(
    protect,
    restrictTo('admin', 'lead-guide'),
    uploadTourImages,
    resizeTourImages,
    updateTour
  )
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
