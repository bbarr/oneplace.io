var foursquare = require('foursquarevenues');
var _ = require('lodash');

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
    }
  },

  match: function(keys, place, cb) {
    var name = place.name;
    var latlng = place.latitude + ',' + place.longitude;
    this.driver(keys.id, keys.secret).getVenues({ ll: latlng, query: name, intent: 'match' }, function(e, data) {
      cb('foursquare', data.response.venues[0].id);
    });
  },

  populate: function(keys, place, props, id, cb) {
    this.driver(keys.id, keys.secret).getVenue({ venue_id: id }, function(e, data) {
      var match = data.response.venue;
      var resolved = props
        .filter(function(prop) { return this.getters[prop]; }, this)
        .reduce(function(currentPlace, prop) { 
          currentPlace[prop] = { value: this.getters[prop](match), source: 'foursquare' }
          return currentPlace;
        }.bind(this), {});
      cb(_.extend(place, resolved));
    }.bind(this));
  },

  fetch: function(keys, id, cb) {
    this.driver(keys.id, keys.secret).getVenue({ venue_id: place.cw.foursquare }, function(e, data) {
      cb(data.response.venue);
    });
  },

  driver: _.memoize(function(key, secret) {
    return foursquare(key, secret)
  })
}
