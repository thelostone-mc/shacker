const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var ShipmentSchema = new Schema({
  attackCaseId: String,
  carrier: String,
  url: String,
  intraCross: String,
  city: String,
  state: String,
  country: String,
  zip: String,
  trackingId: String,
  matchedBy: String,
  trackingId: String,
  flagStatus: String,
  latestEvent: String,
  start: String,
  end: String,
});

mongoose.model('Shipment', ShipmentSchema);
