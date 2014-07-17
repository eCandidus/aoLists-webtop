/**
 * @class
 * @extends
 *
 * A. Confirmation Dialog Box
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
my.Dialogs.Confiirm = function (pmsg, cb, ptitle) {
    Ext.Msg.show({
        title: ptitle || 'Are you sure?',
        msg: pmsg,
        buttons: Ext.Msg.OKCANCEL,
        fn: cb,
        icon: Ext.MessageBox.QUESTION
    });
};

my.Dialogs.Input = function (req, cb) {
    if (!req) req = {};

    var msg = new Ext.form.TextField({
        fieldLabel: req.prompt,
        anchor: '100%'
    });

    var shared = new my.Controls.TBParams({
        req: req,
        field: msg
    });

    var form = new Ext.form.FormPanel({
        labelWidth: 55,
        bodyStyle: 'padding:5px;',
        items: [msg]
    });

    var tbItems = [];
    tbItems.addEntry(new Ext.Toolbar.Fill());
    tbItems.addEntry(new my.Controls.ToolbarButton(shared, 'Cancel', 'eciCancel', cb));
    tbItems.addEntry(new my.Controls.ToolbarButton(shared, 'OK', 'eciOK', cb));

    var toolbar = new Ext.Toolbar({
        items: tbItems
    });

    var baseDef = {
        title: req.title,
        width: 500,
        height: 123,
        iconCls: 'eciInput',
        shim: false,
        animCollapse: false,
        constrainHeader: true,
        layout: 'border',
        closable: true,
        maximizable: false,
        resizable: true,
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

    shared.window = my.App.createWindow(baseDef);
};

my.Dialogs.Choice = function (req, cb) {
    if (!req) req = {};

    var list = new Ext.form.ComboBox({
        fieldLabel: req.prompt,
        anchor: '100%',
        displayField: 'Name',
        store: new my.Select.Support.Query({
            fn: 'User_List'
        })
    });

    var shared = new my.Controls.TBParams({
        req: req,
        field: list
    });

    var form = new Ext.form.FormPanel({
        labelWidth: 55,
        bodyStyle: 'padding:5px;',
        items: [list, msg]
    });

    var tbItems = [];
    tbItems.addEntry(new Ext.Toolbar.Fill());
    tbItems.addEntry(new my.Controls.ToolbarButton(shared, 'Cancel', 'eciCancel', cb));
    tbItems.addEntry(new my.Controls.ToolbarButton(shared, 'OK', 'eciOK', cb));

    var toolbar = new Ext.Toolbar({
        items: tbItems
    });

    var baseDef = {
        title: req.prompt,
        width: 500,
        height: 123,
        iconCls: 'eciInput',
        shim: false,
        animCollapse: false,
        constrainHeader: true,
        layout: 'border',
        closable: true,
        maximizable: false,
        resizable: true,
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

    shared.window = my.App.createWindow(baseDef);
    list.store.load({
        params: {
            start: 0,
            limit: 999
        }
    });
};