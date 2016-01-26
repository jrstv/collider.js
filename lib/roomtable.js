"use strict";

var debug = require('debug')('collider.js:roomtable');
var Room = require('./room');

/**
 * A table of Rooms.
 */
class RoomTable {
  /**
   * @constructor
   * @param {Duration} to - default register timeout, ms.
   */
  constructor(to) {
    this.rooms = new Map();
    this.registerTimeout = to;
  }

  // room returns the room specified by |id|, or creates the room if it does not exist.
  room(id) {
    var r = this.rooms.get(id);
    if (r) return r;

    r = new Room(id, this.registerTimeout, () => {
      this.rooms.delete(id);
      debug("Removed room %s", id);
    });

    this.rooms.set(id, r);
    debug("Created room %s", id);
    return r;
  }

  // remove forwards the remove request to the room. If the room becomes empty, it also removes the room.
  remove(rid, cid) {
    var r = this.rooms.get(rid);
    if (r) r.remove(cid);
  }

  // send forwards the message to the room. If the room does not exist, it will create one.
  send(rid, srcId, msg) {
    var r = this.room(rid);
    r.send(srcId, msg);
  }

  // register forwards the register request to the room. If the room does not exist, it will create one.
  register(rid, cid, ws) {
    var r = this.room(rid);
    r.register(cid, ws);
  }

  // deregister forwards the register request to the room to clears the client's websocket registration.
  deregister(rid, cid, ws) {
    var r = this.rooms.get(rid);
    if (r) r.deregister(cid, ws);
  }

  wsCount() {
    var count = 0;
    for (var r of this.rooms.values()) count += r.wsCount();
    return count;
  }
}

module.exports = RoomTable;
