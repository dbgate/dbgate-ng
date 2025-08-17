## Packages
* dbgate-api - backend for dbgate-web
* dbgate-api-core - define controllers, adds express dependency
* dbgate-core - defines shell utilities and processes
* dbgate-workers - depends on dbgate-core (no dependencies on dbgate-api and dbgate-api-core), this package is forked, when creating child worker process