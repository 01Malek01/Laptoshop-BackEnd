const express = require('express');
const {
  getAllReviews,
  getProdReviews,
  postReview,
  deleteReview,
  editReview,
  getReview,
} = require('../controllers/reviewController');
const { restrictTo, protect } = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(protect, restrictTo('admin'), getAllReviews)
  .post(protect, postReview);

// router.route('/:productId').get(getProdReviews);
router
  .route('/:reviewId')
  .delete(protect, restrictTo('user', 'admin'), deleteReview)
  .patch(protect, restrictTo('admin'), editReview)
  .get(protect, restrictTo('admin'), getReview);

module.exports = router;
