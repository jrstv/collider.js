"use strict";

var debug = require('debug')('collider.js:room');
var Client = require('./client');

const maxRoomCapacity = 2;

class Room {
  /**
   * @constructor
   * @param {string} id - room id.
   * @param {Duration} to - default register timeout, ms.
   * @param {Callback} ecb - room empty callback.
   */
  constructor(id, to, ecb) {
    this.id = id;
    // A mapping from the client ID to the client object.
    this.clients = new Map();
    this.registerTimeout = to;
    this.ecb = ecb;
  }

  // client returns the client, or creates it if it does not exist and the room is not full.
  client(clientID) {
    var c = this.clients.get(clientID);
    if (c) return c;
    if (this.clients.size >= maxRoomCapacity) {
      debug("Room %s is full, not adding client %s", this.id, clientID);
      throw Error("Max room capacity reached");
    }

    c = new Client(clientID, setTimeout(() => this.removeIfUnregistered(c), this.registerTimeout));
    this.clients.set(clientID, c);
    debug("Added client %s to room %s", clientID, this.id);
    return c;
  }

  // register binds a client to the websocket.
  register(clientID, ws) {
    var c = this.client(clientID);
    c.register(ws);
    debug("Client %s registered in room %s", clientID, this.id);

    // Sends the queued messages from the other client of the room.
    if (this.clients.size > 1) {
      for (var oc of this.clients.values()) {
        if (oc.id !== clientID) oc.sendQueued(c);
      }
    }
  }

  // deregister clears the client's websocket registration.
  // We keep the client around until after a timeout, so that users roaming between networks can seamlessly reconnect.
  deregister(clientID, ws) {
    var c = this.clients.get(clientID);
    if (c && c.registeredOf(ws)) {
      c.deregister();
      c.setTimer(setTimeout(() => this.removeIfUnregistered(c), this.registerTimeout));
      debug("Deregistered client %s from room %s", clientID, this.id);
    }
  }

  // removeIfUnregistered removes the client if it has not registered.
  removeIfUnregistered(c) {
    debug("Remove client %s from room %s due to timeout", c.id, this.id);

    if (c === this.clients.get(c.id)) {
      if (!c.registered()) {
        this.clients.delete(c.id);
        if (this.empty() && this.ecb) this.ecb();
      }
    }
  }

  // send sends the message to the other client of the room, or queues the message if the other client has not joined.
  send(srcClientID, msg) {
    var src = this.client(srcClientID);
    if (this.clients.size === 1) return src.enqueue(msg);

    for (var oc of this.clients.values()) {
      if (oc.id !== srcClientID) return src.send(oc, msg);
    }
    throw Error("Corrupted room " + this.id);
  }

  // remove closes the client connection and removes the client specified by the |clientID|.
  remove(clientID) {
    var c = this.clients.get(clientID);
    if (!c) return;
    c.setTimer(null);
    c.deregister();
    this.clients.delete(clientID);

    debug("Removed client %s from room %s", clientID, this.id);
    if (this.empty() && this.ecb) this.ecb();
  }

  // empty returns true if there is no client in the room.
  empty() {
    return this.clients.size === 0;
  }

  wsCount() {
    var count = 0;
    for (var c of this.clients.values()) count += (c.registered() | 0);
    return count;
  }
}

module.exports = Room;
