/**
 *
 *		theme_get.js
 *		aolists
 *
 *		2014-06-17	-	Changes to support aolLists client (by Jose E. Gonzalez jr)
 */
var aofn = module.parent.parent.exports.aofn;

exports.send = function (req, res, credentials, values) {
    aofn.response.openDataset(req, values, ['id', 'Theme']);
    aofn.response.addDataset(req, ['', 'Default']);

    var themes = aofn.getFOLDERS('/public/themes');
    themes.forEach(function (theme) {
        var files = aofn.getFILES(aofn.format('/public/themes/{0}/css', theme));
        if (files.length > 0) {
            var path = aofn.format('../themes/{0}/css/{1}', theme, files[0]);
            aofn.response.addDataset(req, [path, theme.replace('_', ' ')]);
        }
    });
    aofn.response.done(req);
};