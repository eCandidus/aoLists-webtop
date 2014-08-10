/**
 *
 *		util_db.js
 *		aolists
 *
 *      Cryptography related calls
 *
 *		2014-06-17	-	Changes to support aolLists client (by Jose E. Gonzalez jr)
 */
var aofn = module.parent.exports.aofn;

/**
 *	queryXXX - Creates an object with a given key/value
 */
aofn.queryXXX = function (key, value, extra) {
    var ans = {};
    ans[key] = value;
    if (extra) {
        ans = aofn.mergeRecursive(ans, extra);
    }
    return ans;
};

/**
 * parseDS - Parses a dataset value into its component parts
 */
aofn.parseDS = function (value) {
    var ans;
    if (value) {
        ans = value.split('.');
        if (ans.length == 1) {
            ans = [aofn.config.db.defaultdb, ans[0]];
        }
    }
    return ans;
}

/**
 *  getDBLIST - Gets a list of fields from the database
 */
aofn.getDBLIST = function (credentials, params, fields, cb) {
    var wkg = params.objds.split('.');
    var dbname = wkg[0];
    var collname = wkg[1];

    var flds = [];
    if (fields) {
        fields.forEach(function (value) {
            flds.push(aofn.queryXXX(value, 1));
        });
    }

    var query = {
        'o': 'find',
        'skip': params.startrow,
        'limit': params.rowlimit,
        'fields': flds
    };

    if (aofn.hasValue(params.select)) {
        query['matchDESC'] = params.select;
    }

    aofn.serverCall(credentials, aofn.formatURL('/{0}/{1}', dbname, collname) + '?' + require('querystring').stringify(query), function (response) {
        if (cb) {
            cb(response);
        }
    });
};

/**
 *  getDBCOUNT - Gets a count of records
 */
aofn.getDBCOUNT = function (credentials, params, fields, cb) {
    var wkg = params.objds.split('.');
    var dbname = wkg[0];
    var collname = wkg[1];

    var flds = [];
    if (fields) {
        fields.forEach(function (value) {
            flds.push(aofn.queryXXX(value, 1));
        });
    }

    var query = {
        'o': 'count'
    };

    if (aofn.hasValue(params.select)) {
        query['matchDESC'] = params.select;
    }

    aofn.serverCall(credentials, aofn.formatURL('/{0}/{1}', dbname, collname) + '?' + require('querystring').stringify(query), function (response) {
        if (cb) {
            cb(response);
        }
    });
};