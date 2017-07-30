const mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      Shipment = mongoose.model('Shipment'),
      util = require('util');

const getShipments =  () => {
  return new Promise((resolve, reject) => {
    Shipment.find({}, { _id: 0}, (err, shipments) => {
      if(err) {
        console.log("getShipments: error fetching from DB");
        reject(err);
      }
      resolve(shipments);
    });
  });
};

const getTrackedShipments =  () => {
  return new Promise((resolve, reject) => {
    Shipment.find({ tracked: { $exists: true }},
        { _id: 0}, (err, shipments) => {
      if(err) {
        console.log("getShipments: error fetching from DB");
        reject(err);
      }
      resolve(shipments);
    });
  });
};

const getUntrackedShipments =  () => {
  return new Promise((resolve, reject) => {
    Shipment.find({ tracked: { $exists: false }},
        { _id: 0}, (err, shipments) => {
      if(err) {
        console.log("getShipments: error fetching from DB");
        reject(err);
      }
      resolve(shipments);
    });
  });
};

const getCount = () => {
  return new Promise((resolve, reject) => {
    Shipment.count({}, (err, count) => {
      if(err) reject(err);
      resolve(count);
    });
  });
};

const insertOne = (shipment) => {
  Shipment.collection.save(shipment, (err) => {
    if(err)
      throw (err);
  });
};

const bulkInsert = (shipments) => {
  return new Promise((resolve, reject) => {
    Shipment.collection.insert(shipments, (err) => {
      if(err)
        reject(err);
      console.log("Bulk Insert Done!");
      resolve();
    });
  });
};

const bulkUpsert = (shipments) => {
  const bulk = Shipment.collection.initializeUnorderedBulkOp();
  shipments.map((shipment) => {
    bulk.find( {trackingId: shipment.trackingId} ).upsert().replaceOne(shipment);
  });
  bulk.execute().then((x) => {
    console.log("Bulk Upsert done !");
  });
};

const bulkUpdate = (shipments) => {
  const bulk = Shipment.collection.initializeUnorderedBulkOp();
  shipments.map((shipment) => {
    bulk.find( {trackingId: shipment.trackingId} ).replaceOne(shipment);
  });
  bulk.execute().then((x) => {
    console.log("Bulk Update done !");
  });
};

const cleanUp = (newData) => {
  let fileRead = true;
  return new Promise((resolve, reject) => {
    if(newData) {
      resolve(fileRead);
    } else {
      getCount().then((count) => {
        if(count != 0) {
          getUntrackedShipments().then((_shipments) => {
            if(_shipments.length == 0) {
              console.log("test: DB cleanup");
              Shipment.collection.drop((err) => {
                if (err) {
                  console.log("cleanUp: failed to drop collection");
                  reject(err);
                }
                resolve(fileRead);
              });
            } else {
              console.log("test: no clean server crashed");
              fileRead = false;
              resolve(fileRead);
            }
          });
        } else {
          console.log("test: no clean as count = 0");
          resolve(fileRead);
        }
      });
    }
  });
};

module.exports =  {
  getShipments,
  getTrackedShipments,
  getUntrackedShipments,
  insertOne,
  getCount,
  bulkInsert,
  bulkUpsert,
  bulkUpdate,
  cleanUp
}
