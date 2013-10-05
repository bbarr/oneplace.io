
function name(file) {
  return file.split('.')[0];
}

module.exports = require("fs")
  .readdirSync(__dirname)
  .filter(function(file) { return file.indexOf('.adapter') > -1; })
  .reduce(function(files, file) {
    var fileObj = files[name(file)] = require("./" + file); 
    fileObj.name = name(file);
    return files;
  }, {});
