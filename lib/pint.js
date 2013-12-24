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
  var gruntfileTemplate = fs.readFileSync(path.join(lib, 'templates/Gruntfile.tmpl'), 'utf8');
  var pintTasks = fs.readFileSync('Pint.js', 'utf8');

  fs.writeFileSync("./Gruntfile.js", _.template(gruntfileTemplate)({gruntTasks : pintTasks}))

  exec("grunt", function(err, stdout) {
    sys.puts(stdout.trim());

    exec("rm -rf Gruntfile.js", function(err, stdout) {
      sys.puts(stdout.trim());
    });
  });
};

exports.convert = execGrunt;