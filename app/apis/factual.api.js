var Factual = require('factual-api');
var _ = require('lodash');
var rsvp = require('rsvp');
var moment = require('moment');
var cache = require('../lib/cache');

module.exports = {

  getters: {
    
    name: function(data) {
      return data.name;
    },

    location: function(data) {
      return { latitude: data.latitude, longitude: data.longitude };
    },

    address: function(data) {
      return data.address;
    },

    email: function(data) {
      return data.email;
    },

    phone: function(data) {
      return data.tel;
    },

    hours: function(data) {
      var hours = (data.hours || data.hours_display);
      if (!hours) return;
      return _.values(JSON.parse(hours));
    },

    categories: function(data) {
      return data.category_labels;
    },

    price: function(data) {
      return data.price;
    },

    outdoorSeating: function(data) {
      return data.seating_outdoor;
    },

    wheelchairFriendly: function(data) {
      return data.accessible_wheelchair;
    },

    cashOnly: function(data) {
      return data.payment_cashonly;
    },

    wifi: function(data) {
      return data.wifi;
    },

    parking: function(data) {
      return data.parking;
    },

    website: function(data) {
      return data.website;
    }
  },

  match: function(config) {

    var place = config.sourcePlace;

    return new rsvp.Promise(function(resolve, reject) {
      if (place.factual_id) {
        resolve({ factual: place.factual_id });
      } else {
        resolve({});
      }
    });
  },

  populate: function(config, existing, data) {
    var place = existing;
    var resolved = config.props
      .filter(function(prop) {
        // add check for existing here sometime later... using expire to invalidate
        return this.getters[prop];
      }, this)
      .reduce(function(currentPlace, prop) { 

        var value = this.getters[prop](data);
        if (typeof value === 'undefined') return currentPlace;

        var currentPlaceClone = _.clone(currentPlace);
        currentPlaceClone[prop] = { 
          value: value, 
          source: 'factual',
          expires: moment().add('days', 2).format()
        }; 
        return currentPlaceClone;
      }.bind(this), place);

    return resolved;
  },

  fetch: function(config, id) {
    return cache.get(id)
      .then(function(cached) {
        return new rsvp.Promise(function(resolve, reject) {
          if (false && cached) return resolve(cached);

          var keys = config.user.keys.factual;

          this.driver(keys.key, keys.secret).get('/t/restaurants/' + id, function(error, res) {
            if (error) {
              this.driver(keys.key, keys.secret).get('/t/places-edge/' + id, function (error, res) {
                if (res && res.data) {
                  cache.set(id, res.data[0]).then(resolve.bind(null, res.data[0]));
                }
                else reject(error);
              });
            } else {
              if (res && res.data) {
                cache.set(id, res.data[0]).then(resolve.bind(null, res.data[0]));
              }
            }
          }.bind(this));

        }.bind(this));
      }.bind(this));
  },

  search: function(config) {

    var terms = config.terms;
    var termsString = JSON.stringify(terms);
    var keys = config.user.keys.factual;

    return cache.get(termsString).then(function(cached) {
      return new rsvp.Promise(function(resolve, reject) {
        if (cached) console.log('found factual search cached'); return resolve(cached);

        this.driver(keys.key, keys.secret).get('/t/places', _.extend(terms, { select: 'factual_id' }), function(e, res) {
          if (res && res.data) {
            var ids = _.pluck(res.data, 'factual_id');
            cache.set(termsString, ids).then(resolve.bind(null, ids));
          } else reject(e);
        });
      }.bind(this));
    }.bind(this));
  },

  driver: _.memoize(function(key, secret) {
    return new Factual(key, secret);
  })
}

