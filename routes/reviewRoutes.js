//dependencies
const express = require('express');
const {
  getAllReviews,
  createReview
} = require('./../controllers/reviewController');
const { protect, restrictTo } = require('./../controllers/authController');

//REVIEWS ROUTER
const router = express.Router();

//ROUTES
//reviews routes
router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'), createReview);

module.exports = router;
