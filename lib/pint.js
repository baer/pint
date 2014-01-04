'use strict';

var util = require('./util.js'),
  _ = require('underscore'),
  fs = require('fs'),
  exec = require('child_process').exec,
  spawn = require('child_process').spawn,
  async = require('async'),
  jobQueue = require('./jobsQueue.js'),
  q;

var finalizePint = function () {
  exec('rm -rf ' + util.getPathRelativeToTarget('.cask'));
};

var execGrunt = function (runner, next) {
  var templatePath = util.getPathRelativeToPint('lib/templates/Gruntfile.tmpl'),
    gruntfileTemplate = fs.readFileSync(templatePath, 'utf8'),
    gruntFile = _.template(gruntfileTemplate)({
      gruntTasks : JSON.stringify(runner.config).slice(1, -1)
    });

  // TODO: Figure out how to do output
  var outputBuffer = ['--------------------\n', '     ' + runner.name, '\n--------------------\n'];

  // Create Gruntfile
  fs.writeFileSync(util.getPathRelativeToTarget('.cask/' + runner.name + '.js'), gruntFile);

  // Compile Grunt command
  var gruntArgs = runner.build.concat([
    '--gruntfile=' + util.getPathRelativeToTarget('.cask/' + runner.name + '.js'),
    '--base=' + util.getPathRelativeToTarget('')
  ]);

  if (this.verbose) {
    gruntArgs.push('--verbose');
  } else if (this.force) {
    gruntArgs.push('--force');
  }

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

var addRunnersToQueue = function () {
  var runners = jobQueue.getInstance();

  _.each(runners.pop(), function (runner, key) {
    q.push(runner, function () {
      runners.complete(key);
      addRunnersToQueue();
    });
  });
};

var drink = function (opts, runners) {
  // Initialize Job Queue
  jobQueue = jobQueue(runners);

  // Create a temporary .cask directory
  fs.mkdirSync(util.getPathRelativeToTarget('.cask'));

  // create a concurrent queue
  q = async.queue(_.bind(execGrunt, opts), util.getConcurrencyLimit());

  // finalize Pint after the queue is empty and there are no more runners
  q.drain = function () {
    if (jobQueue.getInstance().isEmpty()) {
      finalizePint();
    }
  };

  // Add initial items to the queue
  addRunnersToQueue();
};

exports.drink = drink;