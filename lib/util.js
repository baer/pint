var path = require('path');

module.exports.getPathRelativeToPint = function (newPath) {
  return path.join(__dirname, '..', newPath);
};

module.exports.getPathRelativeToTarget = function (newPath) {
  return path.join(process.cwd(), newPath);
};

module.exports.getConcurrencyLimit = function () {
  return Math.max(require('os').cpus().length, 2);
};