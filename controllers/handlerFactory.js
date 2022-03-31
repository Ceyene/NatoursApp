const catchAsync = require('./../utils/catchAsync');
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
