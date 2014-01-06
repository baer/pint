'use strict';

var assert = require('assert'),
  sinon = require('sinon'),
  chai = require('chai');

// Global setup.
global.expect = chai.expect;

var cli = require('../lib/cli'),
  pint = require('../lib/pint.js');

describe('cli', function () {

  beforeEach(function () {
    // I want to put my stub here but it appears to never be called
    console.log("I am nowhere to be found!");
  });

  describe('--version', function () {
    it('should log version in package.json', function () {
      sinon.stub(pint, 'drink', function () {});

      cli(['--version']);

      // If I have a console log in the test it causes the test to print twice.
      console.log('here');

      // This should not be called but the test says it is.
      sinon.assert.calledOnce(pint.drink);
      pint.drink.restore();
    });
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