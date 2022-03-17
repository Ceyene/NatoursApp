//requiring dependencies
const fs = require('fs');
const express = require('express');

const app = express();

//using middlewares --> express.json() --> middleware that will allow us to put body data inside the request (Express by itself doesn't do it)
app.use(express.json());

//reading the data we have (top level code) and parsing it from JSON to an array of JS objects
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

/////routing configuration/////

//searching for all tours
app.get('/api/v1/tours', (req, res) => {
  //send data to the client
  res.status(200).json({
    status: 'success',
    results: tours.length, //when sending multiple results
    data: {
      tours, //tours: tours
    },
  });
});

//searching for a specific tour
app.get('/api/v1/tours/:id', (req, res) => {
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
});

//adding a new tour
app.post('/api/v1/tours', (req, res) => {
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
});

//updating a specific tour
app.patch('/api/v1/tours/:id', (req, res) => {
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
});

//deleting a specific tour
app.delete('/api/v1/tours/:id', (req, res) => {
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
});

//establishing the port
const port = 3000;
//creating server
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
