const _ = require("underscore"),
      moment = require("moment"),
      config = require("../../config");

const addDate = (shipments) => {
  const currentDate = moment().format("l");
  let _shipmentsLog = [];
  _.each(shipments, (shipment) => {
    const _shipment = {
      "attackCaseId": shipment.attackCaseId,
      "carrier": shipment.carrier,
      "url": shipment.url,
      "intraCross": shipment.intraCross,
      "city": shipment.city,
      "state": shipment.state,
      "country": shipment.country,
      "zip": shipment.zip,
      "matchZipState": shipment.matchZipState,
      "matchedBy": shipment.matchedBy,
      "tracked": shipment.tracked,
      "trackingId": shipment.trackingId,
      "flagStatus": shipment.flagStatus,
      "latestEvent": shipment.latestEvent,
      "start": shipment.start,
      "end": shipment.end,
      "entryDate":  currentDate,
    };
    _shipmentsLog.push(_shipment);
  });
  return _shipmentsLog;
};

const caseUpper = (shipments) => {
  _.each(shipments, (shipment) => {
    shipment.trackingId = shipment.trackingId
                            .replace(/[\u{0080}-\u{FFFF}]/gu,"")
                            .toUpperCase();
  });
  return shipments;
};

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
    if(shipments.length / config.SPLIT_LIMIT > 0) {
      const buckets = Math.ceil(shipments.length / config.SPLIT_LIMIT);

      for (let i = 0; i < buckets; i++) {
        const shipment = {
          url: url,
          shipments: shipments.splice(0, config.SPLIT_LIMIT)
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

const checkUnique = (carriersShipment) => {
  _.each(carriersShipment, (carrier, i) => {
    const uniqueIds = uniqueTrackingId(carrier.shipments);
    if(carrier.shipments.length != uniqueIds.length) {
      console.log(
        "Shipping Ids within carrier", carrier.url, "is not unique",
        "Input Ids:", carrier.shipments.length,
        "UniqueIds:", uniqueIds.length
      );
      return false;
    }
  });
  return true;
}

module.exports =  {
  addDate,
  caseUpper,
  getKeyProperties,
  matchString,
  setDefaultCarrierUrl,
  groupByCarrier,
  splitCarrierShipments,
  uniqueTrackingId,
  checkUnique
}
