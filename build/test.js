'use strict';

module.exports = {
  name: 'test',

  dependsOn: [],

  build: [
    'jshint',
    'mochaTest'
  ],

  config: {
    jshint: {
      options: {
        jshintrc : '.jshintrc',
        ignores: ['./node_modules/**/*']
      },
      all: ['./**/*.js']
    },
    mochaTest: {
      test: {
        options: {
          reporter: "spec"
        },
        src: ["test/**/*.spec.js"]
      }
    },
  }
};