class APIFeatures {
  constructor(query, queryString) {
    this.query = query; //this is the query that we manipulate and want to execute at the end
    this.queryString = queryString;
  }

  filter() {
    //BUILDING QUERY
    //1a) Filtering
    const queryObj = { ...this.queryString }; //creating a copy of the this.queryString object
    const excludedFields = ['page', 'sort', 'limit', 'fields']; //creting an array of the fields to be excluded
    excludedFields.forEach(field => delete queryObj[field]); //removing the fields from the query object

    //1b) Advanced filtering
    let queryStr = JSON.stringify(queryObj); //convert the object to a string
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); //we need to find the parameters added in the url and replace them with the operators with $
    this.query.find(JSON.parse(queryStr)); //getting the filtered query

    return this; //this will allow us to chain the next method
  }

  sort() {
    //2) Sorting
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' '); //return an string of all the fields
      this.query = this.query.sort(sortBy); //mongoose will automatically sort the data according to the property/ies mentioned
    } else {
      this.query = this.query.sort('_id'); //sorting by default the tours by id
    }
    return this; //this will allow us to chain the next method
  }

  limitFields() {
    //3) Field limiting: to see only some fields of the tours in a request
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields); //projecting
    } else {
      this.query = this.query.select('-__v'); //exclude the __v, it's for internal use in mongoose, not for the user
    }
    return this; //this will allow us to chain the next method
  }

  paginate() {
    //4) Pagination
    const page = this.queryString.page * 1 || 1; //converting the page to a number and defining a default page
    const limit = this.queryString.limit * 1 || 100; //defining a default limit of tours to show if the user didn't specify any
    const skip = (page - 1) * limit; //calculating the skip value from the page asked
    //creating the paginated query
    this.query = this.query.skip(skip).limit(limit);

    return this; //this will allow us to chain the next method
  }
}

module.exports = APIFeatures;
