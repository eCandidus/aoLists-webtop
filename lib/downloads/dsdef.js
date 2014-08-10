/**
 *
 *		dsdef_downloads.js
 *		aolists
 *
 *		2014-06-17	-	Changes to support aolLists client (by Jose E. Gonzalez jr)
 */
var aofn = module.parent.parent.exports.aofn;

exports.send = function (req, res, credentials, values) {
    var ds = aofn.parseDS(values.ds);
    if (ds) {
        aofn.serverCall(credentials, aofn.formatURL('/{0}/{1}/metadata', ds[0], ds[1]), function (response) {
            aofn.response.sendDownloadContent(req, ds[1].toLowerCase() + '.json', JSON.stringify(response));
        });
    } else {
        aofn.response.sendDownloadContent(req, 'unknown.json', '');
    }
};