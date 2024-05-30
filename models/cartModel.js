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

cartSchema.methods.calculateTotalPrice = async function () {
  await this.populate('items.productId', 'price');
  this.totalPrice = this.items.reduce((acc, item) => {
    const product = item.productId;
    const quantity = item.quantity;
    return acc + product.price * quantity;
  }, 0);
};

cartSchema.pre('save', async function (next) {
  await this.calculateTotalPrice();
  next();
});

// cartSchema.pre(/^find/, async function (next) {
//   await this.populate('items.productId', 'price');
//   next();
// });

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
