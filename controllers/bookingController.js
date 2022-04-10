//dependencies
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/appError');
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
    success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
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
const createBookingCheckout = async session => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.amount_total / 100;
  await Booking.create({ tour, user, price });
};

//using Stripe's webhooks to create a new booking in my database once payment succeeded
exports.webhookCheckout = (req, res, next) => {
  //getting Stripe's signature from Stripe added header
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    //creating a Stripe event
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).send(`Webhook error: ${error.message}`);
  }

  //checking if we received the event that we want
  if (event.type === 'checkout.session.completed') {
    createBookingCheckout(event.data.object);
  }

  //sending response to Stripé
  res.status(200).json({ received: true });
};

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
