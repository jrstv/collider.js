"use strict";

var debug = require('debug')('collider.js:client');
var sendServerMsg = require('./messages').sendServerMsg;

const maxQueuedMsgCount = 1024;

class Client {
  /**
   * @constructor
   * @param {stirng} id - client id.
   * @param {Timer} t - register timeout timer.
   */
  constructor(id, t) {
    this.id = id;
    this.ws = null;
    this.msgs = [];
    this.timer = t;
  }

  setTimer(t) {
    if (this.timer) clearTimeout(this.timer);
    this.timer = t;
  }

  // register binds the websocket to the client if it's not done yet.
  register(ws) {
    if (this.ws) {
      debug("Not registering because the client %s already has a connection", this.id);
      throw Error("Duplicated registration");
    }
    this.setTimer(null);
    this.ws = ws;
  }

  // deregister closes the websocket if it exists.
  deregister() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // registered returns true if the client has registered.
  registered() {
    return this.ws !== null;
  }

  // registered returns true if the client has registered with that ws.
  registeredOf(ws) {
    return this.ws === ws;
  }

  // enqueue adds a message to the client's message queue.
  enqueue(msg) {
    if (this.msgs.length >= maxQueuedMsgCount) {
      throw Error("Too many messages queued for the client");
    }
    this.msgs.push(msg);
  }

  // sendQueued the queued messages to the other client.
  sendQueued(otherClient) {
    if (this.id === otherClient.id || !otherClient.ws) {
      throw Error("Invalid client");
    }
    for (var m of this.msgs) sendServerMsg(otherClient.ws, m);
    this.msgs = [];
    debug("Sent queued messages from %s to %s", this.id, otherClient.id);
  }

  // send sends the message to the other client if the other client has registered,
  // or queues the message otherwise.
  send(otherClient, msg) {
    if (this.id === otherClient.id) {
      throw Error("Invalid client");
    }
    if (otherClient.ws) return sendServerMsg(otherClient.ws, msg);
    this.enqueue(msg);
  }
}

module.exports = Client;
