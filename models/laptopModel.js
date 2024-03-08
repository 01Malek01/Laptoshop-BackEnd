const mongoose = require('mongoose');

const laptopSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    processor: {
      type: String,
      required: true,
    },
    ram: {
      type: Number,
      required: true,
    },
    storage: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    averageRating:{
      type: Number,
      default: 0,
    },
    numOfRatings:{
      type: Number,
      default: 0,
    },
    image:{
      type:String,
    }

  },
  {
    toJSON: { virtuals: true }, //show virtuals in the response
    toObject: { virtuals: true }, //show virtuals in the response
  },
);

laptopSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'productId',
  localField: '_id',
});





const Laptop = mongoose.model('Laptop', laptopSchema);

module.exports = Laptop;
