let cumulativeItemMap;
let cumulativeCustomerMap;
let perDayMap;
let weekdayMap;
let totalIncome;
let totalDeliveryIncome;
let totalItemsSold;

function initChartMapData(receipts, startOfRange, endOfRange, timeZone) {
  cumulativeItemMap = new Map();
  cumulativeCustomerMap = new Map();
  perDayMap = new Map();
  weekdayMap = new Map();
  totalIncome = 0;
  totalDeliveryIncome = 0;
  totalItemsSold = 0;

  receipts.forEach((receipt) => {
    totalIncome += receipt.billAmount;
    totalDeliveryIncome += receipt.deliveryCharges;
    let cCustomerMapData = cumulativeCustomerMap.get(receipt.customer.mobile);
    if (cCustomerMapData) {
      cCustomerMapData.cumulativeBillAmount += receipt.billAmount;
    } else {
      const data = {
        name: receipt.customer.name,
        cumulativeBillAmount: receipt.billAmount,
        itemsBought: new Map(),
      };
      cumulativeCustomerMap.set(receipt.customer.mobile, data);
      cCustomerMapData = cumulativeCustomerMap.get(receipt.customer.mobile);
    }
    receipt.billItems.forEach((billItem) => {
      totalItemsSold += billItem.quantity;
      let totalQuantity = cCustomerMapData.itemsBought.get(billItem.item.name);
      if (totalQuantity) {
        totalQuantity += billItem.quantity;
        cCustomerMapData.itemsBought.set(billItem.item.name, totalQuantity);
      } else {
        cCustomerMapData.itemsBought.set(billItem.item.name, billItem.quantity);
      }

      const cItemMapData = cumulativeItemMap.get(billItem.item.name);
      if (cItemMapData) {
        cItemMapData.totalQuantity += billItem.quantity;
        cItemMapData.cumulativeAmount +=
          billItem.quantity * billItem.itemPrice -
          (receipt.discount / 100) * (billItem.quantity * billItem.itemPrice);
        cumulativeItemMap.set(billItem.item.name, cItemMapData);
      } else {
        const data = {
          totalQuantity: billItem.quantity,
          cumulativeAmount:
            billItem.quantity * billItem.itemPrice -
            (receipt.discount / 100) * (billItem.quantity * billItem.itemPrice),
        };
        cumulativeItemMap.set(billItem.item.name, data);
      }
    });
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
    const currentDay = startDay.toLocaleDateString(undefined, {
      weekday: 'long',
      timeZone,
    });

    let totalIncomeForRange = 0;
    let totalCustomersForRange = 0;
    let totalItemsSoldForRange = 0;
    const itemSoldForRangeMap = new Map();

    currentRangeReceipts.forEach((receipt) => {
      totalIncomeForRange += receipt.billAmount;
      totalCustomersForRange += 1;
      receipt.billItems.forEach((billItem) => {
        totalItemsSoldForRange += billItem.quantity;
        const currentItemData = itemSoldForRangeMap.get(billItem.item.name);
        if (currentItemData) {
          currentItemData.totalQuantity += billItem.quantity;
          currentItemData.cumulativeAmount +=
            billItem.quantity * billItem.itemPrice -
            (receipt.discount / 100) * (billItem.quantity * billItem.itemPrice);
          itemSoldForRangeMap.set(billItem.item.name, currentItemData);
        } else {
          const data = {
            totalQuantity: billItem.quantity,
            cumulativeAmount:
              billItem.quantity * billItem.itemPrice -
              (receipt.discount / 100) *
                (billItem.quantity * billItem.itemPrice),
          };
          itemSoldForRangeMap.set(billItem.item.name, data);
        }
      });
    });
    const perDayMapData = {
      totalIncomeForRange,
      totalCustomersForRange,
      totalItemsSoldForRange,
      itemSoldForRangeMap,
    };
    perDayMap.set(
      startDay.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        timeZone,
      }),
      perDayMapData
    );

    let weekdayData = weekdayMap.get(currentDay);
    if (weekdayData) {
      weekdayData += totalIncomeForRange;
      weekdayMap.set(currentDay, weekdayData);
    } else {
      weekdayMap.set(currentDay, totalIncomeForRange);
    }
  }
}

function itemsSold() {
  const data = [];
  cumulativeItemMap.forEach((value, key) => {
    data.push({
      name: key,
      value: value.totalQuantity,
    });
  });
  return data;
}

function customerExpenditure() {
  const data = [];
  cumulativeCustomerMap.forEach((value, key) => {
    data.push({
      name: value.name,
      value: value.cumulativeBillAmount,
      mobile: key,
    });
  });
  return data;
}

function customerItems() {
  const data = [];
  cumulativeCustomerMap.forEach((value, key) => {
    const series = [];
    value.itemsBought.forEach((_value, _key) => {
      series.push({
        name: _key,
        value: _value,
      });
    });
    data.push({
      name: value.name,
      series,
      mobile: key,
    });
  });
  return data;
}

function incomePerItem() {
  const data = [];
  cumulativeItemMap.forEach((value, key) => {
    data.push({
      name: `${key} (${Math.floor(
        (value.cumulativeAmount / (totalIncome - totalDeliveryIncome)) * 100
      )}%)`,
      value: value.cumulativeAmount,
    });
  });
  return data;
}

function percentageIncomePerUnitItem() {
  const data = [];
  cumulativeItemMap.forEach((value, key) => {
    data.push({
      name: key,
      value:
        (value.cumulativeAmount /
          ((totalIncome - totalDeliveryIncome) * value.totalQuantity)) *
        100,
    });
  });
  return data;
}

function incomePerDay() {
  const data = [];
  const series = [];
  perDayMap.forEach((value, key) => {
    series.push({
      name: key,
      value: value.totalIncomeForRange,
    });
  });
  data.push({
    name: 'Income/Day',
    series,
  });
  return data;
}

function totalItemsPerDay() {
  const data = [];
  const series = [];
  perDayMap.forEach((value, key) => {
    series.push({
      name: key,
      value: value.totalItemsSoldForRange,
    });
  });
  data.push({
    name: 'No. of Items/Day',
    series,
  });
  return data;
}

function totalCustomersPerDay() {
  const data = [];
  const series = [];
  perDayMap.forEach((value, key) => {
    series.push({
      name: key,
      value: value.totalCustomersForRange,
    });
  });
  data.push({
    name: 'No. of Customers/Day',
    series,
  });
  return data;
}

function itemsSoldPerDay() {
  const data = [];
  cumulativeItemMap.forEach((_, key) => {
    const series = [];
    perDayMap.forEach((_value, _key) => {
      series.push({
        name: _key,
        value: _value.itemSoldForRangeMap.get(key)
          ? _value.itemSoldForRangeMap.get(key).totalQuantity
          : 0,
      });
    });
    data.push({
      name: key,
      series,
    });
  });
  return data;
}

function itemIncomePerDay() {
  const data = [];
  cumulativeItemMap.forEach((_, key) => {
    const series = [];
    perDayMap.forEach((_value, _key) => {
      series.push({
        name: _key,
        value: _value.itemSoldForRangeMap.get(key)
          ? _value.itemSoldForRangeMap.get(key).cumulativeAmount
          : 0,
      });
    });
    data.push({
      name: key,
      series,
    });
  });
  return data;
}

function incomeByWeekday() {
  const data = [];
  weekdayMap.forEach((value, key) => {
    data.push({
      name: key,
      value,
    });
  });
  return data;
}

function totalSummary() {
  return [
    {
      name: 'Item Income',
      value: Math.round((totalIncome - totalDeliveryIncome) * 100) / 100,
    },
    {
      name: 'Items Sold',
      value: totalItemsSold,
    },
    {
      name: 'Delivery Income',
      value: totalDeliveryIncome,
    },
  ];
}

function getChartData(receipts, startOfRange, endOfRange, timeZone) {
  initChartMapData(receipts, startOfRange, endOfRange, timeZone);
  return [
    {
      name: 'Total Summary',
      type: 'numberCard',
      data: totalSummary(),
    },
    {
      name: 'Income Per Weekday',
      type: 'pie',
      data: incomeByWeekday(),
    },
    {
      name: 'Total Customers Per Day',
      type: 'line',
      data: totalCustomersPerDay(),
      xAxisLabel: 'Date',
      yAxisLabel: 'No. of Customers',
    },
    {
      name: 'Individual Customer Expenditure',
      type: 'vBar',
      data: customerExpenditure(),
      xAxisLabel: 'Customer Name',
      yAxisLabel: 'Expenditure',
    },
    {
      name: 'Item Bought By Customers',
      type: 'stackedVBar',
      data: customerItems(),
      xAxisLabel: 'Customer Name',
      yAxisLabel: 'Number of Items',
    },
    {
      name: 'Individual Items Sold',
      type: 'vBar',
      data: itemsSold(),
      xAxisLabel: 'Items',
      yAxisLabel: 'Number of Items',
    },
    {
      name: 'Total Items Sold Per Day',
      type: 'line',
      data: totalItemsPerDay(),
      xAxisLabel: 'Date',
      yAxisLabel: 'Number of Items',
    },
    {
      name: 'Items Sold Per Day',
      type: 'multiLine',
      data: itemsSoldPerDay(),
      xAxisLabel: 'Date',
      yAxisLabel: 'Number of Items',
    },
    {
      name: 'Total Income Per Item',
      type: 'vBar',
      data: incomePerItem(),
    },
    {
      name: '% Income Per Unit Item',
      type: 'vBar',
      data: percentageIncomePerUnitItem(),
      xAxisLabel: 'Item',
      yAxisLabel: '% Income',
    },
    {
      name: 'Income Per Day',
      type: 'line',
      data: incomePerDay(),
      xAxisLabel: 'Date',
      yAxisLabel: 'Income',
    },
    {
      name: 'Items Income Per Day',
      type: 'multiLine',
      data: itemIncomePerDay(),
      xAxisLabel: 'Date',
      yAxisLabel: 'Income',
    },
  ];
}

module.exports = {
  getChartData,
};
