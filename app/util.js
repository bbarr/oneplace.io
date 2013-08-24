
module.exports = {
  
  csvToArray: function(str) {
    return this.toArray((str || '').split(','));
  }
}
