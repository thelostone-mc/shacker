const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var ShipmentLogSchema = new Schema({
  attackCaseId: String,
  carrier: String,
  intraCross: String,
  city: String,
  state: String,
  country: String,
  trackingId: String,
  matchedBy: String,
  trackingId: String,
  flagStatus: String,
  latestEvent: String,
  start: String,
  end: String,
  entryDate: String,
});

mongoose.model('ShipmentLog', ShipmentLogSchema);
