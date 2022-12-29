const express = require('express');
const Receipt = require('../models/receipt');
const auth = require('../middleware/auth');
const verifyUserShop = require('../middleware/verifyUserShop');
const chartFunctions = require('../shared/chartFunctions');

const router = new express.Router();

router.get('/api/reports', [auth, verifyUserShop], async (req, res) => {
  const startOfRange = new Date(req.query.startDate);

  let endOfRange;
  if (req.query.endDate) {
    endOfRange = new Date(req.query.endDate);
  } else {
    endOfRange = new Date(startOfRange.getTime());
    endOfRange = endOfRange.setDate(endOfRange.getDate() + 1);
  }

  let chartData = [];

  try {
    const receipts = await Receipt.find({
      $and: [
        { deliveryDate: { $gte: startOfRange } },
        { deliveryDate: { $lt: endOfRange } },
        { 'shop._id': { $eq: req.query.shopId } },
      ],
    }).lean();
    if (receipts.length) {
      chartData = chartFunctions.getChartData(
        receipts,
        startOfRange,
        endOfRange,
        req.query.timeZone
      );
    }
    res.send(chartData);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
