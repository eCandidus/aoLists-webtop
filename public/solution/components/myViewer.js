/**
 * @class my.Viewer
 * @extends
 *
 * A. Component that allows the viewing/editing of an object
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
my.Viewer = function (req) {

    req.owner = req.owner || '';

    if (!req.options) {
        req.options = {};
        if (req.objds === 'workproduct') req.options.IsWorkProduct = true;
        if (req.objds === 'address') req.options.IsAddress = true;
        if (req.objds.startsWith('merged')) req.options.CanPDF = true;
        if (req.objds === 'mergedwriter') req.options.CanRTF = true;
    }

    var shared = new my.Controls.TBParams({
        object: {
            objid: req.objid,
            objds: req.objds,
            objdesc: req.objdesc,
            objdsdesc: req.objdsdesc,
            mergeif: req.mergeif,
            ctl: req.ctl
        }
    });

    var tbItems = [];

    tbItems.addEntry(new my.Controls.ToolbarButton(shared, 'Where Used', 'eciWhereUsed', function (button, e) {
        my.Tools.WhereUsed(shared.object);
    }));
    tbItems.addEntry('-');

    //if (req.options.IsWorkProduct || req.options.IsAddress) {
    tbItems.addEntry(new my.Controls.ToolbarButton(shared, 'Show History', 'eciHistory', function (button, e) {
        my.Tools.ShowHistory(shared.object);
    }));
    tbItems.addEntry(new my.Controls.ToolbarButton(req, 'Add to History', 'eciHistoryAdd', function (button, e) {
        my.Tools.AddHistory(shared.object);
    }));
    tbItems.addEntry('-');
    //};

    tbItems.addEntry(new my.Controls.ToolbarButton(shared, 'Document Manager', 'eciDocMgr', function (button, e) {
        my.Tools.DocMgr(shared.object);
    }));
    tbItems.addEntry('-');

    tbItems.addEntry(new my.Controls.ToolbarButton(shared, 'Attachments', 'eciAttach', function (button, e) {
        my.Tools.Attachments(shared.object);
    }, req.hasAttach));
    tbItems.addEntry('-');

    if (req.options.IsWorkProduct) {

        if (req.hasExternal) {
            tbItems.addEntry(new my.Controls.ToolbarButton(shared, 'External', 'eciExternal', function (button, e) {
                my.Tools.External(shared.object);
            }));
            tbItems.addEntry('-');
        }

        if (req.hasDMNSion) {
            tbItems.addEntry(new my.Controls.ToolbarButton(shared, 'DMNSion', 'eciDMNSion', function (button, e) {
                my.Tools.DMNSion(shared.object);
            }));
            tbItems.addEntry('-');
        }
    }

    tbItems.addEntry(new my.Controls.ToolbarButton(shared, 'Merge into Document', 'eciDMerge', function (button, e) {
        my.Tools.MergeDoc(shared.object);
    }));
    // tbItems.addEntry(new my.Controls.ToolbarButton(req, 'Merge into Document External', 'eciDMergeW'));
    tbItems.addEntry(new my.Controls.ToolbarButton(shared, 'Merge into Form', 'eciFMerge', function (button, e) {
        my.Tools.MergeForm(shared.object);
    }));
    if (req.options.CanRTF) {
        tbItems.addEntry(new my.Controls.ToolbarButton(shared, 'Download as RTF', 'eciWord', function (button, e) {
            my.AJAX.call('MakeRTF', shared.object, function (result) {
                if (result && result.data && result.data.docid) {
                    my.BrowserWindow(my.AJAX.rootURL + '?' + Ext.urlEncode({
                        ecfile: result.data.docid
                    }));
                }
            });
        }));
    }
    if (req.options.CanPDF) {
        tbItems.addEntry(new my.Controls.ToolbarButton(shared, 'Convert to PDF', 'eciPDF', function (button, e) {
            my.AJAX.call('MakePDF', shared.object, function (result) {
                if (result && result.data && result.data.docid) {
                    my.BrowserWindow(my.AJAX.rootURL + '?' + Ext.urlEncode({
                        ecfile: result.data.docid
                    }));
                }
            });
        }));
    }
    tbItems.addEntry('-');

    tbItems.addEntry(new my.Controls.ToolbarButton(shared, 'Add ' + my.User.DisplayTTD, 'ecittd', function (button, e) {
        my.Tools.Convert({
            targettable: my.User.DisplayTTD,
            objid: button.shared.object.objid,
            objds: button.shared.object.objds
        });
    }));
    tbItems.addEntry(new my.Controls.ToolbarButton(shared, 'Add ' + my.User.DisplayMemo, 'ecimemos', function (button, e) {
        my.Tools.Convert({
            targettable: my.User.DisplayMemo,
            objid: button.shared.object.objid,
            objds: button.shared.object.objds
        });
    }));
    tbItems.addEntry(new my.Controls.ToolbarButton(shared, 'Add ' + my.User.DisplayAppointment, 'eciappointments', function (button, e) {
        my.Tools.Convert({
            targettable: my.User.DisplayAppointment,
            objid: button.shared.object.objid,
            objds: button.shared.object.objds
        });
    }));
    tbItems.addEntry(new my.Controls.ToolbarButton(shared, 'Add ' + my.User.DisplayPhoneMessage, 'eciphonemsgs', function (button, e) {
        my.Tools.Convert({
            targettable: my.User.DisplayPhoneMessage,
            objid: button.shared.object.objid,
            objds: button.shared.object.objds
        });
    }));
    tbItems.addEntry('-');

    tbItems.addEntry(new Ext.Toolbar.Fill());
    tbItems.addEntry('-');

    tbItems.addEntry(new my.Controls.ToolbarButton(shared, 'Cancel', 'eciCancel', function (button, e) {
        var req = button.shared.object;
        my.AJAX.call('ObjectChanged', {
            objds: req.objds,
            objid: req.objid
        }, function (result) {
            if (result && result.data.changed) {
                my.Dialogs.Confiirm('Lose changes?', function (btn, e) {
                    if (btn === 'ok') {
                        my.AJAX.call('CancelObject', {
                            objds: req.objds,
                            objid: req.objid
                        });
                        if (button.shared.window) button.shared.window.close();
                    }
                });
            } else {
                my.AJAX.call('CancelObject', {
                    objds: req.objds,
                    objid: req.objid
                });
                if (button.shared.window) button.shared.window.close();
            }
        });
    }));
    if (req.owner.length == 0) {
        tbItems.addEntry(new my.Controls.ToolbarButton(shared, 'Save', 'eciSave', function (button, e) {
            var req = button.shared.object;
            my.AJAX.call('SaveObject', {
                objds: req.objds,
                objid: req.objid,
                ctl: req.ctl
            }, function (result) {
                if (result) {
                    var resultData = result.data;
                    if (resultData) {
                        if (resultData.ctl) {
                            my.View.SetValue(resultData.ctl, {
                                v: [resultData.objdesc, resultData.objid, resultData.objds],
                                fc: true
                            });
                        }
                    }
                }
            });
            if (button.shared.window) button.shared.window.close();
        }));
    } else {
        tbItems.addEntry({
            xtype: 'tbtext',
            text: 'In use by ' + req.owner + '...'
        });
    }

    var toolbar = new Ext.Toolbar({
        items: tbItems
    });

    var panel = new Ext.Panel({
        layout: 'border',
        items: [{
            region: 'south',
            height: 28,
            layout: 'fit',
            items: [toolbar]
        }, {
            region: 'center',
            items: my.Layouts[req.layoutid]
        }]
    });

    panel.shared = shared;

    return panel;
};