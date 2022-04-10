//dependencies
const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utils/appError');
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll
} = require('./handlerFactory');

//configuring upload for images
// 1) storing image as a buffer to make it available in case we need to resize it
const multerStorage = multer.memoryStorage();
//2) checking that the new file is an image to allow it to be uploaded
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please, upload only images.', 400), false);
  }
};
// uploading new images with complete configurations
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

//MIDDLEWARE: ADDING IMAGES TO OUR TOURS
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

//MIDDLWARE: PROCESSING OUR UPLOADING IMAGES
exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  //1) COVER IMAGE
  //creating img filename and addint it to our request body, so it will be available in the updateOne factory function
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  //using sharp to resize the uploading file -> takes image from buffer
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333) //3/2 ratio
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  //2) IMAGES
  //creating en empty array of images in request body
  req.body.images = [];

  //processing files array and creating a new array of promises
  const imgPromises = req.files.images.map(async (file, i) => {
    //creating filename for each photo
    const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
    //using sharp to resize each uploading file -> takes image from buffer
    await sharp(file.buffer)
      .resize(2000, 1333) //3/2 ratio
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${filename}`);
    //adding the filename of each photo to our request body to make it available for updateOne factory function
    req.body.images.push(filename);
  });

  //awaiting all images promises to be solved before continue
  await Promise.all(imgPromises);

  next();
});

//MIDDLEWARE: ADDING ALIAS FOR POPULAR SEARCH
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

//TOURS ROUTE HANDLERS
exports.getAllTours = getAll(Tour);
exports.getTour = getOne(Tour, { path: 'reviews' });
exports.createTour = createOne(Tour);
exports.updateTour = updateOne(Tour);
exports.deleteTour = deleteOne(Tour);

//Aggregation Pipeline: Matching and Grouping
//Getting Tour Stats, ordered by difficulty
exports.getTourStats = catchAsync(async (req, res, next) => {
  //we can use our Model created with Mongoose for this aggregation pipeline
  const stats = await Tour.aggregate([
    {
      //similar to a filter object in MongoDB
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      //allows to group documents using accumulators
      $group: {
        //_id: null, //id can be the field we can group by the documents, but now want only one resulting doc
        _id: { $toUpper: '$difficulty' }, //several stats, one for each existent value: EASY, MEDIUM, DIFFICULT
        numTours: { $sum: 1 }, //for each document that goes through the pipeline, it will add 1 (result will be 9)
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      //sorts documents according to the indicated operator
      $sort: { avgPrice: 1 } //use value of 1 for ascending sorting
    }
  ]); //each object in this array will be one stage

  //send data to the client
  res.status(200).json({
    status: 'success',
    data: {
      stats //stats : stats
    }
  });
});

//Aggregation Pipelines: Unwinding and Projecting
//Calculating the busiest month of the year --> Business problem to solve
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; //getting the year from the url parameter and transforming it into a number

  const plan = await Tour.aggregate([
    {
      //deconstructs an array field and output one document for each element of the array
      $unwind: '$startDates'
    },
    {
      //it will query and select documents
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      //it will group the documents according to the month of the planned tours
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      //it will convert the number of the month to the name in string, in the id
      $addFields: { month: '$_id' }
    },
    {
      //not going to show the _id field to the client
      $project: {
        _id: 0 //not going to show the _id field, with 1 it would show it up
      }
    },
    {
      //sorting by the number of tours in each month
      $sort: { numTourStarts: -1 } //will show them in descending order, starting with the highest
    },
    {
      //it will limit the amount of results
      $limit: 12
    }
  ]);
  //sending data to the client
  res.status(200).json({
    status: 'success',
    data: {
      plan //plan : plan
    }
  });
});

//GEOSPATIAL QUERIES: Searching tours within a certain distance of a specified point and a specified unit
// -> /tours-within/500/center/36.728513,-119.808303/unit/km
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  //defining radius, in a special unit called radians: distance / radius of Earth
  //option in km and if not, assuming it's in miles
  const radius = unit === 'km' ? distance / 6378.1 : distance / 3963.2;

  //verifying that coordinates have been destructured
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400
      )
    );
  }
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } //centerSphere: GeoJSON geometry used
  });

  //sending response to client
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
});

//GEOSPATIAL AGGREGATION: Calculating distances to all tours from a certain point
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  //option in miles for the multiplier that will parse distance from meters
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  //verifying that coordinates have been destructured
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng.',
        400
      )
    );
  }

  //Calculating distance with Aggregation pipeline
  const distances = await Tour.aggregate([
    //only one stage
    {
      //specific for this search, it should always be first stage
      $geoNear: {
        //starting point to calculate
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1] //converting them to numbers
        },
        //field that will store all calculates distances
        distanceField: 'distance',
        distanceMultiplier: multiplier //parsing from m to km
      }
    },
    {
      //showing only the name and distance
      $project: {
        name: 1,
        distance: 1
      }
    }
  ]);

  //sending response to client
  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
});
