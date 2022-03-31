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

//protect all routes related to reviews, so only authenticated users can make crud operations with them
router.use(protect);

//ROUTES
//reviews routes
router
  .route('/') // redirected from tourRoutes.js
  .get(getAllReviews) //GET /tour/234fsds4/reviews --> gets all reviews for a certain tour
  .post(restrictTo('user'), setTourUserIds, createReview); //POST /tour/234fsds4/reviews --> posting a review for a certain tour

router
  .route('/:id')
  .get(getReview)
  .patch(restrictTo('user', 'admin'), updateReview)
  .delete(restrictTo('user', 'admin'), deleteReview);

module.exports = router;
