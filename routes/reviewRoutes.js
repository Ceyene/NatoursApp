//dependencies
const express = require('express');
const {
  getAllReviews,
  createReview
} = require('./../controllers/reviewController');
const { protect, restrictTo } = require('./../controllers/authController');

//REVIEWS ROUTER
const router = express.Router({ mergeParams: true }); //getting access to the params from tourRouter to get tourId

//ROUTES
//reviews routes
router
  .route('/') // redirected from tourRoutes.js
  .get(getAllReviews)
  .post(protect, restrictTo('user'), createReview);

module.exports = router;
