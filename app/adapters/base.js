
var rsvp = require('rsvp');
var cache = require('../lib/cache');

var base = {

  getters: {},

  promise: function(handler) {
    return new rsvp.Promise(handler);
  },

  nothing: function() {
    return this.promise(function(res) { res(); });
  },

  fetch: function() {
    return this.nothing();
  },

  getName: function() { return this.name; }
}

base.cache = {

  _id: function(ref) { return this.base.getName() + '|' + JSON.stringify(ref) }, 
  
  get: function(ref) {
    return cache.get(this._id(ref));
  },

  set: function(ref, data) {
    return cache.set(this._id(ref), data);
  }
}

module.exports = function() {
  var clone = Object.create(base);
  clone.cache = Object.create(base.cache);
  clone.cache.base = clone;
  return clone;
};
