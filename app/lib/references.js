
var db = require('../util/db');
var collection = db.collection('references');
var rsvp = require('rsvp');
var _ = require('lodash');
var mongo = require('mongodb');

module.exports = {
  
  findOrCreate: function(config) {
    return this.find(config)
      .then(null, function(error) {
        return this.create(config);
      }.bind(this));
  },

  find: function(config) {
    return new rsvp.Promise(function(resolve, reject) {
      collection(function(coll) {
        var query = config.sourceId ? _.object([ [ config.source, config.sourceId ] ]) : { _id: new mongo.ObjectID(config.id.toString()) };
        coll.find(query).nextObject(function(e, doc) {
          doc ? resolve(doc) : reject(e);
        });
      });
    });
  },

  create: function(config) {
    var matching = _.map(config.apis, function(api) { return api.match(config); });
    return rsvp.all(matching)
      .then(function(references) {
        var mergedRefs = _.merge.apply(_, references);
        return new rsvp.Promise(function(resolve, reject) {
          collection(function(coll) {
            coll.insert(mergedRefs, { safe: true }, function(e, docs) {
              e ? reject(e) : resolve(docs[0]);
            }); 
          });
        });
    });
  }
};
