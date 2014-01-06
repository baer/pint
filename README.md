# Pint: A Build tool for the Modern Web

Pint is a concurrent dependency aware wrapper around [Grunt.js](http://http://gruntjs.com/). Because it runs grunt processes under the hood you can continue to take advantage of the enormous Grunt plugin ecosystem and you can reuse all your existing grunt config.  

##### Problems this project is trying to solve

* Build should be concurrent by default
* Build should manage dependencies transparently via a [Directed Acyclic Graph](http://en.wikipedia.org/wiki/Directed_acyclic_graph)
* Build should be well organized
* Build jobs should have a lifecycle. [Gradle](http://www.gradle.org/docs/current/userguide/build_lifecycle.html), [Maven](http://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html), [Ant](http://ant.apache.org/easyant/history/trunk/ref/Defaultlifecycle.html), etc. 

##### Problems with stock Grunt

* Grunt configuration is 100% declarative
* Tasks are grouped by plugin not by functional area
* Versioning and environment profiles are not handled well
* Build dependency management is nonexistent
* No built in concurrency
* There is more to build than tasks!

## Quick Start

##### Install Pint

```bash
new-pint-user$ npm install -g pint
new-pint-user$ pt --help
```


##### Add Pint to your `package.json` file


```javascript
{
  "name": "my-project-name",
  "version": "0.1.0",
  "devDependencies": {
    "pint": "0.0.5",
    "grunt-contrib-jshint": "0.8.0"
  }
}

```

##### Create a new build file. 
Notice that the config here is exactly what you would put in your `Gruntfile.js` and the build array is just a list of what would be Grunt tasks.

```javascript
'use strict';

module.exports = {
  name: 'test',

  dependsOn: [],

  build: [
    'jshint',
  ],

  config: {
    jshint: {
      options: {
        ignores: ['./node_modules/**/*']
      },
      all: ['./**/*.js']
    }
  }
};
```

##### Create a `Pintfile.js` and require in the build file you just made

```javascript
'use strict';

module.exports = {
  build: {
    runners: [
      require('./build/test.js'),
    ]
  },
};

```

##### NPM install your packages and run Pint

```bash
new-pint-user$ npm install
new-pint-user$ pt
```


## Example Projects
* [Pint](https://github.com/baer/pint) - Pint is built with Pint!
* [Pintjs.com](https://github.com/baer/pintjs.com) - Static site using Pint

---

##### TODO:
- [x] Concurrent by default
- [x] Encourage better build organization
- [x] Job dependency management
- [x] Run individual tasks
- [x] initialize and finalize tasks
- [ ] Run arbitrary functions as jobs
- [ ] environment profiles
- [ ] versioning
- [ ] releasing
- [ ] cache busting
- [ ] OS Independant