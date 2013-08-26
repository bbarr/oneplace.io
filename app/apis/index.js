
module.exports = require("fs")
  .readdirSync(__dirname)
  .filter(function(file) { return file.indexOf('.api') > -1; })
  .map(function(file) { return require("./" + file); });
