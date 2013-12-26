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

var getPintConfig = function () {
  var pintConfig = require(targetPath('Pint.js'));
  // Stringify config but remove open and closing braces
  return pintConfig.build.runners[0].config;
}

// Exec new Gruntfile
var execGrunt = function () {
  var gruntfileTemplate = fs.readFileSync(pintPath('lib/templates/Gruntfile.tmpl'), 'utf8');

  // Create Pintfile
  fs.writeFileSync(targetPath("Pintfile.js"), _.template(gruntfileTemplate)({
    gruntTasks : JSON.stringify(getPintConfig()).slice(1, -1)
  }))

  // Exec Grunt
  var gruntCommand = targetPath('node_modules/.bin/grunt') + ' --gruntfile ' + targetPath('Pintfile.js');
  exec(gruntCommand, function(err, stdout) {
    sys.puts(stdout.trim());

    // Remove Pintfile.js
    exec('rm -rf Pintfile.js', function(err, stdout) { sys.puts(stdout.trim()); });
  });
};

exports.drink = execGrunt;