/**
 *
 *		dsdef_uploads.js
 *		aolists
 *
 *		2014-06-17	-	Changes to support aolLists client (by Jose E. Gonzalez jr)
 */
var aofn = module.parent.parent.exports.aofn;

exports.send = function (req, res, credentials, values, document, extras) {
    var ds = aofn.parseDS(document._id);
    if (ds) {
        aofn.serverCall(credentials, aofn.formatURL('/{0}/{1}/metadata', ds[0], ds[1]), document, function (response) {
            aofn.response.set(req, 'passback', ds.join('.'));
            aofn.response.done(req);
        });
    } else {
        aofn.response.done(req);
    }
};