"use strict"

var _ = require('underscore'),
  fs = require('fs'),
  exec = require('child_process').exec,
  spawn = require('child_process').spawn,
  path = require('path'),
  async = require('async');

var getPathRelativeToPint = function (newPath) {
  return path.join(__dirname, '..', newPath)
};

var getPathRelativeToTarget = function (newPath) {
  return path.join(process.cwd(), newPath)
};

var getRunners = function () {
  return require(getPathRelativeToTarget('Pint.js')).build.runners;
};

var getConcurrencyLimit = function () {
  return Math.max(require('os').cpus().length, 2);
};

var initializePint = function () {
  fs.mkdirSync(getPathRelativeToTarget('.cask'));
};

var finalizePint = function () {
  exec('rm -rf ' + getPathRelativeToTarget('.cask'));
};

var execGrunt = function (runner, next) {
  var gruntfileTemplate = fs.readFileSync(getPathRelativeToPint('lib/templates/Gruntfile.tmpl'), 'utf8');
  var outputBuffer = ['--------------------\n', '     ' + runner.name, '\n--------------------\n'];
 
  // Create Pintfile
  fs.writeFileSync(getPathRelativeToTarget('.cask/' + runner.name + '.js'), _.template(gruntfileTemplate)({
    gruntTasks : JSON.stringify(runner.config).slice(1, -1)
  }));

  // Compile Grunt command
  var gruntArgs = runner.build.concat([
    '--gruntfile=' + getPathRelativeToTarget('.cask/' + runner.name + '.js'),
    '--base=' + getPathRelativeToTarget('')
  ]);

  // Spawn a new Grunt process
  var grunt = spawn(getPathRelativeToTarget('node_modules/.bin/grunt'), gruntArgs);

  grunt.stdout.on('data', function (data) {
    outputBuffer.push(data);
  });

  grunt.stderr.on('data', function (data) {
    if (/^execvp\(\)/.test(data)) {
      console.log('Failed to start child process.');
    }
    console.log('' + data);
  });

  grunt.on('close', function (code) {
    console.log(outputBuffer.join(''));
    next();
  });
};

var chug = function () {
  initializePint();
  async.eachLimit(getRunners(), getConcurrencyLimit(), execGrunt, finalizePint);
}

exports.drink = chug;