var async = require('async');
var mongo = require('mongodb').MongoClient;
var _ = require('lodash');

module.exports = {

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
      cb(db.collection('refs'));
    });
  },

  fetch: function(keys, apis, place, cb) {
    async.reduce(_.values(apis), {}, function(refs, api, cb) {
      var name = _.findKey(apis, function(a) { return a === api; });
      api.match(keys[name], place, function(k, v) {
        refs[k] = v;
        cb(null, refs); 
      });
    }, function(e, refs) {
      this.collection(function(coll) {
        coll.insert(refs, { safe: true }, function(e, docs) { cb(docs[0]); });
      });
    }.bind(this));
  },

  find: function(source, sourceId, cb) {
    this.collection(function(refs) {
      var query = {};
      query[source] = sourceId;
      refs.find(query).nextObject(function(e, doc) { 
        if (!doc) return cb(null);
        cb(doc);
      });
    });
  }
}
