const mongoose = require('mongoose');
const validator = require('validator');
const Order = require('./order');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
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
    birthday: {
      day: {
        type: Number,
        required: false,
        validate(value) {
          if (value > 31 || value < 1) {
            throw new Error('Date in not correct');
          }
        },
      },
      month: {
        type: Number,
        required: false,
        validate(value) {
          if (value > 12 || value < 1) {
            throw new Error('Date is not correct');
          }
        },
      },
    },
    anniversary: {
      day: {
        type: Number,
        required: false,
        validate(value) {
          if (value > 31 || value < 1) {
            throw new Error('Date in not correct');
          }
        },
      },
      month: {
        type: Number,
        required: false,
        validate(value) {
          if (value > 12 || value < 1) {
            throw new Error('Date is not correct');
          }
        },
      },
    },
    currentPoints: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error('Points cannot be less than 0');
        }
      },
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Shop',
    },
    active: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

customerSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'customer',
});

// Delete customer orders when customer is removed
customerSchema.pre(
  ['findOneAndDelete', 'deleteMany'],
  async function deleteCustomerOrders(next) {
    const customer = this;
    await Order.deleteMany({ customer: customer.getQuery()._id });
    next();
  }
);

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
