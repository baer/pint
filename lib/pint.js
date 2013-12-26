"use strict"

var _ = require('underscore'),
  fs = require('fs'),
  sys = require('sys'),
  exec = require('child_process').exec,
  program = require('commander'),
  path = require('path');

// CLI
program.version('0.0.1')
  .parse(process.argv);

var pintPath = function (newPath) {
  return path.join(__dirname, '..', newPath)
}

var targetPath = function (newPath) {
  return path.join(process.cwd(), newPath)
}

var chug = function () {
  var runners = require(targetPath('Pint.js')).build.runners;

  _.each(runners, function (runner) {
    execGrunt(runner);
  })
}

// Exec new Gruntfile
var execGrunt = function (runner) {
  var gruntfileTemplate = fs.readFileSync(pintPath('lib/templates/Gruntfile.tmpl'), 'utf8');

  // Create Pintfile
  fs.writeFileSync(targetPath("Pintfile.js"), _.template(gruntfileTemplate)({
    gruntTasks : JSON.stringify(runner.config).slice(1, -1)
  }))

  // Exec Grunt
  var gruntCommand = targetPath('node_modules/.bin/grunt') + ' --gruntfile ' + targetPath('Pintfile.js');
  exec(gruntCommand, function(err, stdout) {
    sys.puts(stdout.trim());

    // Remove Pintfile.js
    exec('rm -rf Pintfile.js', function(err, stdout) { sys.puts(stdout.trim()); });
  });
};

exports.drink = chug;