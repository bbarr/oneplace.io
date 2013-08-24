var _ = require('lodash');
var apis = require('./apis/index');

var cache = {};

module.exports = {

  newPlace: function(id) {
    return { id: id };
  },

  missingProps: function(place, props) {
    return _.difference(props, _.keys(place));
  },

  isResolved: function(place, props) {
    return _.isEmpty(this.missingProps(place, props));
  },

  cache: function(k, v) {
    if (_.isUndefined(v)) {
      return cache[k] || (cache[k] = this.newPlace(k));
    } else {
      return cache[k] = v;
    }
  },

  tryApi: function(i, place, props, cb) {
    if (!apis[i]) return cb({ error: 'no more apis to try!' });

    apis[i].fetch(props, place, function(updatedPlace) {
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

  compose: function(id, props, cb) {
    var place = this.cache(id);
    this.nextStep(0, place, props, cb);
  }
}
