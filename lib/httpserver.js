/**
 *
 *		rest.js
 *		aolists
 *
 *		2014-06-17	-	Changes to support aolLists client (by Jose E. Gonzalez jr)
 */
var app = module.parent.exports.app,
    aofn = module.parent.exports.aofn,
    fs = require('fs');

/**
 *      /
 *
 *      Returns the starting page
 */
app.get('/', function (req, res) {
    aofn.debugSTART(req);

    aofn.response.sendPage(req, '/index.html');
});

/**
 *      use
 *
 *      Returns the uri
 */
app.use(function (req, res) {
    if (aofn.debug) {
        console.log(req.originalUrl);
    }

    // Downloads
    var path = req._parsedUrl.pathname;
    if (aofn.endsWith(path, '.download')) {
        var op = path.substring(1, path.lastIndexOf('.'));
        if (aofn.hasValue(op)) {
            require('./downloads/' + op.toLowerCase()).send(req, res, null, req.query);
        } else {
            aofn.response.sendDownloadContent(req, 'empty.txt', '');
        }
    } else if (aofn.endsWith(path, '.upload')) {
        var op = path.substring(1, path.lastIndexOf('.'));
        if (aofn.hasValue(op)) {
            aofn.buildBODY(req, function (doc, extras) {
                require('./uploads/' + op.toLowerCase()).send(req, res, null, req.query, doc, extras);
            });
        } else {
            aofn.response.done(req);
        }
    } else {
        try {
            aofn.response.sendPage(req, req.originalUrl);
        } catch (e) {}
    }
});