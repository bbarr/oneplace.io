var Factual = require('factual-api');
var _ = require('lodash');

module.exports = {

  getters: {
    
    name: function(data) {
      return data.name;
    },

    address: function(data) {
      return data.address;
    },

    phone: function(data) {
      return data.tel;
    },

    hours: function(data) {
      return data.hours_display;
    },

    categories: function(data) {
      return data.category_labels;
    }
  },

  match: function(keys, place, cb) {
    if (place.factual_id) {
      cb('factual', place.factual_id);
    }
  },

  populate: function(keys, mash, props, id, cb) {
    this.driver(keys.key, keys.secret).get('/t/places/' + id, function (error, res) {
      var match = res.data[0];
      var resolved = props
        .filter(function(prop) { return this.getters[prop]; }, this)
        .reduce(function(currentPlace, prop) { 
          currentPlace[prop] = { value: this.getters[prop](match), source: 'factual' }; 
          return currentPlace;
        }.bind(this), {});
      cb(_.extend(mash, resolved));
    }.bind(this));
  },

  fetch: function(keys, id, cb) {
    this.driver(keys.key, keys.secret).get('/t/places/' + id, function (error, res) {
      if (res && res.data) cb(res.data[0]);
    });
  },

  driver: _.memoize(function(key, secret) {
    return new Factual(key, secret);
  })
}

