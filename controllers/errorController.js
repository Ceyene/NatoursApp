//dependencies
const AppError = require('../utils/appError');

//Handling Invalid Database ID Errors
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

//Handling Duplicate Database Fields
const handleDuplicateFieldsDB = err => {
  const value = Object.values(err.keyValue)[0];
  const message = `Duplicate field value: ${value}. Please use another value.`;
  return new AppError(message, 400);
};

//Handling Mongoose Validation Errors
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Please correct the following errors: ${errors.join('. ')}.`;
  return new AppError(message, 400);
};

//Handling JWT Validation Errors
const handleJWTError = () => {
  return new AppError('Invalid token. Please login again.', 401);
};

//Handling JWT Expired Errors
const handleJWTExpiredError = () => {
  return new AppError('Your token has expired. Please login again.', 401);
};

//Sending different errors to the client, according to the environment
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};
const sendErrorProd = (err, res) => {
  //Operational, trusted error: Send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
    //Programming or other unknown error: Don't leak error details
  } else {
    //1) Log error
    console.error('Error: ', err);

    //2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
};

module.exports = (err, req, res, next) => {
  //console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  //checking if the environment is dev or prod to modify the error sent to the client
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.assign(err);
    //Invalid Database ID Error
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    //Duplicate DB Fields Error
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    //Mongoose Validation Error
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    //JWT Validation Error
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    //JWT Expired Error
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error, res);
  }
};
