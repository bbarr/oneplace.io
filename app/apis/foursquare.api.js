var foursquare = require('foursquarevenues');
var _ = require('lodash');

module.exports = {

  getters: {
    
    name: function(data) {
      return data.name;
    },

    mayor: function(data) {
      return data.mayor;
    }
  },

  fetch: function(place, props, cb) {
    this.driver().getVenue({ venue_id: place.cw.foursquare }, function(e, data) {
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

  driver: _.memoize(function() {
    return foursquare('BERQYYI1HCLFYVPG504AGDCXL00TXNJLQBGXEFWXZNDLOCJS', 'UMCC15GPWCMX4EN20EJ5L45DOVYFHC44W34CYSB3V4QAYWHH')
  })
}

