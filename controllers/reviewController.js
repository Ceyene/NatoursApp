//dependencies
const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');

//REVIEWS ROUTE HANDLERS
exports.getAllReviews = catchAsync(async (req, res, next) => {
  //EXECUTING QUERY
  const reviews = await Review.find(); //awaiting the query for reviews and putting it inside the reviews variable

  //SENDING RESPONSE
  res.status(200).json({
    status: 'success',
    results: reviews.length, //when sending multiple results
    data: {
      reviews //reviews: reviews
    }
  });
});
exports.createReview = catchAsync(async (req, res, next) => {
  //using url params and req to get tour and user id
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  const newReview = await Review.create(req.body); //if anything out of the schema, will be ignored

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview
    }
  });
});
