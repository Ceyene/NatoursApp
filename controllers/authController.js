//dependencies
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

//creating JWT
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

//creating and sending token to reset password
const createSendToken = (user, statusCode, res) => {
  //creating new JWT for logging in the user
  const token = signToken(user._id);

  //creating cookie options
  const cookieOptions = {
    expires: new Date(
      //fecha actual + valor env variable converted to milliseconds
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true //cannot be accessed or modified by the browser -> prevents XSS
  };

  // In production: only sent in an encrypted connection (https)
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  //sending the token via cookie
  res.cookie('jwt', token, cookieOptions);

  //removing the password from the output
  user.password = undefined;

  //sending the token and the user to the client
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

//sing up handler
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role
  });

  //creating new JWT for logging in the new user and sending response to client
  createSendToken(newUser, 201, res);
});

//log in handler
exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1) checking email and password exist
  if (!email || !password) {
    return next(new AppError('Please, provide email and password', 400));
  }
  //2) checking if user exists && password valid
  const user = await User.findOne({ email }).select('+password');
  //const correct = await user.correctPassword(password, user.password);

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  //3) sending token to the client
  //creating JWT for logging in the user and sending response to client
  createSendToken(user, 200, res);
});

//implementing protected routes
exports.protect = catchAsync(async (req, res, next) => {
  //1) Getting token and checking if it's present
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please log in to get access', 401)
    );
  }
  //2) Token Verification
  //gettting the decoded data of the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3) Checking if user still exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError('The user owner of this token does not longer exist.', 401)
    );
  }

  //4) Checking if user changed password after JWT was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please, login again', 401)
    );
  }

  //5) Grant access to protected route
  req.user = currentUser; //sending this currentUser to the request object, so it will be passed to the next middleware
  next();
});

//Authorization: restricting for admin and lead-guides certain functionalities in the app
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles ['admin', 'lead-guide']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    //if role is admin or lead-guide: continue
    next();
  };
};

//Forgot Password functionality
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) getting user, based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email address', 404));
  }
  //2) generating a random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3) sending it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a  PATCH request with your new password and passwordConfirm to ${resetURL}. If you didn't forget your password, please ignore this email.`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (error) {
    user.createPasswordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

//Password Reset functionality
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken, //find the user with the token
    passwordResetExpires: { $gt: Date.now() } //check if the token hasn't expired yet
  });

  //2) if token not expired and there is a user: set new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save(); //save all previous modifications

  //3) update changedPasswordAt property for the user

  //4) log the user in, send JWT
  //creating JWT for logging in the user and sending response to client
  createSendToken(user, 200, res);
});

//Password updating functionality (for logged in users)
exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) getting user from collection
  const user = await User.findById(req.user.id).select('+password');
  //2) checking if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(
      new AppError('Current password incorrect. Please, try again', 401)
    );
  }
  //3) if so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save(); //saving previous modifications -> validations will be done here, pre-middlware associated with save, so don't use findByIdAndUpdate
  //4) log user in, send JWT
  //creating JWT for logging in the user and sending response to client
  createSendToken(user, 200, res);
});
