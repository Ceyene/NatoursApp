//dependencies
const Tour = require('./../models/tourModel');

//TOURS ROUTE HANDLERS
exports.getAllTours = async (req, res) => {
  try {
    //BUILDING QUERY
    //1a) Filtering
    const queryObj = { ...req.query }; //creating a copy of the req.query object
    const excludedFields = ['page', 'sort', 'limit', 'fields']; //creting an array of the fields to be excluded
    excludedFields.forEach(field => delete queryObj[field]); //removing the fields from the query object

    //1b) Advanced filtering
    let queryStr = JSON.stringify(queryObj); //convert the object to a string
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); //we need to find the parameters added in the url and replace them with the operators with $
    let query = Tour.find(JSON.parse(queryStr)); //getting the filtered query for tours

    //2) Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' '); //return an string of all the fields
      query = query.sort(sortBy); //mongoose will automatically sort the data according to the property/ies mentioned
    }
    //EXECUTING QUERY
    const tours = await query; //getting the final query for tours

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
      message: error
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
