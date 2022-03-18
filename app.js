//requiring dependencies
const express = require('express');
const morgan = require('morgan'); //popular logging middleware
//ROUTERS
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

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

//MOUNTING ROUTERS
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
