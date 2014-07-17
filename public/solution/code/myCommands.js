/**
 * @class my.Commands
 * @extends
 *
 * A. Command Definition and Execution
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
/* Tools */
my.Tools = {};

my.Tool = function (name, req, cb) {
    var fn = my.Tools[name];
    if (fn && fn.isFunction()) {
        fn(req, cb);
    } else {
        my.Popup.showAlert('Unable to call tool: ' + name);
    }
};