'use strict';

var util = require('./util.js'),
  _ = require('underscore'),
  Job = require('./Job.js');

var getAllPossibleJobs = function () {
  var jobConfigs = util.getJobs(),
    jobArgs = [];

  _.each(jobConfigs, function (jobConfig) {
    jobArgs.push(jobConfig.name);
  });
  return jobArgs;
};

module.exports = function (jobArgs) {

  // Instance stores a reference to the Singleton
  var instance;
 
  function init() {
    var queuedJobs = {};
    var workableJobs = {};
    var completedJobs = [];

    function queueWorkableJobs(queue, workableJobs) {
      // Determine what is workable
      var workable = _.filter(queue, function (job) {
        if (_.difference(job.config.dependsOn, completedJobs).length === 0) {
          return true;
        }
      });

      // Move jobs from queued to workable
      _.each(workable, function (job) {
        workableJobs[job.name] = job;
        delete queue[job.name];
      });
    }

    function createJobs(jobArgs) {
      var jobs = {};
      jobArgs = (jobArgs.length === 0) ? getAllPossibleJobs() : jobArgs;

      _.each(jobArgs, function (jobArg) {
        jobs[jobArg] = new Job(jobArg);
      });

      return jobs;
    }

    // Queue initial set of jobs
    queuedJobs = createJobs(jobArgs);
    queueWorkableJobs(queuedJobs, workableJobs);

    // Public methods and variables 
    return {
      complete: function (name) {
        completedJobs.push(name);
        queueWorkableJobs(queuedJobs, workableJobs);
      },

      isEmpty: function () {
        return _.isEmpty(queuedJobs) && _.isEmpty(workableJobs);
      },

      pop: function () {
        var items = workableJobs;
        workableJobs = {};
        return items;
      }
    };
  }
 
  return {
    // Get the Singleton instance if one exists
    // or create one if it doesn't
    getInstance: function () {
      if (!instance) {
        instance = init();
      }
      return instance;
    }
  };
};