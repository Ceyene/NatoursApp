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

//establishing the port
const port = process.env.PORT || 3000;

//CREATING SERVER
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

//HANDLING UNHANDLED REJECTIONS
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
