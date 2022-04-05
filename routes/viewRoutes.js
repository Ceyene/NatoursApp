//dependencies
const express = require('express');
const {
  getOverview,
  getTour,
  getLogInForm
} = require('../controllers/viewsController');
const { protect } = require('../controllers/authController');

//creating a router
const router = express.Router();

//VIEWS ROUTES
router.get('/', getOverview);
router.get('/tour/:slug', protect, getTour);

//LOGIN ROUTES
router.get('/login', getLogInForm);

module.exports = router;
