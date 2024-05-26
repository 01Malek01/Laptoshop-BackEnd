// apiFeatures.js
class APIFeatures {
  constructor(query, requestQuery) {
    this.query = query; // Mongoose query object
    this.requestQuery = requestQuery; // Request query parameters in the url
  }

  // Filter data based on query parameters
  filter() {
    const queryObj = { ...this.requestQuery }; // create a copy from the request query parameters from the url
    const excludedFields = ['page', 'sort', 'limit'];
    excludedFields.forEach((field) => delete queryObj[field]);

    // Custom filtering logic:

    // Brand filtering (existing code)
    if (queryObj.brand) {
      queryObj.brand = { $regex: queryObj.brand, $options: 'i' }; // Case-insensitive search
    }

    // Search query logic:
    if (queryObj.search) {
      const searchTerm = queryObj.search.toLowerCase();
      const fieldsToSearch = ['name', 'description']; // Adjust as needed
      let searchQuery = {}; // Replace with an empty object

      fieldsToSearch.forEach((field) => {
        searchQuery[field] = { $regex: searchTerm, $options: 'i' }; // Case-insensitive search
      });

      queryObj.$or = Object.values(searchQuery); // Combine search with other filters using $or
    }

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
    const page = parseInt(this.requestQuery.page, 10) || 1;
    const limit = parseInt(this.requestQuery.limit, 10) || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
