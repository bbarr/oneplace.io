var _ = require('lodash');
var apis = require('../apis/index');
var cache = require('./cache');
var places = require('./places');
var references = require('./references');
var rsvp = require('rsvp');
var moment = require('moment');

module.exports = {

  freshen: function(place) {
    var now = moment();
    return _.object(_.reject(_.pairs(place), function(pair) {
      if (pair[1] && pair[1].expires) {
        if (moment(pair[1].expires).isBefore(now)) {
          return true;
        }
      }
      return false;
    }));
  },

  composite: function(initial, props) {

    var id = initial._id;
    var refId = initial.referenceId;
    var composite = _.object(_.reject(_.pairs(_.clone(initial)), function(pair) { return pair[1] !== id && pair[1] !== refId && props.indexOf(pair[0]) === -1; }));

    return {

      mixin: function(place) {
        return _.extend(composite, place);
      },

      isResolved: function() {
        return _.isEmpty(_.difference(props, _.keys(composite)));
      },

      updateCacheSummary: function() {

        var expiries = _.keys(composite)
          .map(function(key) { 
            return composite[key].expires; 
          });

        function digits(str) { return str ? str.replace(/\D/g, '') : Infinity }
        var cacheSummary = expiries.reduce(function(earliest, expiry) { return digits(expiry) < digits(earliest) ? expiry : earliest; });
        console.log(cacheSummary)

        this.mixin({ cacheSummary: cacheSummary });
      },

      value: function(fin) {
        if (fin) this.updateCacheSummary();
        return composite;
      }
    }
  },

  compose: function(config) {

    console.log('composing', config);
    var initialPlace = _.find(config.apis, function(pair) { return pair[0] === config.source })[1].populate(config, config.place, config.sourcePlace);
    var apisWithoutSource = _.reject(config.apis, function(pair) { return pair[0] === config.source; });

    return new rsvp.Promise(function(resolve, reject) {

      var composite = this.composite(this.freshen(initialPlace), config.props);

      // done if just needed the source API, or was fully cached
      if (composite.isResolved()) {
        return resolve(composite.value(true));
      };

      // now try all the APIs, resolving ASAP when the props are fulfilled
      var now = Date.now();
      console.log('before fetching ', now)
      var fetches = apisWithoutSource.map(function(pair) { 
        return pair[1].fetch(config, config.references[pair[0]])
          .then(function(place) {
            console.log('after fetching api: ', pair, Date.now())
            composite.mixin(pair[1].populate(config, composite.value(), place))
            if (composite.isResolved()) {
              resolve(composite.value(true));
            }
          }.bind(this));
      }, this);

      // we couldnt fullfil the props with the API's available, just return what we've got
      rsvp.all(fetches).then(function(places) {
        resolve(composite.value(true));
      });
    }.bind(this));
  },

  filterApis: function(apis, refs) {
    return _.filter(_.pairs(apis), function(pair) { return refs[pair[0]]; });
  },

  build: function(givenConfig) {
    var config = _.clone(givenConfig);
    config.apis = _.object(this.filterApis(apis, config.user.keys));
    return apis[config.source].fetch(config, config.sourceId)
      .then(function(sourcePlace) {
        return references.findOrCreate(_.extend(config, { sourcePlace: sourcePlace }));
      })
      .then(function(refs) {
        return places.findOrCreate(_.extend(config, { references: refs, apis: this.filterApis(apis, refs) }));
      }.bind(this))
      .then(function(place) {
        return this.compose(_.extend(config, { place: place }))
      }.bind(this))
      .then(function(composed) {
        return places.save(config, composed);
      })
      .fail(function(e) {
        console.log('FAILLLL', e);
      });
  }
}
