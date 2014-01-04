'use strict';

var program = require('commander'),
  pint = require('./pint.js'),
  packageInfo = require('../package.json');

module.exports = function (argv) {
  program
    .version(packageInfo.version)
    .option('-v, --verbose', 'Extra verbose output')
    .option('-f, --force', 'Force execution despite warnings')
    .parse(argv);

  pint.drink({
    verbose: program.verbose || false,
    force: program.force || false
  }, program.args);
};