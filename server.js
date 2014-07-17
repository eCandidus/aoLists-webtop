/**
 *
 *		server.js
 *		aolists-webtop
 *
 *		2014-06-17	-	aolLists web interface (by Jose E. Gonzalez jr)
 *
 *		aoLists is an simple office management system that supports unattached
 *      devices.
 */

/**
 *  Make room for our utilities
 */
var aofn = {};
module.exports.aofn = aofn;
require('./lib/util');
require('./lib/util_fs');

var fs = require('fs'),
    cluster = require('cluster');

var config = {
    'debug': false, // turn debug messages on/off

    'limitThreads': 1, // number of threads (0 = all, >0 = number of threads, <0 = #cpus not used)

    'id': null, // The site ID

    'login': {
        'username': 'admin', // admin user name
        'pwd': null // password
    },

    'server': {
        'port': 60221, // port to use
        'maxupload': '4MB', // The maximum size of an upload
        'ssl': {
            'cert': null, // file name in the cwd that holds the certificate PEM file
            'key': null // file name in the cwd that holds the private key PEM file
        }
    },

    'sessionSec': 'mysecretgoeshere', // key to encode session with

    'db': {
        'host': 'localhost', // host address for MongoDB server
        'port': 42324, // port
        'defaultdb': 'aoLists', // default database to use
        'cachelayouts': true // cache layots in memory
    }
};
try {
    // config.json hold CHANGES to the settings above
    var chgs = aofn.readFILE('/config.json');
    if (chgs) {
        config = aofn.mergeRecursive(config, JSON.parse(chgs));
    }
} catch (e) {
    console.log('Unable to read "' + process.cwd() + '/config.json' + '" - ' + e);
}
aofn.config = config;

// Load rest
require('./lib/util_crypto');
require('./lib/util_queue');
require('./lib/util_response');
require('./lib/util_string');
require('./lib/util_server');
require('./lib/util_login');
require('./lib/util_user');
require('./lib/util_db');
require('./lib/util_socket');

// Make the site id
var idpath = '/public';
aofn.makePATH(idpath);
    // Make name
var idfile = idpath + '/id';
// Do we have an id?
var id = aofn.readFILE(idfile);
if (!id) {
    id = aofn.UUID();
    aofn.writeFILE(idfile, id);
}
// Set
aofn.config.id = id;

// Log mode
if (aofn.config.debug) {
    console.log('aoLists webtop launching...');
}

// Count CPUs
var numCPUs = require('os').cpus().length;
if (aofn.config.limitThreads > 0) {
    numCPUs = aofn.config.limitThreads;
} else if (aofn.config.limitThreads < 0) {
    numCPUs = numCPUs + aofn.config.limitThreads;
    if (numCPUs < 1) {
        numCPUs = 1;
    }
}

if (!aofn.config.debug && numCPUs > 1 && cluster.isMaster) {
    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('death', function (worker) {
        if (aofn.config.debug) {
            console.log('worker ' + worker.pid + ' died');
        }
    });
} else {
    // Worker processes have a http server.
    var express = require('express');
    var app = module.exports.app = express();

    // Load init
    app.use(function (req, res, next) {
        aofn.response.init(req, res);
        next();
    });

    // Load routes
    require('./lib/webservices');
    require('./lib/httpserver');

    //process.on('exit', function (){
    //	console.log('Goodbye!');
    //});

    // Error handler - no code passed back
    if (!aofn.config.debug) {
        app.use(function (err, req, res, next) {
            res.send(500, 'Internal error');
        });
    }

    // Try to get SSL certificate and private key
    var sslCert,
        pk;
    try {
        pk = fs.readFileSync(process.cwd() + '/pk.pem');
        sslCert = fs.readFileSync(process.cwd() + '/cert.pem');
    } catch (e) { }

    var server;
    // Do we have an SSL cert?
    if (sslCert) {
        // Launch HTTPS
        var https = require('https');
        server = https.createServer({
            key: pk,
            cert: sslCert
        }, app).listen(aofn.config.server.port, function () {
            console.log('aoLists SSL webtop started on port ' + aofn.config.server.port);
            aofn.socket.init(server);
        });
    } else {
        // Launch HTTP
        var http = require('http');
        server = http.createServer(app).listen(aofn.config.server.port, function () {
            console.log('aoLists webtop started on port ' + aofn.config.server.port);
            aofn.socket.init(server);
        });
    }
}