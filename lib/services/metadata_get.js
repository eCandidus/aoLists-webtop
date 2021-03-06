﻿/**
 *
 *		metadata_get.js
 *		aolists
 *
 *		2014-06-17	-	Changes to support aolLists client (by Jose E. Gonzalez jr)
 */
var aofn = module.parent.parent.exports.aofn;

exports.send = function (req, res, credentials, values) {
    aofn.response.makeValuesArray(req);
    aofn.serverCall(credentials, '/allmetadata', function (response) {
        if (response && Array.isArray(response)) {
            response.forEach(function (value) {
                aofn.response.addValueToArray(req, value);
            });
        }
        aofn.response.sendArray(req);
    });
};