//dependencies
const Tour = require('./../models/tourModel');

//checking if body contains the name and price property
exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price'
    });
  }
  next();
};

//TOURS ROUTE HANDLERS
exports.getAllTours = (req, res) => {
  //send data to the client
  res.status(200).json({
    status: 'success'
    // requestedAt: req.requestTime,
    // results: tours.length, //when sending multiple results
    // data: {
    //   tours //tours: tours
    // }
  });
};
exports.getTour = (req, res) => {
  const id = req.params.id * 1;
  //search for the tour that matches with the id
  // const tour = tours.find(el => el.id == id);
  // //send specified tour to the client
  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     tour
  //   }
  // });
};
exports.createTour = (req, res) => {
  //console.log(req.body);
  //create a new Id and Tour
  res.status(201).json({
    status: 'success'
    // data: {
    //   tour: newTour
    // }
  });
};
exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<updated tour here>'
    }
  });
};
exports.deleteTour = (req, res) => {
  //status = 204 ---> No Content
  res.status(204).json({
    status: 'success',
    data: null //-> we won't send any data, because the resource no longer exists
  });
};
