var foursquare = require('foursquarevenues');
var _ = require('lodash');
var rsvp = require('rsvp');
var moment = require('moment');

module.exports = {

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
      console.log('foursquare ', data) return data.hours;
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

  match: function(config) {
    var place = config.sourcePlace;
    var keys = config.user.keys['foursquare'];
    var name = place.name;
    var latlng = place.latitude + ',' + place.longitude;
    return new rsvp.Promise(function(resolve, reject) {
      this.driver(keys.id, keys.secret).getVenues({ ll: latlng, query: name, intent: 'match' }, function(e, data) {
        if (e || data.response.venues.length === 0) {
          resolve({});
        } else {
          resolve({ foursquare: data.response.venues[0].id });
        }
      });
    }.bind(this));
  },

  populate: function(config, existing, data) {
    var place = existing;
    var resolved = config.props
      .filter(function(prop) {
        return !place[prop] && this.getters[prop];
      }, this)
      .reduce(function(currentPlace, prop) { 

        var value = this.getters[prop](data);
        if (typeof value === 'undefined') return currentPlace;

        var currentPlaceClone = _.clone(currentPlace);
        currentPlaceClone[prop] = { 
          value: value, 
          source: 'foursquare',
          expires: moment().add('days', 2).format()
        }; 
        return currentPlaceClone;
      }.bind(this), place);
    return resolved;
  },

  fetch: function(config, id) {
    var keys = config.user.keys.foursquare;
    return new rsvp.Promise(function(resolve, reject) {
      this.driver(keys.id, keys.secret).getVenue({ venue_id: id }, function(e, data) {
        if (e) reject(e);
        else resolve(data.response.venue);
      });
    }.bind(this));
  },

  driver: _.memoize(function(key, secret) {
    return foursquare(key, secret)
  })
}
