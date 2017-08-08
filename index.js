const Shipment = require('./app/crud/Shipment'),
      ShipmentLog = require('./app/crud/ShipmentLog'),
      crawler = require('./app/controller/crawler.js'),
      purifier = require('./app/controller/purifier.js'),
      utils = require('./app/controller/utils.js'),
      promiseRetry = require('promise-retry'),
      schedule = require('node-schedule'),
      fs = require('fs'),
      _ = require("underscore");

const _input = './test.json';

const init = (newData) => {
  return new Promise((resolve, reject) => {
    Shipment.cleanUp(newData).then((fileRead) => {
      if(fileRead) {
        fs.readFile(_input, 'utf8', (err, data) => {
          if (err)
            throw err;
          const shipments = utils.caseUpper(JSON.parse(data));
          if(shipments) {
            Shipment.bulkInsert(shipments).then(() => {
              resolve();
            });
          }
          else {
            const error = "error: Invalid JSON input file";
            console.log(error);
            reject(error);
          }
        });
      } else {
        resolve();
      }
    }).catch((err) => {
      console.log("error:", err);
    });
  });
};

const beginShack = () => {
  return new Promise((resolve, reject) => {
    Shipment.getUntrackedShipments().then((inputDataSet) => {
      console.log("Input Size:", inputDataSet.length);

      const shipments = utils.setDefaultCarrierUrl(inputDataSet);
      let carriersShipment = utils.groupByCarrier(shipments);

      if(!utils.checkUnique(carriersShipment)) {
        reject("shipmentIds not unique");
      }

      carriersShipment = utils.splitCarrierShipments(carriersShipment);
      let dataSet = 0;

      _.each(carriersShipment, (carrier, i) => {
        setTimeout((i) => {
          let url = carrier.url;
          const shipmentIds = utils.getKeyProperties(carrier.shipments, "trackingId");

          promiseRetry((retry, number) => {
            if(number > 1) console.log("retrying: ", number, "Bucket: ", i);
            return crawler.headlessCrawl(shipmentIds, url).catch(retry);
          }).then((content) => {
            purifier.extractDataSet(content, carrier.shipments).then((_dataSet) => {
              dataSet += _dataSet.length;
              Shipment.bulkUpdate(_dataSet);
              console.log("shacker updated: ", dataSet);
              if(inputDataSet.length == dataSet) {
                resolve(Shipment.getTrackedShipments());
              }
            }).catch((err) => {
              console.log("error invoking extractDataSet", err);
            });
          });
        }, config.TIMEOUT * i, i);
      });
    });
  });
};

const writeToFile = (dataSet) => {
  ShipmentLog.bulkInsert(dataSet);
  fs.writeFile("./_trackingOutput.json", JSON.stringify(dataSet, null, 2), function(err) {
    if(err) {
      console.log(err);
      throw err;
    }
    console.log("shacker: written To file");
    Shipment.cleanUp();
    return;
  });
};

init(false).then(() => {
  beginShack().then((shipments) => {
    writeToFile(shipments);
  });
}).catch((err) => {
  console.log("error:", err);
});

schedule.scheduleJob('0 0 * * *', function() {
  const newData = true;
  init(newData).then(() => {
    beginShack().then((shipments) => {
      writeToFile(shipments);
    });
  }).catch((err) => {
    console.log("error:", err);
  });
});
