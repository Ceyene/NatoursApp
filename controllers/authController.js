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

//sing up handler
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role
  });

  //creating new JWT for logging in the new user
  const token = signToken(newUser._id);

  //sending the new user to the client
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
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
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token
  });
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
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token
  });
});
