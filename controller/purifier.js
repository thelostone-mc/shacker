const cheerio = require('cheerio');

const extractDataUnit = (content) => {
  return new Promise((resolve, reject) => {
    const shipment = fetchDataPoint(content);
    resolve(shipment);
  });
};

const extractDataSet = (content) => {
  return new Promise((resolve, reject) => {
    const $ = cheerio.load(content);
    let shipments = [];

    if(!$('.jsResultBlock').text()) {
      console.log("extractDataUnit: No results found");
    }

    $('.jsResultBlock').filter((i, shipment) => {
      shipments.push(fetchDataPoint($.html(shipment)));
    });

    resolve(shipments);
  });
};


const fetchDataPoint = (content) => {
  const $ = cheerio.load(content);
  let shipment = {};

  if($('.track-number').text()) {
    shipment.trackingId = $('.track-number').text();
  } else {
    console.log("extractDataSet: unable to get trackingId");
  }

  if($('.flag-status').text()) {
    shipment.flagStatus = $('.flag-status').text();
  } else {
    console.log("extractDataSet: unable to get flagStatus for",
      shipment.trackingId);
  }

  if($('.newest').text()) {
    shipment.latestEvent = $('.newest').text();
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
  extractDataUnit,
  extractDataSet
}
