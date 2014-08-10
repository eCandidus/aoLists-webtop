/**
 * @class UserSettings
 * @extends
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
my.Tools.UserSettings = function (req, cb) {
    if (!req) req = {};

    var shared = my.Functions.mergeRecursive(my.Definitions.Shared(), {
        to: req.to
    });

    var uname = new Ext.form.TextField({
        fieldLabel: 'User Name',
        anchor: '100%',
        emptyText: my.User.userName,
        aoFld: 'uname'
    });

    var upwd = new Ext.form.TextField({
        fieldLabel: 'Password',
        anchor: '100%',
        aoFld: 'upwd'
    });

    var form = new Ext.form.FormPanel({
        labelWidth: 85,
        labelAlign: 'right',
        bodyStyle: 'padding:5px;',
        items: [uname, upwd]
    });

    var tbItems = [];
    tbItems.addEntry(new Ext.Toolbar.Fill());
    tbItems.addEntry(new my.Controls.ToolbarButton('Save', 'eciSave', function (button, e) {
        my.AJAX.call('User_Me', my.Controls.getFORMDATA(form), function (result) {
            my.User.logout();
        });
        my.Helper.closeWindow(button);
    }));

    var toolbar = new Ext.Toolbar({
        items: tbItems
    });

    var baseDef = {
        title: 'User Settings',
        width: 350,
        height: 124,
        iconCls: 'eciTools',
        shim: false,
        animCollapse: false,
        constrainHeader: true,
        layout: 'border',
        closable: true,
        maximizable: false,
        resizable: false,
        shared: shared,
        items: [{
            region: 'south',
            height: 28,
            layout: 'fit',
            items: [toolbar]
        }, {
            region: 'center',
            layout: 'fit',
            items: [form]
        }]
    };

    my.App.createWindow(baseDef);
};