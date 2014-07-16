/**
 *
 *		user_active.js
 *		aolists
 *
 *		2014-06-17	-	Changes to support aolLists client (by Jose E. Gonzalez jr)
 */
var aofn = module.parent.parent.exports.aofn;

exports.send = function (req, res, credentials, values) {
    aofn.response.openDataset(req, values, ['id', 'Name']);
    for (var name in aofn.socket.users) {
        aofn.response.addDataset(req, [name, name]);
    }
    aofn.response.addDataset(req, ['', '*']);
    aofn.response.done(req);
};