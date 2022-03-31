//dependencies
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');

//reading the env variables from our config.env file and saving them into Node environment variables
dotenv.config({ path: './config.env' });

//first, creating the complete mongodb connection string, with the password for the database
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
//connecting to MongoDB database
mongoose.connect(DB).then(() => console.log('DB Connection successful'));

//reading json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

//importing data into database
const importData = async () => {
  try {
    await Tour.create(tours); //it will create a new document for each of the objects in the tours array
    await User.create(users, { validateBeforeSave: false }); //turning off password validation in this case
    await Review.create(reviews);
    console.log('Data successfully loaded!');
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

//deleting data from database
const deleteData = async () => {
  try {
    await Tour.deleteMany(); //it will remove all the documents from the database
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully deleted');
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
