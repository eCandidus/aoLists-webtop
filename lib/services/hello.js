/**
 *
 *		hello.js
 *		aolists
 *
 *		2014-06-17	-	Changes to support aolLists client (by Jose E. Gonzalez jr)
 */
var aofn = module.parent.parent.parent.exports.aofn;

exports.send = function (req, res, values) {
    aofn.response.set(req, 'ID', aofn.hash(aofn.config.sessionSec + 'salt'));
    aofn.response.done(req);
};