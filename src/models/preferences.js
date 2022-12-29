const mongoose = require('mongoose');

const preferencesSchema = new mongoose.Schema(
  {
    dollarToPointsMultiplier: {
      type: Number,
      default: 10,
      validate(value) {
        if (value < 0) {
          throw new Error('Dollar multiplier cannot be less than 0');
        }
      },
    },
    applyAutoDiscount: {
      type: Boolean,
      default: true,
    },
    autoDiscountAmount: {
      type: Number,
      default: 10,
      validate(value) {
        if (value < 0) {
          throw new Error('Auto discount amount cannot be less than 0');
        }
      },
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Shop',
    },
  },
  {
    timestamps: true,
  }
);

const Preferences = mongoose.model('Preferences', preferencesSchema);

module.exports = Preferences;
