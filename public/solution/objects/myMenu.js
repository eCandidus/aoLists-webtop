/**
 * @class myMenu
 * @extends
 *
 * A. Menu Generator
 *
 * @author    Jose Gonzalez
 * @copyright (c) 2014, by Candid.Concepts LC
 * @version   1.0
 * @date      <ul>
 * <li>1. June 17, 2014</li>
 * </ul>
 *
 * @license All code is licensed under the terms of
 * the Open Source LGPL 3.0 license.  Commercial use is permitted to the extent
 * that the code/component(s) do NOT become part of another Open Source or Commercially
 * licensed development library or toolkit without explicit permission.
 *
 * <p>License details: <a href="http://www.gnu.org/licenses/lgpl.html"
 * target="_blank">http://www.gnu.org/licenses/lgpl.html</a></p>
 *
 */
my.Menu.Item = Ext.extend(Ext.app.Module, {
    menuName: null,
    menuFN: null,
    launcherItems: [],

    init: function () {
        this.launcher = {
            text: this.menuName,
            iconCls: 'eci' + this.menuIcon,
            handler: this.createWindow,
            scope: this,
            windowId: my.Constants.NextWindowID()
        };
    },

    createWindow: function (src) {
        var req = src.req;
        if (req.action === 'Add') {
            my.RTComm.ifonline(function () {
                my.View.Form(req);
            });
        }
        if (req.action === 'View') {
            my.RTComm.ifonline(function () {
                my.Select.Form(req, function (req) {
                    my.View.Form(req);
                });
            });
        }
        if (req.action === 'Delete') {
            my.RTComm.ifonline(function () {
                my.Select.Form(req, function (row) {
                    my.Dialogs.Confiirm('You are about to delete "' + row.data + '"', function (btn, text) {
                        if (btn === 'ok') {
                            my.AJAX.call('Object_Del', {
                                objds: row.table,
                                objid: row.id
                            }, function (result) {
                                var msg = 'Unable to delete!';
                                if (result && result.deleted) {
                                    msg = 'Deleted';
                                }
                                my.Popup.showAlert(msg);
                            });
                        }
                    });
                });
            });
        }
    }
});

my.Menu.Entry = Ext.extend(my.Menu.Item, {
    init: function () {
        var menuDef, menuEntry,
            entryIcon = this.menuIcon;
        this.launcherItems = [];
        if (this.menuSub) {
            for (var item in this.menuSub) {
                var itemDef = this.menuSub[item];
                if (!itemDef.isFunction()) {
                    menuEntry = {
                        text: item,
                        scope: this,
                        windowId: my.Constants.NextWindowID(),
                        menu: [],
                        hideOnClick: false
                    };
                    this.launcherItems.addEntry(menuEntry);
                    for (var menuc = 0; menuc < itemDef.length; menuc++) {
                        menuDef = itemDef[menuc];
                        var menuSub = {
                            text: menuDef.actionName,
                            iconCls: 'eci' + menuDef.actionName,
                            handler: this.createWindow,
                            scope: this,
                            windowId: my.Constants.NextWindowID(),
                            req: {
                                objdsdesc: menuDef.actionDSet,
                                objds: menuDef.actionSet,
                                objtype: menuDef.actionSub,
                                action: menuDef.actionName,
                                menuIcon: entryIcon
                            }
                        };
                        menuEntry.menu.addEntry(menuSub);
                    }
                }
            }
        } else {
            for (var menud = 0; menud < this.menuItems.length; menud++) {
                menuDef = this.menuItems[menud];
                menuEntry = {
                    text: menuDef.actionName,
                    iconCls: 'eci' + menuDef.actionName,
                    handler: this.createWindow,
                    scope: this,
                    windowId: my.Constants.NextWindowID(),
                    req: {
                        objdsdesc: menuDef.actionDSet,
                        objds: menuDef.actionSet,
                        objtype: menuDef.actionSub,
                        action: menuDef.actionName,
                        menuIcon: entryIcon
                    }
                };
                this.launcherItems.addEntry(menuEntry);
            }
        }
        this.launcher = {
            text: this.menuName,
            iconCls: 'eci' + this.menuIcon,
            handler: function () {
                return false;
            },
            menu: {
                items: this.launcherItems
            }
        };
    }
});

my.Menu.Generator = function (def) {
    var ans = [];
    for (var defc = 0; defc < def.length; defc++) {
        var menudef = def[defc];
        var item = new my.Menu.Entry(menudef);
        ans.addEntry(item);
    }
    return ans;
};

my.Menu.ToolGenerator = function (def) {
    var ans = [];
    for (var defc = 0; defc < def.length; defc++) {
        var item = def[defc];
        if (item.toolName == '-') {
            ans.addEntry('-');
        } else {
            var entry = {
                toolFN: item.toolFN,
                text: item.toolName,
                iconCls: 'eci' + (item.icon || item.toolFN),
                handler: function (src) {
                    my.Tool(src.toolFN);
                },
                scope: this
            };
            ans.addEntry(entry);
        }
    }
    return ans;
};

my.Menu.SetChecked = function (arr, item, ctype) {
    if (item.itype == ctype) {
        item.iconCls = 'eciok';
    }
    arr.push(item);
};