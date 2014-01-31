'use strict';

var program = require('commander'),
  pint = require('./pint.js'),
  packageInfo = require('../package.json');

module.exports = function (argv) {
  program
    .version(packageInfo.version)
    .option('-v, --verbose', 'Extra verbose output')
    .option('-f, --force', 'Force execution despite warnings')
    .option('-l, --limit <n>', 'Set the maximum number of concurrent jobs (Default: CPUs)', parseInt)
    .parse(argv);

  pint.drink({
    concurrencyLimit: program.limit || Math.max(require('os').cpus().length, 2),
    gruntOpts: {
      verbose: program.verbose || false,
      force: program.force || false
    }
  }, program.args);
};