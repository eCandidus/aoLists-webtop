/**
 * @class my.Generator
 * @extends
 *
 * The tools to generate ExtJS from the display definitions
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

my.Generate.Window = function (req, def) {
    // Make the ExtJS equivalents
    var panel = my.Generate.Form(req, def);
    var toolbar;

    if (req.indefine) {
        toolbar = my.Generate.DefinitionToolbar(req, def);
        panel.on('panelclick', function (x, y) {
            alert('X: ' + x + ', Y: ' + y);
        });
    } else {
        toolbar = my.Generate.Toolbar(req, def);
    }

    //my.View.SetID(layout, req);

    var shared = my.Functions.mergeRecursive(my.Definitions.Shared(), {
        objid: req.objid,
        objds: req.objds,
        objdesc: req.objdesc,
        objdsdesc: req.objdsdesc,
        mergeif: req.mergeif,
        callctl: req.ctl,
        wkgdef: def,
        indefine: req.indefine,
        menuIcon: null
    });

    var header = req.action || 'View';
    if (req.objdesc) {
        header += ' - ' + req.objdesc;
    } else {
        header += ' ' + req.objdsdesc;
    }

    var width = Math.max(150, def.size.width + 32);

    var baseDef = {
        title: Ext.util.Format.EllipsisPix('x-window-header-text', header, width - 65),
        width: width,
        height: def.size.height + 45,
        iconCls: 'eci' + req.menuIcon,
        shim: false,
        animCollapse: false,
        constrainHeader: true,
        maximizable: false,
        resizable: req.indefine,
        layout: 'border',
        closable: true,
        shared: shared,
        items: [{
            region: 'south',
            height: 28,
            layout: 'fit',
            items: [toolbar]
        }, {
            region: 'center',
            layout: 'fit',
            items: [panel]
        }],
        listeners: {
            resize: function () {
                if (my.User.isMgr) {
                    var wkg = my.Helper.getShared(this);
                    if (wkg) {
                        var def = wkg.wkgdef;
                        var width = this.getInnerWidth() - 19;
                        if (width < 0) {
                            width = 0;
                        }
                        def.size.width = width;
                        var height = this.getInnerHeight() - 15;
                        if (height < 0) {
                            height = 0;
                        }
                        def.size.height = height;
                    }
                }
            }
        }
    };
    my.App.createWindow(baseDef);
};

my.Generate.Form = function (req, def) {
    var local = my.Functions.mergeRecursive(my.Definitions.Local(), {
        wkgdef: def
    });

    return new Ext.ux.form.aoVisualPanel({
        local: local
    });
};

my.Generate.Field = function (req, def) {

};
    
my.Generate.Toolbar = function (req, def) {
    var tbItems = [];

    tbItems.addEntry(new my.Controls.ToolbarButton('Where Used', 'eciWhereUsed', function (button, e) {
        my.Tools.WhereUsed(shared.object);
    }));
    tbItems.addEntry('-');

    tbItems.addEntry(new my.Controls.ToolbarButton('Merge into Document', 'eciDMerge', function (button, e) {
        my.Tools.MergeDoc(shared.object);
    }));
    tbItems.addEntry(new my.Controls.ToolbarButton('Merge into Form', 'eciFMerge', function (button, e) {
        my.Tools.MergeForm(shared.object);
    }));

    //tbItems.addEntry('-');

    //tbItems.addEntry(new my.Controls.ToolbarButton('Add ' + my.User.DisplayTTD, 'ecittd', function (button, e) {
    //    my.Tools.Convert({
    //        targettable: my.User.DisplayTTD,
    //        objid: button.shared.object.objid,
    //        objds: button.shared.object.objds
    //    });
    //}));
    //tbItems.addEntry(new my.Controls.ToolbarButton('Add ' + my.User.DisplayMemo, 'ecimemos', function (button, e) {
    //    my.Tools.Convert({
    //        targettable: my.User.DisplayMemo,
    //        objid: button.shared.object.objid,
    //        objds: button.shared.object.objds
    //    });
    //}));
    //tbItems.addEntry(new my.Controls.ToolbarButton('Add ' + my.User.DisplayAppointment, 'eciappointments', function (button, e) {
    //    my.Tools.Convert({
    //        targettable: my.User.DisplayAppointment,
    //        objid: button.shared.object.objid,
    //        objds: button.shared.object.objds
    //    });
    //}));
    //tbItems.addEntry(new my.Controls.ToolbarButton('Add ' + my.User.DisplayPhoneMessage, 'eciphonemsgs', function (button, e) {
    //    my.Tools.Convert({
    //        targettable: my.User.DisplayPhoneMessage,
    //        objid: button.shared.object.objid,
    //        objds: button.shared.object.objds
    //    });
    //}));
    //tbItems.addEntry('-');

    tbItems.addEntry(new Ext.Toolbar.Fill());
    tbItems.addEntry('-');

    tbItems.addEntry(new my.Controls.ToolbarButton('Save', 'eciSave', function (button, e) {
        var win = my.Helper.getWindow(button);
        if (win) {
            var obj = win.shared.wkgobj;
            if (obj) {
                my.AJAX.call('Object_Set', {
                    objds: win.shared.objds,
                    objid: win.shared.objid,
                    obj: win.shared.wkgobj
                }, function (result) {
                    win.close();
                });
            }
            win.close();
        }
    }));

    return new Ext.Toolbar({
        items: tbItems
    });
};
    
my.Generate.DefinitionToolbar = function (req, def) {
    var tbItems = [];
    tbItems.addEntry(new Ext.Toolbar.Fill());
    tbItems.addEntry('-');

    tbItems.addEntry(new my.Controls.ToolbarButton('Save and Continue', 'eciSaveAs', function (button, e) {
        var win = my.Helper.getWindow(button);
        if (win) {
            var def = win.shared.wkgdef;
            if (def) {
                my.AJAX.call('Layout_Set', {
                    objds: win.shared.objds,
                    layout: def
                }, function (result) {
                    my.Layouts[win.shared.objds] = def;
                });
            }
        }
    }));

    return new Ext.Toolbar({
        items: tbItems
    });
};