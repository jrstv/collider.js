"use strict";

var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var path = require('path');

var Collider = require('./lib/collider');

// Application
var app = express();

// settings
app.set('strict routing', true);
app.set('case sensitive routing', true);
app.set('websocket endpoints', {'/ws': require('./routes/ws')});

app.use(logger(app.get('env') === 'development' ? 'dev' : 'combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text());

// locals
app.locals['collider'] = new Collider();

app.use('/', require('./routes/index'));
app.use('/status', require('./routes/status'));
app.use('/ws', require('./routes/ws'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});


module.exports = app;
