
var db = require('./util/db');
var collection = db.collection('clients');
console.log('HERE IS THE COLLECTIN', collection)

var clientLib = {

  collection: collection,

  sanitize: function(client) {
    return {
      email: client.email,
      keys: client.keys
    }
  },

  verify: function(client, verifyCode, cb) {
    collection(function(clients) {
      clients.update({ 
        id: client.id, 
        verifyCode: verifyCode 
      }, { $set: { verified: true } }, { safe: true }, cb);
    });
  },

  create: function(data, cb) {

    var client = {
      email: data.email,
      keys: {},
      privateKey: 'abc',
      publicKey: 'def',
      verifyCode: '123'
    };

    collection(function(clients) {
      clients.insert(client, { safe: true }, function(e, docs) {
        cb(e, (docs ? docs[0] : docs));
      });
    });
  },

  update: function(client, data, cb) {

    var changes = {
      email: data.email || client.email,
      keys: data.keys || client.keys
    };

    collection(function(clients) {
      clients.update({ id: client.id }, { $set: changes }, { safe: true }, cb)
    });
  }
};

module.exports = clientLib;

