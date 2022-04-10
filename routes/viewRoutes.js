//dependencies
const express = require('express');
const {
  getOverview,
  getTour,
  getMyTours,
  getSignUpForm,
  getLogInForm,
  getAccount,
  updateUserData
} = require('../controllers/viewsController');
const { isLoggedIn, protect } = require('../controllers/authController');

//creating a router
const router = express.Router();

//VIEWS ROUTES
router.get('/', isLoggedIn, getOverview);
router.get('/tour/:slug', isLoggedIn, getTour);

//SIGN UP ROUTE
router.get('/signup', getSignUpForm);

//LOGIN ROUTE
router.get('/login', isLoggedIn, getLogInForm);

//USER ACCOUNT ROUTE
router.get('/me', protect, getAccount);

//MY BOOKINGS ROUTE
router.get('/my-tours', protect, getMyTours);

//UPDATE USER DATA ROUTE WITHOUT API
router.post('/submit-user-data', protect, updateUserData);

module.exports = router;
