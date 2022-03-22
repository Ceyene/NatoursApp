//dependencies
const express = require('express');
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours
} = require('./../controllers/tourController');

//TOURS ROUTER
const router = express.Router();

//PARAM MIDDLEWARES
//validating id
//router.param('id', checkID);

//ALIAS FOR POPULAR SEARCH
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

//ROUTES
//tours routes
router
  .route('/')
  .get(getAllTours)
  .post(createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

module.exports = router;
