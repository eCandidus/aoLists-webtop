/**
 *
 *		placeholder_list.js
 *		aolists
 *
 *		2014-06-17	-	Changes to support aolLists client (by Jose E. Gonzalez jr)
 */
var aofn = module.parent.parent.exports.aofn;

exports.send = function (req, res, credentials, values) {
    aofn.getDBLIST(credentials, values, ['_id', '_desc'], function (response) {
        aofn.response.openDataset(req, values, ['id', 'data']);
        if (response && Array.isArray(response)) {
            response.forEach(function (doc) {
                aofn.response.addDataset(req, [doc._id, doc._desc]);
            });
        }
        aofn.response.done(req);
    });
};