"use strict";

var debug = require('debug')('collider.js:messages');

/**
 * WebSocket message from the client.
 * @constructor
 * @param {stirng} cmd - Cmd.
 * @param {string} roomid - RoomID.
 * @param {string} clientid - ClientID
 * @param {string} msg - Msg
 */
function wsClientMsg(cmd, roomid, clientid, msg) {
  this.cmd = cmd;
  this.roomid = roomid;
  this.clientid = clientid;
  this.msg = msg;
}

/**
 * wsServerMsg is a message sent to a client on behalf of another client.
 * @constructor
 * @param {stirng} msg - Msg.
 * @param {string} errMsg - Error.
 */
function wsServerMsg(msg, errMsg) {
  this.msg = msg;
  this.error = errMsg;
}

// sendServerMsg sends a wsServerMsg composed from |msg| to the connection.
function sendServerMsg(ws, msg) {
  var m = new wsServerMsg(msg);
  send(ws, m);
}

// sendServerErr sends a wsServerMsg composed from |errMsg| to the connection.
function sendServerErr(ws, errMsg) {
  var m = new wsServerMsg(undefined, errMsg);
  send(ws, m);
}

// send writes a generic object as JSON to the websocket.
function send(ws, wsMsg) {
  var enc = JSON.stringify(wsMsg);
  ws.send(enc);
}

exports.wsClientMsg = wsClientMsg;
exports.wsServerMsg = wsServerMsg;
exports.sendServerMsg = sendServerMsg;
exports.sendServerErr = sendServerErr;
exports.send = send;
