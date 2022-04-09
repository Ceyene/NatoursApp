//dependencies
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const {
  createOne,
  deleteOne,
  updateOne,
  getOne,
  getAll
} = require('./handlerFactory');

//creating a Stripe Checkout Session
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //1) Getting the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  //2) Creating checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    //custom field: allows to pass data about the session
    //makes this data available to be used in a new booking creation after this purchase
    client_reference_id: req.params.tourId,
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`]
          }
        }
      }
    ]
  });
  //3) Creating session as response to the client
  res.status(200).json({
    status: 'success',
    session
  });
});

//Creating new booking in our db
exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  //TEMPORARY -> getting data from query string -> only in dev
  const { tour, user, price } = req.query;

  if (!(tour && user && price)) return next();

  //creating new booking in our db
  await Booking.create({ tour, user, price });

  //once created, instead of continue to the next middleware and rendering homepage,
  //remove used data from query string and redirect user to homepage safely
  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = createOne(Booking);
exports.getBooking = getOne(Booking);
exports.getAllBookings = getAll(Booking);
exports.updateBooking = updateOne(Booking);
exports.deleteBooking = deleteOne(Booking);

//checking if a user has booked a tour before allowing to review it
exports.checkIfBooked = catchAsync(async (req, res, next) => {
  // To check if booked was bought by user who wants to review it
  const booking = await Booking.find({
    user: req.user.id,
    tour: req.body.tour
  });
  if (booking.length === 0)
    return next(new AppError('You must buy this tour to review it', 401));
  next();
});
