﻿/**
 * @class DMNSion Tool
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
my.Functions.DXList = function (src) {

    var root = new Ext.tree.TreePanel({
        rootVisible: false,
        text: '',
        loader: new Ext.tree.TreeLoader(),
        border: false,
        root: new Ext.tree.AsyncTreeNode({
            children: src.items
        })
    });
    // ECANDIDUS - CHANGE FOR IPAD
    root.on((Ext.isiPad ? 'click' : 'dblclick'), function (node, e) {
        if (!node.hasChildNodes()) {
            var text = my.Functions.CompleteNodeName(node, '');
            my.AJAX.call('GetDXFile', my.AJAX.cleanupParams(src, {
                selection: text
            }), function (result) {
                if (result && result.data && result.data.docid) {
                    my.BrowserWindow(my.AJAX.rootURL + '?' + Ext.urlEncode({
                        ecdfile: result.data.docid
                    }));
                }
            });
        }
    });

    var baseDef = {
        title: 'DMNSion - ' + (src.objdesc || ''),
        width: 640,
        height: 425,
        iconCls: 'eciDMNSion',
        shim: false,
        animCollapse: false,
        constrainHeader: true,
        layout: 'fit',
        closable: true,
        maximizable: true,
        resizable: true,
        items: [root]
    }

    my.App.createWindow(baseDef);
};

my.Tools.DMNSion = function (src, cb) {
    my.AJAX.call('GetDX', src, function (result) {
        if (result && result.data) {
            my.Functions.DXList(result.data);
        }
    });
};