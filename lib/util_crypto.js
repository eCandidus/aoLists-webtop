/**
 *
 *		util_crypto.js
 *		aolists
 *
 *      Cryptography related calls
 *
 *		2014-06-17	-	Changes to support aolLists client (by Jose E. Gonzalez jr)
 */
var app = module.parent.exports.app,
    aofn = module.parent.exports.aofn;

/**
 *  encrypt - Encrypts with password
 */
aofn.encrypt = function (text, key) {
    var cipher = require('crypto').createCipher('aes-256-cbc', key);
    var crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
};

/**
 *  decrypt - Decrypt with password
 */
aofn.decrypt = function (text, key) {
    var decipher = require('crypto').createDecipher('aes-256-cbc', key);
    var dec = decipher.update(text, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
};

/**
 *	hash -
 */
aofn.hash = function (value) {
    return require('crypto').createHash('md5').update(value).digest('hex');
};