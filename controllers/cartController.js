const Cart = require('../models/cartModel');
const catchAsync = require('../utils/catchAsync');
const Laptop = require('../models/laptopModel');

exports.addToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;
  const product = await Laptop.findById(productId);
  if (!userId) {
    next(new CustomError(401, 'you are not logged in'));
  }
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    console.log('No cart  ,  creating one.....');
    cart = new Cart({ userId });
    cart.items.push({ productId, quantity });
    cart.totalPrice += quantity * product.price;
  } else {
    await cart.addToExistingCart(productId, quantity);
  }

  await cart.save();
  res.status(200).json({
    status: 'product added to cart!',
    data: cart,
  });
});

exports.getCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ userId: req.user._id }).populate(
    'items.productId',
  );

  res.status(200).json({
    status: 'success',
    data: cart,
  });
});

exports.clearCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOneAndDelete({ userId: req.user._id });
  res.status(200).json({
    status: 'success',
    data: null,
  });
});
