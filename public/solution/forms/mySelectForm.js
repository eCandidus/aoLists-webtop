/**
 * @class my.Select.Form
 * @extends
 *
 * A. Lists objects in a table and allows selection
 * B. Lista a store and allows a selection
 * C. Lists linked objetcs in a multi-tabbed form and allows selection
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
/* Selection Form - Used for View and Delete */
my.Select.Form = function (src, cb) {
    var grid = new my.Select.Dataset(src);
    if (cb) {
        grid.on('idrequested', cb);
    }
    var baseDef = {
        id: my.Constants.NextWindowID(),
        title: 'Select...',
        width: 640,
        height: 404,
        iconCls: 'eci' + src.menuIcon,
        shim: false,
        animCollapse: false,
        constrainHeader: true,
        layout: 'fit',
        closable: true,
        maximizable: false,
        resizable: false,
        items: [{
            xtype: 'panel',
            layout: 'fit',
            items: [grid]
        }]
    };

    var win = my.App.createWindow(baseDef);
    grid.on('closeWin', function () {
        win.close();
    });
    win.show();
    grid.store.load({
        params: {
            start: 0,
            limit: my.Constants.LinesPerPage
        }
    });
};

/* Generic Pick Form */
my.Select.Pick = function (src, cb) {
    var grid = new my.Select.Array(src);
    if (cb) {
        grid.on('idrequested', cb);
    }
    var baseDef = {
        title: (src.text || 'Pick'),
        width: 640,
        height: 404,
        iconCls: 'bogus',
        shim: false,
        animCollapse: false,
        constrainHeader: true,
        layout: 'fit',
        closable: true,
        maximizable: false,
        resizable: false,
        items: [{
            xtype: 'panel',
            layout: 'fit',
            items: [grid]
        }]
    };

    var win = my.App.createWindow(baseDef);
    grid.on('closeWin', function () {
        win.close();
    });
};