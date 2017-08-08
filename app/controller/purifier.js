const cheerio = require('cheerio'),
      utils = require('./utils.js');;

const extractDataSet = (content, _shipments) => {
  return new Promise((resolve, reject) => {
    const $ = cheerio.load(content);
    let shipments = [];

    if(!$('.jsResultBlock').text()) {
      const msg = "extractDataUnit: No results found";
      console.log(_shipments);
      console.log(msg);
      reject(msg);
    }

    $('.jsResultBlock').filter((i, shipment) => {
      if(!_shipments[i].zip && !_shipments[i].city &&
        !_shipments[i].state && !_shipments[i].country) {
        console.log("extractDataSet: zip, city, state and country not provided:",
          _shipments[i].trackingId);
      }
      else {
        shipments.push(fetchDataPoint($.html(shipment), _shipments[i]));
      }
    });

    resolve(shipments);
  });
};


const fetchDataPoint = (content, _shipment) => {
  const $ = cheerio.load(content);
  let shipment = {
    attackCaseId: _shipment.attackCaseId,
    carrier: _shipment.carrier,
    url: _shipment.url,
    intraCross: _shipment.intraCross,
    city: _shipment.city,
    state: _shipment.state,
    country: _shipment.country,
    matchZipState: "NA",
    matchedBy:  "NA",
    tracked: true
  }

  if($('.track-number').text()) {
    shipment.trackingId = $('.track-number').text();
  } else {
    console.log("extractDataSet: unable to get trackingId");
  }

  if($('.flag-status').text()) {
    shipment.flagStatus = $('.flag-status').text();

    if(shipment.flagStatus == "Not Found") {
        return shipment;
    }
  } else {
    console.log("extractDataSet: unable to get flagStatus for",
      shipment.trackingId);
  }

  if($('.newest').text()) {
    shipment.latestEvent = $('.newest').text();
    if(shipment.flagStatus.startsWith('Delivered')) {
      if(utils.matchString(shipment.latestEvent, _shipment.zip)) {
        shipment.matchZipState = true;
        shipment.matchedBy = "zip";
      } else if(utils.matchString(shipment.latestEvent, _shipment.city)) {
        shipment.matchZipState = true;
        shipment.matchedBy = "city";
      } else if(utils.matchString(shipment.latestEvent, _shipment.state)) {
        shipment.matchZipState = true;
        shipment.matchedBy = "state";
      } else if(utils.matchString(shipment.latestEvent, _shipment.country)) {
        shipment.matchZipState = true;
        shipment.matchedBy = "country";
      } else {
        shipment.matchZipState = false;
      }
    }
  } else {
    console.log("extractDataSet: unable to get latestEvent",
      shipment.trackingId);
  }

  const locations = $('.country');
  if(locations[0].attribs.title && locations[1].attribs.title) {
    shipment.start = locations[0].attribs.title;
    shipment.end = locations[1].attribs.title;
  } else {
    console.log("extractData: unable to get countries", shipment.trackingId);
  }

  return shipment;
}

module.exports =  {
  extractDataSet
}
