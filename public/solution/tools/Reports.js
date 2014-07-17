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
my.Tools.Reports = function (src, cb) {
    var cmp = my.Select.Array({
        fn: 'ObjectReports',
        objid: null,
        objds: null,
        noteid: null,
        cols: ['IE', 'Description'],
        LinesPerPage: -1
    });
    cmp.on('idrequested', function (result) {
        my.View.Form(result);
    });

    var baseDef = {
        title: 'Reports',
        width: 640,
        height: 425,
        iconCls: 'eciReports',
        shim: false,
        animCollapse: false,
        constrainHeader: true,
        layout: 'fit',
        closable: true,
        maximizable: true,
        resizable: true,
        items: [cmp]
    };

    my.App.createWindow(baseDef);
};