'use strict';

var path = require('path');

var getPathRelativeToPint = function (newPath) {
  return path.join(__dirname, '..', newPath);
};

var getPathRelativeToTarget = function (newPath) {
  return path.join(process.cwd(), newPath);
};

var getGlobalConfig = function () {
  var config = require(getPathRelativeToTarget('Pintfile.js')).config;
  return config || {};
};

var getJobs = function () {
  var jobs = require(getPathRelativeToTarget('Pintfile.js')).jobs;
  return jobs || {};
};

module.exports = {
  getPathRelativeToPint: getPathRelativeToPint,
  getPathRelativeToTarget: getPathRelativeToTarget,
  getGlobalConfig: getGlobalConfig,
  getJobs: getJobs
};