"use strict";

var assert = require('assert');
var util = require('util');
var MockWebSocket = require('./mock/mockwebsocket');
var Client = require('../lib/client');

describe('collider.js', () => {
  describe('Client', () => {
    it('create new Client', () => {
      var id = 'abc';
      var c = new Client(id, null);
      assert.equal(c.id, id);
      assert(!c.ws);
      assert.equal(c.msgs.length, 0);
    });

    it('registering the client twice will fail', () => {
      var id = 'abc';
      var c = new Client(id, null);
      var ws = new MockWebSocket();
      assert.doesNotThrow(() => c.register(ws));
      assert.equal(c.ws, ws);
      assert.throws(() => c.register(ws));
    });

    it('dummy', done => {
      done();
    });
  });
});
