//dependencies
const Tour = require('./../models/tourModel');

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
exports.createTour = async (req, res) => {
  try {
    //const newTour = new Tour({});
    //newTour.save().then().catch();

    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent' //don't use this, send meaningful errors to the client
    });
  }
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
