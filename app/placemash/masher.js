var _ = require('lodash');
var apis = require('./apis/index');
var refsLib = require('./refs');
var cache = require('./cache');
var rsvp = require('rsvp');

function Masher(user, source, sourceId, props, cb) {
  this.user = user;
  this.source = source;
  this.sourceId = sourceId;
  this.props = props;
  this.cb = cb;
  this.apis = _.object(_.filter(_.pairs(apis), function(api) { return user.keys[api[0]]; }));
  this.apiNames = _.keys(this.apis);
}

Masher.prototype = {

  missingProps: function(place, props) {
    return _.difference(props, _.keys(place));
  },

  isResolved: function(place, props) {
    return _.isEmpty(this.missingProps(place, props));
  },

  tryApi: function(i, mash, props, refs) {
    var api = this.apis[this.apiNames[i]];
    if (!api) return this.cb({ error: 'no more apis to try!' });
    api.populate(this.user.keys[this.apiNames[i]], mash, props, refs[this.apiNames[i]], _.uberPartial(this.nextStep.bind(this), i + 1, 'arg0', props, refs));
  },

  nextStep: function(i, mash, props, refs) {
    if (this.isResolved(mash, props)) return this.cb(null, mash);
    var missingProps = this.missingProps(mash, props);
    this.tryApi(i, mash, missingProps, refs);
  },

  fromSource: function(cb) {
    this.apis[this.source].fetch(this.user.keys[this.source], this.sourceId, function(place) {
      if (place) refsLib.fetch(this.user.keys, this.apis, place, _.uberPartial(this.fromRefs.bind(this), 'arg0', this.props, this.cb));
      else cb('Can not find source place');
    }.bind(this));
  },

  fromMash: function(mash, refs) {
    this.nextStep(0, mash, this.props, refs);
  },

  fromRefs: function(refs) {
    cache.get(refs._id, function(mash) {
      this.fromMash(mash || {}, refs, _.uberPartial(cache.set, refs._id, 'arg0'));
    }.bind(this));
  },

  mash: function() {
    refsLib.find(this.source, this.sourceId, function(refs) {
      refs ? this.fromRefs(refs) : this.fromSource();
    }.bind(this));
  },

  build: function(config) {
    return references.findOrCreate(config)
      .then(function(refs) {
        return mashups.findOrCreate(config);
      })
      .then(function(mashup) {
        return mashups.populate(config);
      });
  }
}

module.exports = Masher;
