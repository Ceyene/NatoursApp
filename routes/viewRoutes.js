//dependencies
const express = require('express');
const {
  getOverview,
  getTour,
  getLogInForm
} = require('../controllers/viewsController');
const { isLoggedIn } = require('../controllers/authController');

//creating a router
const router = express.Router();

//Middleware -> checking if user is logged in
router.use(isLoggedIn);

//VIEWS ROUTES
router.get('/', getOverview);
router.get('/tour/:slug', getTour);

//LOGIN ROUTES
router.get('/login', getLogInForm);

module.exports = router;
