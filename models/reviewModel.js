//dependencies
const mongoose = require('mongoose');

//creating a schema for our db documents
const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'Review cannot be empty!']
  },
  rating: { type: Number, min: 1, max: 5 },
  createdAt: {
    type: Date,
    default: Date.now(), //mongoose will convert it from miliseconds to date format
    select: false //createdAt will be hidden from the user
  }
});

//creating a model out of the previous schema
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
