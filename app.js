//requiring dependencies
const fs = require('fs');
const express = require('express');
const morgan = require('morgan'); //popular logging middleware

const app = express();

//MIDDLEWARES

//3RD PARTY MIDDLEWARES
//logging
app.use(morgan('dev'));
//allow us to put body data inside the request (Express by itself doesn't do it)
app.use(express.json());
//MY MIDDLEWARES
//saying hello
app.use((req, res, next) => {
  console.log('Hello from the middleware!!');
  next();
});
//adding the request time to all requests
app.use((req, res, next) => {
  //defining a property in the request called requestTime
  req.requestTime = new Date().toISOString();
  next();
});

//reading the data we have (top level code) and parsing it from JSON to an array of JS objects
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

/////routing configuration/////

//ROUTE HANDLERS
const getAllTours = (req, res) => {
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
const getTour = (req, res) => {
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
const createTour = (req, res) => {
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
const updateTour = (req, res) => {
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
const deleteTour = (req, res) => {
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
const getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};
const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};
const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};
const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};
const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

//ROUTES
//tours routes
app.route('/api/v1/tours').get(getAllTours).post(createTour);
app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);
//users routes
app.route('/api/v1/users').get(getAllUsers).post(createUser);
app
  .route('/api/v1/users/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

//establishing the port
const port = 3000;

//CREATING SERVER
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
