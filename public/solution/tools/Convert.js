/**
 * @class Convert Tool
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
my.Tools.Convert = function (req, table) {
    my.AJAX.call('AddressNeeded', {
        objds: req.objds,
        targettable: req.targettable
    }, function (result) {
        if (result) {
            if (result.data.needed) {
                my.Select.Address(req, function (result) {
                    if (result) {
                        this.req.addrid = result.data.id;
                        my.AJAX.call('ConvertObject', this.req, function (result) {
                            if (result) {
                                var req = result.data;
                                my.View.Form(req);
                            }
                        });
                    }
                });
            } else {
                my.AJAX.call('ConvertObject', req, function (result) {
                    if (result) {
                        var req = result.data;
                        req.layoutid = null;
                        my.View.Form(req);
                    }
                });
            }
        }
    });
};