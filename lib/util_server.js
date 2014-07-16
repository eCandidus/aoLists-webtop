/**
 *
 *		util_server.js
 *		aolists
 *
 *      Server related calls
 *
 *		2014-06-17	-	Changes to support aolLists client (by Jose E. Gonzalez jr)
 */
var app = module.parent.exports.app,
    aofn = module.parent.exports.aofn,
    fs = require('fs'),
    request = require('request');

/**
 *
 */
aofn.serverValidate = function (err, resp, body) {
    // Did we get a valid response?
    if (err || resp.statusCode != 200) {
        // Nope, no soup for you!
        body = null;
    } else {
        try {
            // Is the response JSON?
            body = JSON.parse(body);
        } catch (e) {
            // Nope
            body = null;
        }
    }
    // Here body is JSON if valid response, null otherwise
    return body;
};

/**
 *  serverCall - Calls the aoLists server
 */
aofn.serverCall = function (credentials, call, params, mthd, cb) {
    // Handle optional
    if (typeof mthd == 'function' && !cb) {
        // Move
        cb = mthd;
        mthd = null;
    } else if (typeof params == 'function' && !cb) {
        // Move
        cb = params;
        params = null;
    }
    if (typeof params == 'string' && !mthd) {
        mthd = params;
        params = null;
    }
    // Handle null credentials
    if (!credentials) {
        credentials = (aofn.config.login.username || '') + ':' + (aofn.config.login.password || '');
    }
    // build the URL
    var url = aofn.format('http://{0}@{1}:{2}{3}', credentials, aofn.config.db.host, aofn.config.db.port, call);
    // Do we POST?
    if (params) {
        request.post({
            'url': url,
            'json': params
        }, function (err, resp, body) {
            // Validate
            var response = aofn.serverValidate(err, resp, body);
            // And do callback
            if (cb) {
                cb(response);
            }
        });
    } else if (mthd == 'DELETE') {
        request.del(url, function (err, resp, body) {
            // Validate
            var response = aofn.serverValidate(err, resp, body);
            // And do callback
            if (cb) {
                cb(response);
            }
        });
    } else {
        // a GET will do
        request.get(url, function (err, resp, body) {
            // Validate
            var response = aofn.serverValidate(err, resp, body);
            // And do callback
            if (cb) {
                cb(response);
            }
        });
    }
};