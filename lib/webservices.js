/**
 *
 *		webservices.js
 *		aolists
 *
 *		2014-06-17	-	Utilities (by Jose E. Gonzalez jr)
 */
var app = module.parent.exports.app,
    aofn = module.parent.exports.aofn;

/**
 *      /service
 *
 */
app.post('/service', function (req, res) {
    aofn.debugSTART(req);

    aofn.buildBODY(req, function (doc) {
        // Setup
        aofn.response.init(req, res);
        aofn.response.setSvc(req, doc);
        // Standarize
        if (!doc.method || !doc.method.length) {
            aofn.response.errorOut(req, 'Missing method');
        } else {
            doc.method = doc.method.toLowerCase();
            if (doc.signature) {
                doc.signature = new Buffer(doc.signature, 'base64').toString('ascii');
            }
            // The hello method establishes the connection
            if (doc.method == 'hello') {
                // Pass back security key (future use)
                aofn.response.set(req, 'id', aofn.hash(aofn.config.sessionSec));
                // Bye
                aofn.response.done(req);
            } else if (doc.method == 'access_in') {
                // These do not need to be validated
                require('./services/' + doc.method).send(req, res, null, doc.params);
            } else {
                // Get the username and pwd
                if (!doc.signature) {
                    aofn.response.errorOut(req, 'Who are you?');
                } else {
                    // Call
                    try {
                        require('./services/' + doc.method).send(req, res, doc.signature, doc.params);
                    } catch (e) {
                        var msg = 'Invalid method - ' + doc.method;
                        if (aofn.config.debug) {
                            msg += ' - ' + e;
                        }
                        aofn.response.errorOut(req, msg);
                    }
                }
            }
        }
    });
});