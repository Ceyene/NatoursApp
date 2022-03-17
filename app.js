//dependencies
const express = require('express');

const app = express();

//routing configuration
//we need a route for each url and each HTTP Method to be used in order to get a result from them
app.get('/', (req, res) => {
  //we send some data

  //res.status(200).send('Hello from the server side!!');
  res
    .status(200)
    .json({ message: 'Hello from the server side', app: 'Natours' });
});

app.post('/', (req, res) => {
  res.send('You can post to this endpoint...');
});

const port = 3000;
//create a server
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
