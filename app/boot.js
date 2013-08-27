var express = require('express');
var _ = require('lodash');
_.mixin(require('./util'));
var composer = require('./composer');

var app = express();

app.use(express.bodyParser());
app.use(function(req, res, next) {
  next();
});

function respond(req, res, e, data) {
  if (e) {
    res.send(500, { error: e });
  } else {
    res.send(data);
  }
}

app.get('/places/:source/:sourceId', function(req, res) {
  var source = req.param('source') || 'factual';
  var sourceId = req.param('sourceId');
  var props = _.csvToArray(req.param('props'));
  composer.compose(source, sourceId, props, respond.bind(null, req, res));
});

app.listen(process.env.PORT || 3000);
