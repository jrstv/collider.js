"use strict";

var debug = require('debug')('collider.js:dashboard');
var RoomTable = require('./roomtable');

const maxErrLogLen = 128;

/**
 * Status Report
 * @constructor
 */
function statusReport(upsec, openws, totalws, wserrors, httperrors) {
  this.upsec = upsec;
  this.openws = openws;
  this.totalws = totalws;
  this.wserrors = wserrors;
  this.httperrors = httperrors;
}

/**
 * Dashboard
 */
class Dashboard {
  /**
   * @constructor
   */
  constructor(to) {
    this.startTime = Date.now();
    this.totalWs = 0;
    this.totalRecvMsgs = 0;
    this.totalSendMsgs = 0;
    this.wsErrs = 0;
    this.httpErrs = 0;
  }

  /**
   * Get room table's report
   * @param {RoomTable} rs - room table.
   */
  getReport(rs) {
    var uptime = (Date.now() - this.startTime) / 1000 | 0;
    return new statusReport(uptime, rs.wsCount(), this.totalWs, this.wsErrs, this.httpErrs);
  }

  incrWs() {
    ++this.totalWs;
  }

  onWsErr(err) {
    ++this.wsErrs;
  }

  onHttpErr(err) {
    ++this.httpErrs;
  }
}

module.exports = Dashboard;
