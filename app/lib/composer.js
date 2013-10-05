var _ = require('lodash');
var adapters = require('../adapters/index');
var cache = require('./cache');
var resources = require('./places');
var references = require('./references');
var rsvp = require('rsvp');
var moment = require('moment');

module.exports = {

  isResolved: function(resource, props) {
    return _.isEmpty(_.difference(props, _.keys(resource.data)));
  },

  prepareResource: function(resource, props) {
    var clone = _.clone(resource);
    var now = moment();
    _.forEach(clone.meta, function(v, k) {
      if (moment(v.expires).isBefore(now) || props.indexOf(k) < 0) {
        delete clone.data[k];
        delete clone.meta[k];
      }
    });
    return clone;
  },

  finishResource: function(resource) {
    var finished = this.withCacheSummary(resource);
    resources.save(finished); // side-effect
    return finished;
  },

  withCacheSummary: function(resource) {
    var clone = _.clone(resource);
    var expiries = _.keys(clone.data) .map(function(key) { 
      return clone.meta[key].expires; 
    });
    function digits(str) { return str ? str.replace(/\D/g, '') : Infinity }
    var cacheSummary = expiries.reduce(function(earliest, expiry) { return digits(expiry) < digits(earliest) ? expiry : earliest; });
    clone.cacheSummary = cacheSummary;
    return clone;
  },

  populate: function(resource, props, adapter, raw) {
    var clone = _.clone(resource);
    return _.reduce(adapter.getters, function(resource, getter, name) {
      if (!resource.data[name] && props.indexOf(name) > -1) {
        var gotten = getter(raw);
        if (typeof gotten !== 'undefined') {
          resource.data[name] = getter(raw);
          (resource.meta[name] || (resource.meta[name] = {})).expires = moment().add('days', 2).format();
          resource.meta[name].source = adapter.name;
        }
      } 
      return resource;
    }, clone);
  },

  runAdapters: function(user, resource, props, adapters) {

    var fetched = _.invoke(adapters, 'fetch', user, resource);

    return rsvp.all(fetched).then(function(raws) {

      var preparedResource = this.prepareResource(resource, props);
      var resourceAndAdapters = raws.reduce(function(cache, raw, i) {
        if (!raw) return cache;
        return {
          adapters: cache.adapters.concat([ adapters[i] ]),
          resource: this.populate(cache.resource, props, adapters[i], raw)
        }
      }.bind(this), { resource: preparedResource, adapters: [] });

      var adaptersRun = resourceAndAdapters.adapters;
      var leftoverAdapters = _.difference(adapters, adaptersRun);
      if (!this.isResolved(preparedResource, props) && leftoverAdapters && adaptersRun.length > 0) {
        return this.runAdapters(user, preparedResource, props, leftoverAdapters);
      } else {
        return this.finishResource(preparedResource);
      }
    }.bind(this));
  },

  compose: function(user, adapterName, id, props) {
    return resources.findOrCreate(user, adapterName, id)
      .then(function(resource) {
        return this.runAdapters(user, resource, props, _.values(adapters));
      }.bind(this));
  }
}
