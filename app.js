//dependencies
const fs = require('fs');
const express = require('express');

const app = express();

//read the data we have (top level code) and parse it from JSON to an array of JS objects
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

//routing configuration
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

const port = 3000;
//create a server
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
