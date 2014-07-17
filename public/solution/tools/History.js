/**
 * @class History Based Tools
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
/* Billing Block */
my.Controls.Billing = function (tb) {
    return tb;
};

/* Note Viewer */
my.Controls.NoteViewer = function (req, cb) {

    var shared = new my.Controls.TBParams();
    shared.object = req;

    var on = new Ext.ux.form.DateTime({
        fieldLabel: 'On',
        emptyToNow: true,
        value: new Date()
    });
    var toppnl = new Ext.form.FormPanel({
        labelAlign: 'right',
        labelWidth: 30,
        bodyStyle: 'padding:5px;',
        items: [on]
    });
    shared.on = on;

    var tbItems = [];
    tbItems.addEntry(new my.Controls.ToolbarButton(shared, 'Attachments', 'eciAttach', function (button, e) {
        my.Tools.Attachments({
            objid: button.shared.object.objid,
            objds: button.shared.object.objds,
            noteid: button.shared.object.noteid
        });
    }));
    tbItems.addEntry('-');
    tbItems.addEntry(new my.Controls.ToolbarButton(shared, 'Add ' + my.User.DisplayTTD, 'ecittd', function (button, e) {
        my.Tools.Convert({
            targettable: my.User.DisplayTTD,
            objid: button.shared.object.objid,
            objds: button.shared.object.objds,
            note: button.shared.editor.getValue(),
            noteid: button.shared.object.noteid,
            noteattach: true
        });
    }));
    tbItems.addEntry(new my.Controls.ToolbarButton(shared, 'Add ' + my.User.DisplayMemo, 'ecimemos', function (button, e) {
        my.Tools.Convert({
            targettable: my.User.DisplayMemo,
            objid: button.shared.object.objid,
            objds: button.shared.object.objds,
            note: button.shared.editor.getValue(),
            noteid: button.shared.object.noteid,
            noteattach: true
        });
    }));
    tbItems.addEntry(new my.Controls.ToolbarButton(shared, 'Add ' + my.User.DisplayAppointment, 'eciappointments', function (button, e) {
        my.Tools.Convert({
            targettable: my.User.DisplayAppointment,
            objid: button.shared.object.objid,
            objds: button.shared.object.objds,
            note: button.shared.editor.getValue(),
            noteid: button.shared.object.noteid,
            noteattach: true
        });
    }));
    tbItems.addEntry(new my.Controls.ToolbarButton(shared, 'Add ' + my.User.DisplayPhoneMessage, 'eciphonemsgs', function (button, e) {
        my.Tools.Convert({
            targettable: my.User.DisplayPhoneMessage,
            objid: button.shared.object.objid,
            objds: button.shared.object.objds,
            note: button.shared.editor.getValue(),
            noteid: button.shared.object.noteid,
            noteattach: true
        });
    }));
    tbItems.addEntry('-');
    tbItems.addEntry(new Ext.Toolbar.Fill());
    if (req.allowBlank) {
        tbItems.addEntry('-');
        tbItems.addEntry(new my.Controls.ToolbarButton(shared, 'New', 'eciNew', function (button, e) {}));
    }
    tbItems.addEntry('-');
    //    tbItems.addEntry(new my.Controls.ToolbarButton(req, 'Cancel', 'eciCancel', function(button, e) {
    //    }));
    tbItems.addEntry(new my.Controls.ToolbarButton(shared, 'Save', 'eciSave', function (button, e) {
        my.AJAX.call('UpdateNote', {
            objid: button.shared.object.objid,
            objds: button.shared.object.objds,
            on: button.shared.on.getValue(),
            note: button.shared.editor.getValue(),
            noteid: button.shared.object.noteid
        });
    }));

    var toolbar = new Ext.Toolbar({
        items: tbItems
    });

    var bottom = toolbar;
    if (my.User.BillingAllowed) {
        bottom = my.Controls.Billing(toolbar);
    }

    var editor = new Ext.ux.form.ecHTML({
        border: false,
        rmtID: shared.object.objid,
        rmtTable: shared.object.objds,
        rmtNote: null
    });
    shared.editor = editor;

    var panel = new Ext.Panel({
        layout: 'border',
        defaults: {
            xtype: 'panel',
            border: false,
            margins: '0 0 0 0'
        },
        items: [{
            region: 'north',
            height: 33,
            items: [toppnl]
        }, {
            region: 'south',
            height: bottom.height || 28,
            items: [bottom]
        }, {
            region: 'center',
            layout: 'fit',
            items: [editor]
        }]
    });
    panel.shared = shared;
    panel.setNote = function (req) {
        panel.shared.object = req;
        my.AJAX.call('GetNote', req, function (result) {
            if (result && result.data) {
                panel.shared.on.setValue(new Date(result.data.on));
                panel.shared.editor.setValue(result.data.note);
                panel.shared.editor.rmtNote = result.data.noteid;
            }
        });
    };

    return panel;
};

my.Tools.AddHistory = function (req, cb) {
    var panel = my.Controls.NoteViewer(req, cb);
    var baseDef = {
        title: 'Add History Note - ' + (req.objdesc || ''),
        iconCls: 'eciHistoryAdd',
        width: 640,
        height: 400,
        shim: false,
        animCollapse: false,
        constrainHeader: true,
        layout: 'fit',
        closable: true,
        maximizable: true,
        resizable: true

        ,
        items: [{
            xtype: 'panel',
            layout: 'fit',
            items: [panel]
        }]
    };

    my.App.createWindow(baseDef);
};

my.Tools.ShowHistory = function (req, cb) {
    var panel = my.Controls.NoteViewer(Ext.apply({
        allowBlank: true
    }, req), cb);

    var grid = new my.Select.Array({
        fn: 'GetHistoryListing',
        cols: ['On', 'By', 'Note'],
        objid: req.objid,
        objds: req.objds,
        LinesPerPage: 10,
        mode: 'remote'
    });
    grid.on('idselected', function (result) {
        panel.setNote({
            objid: req.objid,
            objds: req.objds,
            noteid: result.id
        });
    });

    var baseDef = {
        title: 'History - ' + (req.objdesc || ''),
        iconCls: 'eciHistory',
        width: 640,
        height: 600,
        shim: false,
        animCollapse: false,
        constrainHeader: true,
        layout: 'fit',
        closable: true,
        maximizable: true,
        resizable: true

        ,
        items: [{
            xtype: 'panel',
            layout: 'border',
            items: [{
                region: 'south',
                xtype: 'panel',
                layout: 'fit',
                height: 266,
                items: [grid]
            }, {
                region: 'center',
                xtype: 'panel',
                layout: 'fit',
                items: [panel]

            }]
        }]
    };

    my.App.createWindow(baseDef);
};