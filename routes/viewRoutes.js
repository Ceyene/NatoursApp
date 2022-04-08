//dependencies
const express = require('express');
const {
  getOverview,
  getTour,
  getLogInForm,
  getAccount,
  updateUserData
} = require('../controllers/viewsController');
const { isLoggedIn, protect } = require('../controllers/authController');
const { createBookingCheckout } = require('../controllers/bookingController');

//creating a router
const router = express.Router();

//VIEWS ROUTES
router.get('/', createBookingCheckout, isLoggedIn, getOverview);
router.get('/tour/:slug', isLoggedIn, getTour);

//LOGIN ROUTE
router.get('/login', isLoggedIn, getLogInForm);

//USER ACCOUNT ROUTE
router.get('/me', protect, getAccount);

//UPDATE USER DATA ROUTE WITHOUT API
router.post('/submit-user-data', protect, updateUserData);

module.exports = router;
