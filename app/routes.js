
var passport = require('passport');
var composer = require('./lib/composer');
var client = require('./lib/client');
var rsvp = require('rsvp');
var _ = require('lodash');

var requireClientKey = passport.authenticate('client-key');
var flexResponse = (function() {
  function respond(res, e, data, status) {
    if (e) res.send(status || 500, { error: e });
    else res.send(status || 200, data);
  }
  return function(res) {
    return respond.bind(null, res);
  }
})();

module.exports = function(app) {

  app.get('/things', requireClientKey, function(req, res) {

    var source = req.param('source');
    var ids = req.param('ids');
    var props = req.param('props');
    var response = flexResponse(res);

    var builds = ids.map(function(id) {
      return composer.compose(req.user, source, id, props);
    });

    rsvp.all(builds).then(function(composites) {
      response(null, composites);
    }, function(error) {
      response(error);
    });
  });

  app.post('/client', function(req, res) {
    client.create(req.body, flexResponse(res));
  });

  app.get('/client/verified/:verifyCode', requireClientKey, function(req, res) {
    client.verify(req.user, req.param('verifyCode'), flexResponse(res));
  });

  app.get('/client', requireClientKey, function(req, res) {
    res.send(client.sanitize(req.user));
  });

  app.patch('/client', requireClientKey, function(req, res) {
    client.update(req.user, req.body, flexResponse(res));
  });

};
