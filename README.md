# Pint

Pint is built with Pint so for an example you can just check out the Pintfile in the build directory!
To check out the Pint website (A much more typical project built with this tool) check out [Pintjs.com](http://pintjs.com)

##### Problems this project is trying to solve

* Build should be concurrent by default
* Build should manage dependencies transparently via a [Directed Acyclic Graph](http://en.wikipedia.org/wiki/Directed_acyclic_graph)

##### Problems with stock Grunt

* Grunt configuration is 100% declarative
* Tasks are grouped by plugin not by functional area
* Versioning and environment profiles are not handled well
* Build dependency management is non existent
* No built in concurrency
* There is more to build than tasks!

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
