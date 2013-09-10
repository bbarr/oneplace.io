
var mongo = require('mongodb').MongoClient;

var driver = (function(cb) {
  var cachedDriver;
  return function(cb) {
    if (cachedDriver) return cb(cachedDriver);
    mongo.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/oneplace', function(err, db) {
      cb(cachedDriver = db);
    });
  };
})();

function collection(name, cb) {
  return driver(function(db) {
    return cb(db.collection(name));
  });
};

module.exports = function(name) {
  return collection.bind(null, name);
}
