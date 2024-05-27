// apiFeatures.js
class APIFeatures {
  constructor(query, requestQuery) {
    this.query = query; // Mongoose query object
    this.requestQuery = requestQuery; // Request query parameters in the url
  }

  // Filter data based on query parameters
  filter() {
    const queryObj = { ...this.requestQuery }; // create a copy from the request query parameters from the url
    const excludedFields = ['page', 'sort', 'limit', 'search'];
    excludedFields.forEach((field) => delete queryObj[field]);

    // Brand filtering (existing code)
    if (queryObj.brand) {
      queryObj.brand = { $regex: queryObj.brand, $options: 'i' }; // Case-insensitive search
    }

    // Additional filters can be added here
    this.query = this.query.find(queryObj);
    return this;
  }

  // Sort data based on query parameters
  sort() {
    if (this.requestQuery.sort) {
      const sortBy = this.requestQuery.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    }
    return this;
  }

  // Paginate data
  paginate() {
    const page = parseInt(this.requestQuery?.page, 10) || 1;
    const limit = parseInt(this.requestQuery?.limit, 10) || 10;
    const skip = (page - 1) * limit;

    if (
      !this.query ||
      typeof this.query.skip !== 'function' ||
      typeof this.query.limit !== 'function'
    ) {
      throw new Error('Invalid query object');
    }

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  // Search data based on query parameters
  search() {
    if (this.requestQuery.search) {
      const searchTerm = this.requestQuery.search.toLowerCase();
      const fieldsToSearch = ['brand', 'model']; // Adjust as needed
      const searchQueries = fieldsToSearch.map((field) => ({
        [field]: { $regex: searchTerm, $options: 'i' },
        //will look like this :
        //         [
        //   { brand: { $regex: 'searchTerm', $options: 'i' } },
        //   { model: { $regex: 'searchTerm', $options: 'i' } }
        // ]
      }));

      this.query = this.query.find({ $or: searchQueries });
    }
    return this;
  }
}

module.exports = APIFeatures;
