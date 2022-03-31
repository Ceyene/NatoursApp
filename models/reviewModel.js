//dependencies
const mongoose = require('mongoose');

//creating a schema for our db documents
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty!']
    },
    rating: { type: Number, min: 1, max: 5 },
    createdAt: {
      type: Date,
      default: Date.now(), //mongoose will convert it from miliseconds to date format
      select: false //createdAt will be hidden from the user
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour']
    }, //embedded document
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  }, //embedded document
  {
    toJSON: { virtuals: true }, //when data outputted as JSON: show virtual properties
    toObject: { virtuals: true } //when data outputted as Object: show virtual properties
  }
);

//QUERY MIDDLEWARE - Pre Middleware - associated to /^find/ queries
//populating child reference to the corresponding tour in each review
reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'tour',
    select: 'name'
    //populating child reference to the corresponding user in each review
  }).populate({
    path: 'user',
    select: 'name photo' //let's not leak user's data here
  });
  next();
});

//creating a model out of the previous schema
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
