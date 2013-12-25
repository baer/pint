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

var symlinkGruntDependencies = function () {
  fs.symlinkSync(pintPath('node_modules/grunt'), targetPath('node_modules/grunt'), 'dir');
  fs.symlinkSync(pintPath('node_modules/grunt-cli'), targetPath('node_modules/grunt-cli'), 'dir');
  fs.symlinkSync(pintPath('node_modules/.bin/grunt'), targetPath('node_modules/.bin/grunt'));
}

var unlinkGruntDependencies = function () {
  fs.unlinkSync(targetPath('node_modules/grunt'));
  fs.unlinkSync(targetPath('node_modules/grunt-cli'));
  fs.unlinkSync(targetPath('node_modules/.bin/grunt'));
}

// Exec new Gruntfile
var execGrunt = function () {
  var pintConfig = require(targetPath('Pint.js'));
  var gruntfileTemplate = fs.readFileSync(pintPath('lib/templates/Gruntfile.tmpl'), 'utf8');

  // Stringify config but remove open and closing braces
  var config = JSON.stringify(pintConfig.build.config).slice(1, -1);

  // Create Pintfile
  fs.writeFileSync(targetPath("Pintfile.js"), _.template(gruntfileTemplate)({
    gruntTasks : config
  }))

  // Symlink Resources
  symlinkGruntDependencies();

  // Exec Grunt
  exec('grunt --gruntfile ' + targetPath('Pintfile.js'), function(err, stdout) {
    sys.puts(stdout.trim());

    // Remove Pintfile and Symlinks
    exec('rm -rf Pintfile.js', function(err, stdout) { sys.puts(stdout.trim()); });
    unlinkGruntDependencies();
  });
};

exports.drink = execGrunt;