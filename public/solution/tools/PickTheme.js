/**
 * @class PickTheme
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
my.Tools.PickTheme = function (req, cb) {
    var grid = new my.Select.Array({
        fn: 'Theme_Get',
        cols: ['Theme'],
        hideSearch: true
    });
    grid.on('idrequested', function (req) {
        my.AJAX.call('Theme_Set', {
            theme: req.id
        });
        Ext.util.CSS.swapStyleSheet('theme', req.id);
    });

    var baseDef = {
        title: 'Themes',
        width: 400,
        height: 300,
        iconCls: 'eciPickTheme',
        shim: false,
        animCollapse: false,
        constrainHeader: true,
        layout: 'fit',
        closable: true,
        maximizable: false,
        resizable: true,
        defaults: {
            xtype: 'panel',
            border: false,
            margins: '0 0 0 0'
        },
        items: [grid]
    };

    my.App.createWindow(baseDef);
    grid.store.load({
        params: {
            start: 0,
            limit: my.Constants.LinesPerPage
        }
    });
};