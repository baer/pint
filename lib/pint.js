"use strict"

var _ = require('underscore'),
  fs = require('fs'),
  exec = require('child_process').exec,
  spawn = require('child_process').spawn,
  program = require('commander'),
  path = require('path'),
  async = require('async');

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
  var runners = require(targetPath('Pint.js')).build.runners,
    concurrentLimit = Math.max(require('os').cpus().length, 2);

  fs.mkdirSync(targetPath('.cask'));
  
  async.eachLimit(runners, concurrentLimit, execGrunt, function () {
    exec('rm -rf ' + targetPath('.cask'));
  });
}

var execGrunt = function (runner, next) {
  var gruntfileTemplate = fs.readFileSync(pintPath('lib/templates/Gruntfile.tmpl'), 'utf8');

  // Create Pintfile
  fs.writeFileSync(targetPath('.cask/' + runner.name + '.js'), _.template(gruntfileTemplate)({
    gruntTasks : JSON.stringify(runner.config).slice(1, -1)
  }));

  // Compile Grunt command
  var gruntArgs = runner.build.concat([
    '--gruntfile=' + targetPath('.cask/' + runner.name + '.js'),
    '--base=' + targetPath('')
  ]);

  // Spawn a new Grunt process
  var grunt = spawn(targetPath('node_modules/.bin/grunt'), gruntArgs);

  grunt.stdout.on('data', function (data) {
    console.log('' + data);
  });

  grunt.stderr.on('data', function (data) {
    if (/^execvp\(\)/.test(data)) {
      console.log('Failed to start child process.');
    }
    console.log('' + data);
  });

  grunt.on('close', function (code) {
    next();
  });
};

exports.drink = chug;