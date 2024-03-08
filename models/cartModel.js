const mongoose = require('mongoose');
const Laptop = require('./laptopModel');

const cartSchema = new mongoose.Schema(
  {
    userId: {
      ref: 'User',
      type: mongoose.Schema.Types.ObjectId,
    },
    items: [
      {
        productId: { type: mongoose.Schema.ObjectId, ref: 'Laptop' },
        quantity: { type: Number, default: 1 },
      },
    ],
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

cartSchema.methods.addToExistingCart = async function (productId, quantity) {
  const product = await Laptop.findById(productId);
 this.items = [...this.items, { productId, quantity }];
 this.totalPrice += quantity * product.price;
}

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
