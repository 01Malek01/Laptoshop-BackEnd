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

cartSchema.post(/^find/, async function (docs, next) {
  if (Array.isArray(docs)) {
    for (let doc of docs) {
      await doc.populate('items.productId', 'price').execPopulate();

      doc.totalPrice = doc.items.reduce((acc, item) => {
        const product = item.productId;
        const quantity = item.quantity;
        return acc + product.price * quantity;
      }, 0);

      await doc.save();
    }
  } else {
    await docs.populate('items.productId', 'price');

    docs.totalPrice = docs.items.reduce((acc, item) => {
      const product = item.productId;
      const quantity = item.quantity;
      return acc + product.price * quantity;
    }, 0);

    await docs.save();
  }

  next();
});
cartSchema.pre(/^find /, async function (req, res, next) {
  this.totalPrice = this.items.reduce((acc, item) => {
    const product = item.productId;
    const quantity = item.quantity;
    return acc + product.price * quantity;
  })
  next();
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
