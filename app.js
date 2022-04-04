//requiring dependencies
const path = require('path');
const express = require('express');
const morgan = require('morgan'); //popular logging middleware
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
//ROUTERS
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

//Setting template engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views')); //using path module to create a path to the views folder

//GLOBAL MIDDLEWARES

//Serving static files
app.use(express.static(path.join(__dirname, 'public'))); //using path module to create path to public folder

//Setting secure HTTP Headers
app.use(helmet());

//Development logging
if (process.env.NODE_ENV === 'development') {
  //logging only in development
  app.use(morgan('dev')); //3RD PARTY MIDDLEWARE
}

//establishing a limit of 100 requests per hour from the same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please, try again in an hour'
});

//using the limiter for every requests whose url starts with api
app.use('/api', limiter);

//Body parser - Reading data from body into req.body
app.use(express.json({ limit: '10kb' })); //allow us to put body data inside the request and limiting the amount of data sent in body requests (Express by itself doesn't do it)

//Data sanitization against NoSQL query injection
app.use(mongoSanitize()); //removing all characters that allows to create query operators from req.body, req.params and req query string

//Preventing parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
); // clears up the query string, except for the whitelisted properties

//adding the request time to all requests (test middleware)
app.use((req, res, next) => {
  //defining a property in the request called requestTime
  req.requestTime = new Date().toISOString();
  next();
});

//route for base template
app.get('/', (req, res) => {
  res.status(200).render('base');
});

//MOUNTING ROUTERS
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

//UNHANDLED ROUTES HANDLER
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//GLOBAL ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

module.exports = app;
