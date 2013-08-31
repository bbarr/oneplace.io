
var passport = require('passport');
var Masher = require('./placemash/masher');
var client = require('./client');

module.exports = function(app) {

  var flexResponse = (function() {

    function respond(res, e, data, status) {
      if (e) {
        res.send(status || 500, { error: e });
      } else {
        res.send(status || 200, data);
      }
    }

    return function(res) {
      return respond.bind(null, res);
    }
  })();

  var requireClientKey = passport.authenticate('client-key');

  app.get('/places/:source/:sourceId', requireClientKey, function(req, res) {

    var props = req.param('props');
    if (!props) return flexResponse(res)('Missing comma-separated "props" query parameter.');

    var masher = new Masher(req.user, req.param('source'), req.param('sourceId'), props.split(','), flexResponse(res));
    masher.mash();
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
