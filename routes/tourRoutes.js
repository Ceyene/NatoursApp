//dependencies
const express = require('express');
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  checkID,
  checkBody
} = require('./../controllers/tourController');

//TOURS ROUTER
const router = express.Router();

//PARAM MIDDLEWARES
//validating id
//router.param('id', checkID);

//ROUTES
//tours routes
router
  .route('/')
  .get(getAllTours)
  .post(checkBody, createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

module.exports = router;
