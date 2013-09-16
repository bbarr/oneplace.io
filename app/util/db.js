
var mongo = require('mongodb').MongoClient;
var rsvp = require('rsvp');

var driver = new rsvp.Promise(function(resolve, reject) {
  mongo.connect(process.env.MONGOHQ_URL || 'mongodb://localhost:27017/oneplace', function(err, db) {
    err ? reject(err) : resolve(db)
  });
});

function collection(name, cb) {
  return driver.then(function(db) {
    return cb(db.collection(name))
  });
};

module.exports = {

  arrayToQuery: function(arr) {
    return arr.reduce(function(query, set) {
      query[set[0]] = set[1];
      return query;
    }, {});
  },
  
  collection: function(name) {
    return collection.bind(null, name);
  }
}

