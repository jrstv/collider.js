"use strict";

var express = require('express');
var router = express.Router();

router.all('/*/*', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST, DELETE");

  if (req.method === 'POST' || req.method === 'DELETE') {
    res.type('text/plain');
  }
  next();
});

/* POST message. */
router.post('/:room/:client', (req, res, next) => {
  var c = req.app.locals['collider'];
  var rid = req.params.room | 0;
  var cid = req.params.client | 0;
  var m = String(req.body || '');

  if (!m) {
    var e = Error('Empty request body');
    res.status(400).send(e.message);
    return c.httpError(e);
  }

  try {
    c.roomTable.send(rid, cid, m);
  } catch (e) {
    res.status(500).send("Failed to send the message: " + e.message);
    return c.httpError(e);
  }

  res.send('OK\n');
});

/* DELETE client. */
router.delete('/:room/:client', (req, res, next) => {
  var c = req.app.locals['collider'];
  var rid = req.params.room | 0;
  var cid = req.params.client | 0;

  c.roomTable.remove(rid, cid);
  res.send('OK\n');
});

module.exports = router;
