/**
 *
 *		util_user.js
 *		aolists
 *
 *      Login call related calls
 *
 *		2014-06-17	-	Changes to support aolLists client (by Jose E. Gonzalez jr)
 */
var aofn = module.parent.exports.aofn;

/**
 *  getUNAME - Gets the user name from credentials
 */
aofn.getUNAME = function (cred) {
    var ans = cred;
    var pos = ans.indexOf(':');
    if (pos != -1) {
        ans = ans.substring(0, pos);
    }
    return ans;
};

/**
 *  privALLOWED - Check to saee if the privilege is allowed
 */
aofn.privALLOWED = function (privileges, type) {
    return (privileges.indexOf(type) != -1) || (privileges.indexOf('*') != -1);
};