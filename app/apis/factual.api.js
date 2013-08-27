var Factual = require('factual-api');
var _ = require('lodash');

module.exports = {

  getters: {
    
    name: function(data) {
      return data.name;
    }
  },

  fetch: function(place, props, cb) {
    this.driver().get('/t/places/' + place.sourceId, function (error, res) {
      var match = res.data[0];
      var resolved = props
        .filter(function(prop) { return this.getters[prop]; }, this)
        .reduce(function(currentPlace, prop) { 
          currentPlace[prop] = { value: this.getters[prop](match), source: 'factual' }; 
          return currentPlace;
        }.bind(this), {});
      cb(_.extend(place, resolved));
    }.bind(this));
  },

  driver: _.memoize(function() {
    return new Factual('LBVlNSAD3y02ZyFos0yJ6Ags91YQShZ617gGxEeC', '8eWCO95MazTi5xPJZqhqZ0Prc5DiNnw0f9otcNAm');
  })
}

