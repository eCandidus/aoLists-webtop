/**
 *
 *		user_me.js
 *		aolists
 *
 *		2014-06-17	-	Changes to support aolLists client (by Jose E. Gonzalez jr)
 */
var aofn = module.parent.parent.exports.aofn;

exports.send = function (req, res, credentials, values) {
    if (aofn.hasValue(values.uname)) {
        aofn.serverCall(credentials, '/metadata/set', {
            'userName': values.uname
        }, function (response) {
            if (aofn.hasValue(values.upwd)) {
                aofn.serverCall(credentials, aofn.formatURL('/users/{0}/{1}', aofn.getUNAME(credentials), values.upwd), function (response) {
                    aofn.response.done(req);
                });
            } else {
                aofn.response.done(req);
            }
        });
    } else if (aofn.hasValue(values.upwd)) {
        aofn.serverCall(credentials, aofn.formatURL('/users/{0}/{1}', aofn.getUNAME(credentials), values.upwd), function (response) {
            aofn.response.done(req);
        });
    } else {
        aofn.response.done(req);
    }
};