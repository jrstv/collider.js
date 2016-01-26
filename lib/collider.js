"use strict";

var debug = require('debug')('collider.js:collider');
var RoomTable = require('./roomtable');
var Dashboard = require('./dashboard');

const registerTimeoutSec = 10;

class Collider {
  /**
   * @constructor
   */
  constructor() {
    this.roomTable = new RoomTable(registerTimeoutSec*1000);
    this.dash = new Dashboard();
  }

  httpError(err) {
    this.dash.onHttpErr(err);
  }

  wsError(err) {
    this.dash.onWsErr(err);
  }
}

module.exports = Collider;
