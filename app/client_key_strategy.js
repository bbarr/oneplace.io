
var passport = require('passport');
var util = require('util');
var crypto = require('crypto');
var clientLib = require('./client');

function ClientKeyStrategy() { 
  this.name = 'client-key'; 
  console.log(this.name)
};

util.inherits(ClientKeyStrategy, passport.Strategy);

ClientKeyStrategy.prototype.authenticate = function(req, options) {
  console.log('coooome on')

  var publicKey = req.param('publicKey');
  var authHash = req.param('authHash');
  var timestamp = req.param('timestamp');

  console.log('whaaaaaaaa')
  clientLib.collection(function(clients) {
    console.log('clients ', clients)
    clients.find({ publicKey: publicKey }).nextObject(function(e, client) {
      if (!client) return this.fail();
      if (!crypto.createHash('md5').update(timestamp, client.privateKey).digest('hex') === authHash) return this.fail();
      req.user = client;
      this.pass();
    }.bind(this));
  }.bind(this));
};
module.exports = ClientKeyStrategy;
