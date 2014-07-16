Name
----

aoLists-webtop - Web interface for aoLists-db.

Description
-----------

The aoLists Webtop provide for a web based user interface to the aoLists package.  

Installation
------------

Installation is via npm: `npm install aolists-webtop`.

Once installed, you can access the API via localhost:60221

Configuration
-------------

The config.json file has been modified to only contain CHANGES to the default configuration settings, found in server.js.  Note that if you are making changes to a sub document (in noSQL parlance), you only need to define the elements that you are changing and not the entire sub-document, for example:

```javascript
{
	"server": {
		"port": "80"
	}
}
```

will change the port entry but leave all others alone.

Default login
-------------

You should create a level manager user in aolists-db that you can use to login and further configure the package.

User documentation
------------------

The user documentation (or manual) will be located at http://aoLists.com.  It is a work in progress.

Dependencies
------------

* Are all indicated in package.json. So far I indicate the lowest version with which I tested the code. Sadly this can result in non-working code when later versions are used.

* aoLists has been tested in Node.js 0.10.29.0

Credits
-------

* [ExtJS V 3.3](http://sencha.com)
* [Express](http://expressjs.com/)
* [npm](http://npmjs.org/)
* [ExtJS Extensions by Jozef Sakáloš, Cornelius Weiss and Merijn Schering]
* [SILK Icons by Mark James]

Authors
------------

* Jose E. Gonzalez jr

License
-------

All code contained herein is distributed under the LGPL 3.0 license, or as described in the code.  All code is copyright 2014 Candid.Concept LC.
