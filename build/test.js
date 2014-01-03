'use strict';

module.exports = {
  name: 'test',

  dependsOn: [],

  build: [
    'jshint'
  ],

  config: {
    jshint: {
      options: {
        jshintrc : '.jshintrc'
      },
      all: [
        './Pint.js',
        './bin/**/*.js',
        './lib/**/*.js',
        './build/**/*.js',
        './test/**/*.js'
      ]
    }
  }
};