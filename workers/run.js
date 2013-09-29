var ironio = require('node-ironio')('Ws5tXCKbzMMbF6UhF9k9tOQ5v_M');
var project = ironio.projects('5247024edb54190009000004');

module.exports = function() {
  project.tasks.queue({ code_name: 'hello', payload: 'payload' }, function(err, res) {
    console.log('task queued', err, res);
  });
}
