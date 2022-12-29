const express = require('express');
const Item = require('../models/item');
const auth = require('../middleware/auth');
const verifyUserShop = require('../middleware/verifyUserShop');

const router = new express.Router();

router.post('/api/item', [auth, verifyUserShop], async (req, res) => {
  const item = new Item({ ...req.body, shop: req.query.shopId });

  try {
    await item.save();
    res.status(201).send(item);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get('/api/items', [auth, verifyUserShop], async (req, res) => {
  try {
    const items = await Item.find({
      shop: req.query.shopId,
      active: true,
    }).sort('name');
    res.send(items);
  } catch (e) {
    res.status(500).send();
  }
});

router.get('/api/item/:id', [auth, verifyUserShop], async (req, res) => {
  try {
    const items = await Item.findOne({
      _id: req.params.id,
      shop: req.query.shopId,
      active: true,
    });
    res.send(items);
  } catch (e) {
    res.status(500).send();
  }
});

router.patch('/api/item/:id', [auth, verifyUserShop], async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'description', 'price'];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const item = await Item.findOne({
      _id: req.params.id,
      shop: req.query.shopId,
    });

    if (!item) {
      res.status(404).send();
    }
    updates.forEach((update) => {
      item[update] = req.body[update];
    });
    await item.save();
    res.send(item);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.patch(
  '/api/item/remove/:id',
  [auth, verifyUserShop],
  async (req, res) => {
    try {
      const item = await Item.findOne({
        _id: req.params.id,
        shop: req.query.shopId,
        active: true,
      });

      if (!item) {
        res.status(404).send();
      }
      item.active = false;
      item.name = `${item.name}_${item._id}_inactive`;
      await item.save();
      res.send(item);
    } catch (e) {
      res.status(500).send();
    }
  }
);

router.delete('/api/item/:id', [auth, verifyUserShop], async (req, res) => {
  try {
    const item = await Item.findOneAndDelete({
      _id: req.params.id,
      shop: req.query.shopId,
    });

    if (!item) {
      res.status(404).send();
    }
    res.send(item);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
