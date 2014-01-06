'use strict';

var util = require('./util.js'),
  _ = require('underscore'),
  fs = require('fs'),
  exec = require('child_process').exec,
  async = require('async'),
  jobQueue = require('./jobQueue.js'),
  q;

var finalizePint = function () {
  exec('rm -rf ' + util.getPathRelativeToTarget('.cask'));
};

var runJob = function (job, next) {
  // This is here from _.bind simply because async.queue methods have a specific signature
  this.options = this.options || {};

  job.run({
    verbose: this.options.verbose,
    force: this.options.force,
    success: next
  });
};

var addJobsToQueue = function () {
  var jobQueueInstance = jobQueue.getInstance();

  _.each(jobQueueInstance.pop(), function (job, jobName) {
    q.push(job, function () {
      jobQueueInstance.complete(jobName);
      addJobsToQueue();
    });
  });
};

var drink = function (opts, jobArgs) {
  // Initialize Job Queue
  jobQueue = jobQueue(jobArgs);

  // Create a temporary .cask directory
  fs.mkdirSync(util.getPathRelativeToTarget('.cask'));

  // create a concurrent queue
  q = async.queue(_.bind(runJob, {options: opts}), util.getConcurrencyLimit());

  // finalize Pint after the queue is empty and there are no more jobs
  q.drain = function () {
    if (jobQueue.getInstance().isEmpty()) {
      finalizePint();
    }
  };

  // Add initial items to the queue
  addJobsToQueue();
};

exports.drink = drink;