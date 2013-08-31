var express = require('express');
var passport = require('passport');
var ClientKeyStrategy = require('./client_key_strategy');

module.exports = function(app) {
  app.use(express.bodyParser());
  passport.use(new ClientKeyStrategy)
  app.use(passport.initialize());
}
