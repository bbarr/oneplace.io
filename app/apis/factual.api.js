var Factual = require('factual-api');
var _ = require('lodash');

module.exports = {

  getters: {
    
    name: function(data) {
      return data.name;
    }
  },

  fetch: function(props, place, cb) {
    this.driver().get('/t/places/' + place.id, function (error, res) {
      var match = res.data[0];
      var resolved = props
        .filter(function(prop) { return this.getters[prop]; }, this)
        .reduce(function(currentPlace, prop) { 
          currentPlace[prop] = this.getters[prop](match); 
          return currentPlace;
        }.bind(this), place);
      cb(null, resolved);
    }.bind(this));
  },

  driver: _.memoize(function() {
    return new Factual('LBVlNSAD3y02ZyFos0yJ6Ags91YQShZ617gGxEeC', '8eWCO95MazTi5xPJZqhqZ0Prc5DiNnw0f9otcNAm');
  })
}

