const mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      utils = require('../controller/utils'),
      ShipmentLog = mongoose.model('ShipmentLog');

const bulkInsert = (shipments) => {
  return new Promise((resolve, reject) => {
    resolve(utils.addDate(shipments));
  }).then((_shipments) => {
    ShipmentLog.collection.insert(_shipments, (err) => {
      if(err)
        console.log("ShipmentLog: bulkInsert failed ");
    });
  });
};

module.exports =  {
  bulkInsert
}
