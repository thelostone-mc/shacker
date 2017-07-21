const crawler = require('./controller/crawler.js');
      purifier = require('./controller/purifier.js'),
      utils = require('./controller/utils.js'),
      promiseRetry = require('promise-retry'),
      test = require('./test.js'),
      fs = require('fs'),
      _ = require("underscore");

const TIMEOUT = 120000;

const inputDataSet = test.shipments;
const uniqueIds = utils.uniqueTrackingId(inputDataSet);

console.log("Input Size: ", uniqueIds.length);

const shipments = utils.setDefaultCarrierUrl(inputDataSet);
let carriersShipment = utils.groupByCarrier(shipments);

carriersShipment = utils.splitCarrierShipments(carriersShipment);
let dataSet = [];

_.each(carriersShipment, (carrier, i) => {
  setTimeout((i) => {
    let url = carrier.url;
    const shipmentIds = utils.getKeyProperties(carrier.shipments, "trackingId");

    promiseRetry((retry, number) => {
      if(number > 1) console.log("retrying: ", number, "Bucket: ", i);
      return crawler.headlessCrawl(shipmentIds, url).catch(retry);
    }).then(async (content) => {
      purifier.extractDataSet(content, carrier.shipments).then((_dataSet) => {
        dataSet = dataSet.concat(_dataSet);
        fs.writeFile("./_trackingOutput.json", JSON.stringify(dataSet, null, 2), function(err) {
          if(err) return console.log(err);
          console.log("shacker updated: ", dataSet.length);
        });
      });
    });
  }, TIMEOUT * i, i);
});
