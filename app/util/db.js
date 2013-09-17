
var mongo = require('mongodb').MongoClient;
var rsvp = require('rsvp');

var driver = new rsvp.Promise(function(resolve, reject) {
  console.log(process.env)
  console.log(process.env.MONGOHQ_URL)
  mongo.connect(process.env.MONGOHQ_URL || 'mongodb://localhost:27017/oneplace', function(err, db) {
    err ? reject(err) : resolve(db)
  });
});

function collection(name, cb) {
  console.log('name and cb', name, cb)
  return driver.then(function(db) {
    console.log('inside of driver', db)
    return cb(db.collection(name))
  }, function(e) { console.log('error', e) });
};

module.exports = {

  arrayToQuery: function(arr) {
    return arr.reduce(function(query, set) {
      query[set[0]] = set[1];
      return query;
    }, {});
  },
  
  collection: function(name) {
    console.log('returing bound collection for ', name)
    return collection.bind(null, name);
  }
}

