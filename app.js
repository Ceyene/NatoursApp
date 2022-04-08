//requiring dependencies
const path = require('path');
const express = require('express');
const morgan = require('morgan'); //popular logging middleware
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
//ROUTERS
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

//Setting template engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views')); //using path module to create a path to the views folder

//GLOBAL MIDDLEWARES

//Serving static files
app.use(express.static(path.join(__dirname, 'public'))); //using path module to create path to public folder

//Setting secure HTTP Headers

// Further HELMET configuration for Security Policy (CSP)
const scriptSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://js.stripe.com',
  'https://m.stripe.network',
  'https://*.cloudflare.com'
];
const styleSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://fonts.googleapis.com/'
];
const connectSrcUrls = [
  'https://unpkg.com',
  'https://tile.openstreetmap.org',
  'https://*.stripe.com',
  'https://bundle.js:*',
  'ws://127.0.0.1:*/'
];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
      baseUri: ["'self'"],
      fontSrc: ["'self'", ...fontSrcUrls],
      scriptSrc: ["'self'", 'https:', 'http:', 'blob:', ...scriptSrcUrls],
      frameSrc: ["'self'", 'https://js.stripe.com'],
      objectSrc: ["'none'"],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:', 'https://m.stripe.network'],
      childSrc: ["'self'", 'blob:'],
      imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
      formAction: ["'self'"],
      connectSrc: [
        "'self'",
        "'unsafe-inline'",
        'data:',
        'blob:',
        ...connectSrcUrls
      ],
      upgradeInsecureRequests: []
    }
  })
);

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

//Url encoded - allows to send data from the client side
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

//Getting access to our cookies to get JWT
app.use(cookieParser());

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

//MOUNTING ROUTERS
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

//UNHANDLED ROUTES HANDLER
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//GLOBAL ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

module.exports = app;
