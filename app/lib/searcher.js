
var rsvp = require('rsvp');
var apis = require('../apis/index');

module.exports = {

  search: function(config) {
    return apis[config.source].search(config);
  }
}
