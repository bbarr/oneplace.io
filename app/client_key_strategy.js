
var passport = require('passport');
var util = require('util');
var crypto = require('crypto');
var clientLib = require('./client');

function ClientKeyStrategy() { 
  this.name = 'client-key'; 
};

util.inherits(ClientKeyStrategy, passport.Strategy);

ClientKeyStrategy.prototype.authenticate = function(req, options) {

  var publicKey = req.param('publicKey');
  var authHash = req.param('authHash');
  var timestamp = req.param('timestamp');

  clientLib.collection(function(clients) {
    clients.find({ publicKey: publicKey }).nextObject(function(e, client) {
      if (!client) return this.fail();
      if (!crypto.createHash('md5').update(timestamp, client.privateKey).digest('hex') === authHash) return this.fail();
      req.user = client;
      this.pass();
    }.bind(this));
  }.bind(this));
};
module.exports = ClientKeyStrategy;
