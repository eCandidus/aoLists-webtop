/**
 * @class Datasets
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
my.Tools.Datasets = function (req, cb) {
    req = req || {};

    var shared = my.Functions.mergeRecursive(my.Definitions.Shared(), {
        to: req.to
    });

    var flds = [];

    var uds = new Ext.form.ComboBox({
        fieldLabel: 'Dataset',
        anchor: '100%',
        aoFld: 'ds',
        displayField: 'Name',
        store: new my.Select.Support.Query({
            fn: 'Dataset_List',
            autoLoad: true
        }),
        listeners: {
            'select': function () {
                my.Functions.busy(function () {
                    my.AJAX.call('Dataset_Get', my.Controls.getFORMDATA(form), function (result) {
                        my.Controls.putFORMDATA(form, result);
                    });
                });
            }
        }
    });
    flds.push(uds);

    var desc = new Ext.form.TextField({
        fieldLabel: 'Description',
        anchor: '100%',
        aoFld: '_desc'
    });
    flds.push(desc);

    var icon = new Ext.form.ComboBox({
        fieldLabel: 'Icon',
        anchor: '100%',
        aoFld: 'icon',
        displayField: 'Name',
        store: new my.Select.Support.Query({
            fn: 'Icons_Get',
            autoLoad: true
        })
    });
    flds.push(icon);

    var defac = new Ext.form.TextField({
        fieldLabel: 'Default Privilege',
        anchor: '100%',
        aoFld: 'priv'
    });
    flds.push(defac);

    var hidden = new Ext.form.Checkbox({
        fieldLabel: 'Hidden?',
        anchor: '100%',
        aoFld: 'ishid'
    });
    flds.push(hidden);

    var form = new Ext.form.FormPanel({
        labelWidth: 100,
        labelAlign: 'right',
        bodyStyle: 'padding:5px;',
        items: flds
    });

    var tbItems = [];
    tbItems.addEntry(new my.Controls.ToolbarButton('Edit Layout', 'eciAdd', function (button, e) {
        my.View.Form({
            objds: uds.getValue(),
            objdsdesc: desc.getValue(),
            indefine: true,
            menuIcon: icon.getValue(),
            action: 'Configure'
        });
    }));
    tbItems.addEntry('-');
    tbItems.addEntry(new my.Controls.ToolbarButton('Download Definition', 'eciSILKdatabasesave', function (button, e) {
        my.RTComm.ifonline(function () {
            my.BrowserWindow(my.AJAX.rootURL + 'dsdef.download?' + Ext.urlEncode(my.Controls.getFORMDATA(form)));
        });
    }));
    tbItems.addEntry(new my.Controls.ToolbarUpload('Upload Definition', 'eciSILKdatabaseadd', 'dsdef.upload', function (button, e) {
        my.RTComm.ifonline(function () {
            my.Functions.busy(function () {
                var ds = button.uploader.store.getAt(0).data.passback;
                my.AJAX.call('Dataset_Get', { 'ds': ds }, function (result) {
                    my.Controls.putFORMDATA(form, result);
                });
            });
        });
    }));
    tbItems.addEntry('-');
    tbItems.addEntry(new my.Controls.ToolbarButton('Remove', 'eciGRemove', function (button, e) {
        my.RTComm.ifonline(function () {
            Ext.Msg.show({
                title: 'Removing ' + uds.getValue() + '...',
                msg: 'Are you sure that you want to remove the dataset?',
                buttons: Ext.Msg.OKCANCEL,
                fn: function (btn) {
                    if (btn === 'ok') {
                        my.Functions.busy(function () {
                            my.AJAX.call('Dataset_Del', {
                                uds: uds.getValue()
                            }, function (result) {
                                my.Helper.closeWindow(button);
                            });
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
            my.Functions.busy(function () {
                my.AJAX.call('Dataset_Set', my.Controls.getFORMDATA(form), function (result) { });
                my.Helper.closeWindow(button);
            });
        });
    }));

    var toolbar = new Ext.Toolbar({
        items: tbItems
    });

    var baseDef = {
        title: 'Datasets',
        width: 300,
        iconCls: 'eciTools',
        shim: false,
        animCollapse: false,
        constrainHeader: true,
        layout: 'border',
        closable: true,
        maximizable: false,
        resizable: true,
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
};