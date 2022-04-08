//dependencies
const mongoose = require('mongoose');

//creating a schema for our db documents
const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a tour']
  }, //embedded document reference
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a user']
  }, //embedded document reference
  price: {
    type: Number,
    require: [true, 'Booking must have a price']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  paid: {
    type: Boolean,
    default: true
  }
});

//QUERY MIDDLEWARE - Pre Middleware - associated to /^find/ queries
//populating child reference to the corresponding user in each review
bookingSchema.pre(/^find/, function(next) {
  //populating child reference to the corresponding tour and user in each review
  this.populate({
    path: 'tour',
    select: 'name'
  }).populate('user'); //user data won't be leaked because this will only be seen by admin users
  next();
});

//creating a model out of the previous schema
const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
