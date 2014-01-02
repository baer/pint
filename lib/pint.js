"use strict";

var util = require('./util.js'),
  _ = require('underscore'),
  fs = require('fs'),
  exec = require('child_process').exec,
  spawn = require('child_process').spawn,
  async = require('async'),
  runnersSingleton = require('./runners.js')(),
  q;

var finalizePint = function () {
  exec('rm -rf ' + util.getPathRelativeToTarget('.cask'));
};

var execGrunt = function (runner, next) {
  var gruntfileTemplate = fs.readFileSync(util.getPathRelativeToPint('lib/templates/Gruntfile.tmpl'), 'utf8');
  var outputBuffer = ['--------------------\n', '     ' + runner.name, '\n--------------------\n'];
 
  // Create Pintfile
  fs.writeFileSync(util.getPathRelativeToTarget('.cask/' + runner.name + '.js'), _.template(gruntfileTemplate)({
    gruntTasks : JSON.stringify(runner.config).slice(1, -1)
  }));

  // Compile Grunt command
  var gruntArgs = runner.build.concat([
    '--gruntfile=' + util.getPathRelativeToTarget('.cask/' + runner.name + '.js'),
    '--base=' + util.getPathRelativeToTarget('')
  ]);

  // Spawn a new Grunt process
  var grunt = spawn(util.getPathRelativeToTarget('node_modules/.bin/grunt'), gruntArgs);

  grunt.stdout.on('data', function (data) {
    outputBuffer.push(data);
  });

  grunt.stderr.on('data', function (data) {
    if (/^execvp\(\)/.test(data)) {
      console.log('Failed to start child process.');
    }
    console.log('' + data);
  });

  grunt.on('close', function () {
    console.log(outputBuffer.join(''));
    next();
  });
};

var addRunnersToQueue = function() {
  var runners = runnersSingleton.getInstance();

  _.each(runners.pop(), function (runner, key) {
    q.push(runner, function () {
      runners.complete(key);
      addRunnersToQueue();
    });
  });
};

var chug = function () {
  // Create a temporary .cask directory
  fs.mkdirSync(util.getPathRelativeToTarget('.cask'));

  // create a concurrent queue
  q = async.queue(execGrunt, util.getConcurrencyLimit());

  // finalize Pint after the queue is empty and there are no more runners
  q.drain = function () {  
    if (runnersSingleton.getInstance().isEmpty()) {
      finalizePint();
    }
  };

  // Add initial items to the queue
  addRunnersToQueue();
};

exports.drink = chug;