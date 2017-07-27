var path = require('path'),
    express = require('express'),
    app = express(),
    glob = require('glob'),
    mongoose = require('mongoose');

const _db = "mongodb://127.0.0.1/shacker";
mongoose.connect(_db, { useMongoClient: true });
mongoose.Promise = Promise;

var db = mongoose.connection;

db.on('error', function () {
  throw new Error('unable to connect to database at ' + _db);
});

var models = glob.sync(__dirname + '/app/models/*.js');
models.forEach(function (model) {
  require(model);
});

db.on('open', (err) => {
  console.log("Let the shacking begin. \\m/");
  require("./index.js");
});
