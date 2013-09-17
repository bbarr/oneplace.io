
var express = require('express');
var app = express();

require('./middleware')(app);
require('./routes')(app);

app.use(express.logger());

// and go!
app.listen(process.env.PORT || 3000);
