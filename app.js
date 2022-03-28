//requiring dependencies
const express = require('express');
const morgan = require('morgan'); //popular logging middleware
//ROUTERS
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//MIDDLEWARES

if (process.env.NODE_ENV === 'development') {
  //logging only in development
  app.use(morgan('dev')); //3RD PARTY MIDDLEWARE
}

//allow us to put body data inside the request (Express by itself doesn't do it)
app.use(express.json());

//allow us to serve static files
app.use(express.static(`${__dirname}/public`));

//adding the request time to all requests
app.use((req, res, next) => {
  //defining a property in the request called requestTime
  req.requestTime = new Date().toISOString();
  next();
});

//MOUNTING ROUTERS
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//UNHANDLED ROUTES HANDLER
app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

module.exports = app;
