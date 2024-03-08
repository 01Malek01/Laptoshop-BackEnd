const mongoose = require('mongoose');
const Laptop = require('./laptopModel');

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Please provide rating'],
    },
    comment: {
      type: String,
      required: [true, 'Please provide review'],
    },
    userId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: ['User'],
      },
    ],
    productId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: ['Laptop'],
      },
    ],
  },
  {
    timestamps: true,
  },
);




const Review = mongoose.model('Review', reviewSchema);

Review.createIndexes({ rating: 1, laptop: 1 }, { unique: true });

module.exports = Review;
