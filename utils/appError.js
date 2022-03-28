//ERROR CLASS
class AppError extends Error {
  constructor(message, statusCode) {
    super(message); //calling Error as the parent constructor and setting message (message is the only parameter that the built-in Error class accepts)

    this.statusCode = statusCode; //setting statusCode
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; //setting status
    this.isOperational = true; //later will validate this, we will only use this for operational errors
    Error.captureStackTrace(this, this.constructor); //capturing the stack trace
  }
}

module.exports = AppError;
