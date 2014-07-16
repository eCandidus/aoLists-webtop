/**
 *
 *		util.js
 *		aolists
 *
 *		2014-06-17	-	Utilities (by Jose E. Gonzalez jr)
 */
var app = module.parent.exports.app,
    aofn = module.parent.exports.aofn;

/**
 *  debugSTART - Displays the info at the start of a function call
 */
aofn.debugSTART = function (req, mthd) {
    if (aofn.config.debug) {
        console.log('Called `' + req.route.path + ' (' + (mthd || 'GET') + ') - ' + JSON.stringify(req.params));
    }
};

/**
 * buildBODY - Retrieves the body as JSON
 */
aofn.buildBODY = function (req, cb) {
    require('raw-body')(req, {
        length: req.headers['content-length'],
        limit: '1mb'
    }, function (err, text) {
        if (err || !text) {
            aofn.response.errorOut(req, 'Missing document');
        } else {
            var doc = null;
            var extras = {};
            try {
                var asstring = text.toString();
                if (!aofn.startsWith(asstring, '{')) {
                    // Get first line
                    var eol = asstring.indexOf('\r\n');
                    var fl = asstring.substring(0, eol);
                    // Split each section
                    var sections = asstring.split(fl);
                    // Make invalid
                    asstring = '';
                    // Loop and build extras
                    for (var i = 1; i < sections.length; i++) {
                        var parsed = aofn.parseMULTI(sections[i]);
                        if (aofn.hasValue(parsed.name)) {
                            // Is it the body?
                            if (aofn.startsWith(parsed.name, 'ext-gen')) {
                                // Save
                                asstring = parsed.value;
                            } else {
                                extras[parsed.name] = parsed.value;
                            }
                        }
                    }
                }
                doc = JSON.parse(asstring);
            } catch (e) {
                doc = null;
            }
            // Do we have a document?
            if (!doc) {
                aofn.response.errorOut(req, 'Malformed document');
            } else {
                if (cb) {
                    cb(doc, extras);
                }
            }
        }
    });
};

aofn.parseMULTI = function (value) {
    // Response
    var ans = {
        name: null,
        value: null
    };
    // Find data start
    var delim = value.indexOf('\r\n\r\n');
    // Get value
    ans.value = value.substring(delim + 4, value.length - 2);
    // Find name
    delim = value.indexOf('name="');
    // Get value
    value = value.substring(delim + 6);
    // And end
    delim = value.indexOf('"');
    // Save
    ans.name = value.substring(0, delim);
    //
    return ans;
};

/**
 * mergeRecursive - Merge two objects
 * (From StackOverflow: http://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically)
 */
aofn.mergeRecursive = function (obj1, obj2) {
    for (var p in obj2) {
        try {
            // Property in destination object set; update its value.
            if (obj2[p].constructor == Object) {
                obj1[p] = aofn.mergeRecursive(obj1[p], obj2[p]);
            } else {
                obj1[p] = obj2[p];
            }
        } catch (e) {
            // Property in destination object not set; create it and set its value.
            obj1[p] = obj2[p];
        }
    }

    return obj1;
};

/**
 * createCSS - Creates a CSS file from all of the PNG images in the given directory
 */
aofn.createCSS = function (name, path) {
    // We create the CSS on the fly...
    var css = '';
    // Silk stuff
    var images = aofn.getFILES('/public' + path);
    var prefix = name.toUpperCase();
    images.forEach(function (entry) {
        if (aofn.endsWith(entry, '.png')) {
            var name = entry.substring(0, entry.length - 4).replace(/_/g, '');
            css += aofn.format('.eci{0}{1}, button.eci{0}{1}{background-image: url( ..{3}/{1} );}\r\n', prefix, name, entry, path);
        }
    });
    // Write
    aofn.writeFILE(aofn.format('/public/solution/{0}.css', name), css);
};