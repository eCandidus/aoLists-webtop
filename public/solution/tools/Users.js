/**
 * @class Users
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
my.Tools.Users = function (req, cb) {
    my.AJAX.call('Metadata_Get', {}, function (result) {
        req = req || {};

    var shared = my.Functions.mergeRecursive(my.Definitions.Shared(), {
        to: req.to
    });

        var flds = [];

        var uname = new Ext.form.ComboBox({
            fieldLabel: 'User Name',
            anchor: '100%',
            aoFld: 'uname',
            displayField: 'Name',
            store: new my.Select.Support.Query({
                fn: 'User_List',
                autoLoad: true
            }),
            listeners: {
                'select': function () {
                    my.AJAX.call('User_Get', my.Controls.getFORMDATA(form), function (result) {
                        my.Controls.putFORMDATA(form, result);
                    });
                }
            }
        });
        flds.push(uname);

        var upwd = new Ext.form.TextField({
            fieldLabel: 'Password',
            anchor: '100%',
            aoFld: 'upwd'
        });
        flds.push(upwd);

        if (result && Array.isArray(result)) {
            var lbl1 = new Ext.form.CenterLabel({
                text: 'Privileges'
            });
            flds.push(lbl1);

            result.forEach(function (value) {
                var ds = new Ext.form.TextField({
                    fieldLabel: value._desc,
                    anchor: '100%',
                    ds: value._id,
                    aoFld: value._id
                });
                flds.push(ds);
            });
        }

        var form = new Ext.form.FormPanel({
            labelWidth: 120,
            labelAlign: 'right',
            bodyStyle: 'padding:5px;',
            items: flds
        });

        var tbItems = [];
        tbItems.addEntry(new my.Controls.ToolbarButton('Remove', 'eciGRemove', function (button, e) {
            my.RTComm.ifonline(function () {
                Ext.Msg.show({
                    title: 'Removing ' + uname.getValue() + '...',
                    msg: 'Are you sure that you want to remove the user?',
                    buttons: Ext.Msg.OKCANCEL,
                    fn: function (btn) {
                        if (btn === 'ok') {
                            my.AJAX.call('User_Del', {
                                uname: uname.getValue()
                            }, function (result) {
                                my.Helper.closeWindow(button);
                            });
                        }
                    },
                    icon: Ext.MessageBox.QUESTION
                });
            });
        }));
        tbItems.addEntry(new Ext.Toolbar.Fill());
        tbItems.addEntry(new my.Controls.ToolbarButton('Save', 'eciSave', function (button, e) {
            my.RTComm.ifonline(function () {
                my.AJAX.call('User_Set', my.Controls.getFORMDATA(form), function (result) { });
                my.Helper.closeWindow(button);
            });
        }));

        var toolbar = new Ext.Toolbar({
            items: tbItems
        });

        var baseDef = {
            title: 'User Settings',
            width: 300,
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
        baseDef.height = my.Controls.computeHeight(baseDef);

        my.App.createWindow(baseDef);
    });
};