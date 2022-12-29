const express = require('express');
const Customer = require('../models/customer');
const auth = require('../middleware/auth');
const verifyUserShop = require('../middleware/verifyUserShop');
const Receipt = require('../models/receipt');
const purchaseReportFunctions = require('../shared/customerPurchaseReport');

const router = new express.Router();

router.post('/api/customer', [auth, verifyUserShop], async (req, res) => {
  const customer = new Customer({ ...req.body, shop: req.query.shopId });

  try {
    await customer.save();
    res.status(201).send(customer);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/api/customers', [auth, verifyUserShop], async (req, res) => {
  try {
    const customers = await Customer.find({
      shop: req.query.shopId,
      active: true,
    }).sort('name');
    res.send(customers);
  } catch (e) {
    res.status(500).send();
  }
});

router.get('/api/customer/:id', [auth, verifyUserShop], async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      shop: req.query.shopId,
      active: true,
    });
    res.send(customer);
  } catch (e) {
    res.status(500).send();
  }
});

router.patch('/api/customer/:id', [auth, verifyUserShop], async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    'name',
    'address',
    'email',
    'mobile',
    'birthday',
    'anniversary',
    'currentPoints',
  ];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      shop: req.query.shopId,
    });

    if (!customer) {
      res.status(404).send();
    }

    updates.forEach((update) => {
      customer[update] = req.body[update];
    });
    await customer.save();
    res.send(customer);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.patch(
  '/api/customer/remove/:id',
  [auth, verifyUserShop],
  async (req, res) => {
    try {
      const customer = await Customer.findOne({
        _id: req.params.id,
        shop: req.query.shopId,
        active: true,
      });

      if (!customer) {
        res.status(404).send();
      }
      customer.active = false;
      customer.name = `${customer.name}_${customer._id}_inactive`;
      customer.mobile = `${customer.mobile}_${customer._id}_inactive`;
      await customer.save();
      res.send(customer);
    } catch (e) {
      res.status(500).send();
    }
  }
);

router.delete('/api/customer/:id', [auth, verifyUserShop], async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({
      _id: req.params.id,
      shop: req.query.shopId,
    });

    if (!customer) {
      res.status(404).send();
    }

    res.send(customer);
  } catch (e) {
    res.status(500).send();
  }
});

router.get(
  '/api/customerPurchaseReport/:id',
  [auth, verifyUserShop],
  async (req, res) => {
    const startOfRange = new Date(req.query.startDate);

    let endOfRange;
    if (req.query.endDate) {
      endOfRange = new Date(req.query.endDate);
    } else {
      endOfRange = new Date(startOfRange.getTime());
      endOfRange = endOfRange.setDate(endOfRange.getDate() + 1);
    }

    let purchaseData = {
      purchaseSummary: [],
      receiptData: [],
    };

    try {
      const receipts = await Receipt.find({
        $and: [
          { deliveryDate: { $gte: startOfRange } },
          { deliveryDate: { $lt: endOfRange } },
          { 'shop._id': { $eq: req.query.shopId } },
          { 'customer._id': { $eq: req.params.id } },
        ],
      })
        .sort('deliveryDate')
        .lean();

      if (receipts.length) {
        purchaseData = purchaseReportFunctions.getPurchaseData(
          receipts,
          startOfRange,
          endOfRange,
          req.query.timeZone
        );
      }
      res.send(purchaseData);
    } catch (e) {
      res.status(500).send();
    }
  }
);

module.exports = router;
