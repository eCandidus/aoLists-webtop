/**
 * @class Attachment Tool
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
my.Tools.Attachments = function (src, cb) {
    var cmp = my.Select.Array({
        fn: 'ObjectAttachments',
        objid: src.objid,
        objds: src.objds,
        noteid: src.noteid,
        cols: ['IE', 'Description'],
        LinesPerPage: -1
    });
    cmp.on('idrequested', function (result) {
        my.View.Form(result);
    });

    var baseDef = {
        title: 'Attachments - ' + (src.objdesc || ''),
        width: 640,
        height: 425,
        iconCls: 'eciAttach',
        shim: false,
        animCollapse: false,
        constrainHeader: true,
        layout: 'fit',
        closable: true,
        maximizable: true,
        resizable: true
            //        , items: [cmp]
    };
    if (my.User.AllowUpload) {
        baseDef.items = [{
            region: 'east',
            title: 'New',
            xtype: 'panel',
            width: 200,
            minSize: 200,
            layout: 'fit',
            collapsible: true,
            collapsed: true,
            items: [new Ext.ux.UploadPanel({
                url: 'default.aspx',
                objid: my.AJAX.ID + ':' + src.objds + ':' + src.objid,
                progressUrl: 'default.aspx',
                listeners: {
                    allfinished: function () {
                        cmp.store.reload();
                    }
                }
            })]
        }, {
            region: 'center',
            layout: 'fit',
            items: [cmp]
        }];
        baseDef.layout = 'border';
    } else {
        baseDef.items = [cmp];
    }

    my.App.createWindow(baseDef);
};