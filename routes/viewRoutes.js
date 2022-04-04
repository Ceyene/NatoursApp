//dependencies
const express = require('express');
const { getOverview, getTour } = require('../controllers/viewsController');

//creating a router
const router = express.Router();

//VIEWS ROUTES
router.get('/', getOverview);
router.get('/tour/:slug', getTour);

module.exports = router;
