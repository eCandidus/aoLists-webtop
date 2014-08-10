/**
 *
 *		user_del.js
 *		aolists
 *
 *		2014-06-17	-	Changes to support aolLists client (by Jose E. Gonzalez jr)
 */
var aofn = module.parent.parent.exports.aofn;

exports.send = function (req, res, credentials, values) {
    if (aofn.hasValue(values.uname) && values.uname != aofn.getUNAME(credentials)) {
        aofn.serverCall(credentials, aofn.formatURL('/users/{0}', values.uname), 'DELETE');
        aofn.response.done(req);
    } else {
        aofn.response.errorOut(req, 'Missing name and/or credentials');
    }
};