const Shop = require('../models/shop');

const verifyUserShop = async (req, res, next) => {
  try {
    const shop = await Shop.findOne({ _id: req.query.shopId, user: req.user });
    if (!shop) {
      throw new Error();
    }
    req.shop = shop;
    next();
  } catch (e) {
    res.status(401).send({ error: 'Unauthorized to perform this action' });
  }
};

module.exports = verifyUserShop;
