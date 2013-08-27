var _ = require('lodash');
var apis = require('./apis/index');

var cache = {};

module.exports = {

  joinId: function(source, sourceId) {
    return source + '_' + sourceId;
  },

  splitId: function(id) {
    return id.split('_');
  },

  newPlace: function(id, cb) {
    var parts = this.splitId(id);
    this.getCrosswalk(id, function(cw) {
      var place = { id: id, source: parts[0], sourceId: parts[1], cw: cw };
      cb(place);
    });
  },

  getCrosswalk: function(id, cb) {
    var parts = this.splitId(id);
    cb({ foursquare: '4c3e3a7cb8b4be9aaad9cbef' });
  },

  missingProps: function(place, props) {
    return _.difference(props, _.keys(place));
  },

  isResolved: function(place, props) {
    return _.isEmpty(this.missingProps(place, props));
  },

  cache: function(id, place, cb) {
    if (_.isFunction(place)) {
      var realCb = place;
      if (cache[id]) {
        cb(cache[id]);
      } else {
        cache[id] = this.newPlace(id, realCb);
      }
    } else {
      cache[id] = place;
      cb(cache[id]);
    }
  },

  tryApi: function(i, place, props, cb) {
    if (!apis[i]) return cb({ error: 'no more apis to try!' });

    apis[i].fetch(place, props, function(updatedPlace) {
      this.nextStep(i + 1, updatedPlace, props, cb);
    }.bind(this));
  },

  nextStep: function(i, place, props, cb) {
    if (this.isResolved(place, props)) {
      cb(null, place);
    } else {
      var missingProps = this.missingProps(place, props);
      this.tryApi(i, place, missingProps, cb);
    }
  },

  compose: function(source, sourceId, props, cb) {
    var id = this.joinId(source, sourceId);
    this.cache(id, function(place) {
      this.nextStep(0, place, props, cb);
    }.bind(this));
  }
}
