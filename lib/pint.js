"use strict"

var _ = require('underscore'),
  fs = require('fs'),
  sys = require('sys'),
  exec = require('child_process').exec,
  program = require('commander'),
  path = require('path');

var pintPath = path.join(__dirname, '..'),
  targetPath = process.cwd()

// CLI
program.version('0.0.1')
  .parse(process.argv);

// Exec new Gruntfile
var execGrunt = function () {
  var pintConfig = require(path.join(process.cwd(), 'Pint.js'));
  var gruntfileTemplate = fs.readFileSync(path.join(pintPath, 'lib/templates/Gruntfile.tmpl'), 'utf8');

  // Stringify config but remove open and closing braces
  var config=JSON.stringify(pintConfig.build.config);
  config = config.substring(1, config.length - 1)

  fs.writeFileSync(path.join(targetPath, "Pintfile.js"), _.template(gruntfileTemplate)({
    gruntTasks : config
  }))

  exec("grunt --gruntfile Pintfile.js", function(err, stdout) {
    sys.puts(stdout.trim());

    exec("rm -rf Pintfile.js", function(err, stdout) {
      sys.puts(stdout.trim());
    });
  });
};

exports.drink = execGrunt;