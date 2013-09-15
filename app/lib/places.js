
var mongo = require('mongodb');
var rsvp = require('rsvp');
var _ = require('lodash');
var db = require('../util/db')
var collection = db.collection('places');

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
        var query = config.references ? { referenceId: config.references._id } : { _id: new mongo.ObjectID(config.id) };
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
        var oid = new mongo.ObjectID(place._id.toString());
        coll.update({ _id: oid }, { $set: place }, { safe: true }, function(e, doc) {
          e ? reject(e) : resolve(/^\d+$/.test(doc) ? place : doc);
        });
      });
    });
  }
};
