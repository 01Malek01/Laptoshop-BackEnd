const express = require('express');
const { protect } = require('../controllers/authController');
const { addToCart, getCart, clearCart } = require('../controllers/cartController');

const router = express.Router();

router.get('/', protect, getCart);
router.post('/add', protect, addToCart);
router.delete('/', protect, clearCart);

module.exports = router;