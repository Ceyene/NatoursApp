const catchAsync = require('./../utils/catchAsync');
const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('./../utils/AppError');

//handler factory to delete resources
exports.deleteOne = Model => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    //HANDLING NOT FOUND RESOURCES
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    //status = 204 ---> No Content
    res.status(204).json({
      status: 'success',
      data: null //-> we won't send any data, because the resource no longer exists
    });
  });
};
//handler factory to update resources
exports.updateOne = Model => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    //HANDLING NOT FOUND RESOURCES
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });
};
//handler factory to create resources
exports.createOne = Model => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body); //if anything out of the schema, will be ignored

    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });
};
//handler factory to read specific document by Id
exports.getOne = (Model, popOptions) => {
  return catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id); //Model.findOne({_id: req.params.id})
    if (popOptions) query = query.populate(popOptions); //populating our references with data
    const doc = await query;

    //HANDLING NOT FOUND RESOURCES
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    //send specified document to the client
    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });
};
//handler factory to read all documents from a resource
exports.getAll = Model => {
  return catchAsync(async (req, res, next) => {
    //getting all reviews for a certain tour with nested routes
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId }; //filtering tours by id
    //EXECUTING QUERY
    //create an object, instance from the APIFeatures class, to parse a query object (Model.find()) and the query string from the url (given by Express)
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort() // these methods manipulate the query
      .limitFields()
      .paginate();
    const docs = await features.query.explain(); //awaiting the final query for docs and putting it inside the docs variable

    //SENDING RESPONSE
    res.status(200).json({
      status: 'success',
      results: docs.length, //when sending multiple results
      data: {
        data: docs
      }
    });
  });
};
