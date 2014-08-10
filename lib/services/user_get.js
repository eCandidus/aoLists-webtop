/**
 *
 *		user_get.js
 *		aolists
 *
 *		2014-06-17	-	Changes to support aolLists client (by Jose E. Gonzalez jr)
 */
var aofn = module.parent.parent.exports.aofn;

exports.send = function (req, res, credentials, values) {
    aofn.response.set(req, values);
    if (aofn.hasValue(values.uname)) {
        aofn.serverCall(credentials, aofn.formatURL('/users/{0}/metadata', values.uname), function (response) {
            var privs = response.collectionsAllowed || [];
            privs.forEach(function (item) {
                var pos = item.lastIndexOf('.');
                var key = item.substring(0, pos);
                var priv = item.substring(pos + 1);
                aofn.response.set(req, key, priv);
            });
            aofn.response.done(req);
        });
    } else {
        aofn.response.errorOut(req, 'Missing user name');
    }
};