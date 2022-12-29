const express = require('express');
require('./db/mongoose');
const cors = require('cors');
const path = require('path');
const userRouter = require('./routers/user');
const orderRouter = require('./routers/order');
const itemRouter = require('./routers/item');
const customerRouter = require('./routers/customer');
const shopRouter = require('./routers/shop');
const receiptRouter = require('./routers/receipt');
const reportRouter = require('./routers/reports');
const preferencesRouter = require('./routers/preferences');

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(userRouter);
app.use(orderRouter);
app.use(itemRouter);
app.use(customerRouter);
app.use(shopRouter);
app.use(receiptRouter);
app.use(reportRouter);
app.use(preferencesRouter);
app.use(express.static(path.join(__dirname, '../public')));

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is up on port ${port}`);
});
