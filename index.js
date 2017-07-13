const crawler = require('./controller/crawler.js');
      purifier = require('./controller/purifier.js'),
      utils = require('./controller/utils.js'),
      test = require('./test.js'),
      fs = require('fs'),
      _ = require("underscore");

const inputDataSet = test.shipments;
const shipments = utils.setDefaultCarrierUrl(inputDataSet);
let carriersShipment = utils.groupByCarrier(shipments);

carriersShipment = utils.splitCarrierShipments(carriersShipment);
let dataSet = [];
_.each(carriersShipment, (carrier) => {
  let url = carrier.url;
  const shipmentIds = utils.getKeyProperties(carrier.shipments, "trackingId");
  crawler.headlessCrawl(shipmentIds, url).then((content) => {
    purifier.extractDataSet(content, carrier.shipments).then((_dataSet) => {
      dataSet = dataSet.concat(_dataSet);
      if(dataSet.length == inputDataSet.length) {
        fs.writeFile("./_trackingOutput.json", JSON.stringify(dataSet, null, 2), function(err) {
          if(err) return console.log(err);
          console.log("shacking complete");
        });
      }
    });
  });
});
