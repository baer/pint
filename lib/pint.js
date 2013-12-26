"use strict"

var _ = require('underscore'),
  fs = require('fs'),
  sys = require('sys'),
  exec = require('child_process').exec,
  program = require('commander'),
  path = require('path'),
  Q = require('q');

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
  var runnerPromises = [];
  
  fs.mkdirSync(targetPath('.cask'));

  _.each(runners, function (runner) {
    runnerPromises.push(execGrunt(runner));
  })

  Q.allSettled(runnerPromises).then( function () {
    exec('rm -rf ' + targetPath('.cask'));
  })
}

var execGrunt = function (runner) {
  var deferred = Q.defer();
  var gruntfileTemplate = fs.readFileSync(pintPath('lib/templates/Gruntfile.tmpl'), 'utf8');

  // Create Pintfile
  fs.writeFileSync(targetPath('.cask/' + runner.name + '.js'), _.template(gruntfileTemplate)({
    gruntTasks : JSON.stringify(runner.config).slice(1, -1)
  }))

  // Compile Grunt command
  var gruntCommand = targetPath('node_modules/.bin/grunt') + 
    ' --gruntfile ' + targetPath('.cask/' + runner.name + '.js') +
    ' --base ' + targetPath('');

  // Exec Grunt
  exec(gruntCommand, function(err, stdout) {
    sys.puts(stdout.trim());

    // Resolve the promise 
    deferred.resolve(true);
  });

  return deferred.promise
};

exports.drink = chug;