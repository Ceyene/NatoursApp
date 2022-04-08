//Integration with Stripe API - creating API endpoint for a Stripe Checkout Session
//dependencies
const express = require('express');
const { getCheckoutSession } = require('./../controllers/bookingController');
const { protect } = require('./../controllers/authController');

//BOOKINGS ROUTER
const router = express.Router();

//ROUTES
//bookings routes
router.get('/checkout-session/:tourId', protect, getCheckoutSession);

module.exports = router;
