/**
 * @class Document Manager Tool
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
my.Functions.DMView = function (src) {

    var localStore = new Ext.data.JsonStore({
        proxy: new Ext.data.MemoryProxy(),
        reader: new Ext.data.JsonReader(),
        mode: 'local'
    });
    localStore.on('load', function (store, records, options) {
        //alert(records[0].id);
    });

    var toolbar = new Ext.PagingToolbar({
        pageSize: 1,
        store: localStore,
        images: {},
        imageArea: new Ext.Panel(),
        paintImage: function (tb, index) {
            var record = tb.store.getAt(index);
            var id = record.id;
            var eL = tb.imageArea.getEl();
            var image = tb.images[id];
            if (image) {
                my.Functions.setValueImage(eL, image);
            } else {
                var xwidth = tb.getEl().getComputedWidth();
                if (xwidth < 100) xwidth = 650;
                tb.disable();
                my.AJAX.call('GetDMPage', {
                    page: id,
                    width: xwidth
                }, function (result) {
                    tb.enable();
                    if (result && result.data) {
                        tb.images[result.data.page] = result.data.v;
                        my.Functions.setValueImage(tb.imageArea.getEl(), result.data.v);
                    }
                });
            }
        }
    });
    toolbar.on('beforechange', function (tb, options) {
        tb.cursor = options.start;
        //tb.paintImage(tb, tb.cursor - 1);
        tb.onLoad(tb.store, null, {
            params: {
                start: options.start
            }
        });
    });
    toolbar.on('change', function (tb, options) {
        var page = tb.getPageData().activePage - 1;
        tb.paintImage(tb, page);
    });

    var baseDef = {
        title: 'Document Manager Viewer',
        width: 650 + 18,
        height: 475,
        iconCls: 'eciDocMgr',
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
            items: [toolbar]
        }, {
            region: 'center',
            autoScroll: true,
            items: [toolbar.imageArea]
        }]
    }

    my.App.createWindow(baseDef);
    localStore.loadData(src.dataset);
};

my.Functions.CompleteNodeName = function (node, txt) {
    txt = node.text + txt;
    if (node.parentNode) {
        txt = my.Functions.CompleteNodeName(node.parentNode, ':' + txt);
    }
    return txt;
};

my.Functions.DMList = function (src) {

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
            my.AJAX.call('OpenDM', my.AJAX.cleanupParams(src, {
                selection: text
            }), function (result) {
                if (result && result.data && result.data.dataset) {
                    my.Functions.DMView(result.data);
                }
            });
        }
    });

    var baseDef = {
        title: 'Document Manager - ' + (src.objdesc || ''),
        width: 640,
        height: 425,
        iconCls: 'eciDocMgr',
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

my.Tools.DocMgr = function (src, cb) {
    my.AJAX.call('GetDocMgr', src, function (result) {
        if (result && result.data) {
            my.Functions.DMList(result.data);
        }
    });
};