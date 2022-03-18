const fs = require('fs');

//reading the data we have (top level code) and parsing it from JSON to an array of JS objects
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

//TOURS ROUTE HANDLERS
exports.getAllTours = (req, res) => {
  //send data to the client
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length, //when sending multiple results
    data: {
      tours, //tours: tours
    },
  });
};
exports.getTour = (req, res) => {
  console.log(req.params);
  //convert the id into a number
  const id = req.params.id * 1;
  //check if the id exists in our "database" file
  if (!id || id > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  //search for the tour that matches with the id
  const tour = tours.find((el) => el.id == id);
  //send specified tour to the client
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};
exports.createTour = (req, res) => {
  //console.log(req.body);
  //create a new Id and Tour
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  //push this new Tour to the existent array of tours
  tours.push(newTour);
  //we modify our "database" file
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      //status = 201 ---> Created
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};
exports.updateTour = (req, res) => {
  //convert the id param into a number
  const id = req.params.id * 1;
  //validating the id
  if (!id || id > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<updated tour here>',
    },
  });
};
exports.deleteTour = (req, res) => {
  //convert the id param into a number
  const id = req.params.id * 1;
  //validating the id
  if (!id || id > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  //status = 204 ---> No Content
  res.status(204).json({
    status: 'success',
    data: null, //-> we won't send any data, because the resource no longer exists
  });
};
