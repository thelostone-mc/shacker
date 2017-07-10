const crawler = require('./controller/crawler.js');
      purifier = require('./controller/purifier.js'),
      utils = require('./controller/utils.js'),
      test = require('./test.js'),
      _ = require("underscore");

const shipments = utils.setDefaultCarrierUrl(test.shipments);
carriersShipment = utils.groupByCarrier(shipments);

_.each(carriersShipment, (carrier) => {
  let url = carrier.url;
  const shipmentIds = utils.getKeyProperties(carrier.shipments, "trackingId");
  crawler.headlessCrawl(shipmentIds, url).then((content) => {
    console.log(purifier.extractDataSet(content, shipments));
  });
});
