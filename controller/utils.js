const _ = require("underscore");

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
  return string.includes(matcher);
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

module.exports =  {
  getKeyProperties,
  matchString,
  setDefaultCarrierUrl,
  groupByCarrier
}
