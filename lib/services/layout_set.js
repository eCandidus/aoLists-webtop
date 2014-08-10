/**
 *
 *		layout_set.js
 *		aolists
 *
 *		2014-06-17	-	Changes to support aolLists client (by Jose E. Gonzalez jr)
 */
var aofn = module.parent.parent.exports.aofn;

exports.send = function (req, res, credentials, values) {
    var ds = aofn.parseDS(values.objds);
    if (ds) {
        aofn.serverCall(credentials, aofn.formatURL('/{0}/{1}/metadata', ds[0], ds[1]), function (response) {
            response.layout = values.layout || {};
            aofn.serverCall(credentials, aofn.formatURL('/{0}/{1}/metadata', ds[0], ds[1]), response, function (response) {
                aofn.response.done(req);
            });
        });
    } else {
        aofn.response.errorOut(req, 'Missing dataset');
    }
};