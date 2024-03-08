const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewModel');
const CustomError = require('../utils/customErrorHandler');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();

  if (!reviews) {
    return next(new CustomError('No document found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      reviews,
    },
  });
});

// exports.getProdReviews = catchAsync(async (req, res, next) => {
//   const productId = req.params.productId || req.body.productId;
//   if (!productId) {
//     return next(new CustomError('No product id found', 404));
//   }
//   const reviews = await Review.find({ productId });
//   if (!reviews) {
//     return next(new CustomError('No document found', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       reviews,
//     },
//   });
// });

exports.postReview = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const productId = req.body.productId;
  if (!req.body.productId) {
    req.body.productId = req.params.productId;
  }
  if (!productId) {
    return next(new CustomError('No product id found', 404));
  }
  if (!userId) {
    return next(new CustomError('you are not logged in', 401));
  }
  const { rating, comment } = req.body;
  const review = await Review.create({
    rating,
    comment,
    productId,
    userId,
  });
  res.status(201).json({
    status: 'success',
    data: {
      review,
    },
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const { reviewId } = req.params;

  const review = await Review.findById(reviewId);

  if (!review) {
    return next(new CustomError(404, 'Review not found'));
  }

  // Check if the user owns the review or has the necessary permissions to delete it
  if (review.userId.toString() !== req.user._id.toString()) {
    return next(new CustomError(403, 'You are not authorized to delete this review'));
  }

  await review.deleteOne();

  res.status(204).json({
    status: 'Deleted successfully',
    data: null,
  });
});

exports.editReview = catchAsync(async (req, res, next) => {
  const { reviewId } = req.params;

  const { rating, comment } = req.body;

  const review = await Review.findById(reviewId);

  if (!review) {
    return next(new CustomError('Review not found', 404));
  }

  // Check if the user owns the review or has the necessary permissions to edit it
  if (review.userId.toString() !== req.user._id.toString()) {
    return next(
      new CustomError('You are not authorized to edit this review', 403),
    );
  }

  review.rating = rating;
  review.comment = comment;
  await review.save();

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

exports.getReview = catchAsync(async (req, res, next) => {
  const { reviewId } = req.params;

  const review = await Review.findById(reviewId);

  if (!review) {
    return next(new CustomError('Review not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});
