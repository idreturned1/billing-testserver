let totalIncome;
let totalPointsUsed;
let totalItemsSold;
let orderAmountArr;
let perDayMap;

function initPurchaseData(receipts, startOfRange, endOfRange, timeZone) {
  perDayMap = new Map();
  totalIncome = 0;
  totalPointsUsed = 0;
  totalItemsSold = 0;
  orderAmountArr = [];

  receipts.forEach((receipt) => {
    totalIncome += receipt.billAmount;
    totalPointsUsed += receipt.pointsUsed;
    orderAmountArr.push(receipt.billAmount);
  });

  for (
    let startDay = startOfRange;
    startDay < endOfRange;
    startDay.setDate(startDay.getDate() + 1)
  ) {
    const nextDay = new Date(startDay.getTime());
    nextDay.setDate(nextDay.getDate() + 1);
    const currentRangeReceipts = receipts.filter(
      (receipt) =>
        receipt.deliveryDate >= startDay && receipt.deliveryDate < nextDay
    );

    perDayMap.set(
      startDay.toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        year: 'numeric',
        timeZone,
      }),
      currentRangeReceipts
    );
  }
}

function getReceiptsData() {
  const data = [];
  perDayMap.forEach((value, key) => {
    if (value && value.length) {
      data.push({
        date: key,
        receipts: value,
      });
    }
  });
  return data;
}

function getPurchaseData(receipts, startOfRange, endOfRange, timeZone) {
  initPurchaseData(receipts, startOfRange, endOfRange, timeZone);
  return {
    purchaseSummary: [
      {
        id: 'totalAmountSpent',
        title: 'Total Amount Spent',
        value: totalIncome,
        prefix: '$',
      },
      {
        id: 'totalPointsReceived',
        title: 'Total Points Received',
        value: Math.round(totalIncome),
      },
      {
        id: 'totalOrdersPlaced',
        title: 'Total Orders Placed',
        value: receipts.length,
      },
      {
        id: 'totalPointsUsed',
        title: 'Total Points Used',
        value: totalPointsUsed,
      },
      {
        id: 'totalItemsPurchased',
        title: 'Total Items Purchased',
        value: totalItemsSold,
      },
      {
        id: 'highestValueOrder',
        title: 'Highest Value Order',
        value: Math.max(...orderAmountArr),
        prefix: '$',
      },
      {
        id: 'lowestValueOrder',
        title: 'Lowest Value Order',
        value: Math.min(...orderAmountArr),
        prefix: '$',
      },
      {
        id: 'averageOrderAmount',
        title: 'Average Order Amount',
        value:
          orderAmountArr.reduce((a, b) => a + b, 0) / orderAmountArr.length ||
          0,
        prefix: '$',
      },
    ],
    receiptData: getReceiptsData(),
  };
}

module.exports = {
  getPurchaseData,
};
