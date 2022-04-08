//dependencies
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const AppError = require('../utils/AppError');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll
} = require('./handlerFactory');

//creating a Stripe Checkout Session
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //1) Getting the currently booked tour
  const tour = await Tour.findById(req.params.tourID);
  //2) Creating checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    //custom field: allows to pass data about the session
    //makes this data available to be used in a new booking creation after this purchase
    client_reference_id: req.params.tourID,
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
