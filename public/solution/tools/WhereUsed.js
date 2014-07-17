/**
 * @class Where Used Tool
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
/* Where Used Panel */
my.Controls.WUPanel = function (table, src) {
    var cmp = my.Select.Array({
        fn: 'ObjectWU',
        objid: src.objid,
        objds: src.objds,
        targettable: table,
        cols: ['Description'],
        sortCol: 'Description',
        sortAD: 'DESC',
        LinesPerPage: -1
    });
    cmp.on('idrequested', function (result) {
        my.View.Form(result);
    });

    return {
        title: table,
        xtype: 'panel',
        layout: 'fit',
        border: false,
        autoScroll: true,
        items: [cmp]
    };
};

/* Where Used Tool */
my.Tools.WhereUsed = function (src, cb) {
    var panels = [];
    panels.addEntry(my.Controls.WUPanel(my.User.DisplayTTD, src));
    panels.addEntry(my.Controls.WUPanel(my.User.DisplayAppointment, src));
    panels.addEntry(my.Controls.WUPanel(my.User.DisplayPhoneMessage, src));
    panels.addEntry(my.Controls.WUPanel(my.User.DisplayMemo, src));
    panels.addEntry(my.Controls.WUPanel(my.User.DisplayMergedDocuments, src));
    panels.addEntry(my.Controls.WUPanel(my.User.DisplayMeregedForms, src));

    var baseDef = {
        title: 'Where Used - ' + (src.objdesc || ''),
        width: 640,
        height: 430,
        iconCls: 'bogus',
        shim: false,
        animCollapse: false,
        constrainHeader: true,
        layout: 'fit',
        closable: true,
        maximizable: true,
        resizable: true,
        items: [{
            xtype: 'tabpanel',
            activeTab: 0,
            enableTabScroll: true,
            minTabWidth: 100,
            items: panels
        }]
    };

    my.App.createWindow(baseDef);
};