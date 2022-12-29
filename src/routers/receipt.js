const express = require('express');
const Receipt = require('../models/receipt');
const Order = require('../models/order');
const auth = require('../middleware/auth');
const verifyUserShop = require('../middleware/verifyUserShop');

const router = new express.Router();

router.post(
  '/api/receiptForOrder/:orderId',
  [auth, verifyUserShop],
  async (req, res) => {
    const receiptOrder = await Order.findOne({
      _id: req.params.orderId,
      shop: req.query.shopId,
    });
    await receiptOrder
      .populate('customer')
      .populate('billItems.item')
      .populate('shop')
      .execPopulate();

    const receipt = new Receipt({
      order: receiptOrder._id,
      customer: JSON.parse(JSON.stringify(receiptOrder.customer)),
      shop: JSON.parse(JSON.stringify(receiptOrder.shop)),
      billItems: JSON.parse(JSON.stringify(receiptOrder.billItems)),
      billAmount: receiptOrder.billAmount,
      discount: receiptOrder.discount ? receiptOrder.discount : 0,
      deliveryCharges: receiptOrder.deliveryCharges
        ? receiptOrder.deliveryCharges
        : 0,
      advancePayment: receiptOrder.advancePayment
        ? receiptOrder.advancePayment
        : 0,
      deliveryDate: receiptOrder.deliveryDate,
      pointsUsed: receiptOrder.pointsUsed,
      discountType: receiptOrder.discountType,
      discountValue: receiptOrder.discountValue,
      dollarToPointsMultiplier: receiptOrder.dollarToPointsMultiplier,
    });

    try {
      await Receipt.findOneAndDelete({ order: req.params.orderId });
      await receipt.save();
      res.status(201).send(receipt);
    } catch (e) {
      res.status(400).send(e);
    }
  }
);

router.get(
  '/api/receiptForOrder/:orderId',
  [auth, verifyUserShop],
  async (req, res) => {
    try {
      const receipt = await Receipt.findOne({
        order: req.params.orderId,
        'shop._id': `${req.query.shopId}`,
      });
      res.send(receipt);
    } catch (e) {
      res.status(500).send();
    }
  }
);

router.delete(
  '/api/receiptForOrder/:orderId',
  [auth, verifyUserShop],
  async (req, res) => {
    try {
      const receipt = await Receipt.findOneAndDelete({
        order: req.params.orderId,
        shop: req.query.shopId,
      });

      if (!receipt) {
        res.status(404).send();
      }
      res.send(receipt);
    } catch (e) {
      res.status(500).send();
    }
  }
);

module.exports = router;
