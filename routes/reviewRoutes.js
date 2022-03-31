//dependencies
const express = require('express');
const {
  getAllReviews,
  setTourUserIds,
  getReview,
  createReview,
  updateReview,
  deleteReview
} = require('./../controllers/reviewController');
const { protect, restrictTo } = require('./../controllers/authController');

//REVIEWS ROUTER
const router = express.Router({ mergeParams: true }); //getting access to the params from tourRouter to get tourId

//ROUTES
//reviews routes
router
  .route('/') // redirected from tourRoutes.js
  .get(getAllReviews) //GET /tour/234fsds4/reviews --> gets all reviews for a certain tour
  .post(protect, restrictTo('user'), setTourUserIds, createReview); //POST /tour/234fsds4/reviews --> posting a review for a certain tour

router
  .route('/:id')
  .get(getReview)
  .patch(protect, updateReview)
  .delete(protect, restrictTo('user', 'admin'), deleteReview);

module.exports = router;
