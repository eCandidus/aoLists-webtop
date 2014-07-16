/**
 *
 *		util_login.js
 *		aolists
 *
 *      Login call related calls
 *
 *		2014-06-17	-	Changes to support aolLists client (by Jose E. Gonzalez jr)
 */
var app = module.parent.exports.app,
    aofn = module.parent.exports.aofn;

/**
 *  addMENU - Top level menu
 */
aofn.addMENU = function (name, desc, icon, coll) {
    return {
        'menuName': desc,
        'menuSet': coll,
        'menuIcon': icon || name,
        'menuItems': []
    };
};

/**
 *  addSUB - Sub menu
 */
aofn.addSUB = function (menu, action) {
    var entry = {
        'actionName': action,
        'actionSet': menu.menuSet,
        'actionDSet': menu.menuName
    };
    menu.menuItems.push(entry);

    return entry;
};

/**
 *  addTOOL - Tool
 */
aofn.addTOOL = function (name, fn, icon) {
    return {
        'toolName': name,
        'toolFN': fn,
        'icon': icon
    };
};