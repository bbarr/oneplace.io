
var mongo = require('mongodb');
var rsvp = require('rsvp');
var _ = require('lodash');
var db = require('../util/db')
var collection = db.collection('places');

module.exports = {
  
  findOrCreate: function(user, adapterName, id) {
    return new rsvp.Promise(function(res, rej) {
      this.find(user, adapterName, id)
        .then(res, function(error) {
          this.create(user, adapterName, id).then(res);
        }.bind(this));
    }.bind(this));
  },

  find: function(user, adapterName, id) {
    return new rsvp.Promise(function(resolve, reject) {
      return collection(function(coll) {
        var query = {}; 
        query['refs.' + adapterName] = id;
        coll.find(query).nextObject(function(e, doc) {
          return doc ? resolve(doc) : reject(e);
        });
      });
    });
  },

  create: function(user, adapterName, id) {
    return rsvp.Promise(function(resolve, reject) {
      collection(function(coll) {
        var doc = { refs: {}, data: {}, meta: {} };
        doc.refs[adapterName] = id;
        coll.insert(doc, { safe: true }, function(e, docs) {
          e ? reject(e) : resolve(docs[0]);
        }); 
      });
    });
  },

  save: function(resource) {
    return rsvp.Promise(function(resolve, reject) {
      collection(function(coll) {
        var oid = new mongo.ObjectID(resource._id.toString());
        var clonedResource = _.clone(resource);
        delete clonedResource._id;
        coll.update({ _id: oid }, { $set: clonedResource }, function() {});
      });
    });
  }
};
