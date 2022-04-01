//dependencies
const mongoose = require('mongoose');
const Tour = require('./tourModel');

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
    }, //embedded document reference
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  }, //embedded document reference
  {
    toJSON: { virtuals: true }, //when data outputted as JSON: show virtual properties
    toObject: { virtuals: true } //when data outputted as Object: show virtual properties
  }
);

//QUERY MIDDLEWARE - Pre Middleware - associated to /^find/ queries
//populating child reference to the corresponding user in each review
reviewSchema.pre(/^find/, function(next) {
  //populating child reference to the corresponding tour and user in each review
  //   this.populate({
  //     path: 'tour',
  //     select: 'name'
  //   }).populate({
  //     path: 'user',
  //     select: 'name photo' //let's not leak user's data here
  //   });

  this.populate({
    path: 'user',
    select: 'name photo' //let's not leak user's data here
  });
  next();
});

//adding a static method to the schema, so we calculate the ratings average in our tours
reviewSchema.statics.calcAverageRatings = async function(tourId) {
  //using aggregation pipeline - this points to the current model (Model.aggregate)
  const stats = await this.aggregate([
    //stages
    //1- selecting reviews belonging to the current tour
    { $match: { tour: tourId } },
    //2- calculating the average of rating in all reviews grouped
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].nRating,
    ratingsAverage: stats[0].avgRating
  });
};

//Pre-Middleware - associated to save event
//adding the averageRatings to a tour each time a review is created (saved)
reviewSchema.pre('save', function() {
  //this points to the current doc (review) and constructor points to the model that created that doc (Review)
  this.constructor.calcAverageRatings(this.tour); //Review.calcAverageRatings(this.tour)
});

//creating a model out of the previous schema
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
