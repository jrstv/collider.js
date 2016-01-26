"use strict";

var express = require('express');
var router = express.Router();

/* GET status. */
router.get('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET");

  var c = req.app.locals['collider'];
  var r = c.dash.getReport(c.roomTable);

  try {
    res.json(r);
  } catch (e) {
    res.status(500).json(e.message);
    c.httpError(e);
  }
});

module.exports = router;
