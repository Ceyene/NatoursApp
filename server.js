//dependencies
const mongoose = require('mongoose');
const dotenv = require('dotenv');
//reading the env variables from our config.env file and saving them into Node environment variables
dotenv.config({ path: './config.env' });

//first, creating the complete mongodb connection string, with the password for the database
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
//connecting to MongoDB database
mongoose.connect(DB).then(() => console.log('DB Connection successful'));

const app = require('./app');

//creating a schema for our db documents
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true
  },
  rating: {
    type: Number,
    default: 4.5
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price']
  }
});
//creating a model out of the previous schema
const Tour = mongoose.model('Tour', tourSchema);
//creating a test document from the created Model
const testTour = new Tour({
  name: 'Carlos Paz Trip',
  rating: 4.9,
  price: 207
});
//interacting with the database with our new document
testTour
  .save()
  .then(doc => console.log(doc))
  .catch(err => console.log('Error: ', err));
//establishing the port
const port = process.env.PORT || 3000;

//CREATING SERVER
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
