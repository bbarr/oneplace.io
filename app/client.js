
var mongo = require('mongodb').MongoClient;

var clientLib = {

  sanitize: function(client) {
    return {
      email: client.email,
      keys: client.keys
    }
  },

  driver: (function() {
    var cachedDriver;
    return function(cb) {
      if (cachedDriver) return cb(cachedDriver);
      mongo.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/oneplace', function(err, db) {
        cb(cachedDriver = db);
      });
    };
  })(),

  collection: function(cb) {
    this.driver(function(db) {
      cb(db.collection('clients'));
    });
  },

  verify: function(client, verifyCode, cb) {
    this.collection(function(clients) {
      clients.update({ id: client.id, verifyCode: verifyCode }, { $set: { verified: true } }, { safe: true }, cb);
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

    this.collection(function(clients) {
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

    this.collection(function(clients) {
      clients.update({ id: client.id }, { $set: changes }, { safe: true }, cb)
    });
  }
};

module.exports = clientLib;
