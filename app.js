//dependencies
const fs = require('fs');
const express = require('express');

const app = express();

//express.json() --> middleware that will allow us to put body data inside the request (Express by itself doesn't do it)
app.use(express.json());

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
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
});

const port = 3000;
//create a server
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
