
module.exports = require("fs")
  .readdirSync(__dirname)
  .filter(function(file) { console.log(file); return file.indexOf('.api') > -1; })
  .map(function(file) { return require("./" + file); });
