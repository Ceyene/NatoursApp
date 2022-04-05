//dependencies
const express = require('express');
const {
  getOverview,
  getTour,
  getLogInForm
} = require('../controllers/viewsController');

//creating a router
const router = express.Router();

//VIEWS ROUTES
router.get('/', getOverview);
router.get('/tour/:slug', getTour);

//LOGIN ROUTES
router.get('/login', getLogInForm);

module.exports = router;
