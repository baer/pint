'use strict';

var util = require('./util.js'),
  _ = require('underscore');

module.exports = function () {
 
  // Instance stores a reference to the Singleton
  var instance;
 
  function init() {
    var runners = require(util.getPathRelativeToTarget('Pint.js')).build.runners;
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
        delete queuedRunners[runner.name];
      });
    }

    // Queue initial set of runners
    _.each(runners, function (runner) {
      queuedRunners[runner.name] = runner;
    });
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