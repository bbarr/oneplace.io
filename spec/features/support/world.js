var zombie = require('zombie');
var RestClient = require('node-rest-client').Client;


var World = function World(callback) {

  this.browser = new zombie();
  this.http = new RestClient();

  callback();
};

exports.World = World;
