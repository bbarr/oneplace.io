
var rsvp = require('rsvp');

var redis;
var client;
if (process.env.REDISTOGO_URL) {
  redis = require('redis-url').connect(process.env.REDISTOGO_URL);
  client = redis;
} else {
  redis = require('redis');
  client = redis.createClient();
}


module.exports = {

  get: function(key) {
    return new rsvp.Promise(function(resolve, reject) {
      client.get(key, function(e, val) {
        if (!e) console.log('GOT FROM CACHE: ', key, val);
        e ? resolve() : resolve(JSON.parse(val));
      });
    });
  },

  set: function(key, val) {
    var valJSON = JSON.stringify(val);
    return new rsvp.Promise(function(resolve, reject) {
      client.set(key, valJSON, function(e, val) {
        e ? reject(e) : resolve(val);
      });
    });
  }
}
