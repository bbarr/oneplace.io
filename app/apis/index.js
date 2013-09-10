
function name(file) {
  return file.split('.')[0];
}

module.exports = require("fs")
  .readdirSync(__dirname)
  .filter(function(file) { return file.indexOf('.api') > -1; })
  .reduce(function(files, file) {
    files[name(file)] = require("./" + file); 
    return files;
  }, {});
