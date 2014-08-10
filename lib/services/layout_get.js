/**
 *
 *		layout_get.js
 *		aolists
 *
 *		2014-06-17	-	Changes to support aolLists client (by Jose E. Gonzalez jr)
 */
var aofn = module.parent.parent.exports.aofn;

exports.send = function (req, res, credentials, values) {
    aofn.response.set(req, values);
    var ds = aofn.parseDS(values.objds);
    if (ds) {
        aofn.serverCall(credentials, aofn.formatURL('/{0}/{1}/metadata', ds[0], ds[1]), function (response) {
            aofn.response.set(req, 'layout', response.layout || {});
            aofn.response.done(req);
        });
    } else {
        aofn.response.errorOut(req, 'Missing dataset');
    }
};