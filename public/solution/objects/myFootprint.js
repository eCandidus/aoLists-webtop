/**
 * @class myFootprint
 * @extends
 *
 * @author    Many - Jose Gonzalez
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
/* Footprint */
var my = {};
my.Dialogs = {};
my.Layouts = {};
my.Menu = {};
my.Select = {};
my.Select.Support = {};
my.Controls = {};
my.View = {};
my.Functions = {};
my.Socket = null;

/* Constants */
my.Constants = {
    LinesPerPage: 15,
    QMPending: false,
    WindowID: 0,
    NextWindowID: function () {
        return 'win' + my.Constants.WindowID++;
    },
    QMDelay: -99
};

/* Window Manager */
my.Constants.NextWindowID = function () {
    if (!my.Constants.WindowID) my.Constants.WindowID = 0;

};