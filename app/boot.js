
var express = require('express');
var app = express();

require('./middleware')(app);
require('./routes')(app);

// and go!
app.listen(process.env.PORT || 3000);
