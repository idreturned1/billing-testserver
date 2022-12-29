const express = require('express');
const Shop = require('../models/shop');
const auth = require('../middleware/auth');
const getUploadFileMiddleware = require('../shared/uploadFile');

const router = new express.Router();

router.post('/api/shop', auth, async (req, res) => {
  const shop = new Shop({
    ...req.body,
    user: req.user._id,
  });

  try {
    await shop.save();
    res.status(201).send(shop);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post('/api/shop/logo/:id', auth, async (req, res) => {
  try {
    const shop = await Shop.findOne({ _id: req.params.id, user: req.user._id });
    const uploadConfig = {
      dirName: 'shopLogos',
      fileName: `logo_${shop.id}`,
      fileFilter: /\.(jpg|jpeg|png)$/,
      propertyName: 'shopLogo',
    };
    const uploadFile = getUploadFileMiddleware(uploadConfig);
    await uploadFile(req, res);

    if (!req.file) {
      res.status(400).send('Please upload a file');
    }

    shop.logo = `/assets/shopLogos/${req.file.filename}`;
    await shop.save();

    res.status(200).send(shop.logo);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get('/api/shops', auth, async (req, res) => {
  try {
    const shops = await Shop.find({ user: req.user._id }).sort('name');
    res.send(shops);
  } catch (e) {
    res.status(500).send();
  }
});

router.get('/api/shop/:id', auth, async (req, res) => {
  try {
    const shop = await Shop.findOne({ _id: req.params.id, user: req.user._id });
    res.send(shop);
  } catch (e) {
    res.status(500).send();
  }
});

router.patch('/api/shop/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'address', 'email', 'mobile'];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    const shop = await Shop.findOne({ _id: req.params.id, user: req.user._id });

    if (!shop) {
      res.status(404).send();
    }
    updates.forEach((update) => {
      shop[update] = req.body[update];
    });
    await shop.save();
    res.send(shop);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete('/api/shop/:id', auth, async (req, res) => {
  try {
    const shop = await Shop.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!shop) {
      res.status(404).send();
    }
    res.send(shop);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
