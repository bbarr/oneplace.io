
var mongo = require('mongodb');
var db = require('../util/db')
var collection = db.collection('places');
var rsvp = require('rsvp');
var _ = require('lodash');

module.exports = {
  
  findOrCreate: function(config) {
    return this.find(config)
      .then(null, function(error) {
        return this.create(config);
      }.bind(this));
  },

  find: function(config) {
    return new rsvp.Promise(function(resolve, reject) {
      return collection(function(coll) {
        var query;
        if (config.references) {
          query = { referenceId: config.references._id };
        } else {
          query = { _id: new mongo.ObjectID(config.id) };
        }
        coll.find(query).nextObject(function(e, doc) {
          return doc ? resolve(doc) : reject(e);
        });
      });
    });
  },

  create: function(config) {
    return rsvp.Promise(function(resolve, reject) {
      collection(function(coll) {
        coll.insert({ referenceId: config.references._id }, { safe: true }, function(e, docs) {
          e ? reject(e) : resolve(docs[0]);
        }); 
      });
    });
  },

  save: function(config, place) {
    return rsvp.Promise(function(resolve, reject) {
      collection(function(coll) {
        var updaterPlace = _.object(_.reject(_.pairs(place), function(pair) { return pair[1] && !pair[1].source; }));
        var oid = new mongo.ObjectID(place._id.toString());
        coll.update({ _id: oid }, { $set: updaterPlace }, { safe: true }, function(e, doc) {
          e ? reject(e) : resolve(/^\d+$/.test(doc) ? place : doc);
        });
      });
    });
  }
};
