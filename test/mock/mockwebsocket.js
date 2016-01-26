"use strict";

class MockWebSocket {
  constructor() {
    this.Msg = null;
    this.Closed = false;
  }

  send(data) {
    this.Msg = data;
    return new Buffer(data).length;
  }

  close() {
    this.Closed = true;
  }
}

module.exports = MockWebSocket;
