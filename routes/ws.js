"use strict";

var express = require('express');
var sendServerErr = require('../lib/messages').sendServerErr;

var router = express.Router();

/* GET /ws. */
router.get('/', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET");

  var c = req.app.locals['collider'];
  var e = Error('WebSocket Only');
  res.status(400).json(e.message);
  c.httpError(e);
});

/* WebSocket /ws. */
router.onUpgrade = (ws, app) => {
  var registered;
  var rid;
  var cid;
  var c = app.locals['collider'];

  // TODO: heartbeat support
  //
  ws.on('message', message => {
    try {
      var msg = JSON.parse(message);
    } catch (e) {
      return serr("JSON parse error: " + e.message);
    }

    switch (msg.cmd) {
      case 'register':
        return regws(msg);
      case 'send':
        return send(msg);
      default:
        return serr("Invalid message: unexpected 'cmd'");
    }
  });

  ws.once('error', e => {
    ws.close();
    c.wsError(e);
  });

  ws.once('close', () => {
    if (registered) c.roomTable.deregister(rid, cid, ws);
  });

  function regws(msg) {
    if (registered) return serr("Duplicated register request");
    if (!msg.roomid || !msg.clientid) {
      return serr("Invalid register request: missing 'clientid' or 'roomid'");
    }

    msg.roomid |= 0;
    msg.clientid |= 0;

    try {
      c.roomTable.register(msg.roomid, msg.clientid, ws);
    } catch (e) {
      return serr(e);
    }

    registered = true;
    rid = msg.roomid;
    cid = msg.clientid;
    c.dash.incrWs();
  }

  function send(msg) {
    if (!registered) return serr("Client not registered");
    if (!msg.msg) {
      return serr("Invalid send request: missing 'msg'");
    }
    c.roomTable.send(rid, cid, String(msg.msg || ''));
  }

  function serr(e) {
    if (!(e instanceof Error)) e = Error(e);
    sendServerErr(ws, e.message);
    ws.close();
    c.wsError(e);
  }
};

module.exports = router;
