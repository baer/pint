"use strict"

var _ = require('underscore'),
  fs = require('fs'),
  sys = require('sys'),
  exec = require('child_process').exec,
  program = require('commander');

var path = require('path'),
  fs = require('fs'),
  lib = path.join(path.dirname(fs.realpathSync(__filename)), '../lib');

// CLI
program.version('0.0.1')
  .parse(process.argv);

// Exec new Gruntfile
var execGrunt = function () {
  var pintConfig = require(path.join(process.cwd(), 'Pint.js'));
  var gruntfileTemplate = fs.readFileSync(path.join(lib, 'templates/Gruntfile.tmpl'), 'utf8');

  // Stringify config but remove open and closing braces
  var config=JSON.stringify(pintConfig.build.config);
  config = config.substring(1, config.length - 1)

  fs.writeFileSync("./Gruntfile.js", _.template(gruntfileTemplate)({
    gruntTasks : config
  }))

  exec("grunt", function(err, stdout) {
    sys.puts(stdout.trim());

    exec("rm -rf Gruntfile.js", function(err, stdout) {
      sys.puts(stdout.trim());
    });
  });
};

exports.drink = execGrunt;