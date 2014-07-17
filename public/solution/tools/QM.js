/**
 * @class QuickMessage
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
my.Tools.QMSend = function (req, cb) {
    if (!req) req = {};

    var shared = new my.Controls.TBParams({
        to: req.to
    });

    var list = new Ext.form.ComboBox({
        fieldLabel: 'Send To',
        anchor: '100%',
        displayField: 'Name',
        editable: false,
        store: new my.Select.Support.Query({
            fn: 'User_Active',
            autoLoad: true
        })
    });

    var msg = new Ext.form.TextField({
        fieldLabel: 'Message',
        anchor: '100%'
    });

    var form = new Ext.form.FormPanel({
        labelWidth: 85,
        labelAlign: 'right',
        bodyStyle: 'padding:5px;',
        items: [list, msg]
    });

    var tbItems = [];
    tbItems.addEntry(new Ext.Toolbar.Fill());
    tbItems.addEntry(new my.Controls.ToolbarButton(shared, 'Save', 'eciSave', function (button, e) {
        my.RTComm.ifonline(function () {
            var xto = list.getValue();
            var xmsg = msg.getValue();
            if (xto.length > 0 && xmsg.length > 0) {
                my.RTComm.qm(xto, xmsg);
                button.shared.window.close();
            } else {
                my.Popup.showAlert('Enter both a recepient and a message');
            }
        });
    }));

    var toolbar = new Ext.Toolbar({
        items: tbItems
    });

    var baseDef = {
        title: 'Send Quick Message',
        width: 500,
        height: 124,
        iconCls: 'eciQMSend',
        shim: false,
        animCollapse: false,
        constrainHeader: true,
        layout: 'border',
        closable: true,
        maximizable: false,
        resizable: false,
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