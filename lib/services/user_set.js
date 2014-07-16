/**
 *
 *		user_set.js
 *		aolists
 *
 *		2014-06-17	-	Changes to support aolLists client (by Jose E. Gonzalez jr)
 */
var aofn = module.parent.parent.exports.aofn;

exports.send = function (req, res, credentials, values) {
    if (aofn.hasValue(values.uname)) {
        var allowed = [];
        for (var key in values) {
            if (key.indexOf('.') != -1) {
                var opriv = values[key],
                    priv = '';
                if (aofn.privALLOWED(opriv, '*')) {
                    priv += '*';
                } else {
                    if (aofn.privALLOWED(opriv, 'a')) {
                        priv += 'a';
                    }
                    if (aofn.privALLOWED(opriv, 'v')) {
                        priv += 'v';
                    }
                    if (aofn.privALLOWED(opriv, 'd')) {
                        priv += 'd';
                    }
                }
                if (aofn.hasValue(priv)) {
                    allowed.push(key + '.' + priv);
                }
            }
        }
        if (aofn.hasValue(values.upwd)) {
            aofn.serverCall(credentials, aofn.format('/users/{0}/{1}', values.uname, values.upwd), function (response) {
                aofn.serverCall(credentials, aofn.format('/users/{0}/metadata/set', values.uname), {
                    'collectionsAllowed': allowed
                }, function (response) {
                    aofn.response.done(req);
                });
            });
        } else {
            aofn.serverCall(credentials, aofn.format('/users/{0}/metadata/set', values.uname), {
                'collectionsAllowed': allowed
            }, function (response) {
                aofn.response.done(req);
            });
        }
    } else {
        aofn.response.errorOut(req, 'Missing user name');
    }
};