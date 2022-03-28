//CATCHING ASYNC ERRORS
module.exports = fn => {
  //returning a function that will be called when its used the exact route
  //this function will be assigned to createTour to be executed when needed
  return (req, res, next) => {
    fn(req, res, next).catch(err => next(err)); //same as writing ".catch(next)"
  };
};
