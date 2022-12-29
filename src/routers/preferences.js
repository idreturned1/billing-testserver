const express = require('express');
const Preferences = require('../models/preferences');
const auth = require('../middleware/auth');
const verifyUserShop = require('../middleware/verifyUserShop');

const router = new express.Router();

router.get('/api/preferences', [auth, verifyUserShop], async (req, res) => {
  try {
    const preferences = await Preferences.findOne({
      shop: req.query.shopId,
    });
    if (preferences) {
      res.send(preferences);
    } else {
      const newPreferences = new Preferences({ shop: req.query.shopId });
      await newPreferences.save();
      res.send(newPreferences);
    }
  } catch (e) {
    res.status(500).send();
  }
});

router.patch('/api/preferences', [auth, verifyUserShop], async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    'dollarToPointsMultiplier',
    'applyAutoDiscount',
    'autoDiscountAmount',
  ];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    let preferences = await Preferences.findOne({
      shop: req.query.shopId,
    });

    if (!preferences) {
      preferences = new Preferences({ shop: req.query.shopId });
      await preferences.save();
    }
    updates.forEach((update) => {
      preferences[update] = req.body[update];
    });
    await preferences.save();
    res.send(preferences);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
