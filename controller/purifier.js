const cheerio = require('cheerio'),
      utils = require('./utils.js');;

const extractDataSet = (content, _shipments) => {
  return new Promise((resolve, reject) => {
    const $ = cheerio.load(content);
    let shipments = [];

    if(!$('.jsResultBlock').text()) {
      console.log("extractDataUnit: No results found");
    }

    $('.jsResultBlock').filter((i, shipment) => {
      const matchId = _shipments[i].zip ? _shipments[i].zip : _shipments[i].city;
      if(!matchId) {
        console.log("extractDataSet: zip / city not provided:",
          _shipments[i].id);
      }
      else {
        shipments.push(fetchDataPoint($.html(shipment), matchId));
      }
    });

    resolve(shipments);
  });
};


const fetchDataPoint = (content, matchId) => {
  const $ = cheerio.load(content);
  let shipment = {};

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
      shipment.zip_state = utils.matchString(shipment.latestEvent, matchId);
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
