/**
 *
 *		access_in.js
 *		aolists
 *
 *		2014-06-17	-	Changes to support aolLists client (by Jose E. Gonzalez jr)
 */
var aofn = module.parent.parent.exports.aofn;

exports.send = function (req, res, credentials, values) {
    aofn.serverCall(credentials, aofn.formatURL('/users/{0}/{1}/validate', values.userNickname, values.password), function (response) {
        if (!response || response.ok !== 1) {
            aofn.response.errorOut(req, 'Unable to validate');
        } else {
            // Mgr?
            var isMgr = (response.level == 'manager');
            // Set the signature
            aofn.response.set(req, 'signature', new Buffer(values.userNickname + ":" + values.password).toString('base64'));
            // And pass back profile
            aofn.serverCall(values.userNickname + ':' + values.password, '/metadata', function (response) {
                response.userLogin = values.userNickname;
                response.isMgr = isMgr;
                response.toolDefinitions = [];
                response.toolDefinitions.push(aofn.addTOOL('Quick Msg', 'QMSend'));
                response.toolDefinitions.push(aofn.addTOOL('Themes', 'PickTheme'));
                response.toolDefinitions.push(aofn.addTOOL('Settings', 'UserSettings', 'Tools'));

                if (response.isMgr) {
                    response.toolDefinitions.push(aofn.addTOOL('-'));
                    response.toolDefinitions.push(aofn.addTOOL('Users', 'Users', 'Who'));
                    response.toolDefinitions.push(aofn.addTOOL('Datasets', 'Datasets', 'aoLists'));
                }

                var sets = response.collectionsAllowed || [];
                response.menuDefinitions = [];
                var wat = {
                    level: sets.length
                };
                sets.forEach(function (element, index, array) {
                    var set = element.split('.');
                    if (set.length > 1) {
                        var db = set [0];
                        var collection = set [1];
                        var privileges = 'avd';
                        if (set.length > 2) {
                            privileges = set [2];
                        }
                        var shortID = set [0] + '.' + set [1];
                        aofn.serverCall(credentials, aofn.formatURL('/{0}/{1}/metadata', db, collection), function (lresp) {
                            // Valid?
                            if (lresp._desc && ! lresp.ishid) {
                                // The top level item
                                var menu = aofn.addMENU(collection, lresp._desc, lresp.icon, shortID);
                                // Now add the commands
                                if (aofn.privALLOWED(privileges, 'a')) {
                                    aofn.addSUB(menu, 'Add');
                                }
                                if (aofn.privALLOWED(privileges, 'v')) {
                                    aofn.addSUB(menu, 'View');
                                }
                                if (aofn.privALLOWED(privileges, 'd')) {
                                    aofn.addSUB(menu, 'Delete');
                                }
                                // Add to menus
                                response.menuDefinitions.push(menu);
                            }
                            wat.level--;
                            if (wat.level === 0) {
                                response.menuDefinitions.sort(function(a,b) {return (a.menuName > b.menuName) ? 1 : ((b.menuName > a.menuName) ? -1 : 0);} );
                                aofn.response.sendData(req, response);
                            }
                        });
                    } else {
                        wat.level--;
                        if (wat.level === 0) {
                            response.menuDefinitions.sort(function (a, b) { return (a.menuName > b.menuName) ? 1 : ((b.menuName > a.menuName) ? -1 : 0); });
                            aofn.response.sendData(req, response);
                        }
                    }
                });
                if (wat.level === 0) {
                    response.menuDefinitions.sort(function(a,b) {return (a.menuName > b.menuName) ? 1 : ((b.menuName > a.menuName) ? -1 : 0);} );
                    aofn.response.sendData(req, response);
                }
            });
        }
    });
};