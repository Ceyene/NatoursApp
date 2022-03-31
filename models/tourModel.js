//dependencies
const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
//const User = require('./userModel');

//creating a schema for our db documents
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'], //data validator
      maxlength: [60, 'A tour name must have a maximum of 60 characters'], //data validator
      minlength: [10, 'A tour name must have a minimum of 10 characters'], //data validator
      unique: true,
      trim: true //removes all white spaces at the beginning and the end
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium or difficult' //data validator
      },
      validate: [
        validator.isAlpha,
        'Tour name must only contain alphabetical characters'
      ] //validator.js -> checks if all the characters in a string are letters
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1'],
      max: [5, 'Rating must be below 5']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      //this will work only to newly created documents
      validate: {
        validator: function(val) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(), //mongoose will convert it from miliseconds to date format
      select: false //createdAt will be hidden from the user
    },
    startDates: [Date], //also will be parsed by mongoose
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number], //Long Lat
      address: String,
      description: String
    },
    locations: [
      //embedded document
      {
        //GeoJSON
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number], //Long Lat
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      //embedded document
      { type: mongoose.Schema.ObjectId, ref: 'User' }
    ]
  },
  {
    toJSON: { virtuals: true }, //when data outputted as JSON: show virtual properties
    toObject: { virtuals: true } //when data outputted as Object: show virtual properties
  }
);

//creating virtual property: tour duration in weeks
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7; //duration in days, divided by 7
});

//DOCUMENT MIDDLEWARE - Pre Middleware - associated to the save event
//Runs before save() and create()
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true }); //this -> currently processed document, the one that is being saved to the db
  next();
});

//Pre Middleware - associated to the save event
//let's retrieve tour guides documents each time a new tour is created
// tourSchema.pre('save', async function(next) {
//   //iterate through the guides array and get a document in each iteration
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

/*
//Document Middleware - Post Middleware - associated to the save event
//Runs after all pre middleware functions have completed
tourSchema.post('save', function(doc, next) {
  console.log(doc);
  next();
});
*/

//QUERY MIDDLEWARE - Pre Middleware - associated to find() query
//let's show only public tours, not secret ones
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } }); //this will point to the current query

  this.start = Date.now();
  next();
});

//QUERY MIDDLEWARE - Pre Middleware - associated to /^find/ queries
//populating child references to guide users in this tour
tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
});
/*
//QUERY MIDDLEWARE - Post Middleware - associated to find() query
tourSchema.post(/^find/, function(docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  console.log(docs);
  next();
});
*/

//AGGREGATION MIDDLEWARE - Pre Middleware - associated to aggregate() method
//removing from the output all the secret tours
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); //this will point to the aggregation object
  next();
});

//creating a model out of the previous schema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
