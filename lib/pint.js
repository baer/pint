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
  job.run({
    verbose: this.verbose,
    force: this.force,
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
  // Clean up if Pint fails unexpectedly
  process.on('uncaughtException', function () {
    console.log('Ooof, One too many. Pint fell off the stool...');
    finalizePint();
  });

  // Initialize Job Queue
  jobQueue = jobQueue(jobArgs);

  // Create a temporary .cask directory
  fs.mkdirSync(util.getPathRelativeToTarget('.cask'));

  // create a concurrent queue
  // Note: opts.gruntOpts must be bound because async.queue methods require have a specific method
  //       signature
  q = async.queue(_.bind(runJob, opts.gruntOpts), opts.concurrencyLimit);

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