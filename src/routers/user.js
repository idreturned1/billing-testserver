const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');
const findByCredentials = require('../middleware/findByCredential');

const router = new express.Router();
const _tokenType = require('../shared/tokenType');

router.post('/api/user/register', async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    const accessToken = await user.generateAuthToken();
    const tokenType = _tokenType.BEARER;
    res.status(201).send({ username: user.username, accessToken, tokenType });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post('/api/user/login', async (req, res) => {
  try {
    const user = await findByCredentials(req.body.username, req.body.password);
    const accessToken = await user.generateAuthToken();
    const tokenType = _tokenType.BEARER;
    res.status(200).send({ username: user.username, accessToken, tokenType });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post('/api/user/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.post('/api/user/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.get('/api/user/me', auth, async (req, res) => {
  res.send(req.user);
});

router.patch('/api/user/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['username', 'email', 'password'];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    updates.forEach((update) => {
      req.user[update] = req.body[update];
    });
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete('/api/user/me', auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
