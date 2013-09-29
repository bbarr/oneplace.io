module.exports = function(grunt) {

  grunt.registerTask('default', 'Log some stuff.', function() {
    grunt.log.write('Logging some stuff...').ok();
  });

  grunt.registerTask('spec', [ 'units', 'features' ]);

  grunt.registerTask('units', 'Running units...', function() {
    var done = this.async();
    require('child_process').exec('mocha ./spec/units', function (err, stdout) {
      grunt.log.write(stdout);
      done(err);
    });
  });

  grunt.registerTask('features', 'Running features...', function() {
    var done = this.async();
    require('child_process').exec('cucumber.js ./spec/features', function (err, stdout) {
      grunt.log.write(stdout);
      done(err);
    });
  });

};
