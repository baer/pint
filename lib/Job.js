'use strict';

var util = require('./util.js'),
  _ = require('underscore'),
  fs = require('fs'),
  exec = require('child_process').exec,
  spawn = require('child_process').spawn;

function Job(name) {
  this.name = name;

  var config = require(util.getPathRelativeToTarget('Pint.js')).jobs;
  this.config = _.findWhere(config, {name: this.name});
}

Job.prototype.run = function (options) {
  var opts = options || {};

  var templatePath = util.getPathRelativeToPint('lib/templates/Gruntfile.tmpl'),
    gruntfileTemplate = fs.readFileSync(templatePath, 'utf8'),
    gruntFile = _.template(gruntfileTemplate)({
      projectConfigVariables: JSON.stringify(util.getGlobalConfig()),
      gruntTasks : JSON.stringify(this.config.config).slice(1, -1)
    });

  // TODO: Figure out how to do output
  var outputBuffer = ['--------------------\n', '     ' + this.name, '\n--------------------\n'];

  // Create Gruntfile
  fs.writeFileSync(util.getPathRelativeToTarget('.cask/' + this.name + '.js'), gruntFile);

  // Compile Grunt command
  var gruntArgs = this.config.build.concat([
    '--gruntfile=' + util.getPathRelativeToTarget('.cask/' + this.name + '.js'),
    '--base=' + util.getPathRelativeToTarget('')
  ]);

  if (opts.verbose) {
    gruntArgs.push('--verbose');
  } else if (opts.force) {
    gruntArgs.push('--force');
  }

  // Initialize job
  if (_.isFunction(this.config.initialize)) {
    this.config.initialize();
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

  var self = this;
  grunt.on('close', function () {
    console.log(outputBuffer.join(''));
    // Finalize job
    if (_.isFunction(self.config.finalize)) {
      self.config.finalize();
    }
    // Call Success Handler
    if (_.isFunction(opts.success)) {
      opts.success();
    }
  });
};

module.exports = Job;