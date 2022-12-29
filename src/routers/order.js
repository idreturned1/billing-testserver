const express = require('express');
const Order = require('../models/order');
const auth = require('../middleware/auth');
const verifyUserShop = require('../middleware/verifyUserShop');

const router = new express.Router();

router.post('/api/order', [auth, verifyUserShop], async (req, res) => {
  req.body.deliveryDate = new Date(req.body.deliveryDate);
  const order = new Order({ ...req.body, shop: req.query.shopId });

  try {
    await order.save();
    await order.populate('customer').populate('billItems.item').execPopulate();
    res.status(201).send(order);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/api/order/:id', [auth, verifyUserShop], async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      shop: req.query.shopId,
    });
    await order.populate('customer').populate('billItems.item').execPopulate();
    res.send(order);
  } catch (e) {
    res.status(500).send();
  }
});

router.get('/api/orders', [auth, verifyUserShop], async (req, res) => {
  const startOfRange = new Date(req.query.startDate);

  let endOfRange;
  if (req.query.endDate) {
    endOfRange = new Date(req.query.endDate);
  } else {
    endOfRange = new Date(startOfRange.getTime());
    endOfRange = endOfRange.setDate(endOfRange.getDate() + 1);
  }

  try {
    const orders = await Order.find({
      $and: [
        { deliveryDate: { $gte: startOfRange } },
        { deliveryDate: { $lt: endOfRange } },
        { shop: { $eq: req.query.shopId } },
      ],
    }).sort('deliveryDate');

    const orderPromiseArr = [];
    orders.forEach(async (order) => {
      orderPromiseArr.push(
        order.populate('customer').populate('billItems.item').execPopulate()
      );
    });

    await Promise.all(orderPromiseArr);

    res.send(orders);
  } catch (e) {
    res.status(500).send();
  }
});

router.patch('/api/order/:id', [auth, verifyUserShop], async (req, res) => {
  const updates = Object.keys(req.body);
  if (req.body.deliveryDate) {
    req.body.deliveryDate = new Date(req.body.deliveryDate);
  }
  const allowedUpdates = [
    'customer',
    'completed',
    'billItems',
    'billAmount',
    'discount',
    'deliveryDate',
    'paymentCompleted',
    'deliveryCharges',
    'advancePayment',
    'pointsUsed',
    'discountType',
    'discountValue',
    'dollarToPointsMultiplier',
  ];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const order = await Order.findOne({
      _id: req.params.id,
      shop: req.query.shopId,
    });

    if (!order) {
      res.status(404).send();
    }
    updates.forEach((update) => {
      order[update] = req.body[update];
    });
    await order.save();
    await order.populate('customer').populate('billItems.item').execPopulate();
    res.send(order);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete('/api/order/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({
      _id: req.params.id,
      shop: req.query.shopId,
    });

    if (!order) {
      res.status(404).send();
    }
    res.send(order);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
