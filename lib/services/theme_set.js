/**
 *
 *		theme_set.js
 *		aolists
 *
 *		2014-06-17	-	Changes to support aolLists client (by Jose E. Gonzalez jr)
 */
var aofn = module.parent.parent.exports.aofn;

exports.send = function (req, res, credentials, values) {
    aofn.serverCall(credentials, '/metadata/set', {
        'userTheme': values.theme
    }, function (response) {
        aofn.response.done(req);
    });
};