
var express = require('express');
var app = express();

require('./middleware')(app);
require('./routes')(app);

app.use(express.logger());

app.get('/foo', function(req, res) {
  res.send('HIIII');
});

// and go!
app.listen(process.env.PORT || 3000);
