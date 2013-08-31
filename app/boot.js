var express = require('express');
var passport = require('passport');
var _ = require('lodash');

// utils
_.mixin({
  uberPartial: function(fn) {
    var argTemplate = [].slice.call(arguments, 1);
    return function() {
      var args = [].slice.call(arguments);
      var combinedArgs = argTemplate.map(function(arg, i) { 
        if (typeof arg !== 'string') return arg;
        var match = arg.match(/^arg(\d+)$/);
        return (match) ? args[match[1]] : arg; 
      });
      return fn.apply(this, combinedArgs);
    };
  }
});

var app = express();
require('./middleware')(app);
require('./routes')(app);

// and go!
app.listen(process.env.PORT || 3000);
