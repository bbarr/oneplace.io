var Factual = require('factual-api');
var _ = require('lodash');
var base = require('./base');

module.exports = _.extend(base(), {

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

  fetch: function(user, resource) {
    var driver = this.driver;
    var cache = this.cache;
    var promise = this.promise;
    var id = resource.refs.factual;

    return cache.get(id)
      .then(function(cached) {
        return promise(function(resolve, reject) {
          if (cached) return resolve(cached);

          var keys = user.keys.factual;
          var handleRes = function(res) {
            if (res && res.data) {
              cache.set(id, res.data[0]).then(resolve.bind(null, res.data[0]));
            } else resolve();
          };

          driver(keys.key, keys.secret).get('/t/restaurants/' + id, function(error, res) {
            if (error) {
              driver(keys.key, keys.secret).get('/t/places/' + id, function (error, res) { handleRes(res); });
            } else {
              handleRes(res);
            }
          });
        });
      });
  },

  driver: _.memoize(function(key, secret) {
    return new Factual(key, secret);
  })
});

