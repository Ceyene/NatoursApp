//Integration with Stripe API - creating API endpoint for a Stripe Checkout Session
//dependencies
const express = require('express');
const {
  getCheckoutSession,
  createBooking,
  getBooking,
  updateBooking,
  deleteBooking,
  getAllBookings
} = require('./../controllers/bookingController');
const { protect, restrictTo } = require('./../controllers/authController');

//BOOKINGS ROUTER
const router = express.Router();

//ROUTES
//bookings routes

//protecting all routes
router.use(protect);

router.get('/checkout-session/:tourId', getCheckoutSession);

//restricting the following routes for lead-guides and admin users only
router.use(restrictTo('lead-guide', 'admin'));

router
  .route('/')
  .get(getAllBookings)
  .post(createBooking);

router
  .route('/:id')
  .get(getBooking)
  .patch(updateBooking)
  .delete(deleteBooking);

module.exports = router;
