/**
 *
 *		dataset_del.js
 *		aolists
 *
 *		2014-06-17	-	Changes to support aolLists client (by Jose E. Gonzalez jr)
 */
var aofn = module.parent.parent.exports.aofn;

exports.send = function (req, res, credentials, values) {
    aofn.response.set(req, values);
    var ds = aofn.parseDS(values.ds);
    if (ds) {
        aofn.serverCall(credentials, aofn.formatURL('/{0}/{1}', ds[0], ds[1]), 'DELETE', function (response) {
            aofn.response.done(req);
        });
    } else {
        aofn.response.errorOut(req, 'Missing dataset');
    }
};