var express = require('express');
var _ = require('lodash');
_.mixin(require('./util'));
var composer = require('./composer');

var app = express();

app.use(express.bodyParser());

app.get('/details/:id', function(req, res) {

  var id = req.param('id');
  var props = _.csvToArray(req.param('props'));

  composer.compose(id, props, function(e, place) {
    if (e) {
      res.send(500, { error: e });
    } else {
      res.send(place);
    }
  });
});

app.listen(process.env.PORT || 3000);
