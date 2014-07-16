/**
 *
 *		util_fs.js
 *		aolists
 *
 *      File system related calls
 *
 *		2014-06-17	-	Utilities (by Jose E. Gonzalez jr)
 */
var app = module.parent.exports.app,
    aofn = module.parent.exports.aofn,
    fs = require('fs');

/**
 * readFILE - Reads a file
 */
aofn.readFILE = function (file) {
    var ans;
    try {
        file = process.cwd() + file;
        if (fs.existsSync(file)) {
            ans = fs.readFileSync(file).toString();
        }
    } catch (e) {}
    return ans;
};

/**
 * writeFILE - Writes a file
 */
aofn.writeFILE = function (file, content, options) {
    try {
        ans = fs.writeFileSync(process.cwd() + file, content, options);
    } catch (e) {}
};

/**
 * getFILES - Gets the files at a given folder
 */
aofn.getFILES = function (rootDir) {
    var ans = [];
    try {
        if (!rootDir) {
            rootDir = '/';
        }
        rootDir = process.cwd() + rootDir;
        if (fs.existsSync(rootDir)) {
            var files = fs.readdirSync(rootDir);

            files.forEach(function (file, index) {
                if (file[0] != '.') {
                    var filePath = rootDir + '/' + file;
                    try {
                        if (fs.statSync(filePath).isFile()) {
                            ans.push(file);
                        }
                    } catch (e) {}
                }
            });
        }
    } catch (e) {}
    //
    return ans;
};

/**
 * getFOLDERS - Gets the folders at a given folder
 */
aofn.getFOLDERS = function (rootDir) {
    var ans = [];
    if (!rootDir) {
        rootDir = '/';
    }
    rootDir = process.cwd() + rootDir;
    var files = fs.readdirSync(rootDir);

    files.forEach(function (file, index) {
        if (file[0] != '.') {
            var filePath = rootDir + '/' + file;
            try {
                if (fs.statSync(filePath).isDirectory()) {
                    ans.push(file);
                }
            } catch (e) {}
        }
    });
    //
    return ans;
};

/**
 * makePATH - Makes a path
 */
aofn.makePATH = function (path) {
    var folders = path.split('/');
    var dir = process.cwd();
    folders.forEach(function (folder) {
        dir += '/' + folder;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
    });
};