const mongoose = require('mongoose');
const Receipt = require('./receipt');

const orderSchema = new mongoose.Schema(
  {
    completed: {
      type: Boolean,
      default: false,
    },
    paymentCompleted: {
      type: Boolean,
      default: false,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Customer',
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Shop',
    },
    billItems: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Item',
        },
        itemPrice: {
          type: Number,
          required: true,
          validate(value) {
            if (value < 0) {
              throw new Error('Price cannot be less than 0');
            }
          },
        },
        quantity: {
          type: Number,
          required: true,
          validate(value) {
            if (value < 0) {
              throw new Error('Quantity cannot be less than 0');
            }
          },
        },
      },
    ],
    billAmount: {
      type: Number,
      required: true,
      validate(value) {
        if (value < 0) {
          throw new Error('Total amount cannot be less than 0');
        }
      },
    },
    discount: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error('Discount percentage cannot be less than 0');
        }
      },
    },
    deliveryCharges: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error('Delivery charges cannot be less than 0');
        }
      },
    },
    advancePayment: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error('Advance payment cannot be less than 0');
        }
      },
    },
    deliveryDate: {
      type: Date,
      required: true,
    },
    pointsUsed: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error('Points used cannot be less than 0');
        }
      },
    },
    discountType: {
      type: String,
      default: 'amount',
      validate(value) {
        if (!['points', 'percentage', 'amount'].includes(value)) {
          throw new Error('Received wrong discount type');
        }
      },
    },
    discountValue: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error('Discount value used cannot be less than 0');
        }
      },
    },
    dollarToPointsMultiplier: {
      type: Number,
      default: 10,
      validate(value) {
        if (value < 1) {
          throw new Error(
            'Dollar to points multiplier used cannot be less than 1'
          );
        }
      },
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.pre(
  ['findOneAndDelete', 'deleteMany'],
  async function deleteOrderReceipt(next) {
    const order = this;
    await Receipt.deleteMany({ order: order.getQuery()._id });
    next();
  }
);

orderSchema.virtual('receipt', {
  ref: 'Receipt',
  localField: '_id',
  foreignField: 'order',
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
