
var rsvp = require('rsvp');
var express = require('express');
var app = express();

rsvp.configure('onerror', function(error) {
  console.log('error: ', error);
});


require('./middleware')(app);
require('./routes')(app);

app.use(express.logger());

// and go!
app.listen(process.env.PORT || 3000);
