'use strict';

var assert = require('assert'),
  sinon = require('sinon'),
  chai = require('chai');

// Global setup.
global.expect = chai.expect;

var cli = require('../lib/cli');

describe('cli', function () {
  describe('--version', function () {
    it('should log version in package.json');
    it('should not execute Pint');
    it('should ignore other options and parameters');
    it('should return with exit code 0');
  });

  describe('--force', function () {
    it('should take -f or --force');
    it('should execute Pint');
    it('should ignore other options and parameters');
    it('should spawn a grunt process with the --force flag');
    it('should return with exit code 0');
  });

  describe('--verbose', function () {
    it('should take -v or --verbose');
    it('should execute Pint');
    it('should spawn a grunt process with the --force flag');
    it('should return with exit code 0');
  });

  describe('specific runners', function () {
    it('should ignore other options and parameters');
    it('should execute only the specified runners and their dependencies');
  });
});