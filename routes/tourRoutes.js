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
  getTourStats
} = require('./../controllers/tourController');

//TOURS ROUTER
const router = express.Router();

//PARAM MIDDLEWARES
//validating id
//router.param('id', checkID);

//ALIAS FOR POPULAR SEARCH
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

//AGGREGATION PIPELINE: Getting tours by groups according price and ratings
router.route('/tour-stats').get(getTourStats);

//ROUTES
//tours routes
router
  .route('/')
  .get(getAllTours)
  .post(createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

module.exports = router;
