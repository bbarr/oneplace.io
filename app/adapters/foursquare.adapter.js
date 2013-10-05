var foursquare = require('foursquarevenues');
var _ = require('lodash');
var base = require('./base');

module.exports = _.extend(base(), {

  getters: {
    
    name: function(data) {
      return data.name;
    },

    mayor: function(data) {
      return data.mayor;
    },

    menu: function(data) {
      return data.menu;
    },

    hours: function(data) {
      return data.hours;
    },

    photos: function(data, options) {
      return data.photos;
    },

    price: function(data) {
      return data.price;
    },

    rating: function(data) {
      return data.rating;
    },
  },

  fetch: function(user, resource) {

    var cache = this.cache;
    var id = resource.refs.foursquare;
    var keys = user.keys.foursquare;
    if (!keys) return this.nothing();

    return this.promise(function(resolve, reject) {

      function handleRes(e, res) {
        if (res && res.response) {
          var venue = res.response.venue || res.response.venues;
          venue = venue[0] || venue;
          resource.refs.foursquare = venue.id;
          cache.set(venue.id, venue).then(resolve.bind(null, venue));
        }
      }

      if (id) {
        this.driver(keys.id, keys.secret).getVenue({ venue_id: id }, handleRes);
      } else if (resource.data.location && resource.data.name) {
        var latlng = resource.data.location.latitude + ',' + resource.data.location.longitude;
        var name = resource.data.name;
        this.driver(keys.id, keys.secret).getVenues({ ll: latlng, query: name, intent: 'match' }, handleRes);
      } else {
        resolve();
      }
    }.bind(this));
  },

  driver: _.memoize(function(key, secret) {
    return foursquare(key, secret)
  })
})
