"use strict"

var _ = require('underscore'),
  fs = require('fs'),
  exec = require('child_process').exec,
  spawn = require('child_process').spawn,
  path = require('path'),
  async = require('async'),
  q;

// runnersCollection singleton
var runnersCollection = (function () {
 
  // Instance stores a reference to the Singleton
  var instance;
 
  function init() {
    var runners = require(getPathRelativeToTarget('Pint.js')).build.runners;
    var queuedRunners = {};    
    var workableRunners = {};
    var completedRunners = [];

    function queueRunners() {
      // Determine what is workable
      var workable = _.filter(queuedRunners, function (runner) {
        if (_.difference(runner.dependsOn, completedRunners).length === 0) {
          return true;
        }
      });

      // Move runners from queued to workable
      _.each(workable, function (runner) {
        workableRunners[runner.name] = runner;
        delete queuedRunners[runner.name]
      })
    }

    // Queue initial set of runners
    _.each(runners, function (runner) {
      queuedRunners[runner.name] = runner;
    })    
    queueRunners();

    // Public methods and variables 
    return {
      complete: function (name) {
        completedRunners.push(name);
        queueRunners();
      },

      isEmpty: function () {
        return _.isEmpty(queuedRunners) && _.isEmpty(workableRunners);
      },

      pop: function () {
        var items = workableRunners;
        workableRunners = {};
        return items;
      } 
    };
  };
 
  return {
    // Get the Singleton instance if one exists
    // or create one if it doesn't
    getInstance: function () {
      if ( !instance ) {
        instance = init();
      }
      return instance;
    }
  };
})();

var getPathRelativeToPint = function (newPath) {
  return path.join(__dirname, '..', newPath)
};

var getPathRelativeToTarget = function (newPath) {
  return path.join(process.cwd(), newPath)
};

var getConcurrencyLimit = function () {
  return Math.max(require('os').cpus().length, 2);
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

var addRunnersToQueue = function() {
  var runners = runnersCollection.getInstance();

  _.each(runners.pop(), function (runner, key) {
    q.push(runner, function (err) {
      runners.complete(key);
      addRunnersToQueue();
    });
  });
};

var chug = function () {
  // Create a temporary .cask directory
  fs.mkdirSync(getPathRelativeToTarget('.cask'));

  // create a concurrent queue
  q = async.queue(execGrunt, getConcurrencyLimit());

  // finalize Pint after the queue is empty and there are no more runners
  q.drain = function () {  
    if (runnersCollection.getInstance().isEmpty()) {
      finalizePint();
    }
  }

  // Add initial items to the queue
  addRunnersToQueue();
}

exports.drink = chug;