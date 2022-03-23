//dependencies
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');

//MIDDLEWARE: ADDING ALIAS FOR POPULAR SEARCH
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

//TOURS ROUTE HANDLERS
exports.getAllTours = async (req, res) => {
  try {
    //EXECUTING QUERY
    //create an object, instance from the APIFeatures class, to parse a query object (Tour.find()) and the query string from the url (given by Express)
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort() // these methods manipulate the query
      .limitFields()
      .paginate();
    const tours = await features.query; //awaiting the final query for tours and putting it inside the tours variable

    //SENDING RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length, //when sending multiple results
      data: {
        tours //tours: tours
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message
    });
  }
};
exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    //Tour.findOne({_id: req.params.id})

    //send specified tour to the client
    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message
    });
  }
};
exports.createTour = async (req, res) => {
  try {
    //const newTour = new Tour({});
    //newTour.save().then().catch();

    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};
exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour //tour : tour
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message //send meaningful errors to the client
    });
  }
};
exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    //status = 204 ---> No Content
    res.status(204).json({
      status: 'success',
      data: null //-> we won't send any data, because the resource no longer exists
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

//Aggregation Pipeline: Matching and Grouping
//Getting Tour Stats, ordered by difficulty
exports.getTourStats = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

//Aggregation Pipelines: Unwinding and Projecting
//Calculating the busiest month of the year --> Business problem to solve
exports.getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};
