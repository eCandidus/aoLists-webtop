/**
 * @class my.Helpers
 * @extends
 *
 * The tools to generate ExtJS from the display definitions
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

my.Helper.getWindow = function (ctl) {
    // Default
    var ans;
    // Are we it?
    while (ctl) {
        // Are we ther yest?
        if (ctl.shared) {
            // Save and exit
            ans = ctl;
            break;
        } else {
            // Move up the food chain
            ctl = ctl.ownerCt;
        }
    }
    //
    return ans;
};

my.Helper.closeWindow = function (ctl) {
    var win = my.Helper.getWindow(ctl);
    if (win) {
        win.close();
    }
};

my.Helper.getShared = function (ctl) {
    //
    var ans;
    // Get the window
    ctl = my.Helper.getWindow(ctl);
    // Any?
    if (ctl) {
        ans = ctl.shared;
    }
    //
    return ans;
};

my.Helper.getLocal = function (ctl) {
    // Default
    var ans;
    // Are we it?
    while (ctl) {
        // Are we ther yet?
        if (ctl.local) {
            // Save and exit
            ans = ctl.local;
            break;
        } else {
            // Move up the food chain
            ctl = ctl.ownerCt;
        }
    }
    //
    return ans;
};

my.Helper.get = function (ctl) {
    // Default
    var ans;
    // Are we it?
    while (ctl) {
        // Are we ther yet?
        if (ctl.local) {
            // Save and exit
            ans = ctl.local;
            break;
        } else if (ctl.shared) {
            //
            ans = ctl.shared;
            break;
        } else {
            // Move up the food chain
            ctl = ctl.ownerCt;
        }
    }
    //
    return ans;
};

my.Helper.getFullaoFld = function (ctl) {
    // Default
    var ans = '';
    // Are we it?
    while (ctl) {
        // Do we have a fld?
        if (ctl.aoFld) {
            ans += '.' + ctl.aoFld;
        }
        // Move up the food chain
        ctl = ctl.ownerCt;
    }
    // Remove leading separator
    if (ans.length > 0) {
        ans = ans.substring(1);
    }
    //
    return ans;
};

my.Helper.handleResize = function (b, w, h, e) {
    var el = Ext.get(b.getEl().id);
    el.setWidth(w);
    el.setHeight(h);
};
