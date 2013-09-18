
var references = require('./lib/references');
var passport = require('passport');
var places = require('./lib/places');
var composite = require('./lib/masher');
var client = require('./client');
var searcher = require('./lib/searcher');
var rsvp = require('rsvp');
var _ = require('lodash');

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

  var fixIds = function(objs) {
    return objs.map(function(obj) {
      var id = obj._id;
      delete obj._id;
      obj.id = id;
      return obj;
    });
  }

  var requireClientKey = passport.authenticate('client-key');

  app.get('/places/:source', requireClientKey, function(req, res) {
    
    var ids = req.param('ids').split(',');
    var props = req.param('props').split(',');

    var response = flexResponse(res);

    var promises = _.compact(ids).map(function(id) {
      return composite.build({ 
        user: req.user, 
        source: req.param('source'),
        sourceId: id,
        props: props
      });
    });

    rsvp.all(promises).then(function(composites) {
      response(null, fixIds(composites));
    }, function(error) {
      response(error);
    });
  });

  app.get('/places/:id/:source', requireClientKey, function(req, res) {

    var props = req.param('props');
    if (!props) return flexResponse(res)('Missing comma-separated "props" query parameter.');

    var response = flexResponse(res);

    places.find({ id: req.param('id') })
      .then(function(place) {
        return references.find({ id: place.referenceId })
          .then(function(ref) {
            composite.build({
              user: req.user,
              source: req.param('source'),
              sourceId: ref[req.param('source')],
              props: props.split(',')
            }).then(function(composite) {
              response(null, fixIds([ composite ])[0]);
            }, function(error) {
              response(error);
            });
          });
      });
  });

  app.get('/places/:source/:sourceId', requireClientKey, function(req, res) {

    var props = req.param('props');
    if (!props) return flexResponse(res)('Missing comma-separated "props" query parameter.');

    var response = flexResponse(res);

    composite.build({ 
      user: req.user, 
      source: req.param('source'),
      sourceId: req.param('sourceId'),
      props: props.split(',')
    }).then(function(composite) {
      response(null, fixIds([ composite ])[0]);
    }, function(error) {
      response(error);
    });
  });

  app.get('/pladces/:source', requireClientKey, function(req, res) {

    var response = flexResponse(res);
    
    var terms = JSON.parse(decodeURIComponent(req.param('terms')));
    if (!terms) return response('Missing "terms" query parameter to search with');

    var props = req.param('props');
    if (!props) return flexResponse(res)('Missing comma-separated "props" query parameter.');

    var config = {
      user: req.user,
      source: req.param('source'),
      terms: terms,
      props: props.split(',')
    };

    searcher.search(config)
      .then(function(ids) {
        var builds = ids.map(function(id) {
          return composite.build(_.extend(config, {
            sourceId: id
          }));
        });
        rsvp.all(builds).then(function(composites) {
          response(null, fixIds(composites));
        });
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
