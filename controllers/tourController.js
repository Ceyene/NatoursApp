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
      message: error
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
      message: err
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
      message: 'Invalid data sent' //don't use this, send meaningful errors to the client
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
      message: error
    });
  }
};
