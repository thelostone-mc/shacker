const crawler = require('./controller/crawler.js');
      purifier = require('./controller/purifier.js'),
      utils = require('./controller/utils.js');

const shipments = [
  {
    id: "LW377059748CN",
    zip: 77028
  },
  {
    id: "LK272056367CN",
    city: "LA"
  },
  {
    id: "LW431678671CN",
    city: "LA"
  }
];

const shipmentIds = utils.getKeyProperties(shipments, "id");

crawler.headlessCrawl(shipmentIds).then((content) => {
  console.log(purifier.extractDataSet(content, shipments));
});
