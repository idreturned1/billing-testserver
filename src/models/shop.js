const mongoose = require('mongoose');
const validator = require('validator');
const Order = require('./order');
const Item = require('./item');
const Customer = require('./customer');

const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Email is invalid');
        }
      },
    },
    mobile: {
      type: String,
      unique: true,
      required: true,
    },
    logo: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

shopSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'shop',
});

shopSchema.virtual('customers', {
  ref: 'Customer',
  localField: '_id',
  foreignField: 'shop',
});

shopSchema.virtual('items', {
  ref: 'Item',
  localField: '_id',
  foreignField: 'shop',
});

shopSchema.pre(
  ['findOneAndDelete', 'deleteMany'],
  async function deleteShopData(next) {
    const shop = this;
    await Order.deleteMany({ shop: shop.getQuery()._id });
    await Item.deleteMany({ shop: shop.getQuery()._id });
    await Customer.deleteMany({ shop: shop.getQuery()._id });
    next();
  }
);

const Shop = mongoose.model('Shop', shopSchema);

module.exports = Shop;
