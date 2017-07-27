const _ = require("underscore");

const SPLIT_LIMIT = 40;

const caseUpper = (shipments) => {
  _.each(shipments, (shipment) => {
    shipment.trackingId = shipment.trackingId.toUpperCase();
  });
  return shipments;
}

const getKeyProperties = (array, property) => {
  let list = [];
  array.forEach((object) => {
    if(!object[property]) {
      console.log("getKeyProperties: Unable to find", property, "in", object);
    }
    else {
      list.push(object[property]);
    }
  })
  return list;
};

const matchString = (string, matcher) => {
  if(!matcher || !string)
    return false;

  const pattern = new RegExp(matcher.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1"), "i");
  return string.match(pattern);
};

const setDefaultCarrierUrl = (shipments) => {
  _.each(shipments, (shipment) => {
    if(!shipment.url) {
      shipment.url = "https://www.17track.net/en/track?nums=";
      shipment.carrier = "AUTO"
    }
  })
  return shipments;
};

const groupByCarrier = (shipments) => {
  return _.chain(shipments).groupBy('url').map(function(value, key) {
    return {
        "url": key,
        "shipments": value
    }
  }).value();
};

const splitCarrierShipments = (shipments) => {
  let _shipments = [];
  _.each(shipments, (carriersShipment, index) => {
    const url = carriersShipment.url;
    const shipments = carriersShipment.shipments;
    if(shipments.length / SPLIT_LIMIT > 0) {
      const buckets = Math.ceil(shipments.length / SPLIT_LIMIT);

      for (let i = 0; i < buckets; i++) {
        const shipment = {
          url: url,
          shipments: shipments.splice(0, SPLIT_LIMIT)
        };
        _shipments.push(shipment);
      }

    } else {
      _shipments.push(carriersShipment);
    }
  });

  return _shipments;
}

const uniqueTrackingId = (shipments) => {
  let ids = [];
  _.each(shipments, (_shipment) => {
    ids.push(_shipment.trackingId);
  });
  return _.uniq(ids);
}

module.exports =  {
  caseUpper,
  getKeyProperties,
  matchString,
  setDefaultCarrierUrl,
  groupByCarrier,
  splitCarrierShipments,
  uniqueTrackingId
}
