/**
 *
 *		geticons.js
 *		aolists
 *
 *		2014-06-17	-	Changes to support aolLists client (by Jose E. Gonzalez jr)
 */
var aofn = module.parent.parent.exports.aofn;

exports.send = function (req, res, credentials, values) {
    aofn.response.openDataset(req, values, ['id', 'Name']);
    aofn.response.addDataset(req, ['', '']);
 
    var cssfiles = aofn.getFILES('/public/solution');
    cssfiles.forEach(function (cssfile) {
        if(aofn.endsWith(cssfile, '.css')) {
            var csslist = aofn.readFILE('/public/solution/' + cssfile);
            csslist = csslist.split('\n');
            csslist.forEach( function(entry) {
                if(aofn.startsWith(entry, '.eci')) {
                    var name = entry.substring(4, entry.indexOf(','));
                    aofn.response.addDataset(req, [name, name]);
                }
            });
        };
    });
    aofn.response.done(req);
};