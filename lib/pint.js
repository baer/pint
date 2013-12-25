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

// Exec new Gruntfile
var execGrunt = function () {
  var pintConfig = require(path.join(process.cwd(), 'Pint.js'));
  var gruntfileTemplate = fs.readFileSync(pintPath('lib/templates/Gruntfile.tmpl'), 'utf8');

  // Stringify config but remove open and closing braces
  var config=JSON.stringify(pintConfig.build.config);
  config = config.substring(1, config.length - 1)

  fs.writeFileSync(targetPath("Pintfile.js"), _.template(gruntfileTemplate)({
    gruntTasks : config
  }))

  exec('grunt --gruntfile ' + targetPath('Pintfile.js'), function(err, stdout) {
    sys.puts(stdout.trim());

    exec('rm -rf Pintfile.js', function(err, stdout) {
      sys.puts(stdout.trim());
    });
  });
};

exports.drink = execGrunt;