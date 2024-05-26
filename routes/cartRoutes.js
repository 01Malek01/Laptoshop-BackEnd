const express = require('express');
const { protect } = require('../controllers/authController');
const {
  addToCart,
  getCart,
  clearCart,
  removeItemFromCart,
} = require('../controllers/cartController');

const router = express.Router();

router.use(protect);
router
  .get('/', getCart)
  .post('/', addToCart)
  .delete('/', clearCart)
  .patch('/', removeItemFromCart);
router.post('/checkout', protect);

module.exports = router;
