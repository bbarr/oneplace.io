var Twit = require('twit');
var _ = require('lodash');
var base = require('./base');

module.exports = _.extend(base(), {

  getters: {
    
    name: function(data) {
      return data.name;
    },

    tweets: function(data) {
      return [];
    }
  },

  fetch: function(user, resource) {

    var cache = this.cache;
    var id = resource.refs.twitter;
    var keys = user.keys.twitter;
    var driver = this.driver();
    // if (!keys) return this.nothing();

    return cache.get(id)
      .then(function(cached) {
        return this.promise(function(resolve, reject) {
          if (cached) return resolve(cached);

          function handleRes(e, venue) {
            if (venue) {
              resource.refs.twitter = venue.id;
              cache.set(venue.id, venue).then(resolve.bind(null, venue));
            } else resolve();
          }

          if (resource.data.location && resource.data.name) {
            driver.get('geo/similar_places', { 
              lat: resource.data.location.latitude, 
              long: resource.data.location.longitude, 
              name: resource.data.name 
            }, function(e, res) {
              if (e) return resolve();
              var venue = res.result.places[0];
              driver.get('search/tweets', { q: "place:" + venue.id }, function(e, res) {
                if (e) return resolve();
                venue.tweets = res.statuses;
                handleRes(e, venue);
              }); 
            }.bind(this));
          } else resolve();

        }.bind(this));
      }.bind(this));
  },

  driver: _.memoize(function(key, secret) {
    return new Twit({
      consumer_key: 'pF1Np5BSni4e6UCm27Ljsg',
      consumer_secret: '9wCVgOXc53G4OWW5q9tJJIqaMOpnNQ8MRVmmhJ28To',
      access_token: '193468600-pVdXTVqoSvgq3fXJhoKBqiUt15t1z7TfjwH7wRNM',
      access_token_secret: 'gBSltmPiOuArKwjcQRbly5W4nkvHfxxMon5zX8Kn4'
    });
  })
})
