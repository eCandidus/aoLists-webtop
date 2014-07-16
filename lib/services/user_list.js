/**
 *
 *		user_list.js
 *		aolists
 *
 *		2014-06-17	-	Changes to support aolLists client (by Jose E. Gonzalez jr)
 */
var aofn = module.parent.parent.exports.aofn;

exports.send = function (req, res, credentials, values) {
    aofn.serverCall(credentials, '/users', function (response) {
        aofn.response.openDataset(req, values, ['id', 'Name']);
        if (response) {
            response.forEach(function (value) {
                if (!values.select.length || value.indexOf(values.select) != -1) {
                    aofn.response.addDataset(req, [value, value]);
                }
            });
        }
        aofn.response.done(req);
    });
};