
var passport = require('passport');
var composite = require('./lib/masher');
var client = require('./client');
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

  app.get('/places/:source', requireClientKey, function(req, res) {
    
    var ids = req.param('ids').split(',');
    var props = req.param('props').split(',');
    var response = flexResponse(res);

    var builds = ids.map(function(id) {
      return composite.build({ 
        user: req.user, 
        source: req.param('source'),
        sourceId: id,
        props: props
      });
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
