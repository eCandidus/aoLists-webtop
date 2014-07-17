/**
 * @class Calendar
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
my.Tools.Calendar = function (req, cb) {

    var localStore = new my.Select.Support.Query({
        fn: 'GetCalendar',
        calendarstart: null,
        calendarend: null,
        cols: ['id', 'summary', 'dtstart', 'dtend', 'color', 'note']
    });

    var panel = new Tine.Calendar.EventCalendar({
        store: localStore
    });

    var baseDef = {
        title: 'Calendar',
        width: 600,
        height: 600,
        iconCls: 'eciCalendar',
        shim: false,
        animCollapse: false,
        constrainHeader: true,
        layout: 'fit',
        closable: true,
        maximizable: true,
        resizable: true,
        defaults: {
            xtype: 'panel',
            border: false,
            margins: '0 0 0 0'
        },
        items: [panel]
    };

    my.App.createWindow(baseDef);
};