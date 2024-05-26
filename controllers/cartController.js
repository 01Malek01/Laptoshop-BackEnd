const Cart = require('../models/cartModel');
const catchAsync = require('../utils/catchAsync');
const Laptop = require('../models/laptopModel');
const CustomError = require('../utils/customErrorHandler');

exports.addToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;

  if (!userId) {
    return next(new CustomError(401, 'You are not logged in'));
  }

  const product = await Laptop.findById(productId);
  if (!product) {
    return next(new CustomError(404, 'Product not found'));
  }

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    console.log('No cart, creating one.....');
    cart = new Cart({ userId });
  }

  const existingProductIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId.toString(),
  );

  if (existingProductIndex !== -1) {
    const existingProduct = cart.items[existingProductIndex];
    cart.totalPrice -= existingProduct.quantity * product.price;
    existingProduct.quantity += quantity;
    cart.totalPrice += existingProduct.quantity * product.price;
    cart.items[existingProductIndex] = existingProduct;
  } else {
    cart.items.push({ productId, quantity });
    cart.totalPrice += quantity * product.price;
  }

  await cart.save();
console.log("request received");
  res.status(200).json({
    status: 'Product added to cart!',
    data: cart,
  });
});

exports.getCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ userId: req.user._id }).populate({
    path:"items.productId",
    select:'brand price model image '
  });
  let productsPromises = cart.items?.map(async (item) => {
    const product = await Laptop.findById(item.productId);
    return product;
  });
  let products = await Promise.all(productsPromises).catch(err => {
        return next(new CustomError(404, 'Your cart is Empty'));

  });
  if (!cart) {
    return next(new CustomError(404, 'Your cart is Empty'));
  }
  res.status(200).json({
    status: 'success',
    data: cart,
    products,
  });
});

exports.clearCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOneAndDelete({ userId: req.user._id });
  res.status(200).json({
    status: 'success',
    data: null,
  });
});


exports.removeItemFromCart = catchAsync(async (req, res, next) => {
  const { id } = req.body;
  const cart = await Cart.findOneAndUpdate(
    { userId: req.user._id },
    { $pull: { items: { productId: id } } },
    { new: true },
  );
  
  res.status(200).json({
    status: 'success',
    data: cart,
  });
});
