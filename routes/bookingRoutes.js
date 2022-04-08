//Integration with Stripe API - creating API endpoint for a Stripe Checkout Session
//dependencies
const express = require('express');
const { getCheckoutSession } = require('./../controllers/bookingController');
const { protect, restrictTo } = require('./../controllers/authController');

//BOOKINGS ROUTER
const router = express.Router();

//ROUTES
//bookings routes
router.get('/checkout-session/:tourID', protect, getCheckoutSession);

module.exports = router;
