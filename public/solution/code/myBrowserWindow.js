/**
 * @class my.BrowserWindow
 * @extends
 *
 * A. Opens a new browser window
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
my.BrowserWindow = function (anchor, options) {

    options = options || {};
    /*
     * fullscreen    - Use entire display if true
     * width         - The width (in pixels) - Disregarded in fullscreen = true
     * height        - The height (in pixels) - Disregarded in fullscreen = true
     * left          - Left (in pixels) - Disregarded in fullscreen = true
     * top           - Top (in pixels) - Disregarded in fullscreen = true
     * center        - If true, center in screen - Disregarded in fullscreen = true
     * name          - DOM name
     * scrollbars    - If true, display scrollbars
     * menubar       - If true, display menubar
     * locationbar   - If true, display location bar
     * resizable     - If true, allow resizing
     */

    var args = '';

    if (!options.name) {
        options.name = my.Constants.NextWindowID();
    }
    if (options.fullscreen) {
        args += ",width=" + screen.availWidth;
        args += ",height=" + screen.availHeight;
    } else {
        if (options.height) {
            args += ",height=" + options.height;
        }
        if (options.width) {
            args += ",width=" + options.width;
        }
        if (options.center) {
            options.y = Math.floor((screen.availHeight - (options.height || screen.height)) / 2) - (screen.height - screen.availHeight);
            options.x = Math.floor((screen.availWidth - (options.width || screen.width)) / 2) - (screen.width - screen.availWidth);
            args += ",screenx=" + options.x;
            args += ",screeny=" + options.y;
            args += ",left=" + options.x;
            args += ",top=" + options.y;
        }
    }

    if (options.scrollbars) {
        args += ",scrollbars=1";
    }
    if (options.menubar) {
        args += ",menubar=1";
    }
    if (options.locationbar) {
        args += ",location=1";
    }
    if (options.resizable) {
        args += ",resizable=1";
    }

    if (args.length > 0) {
        args = args.substring(1);
    }

    return window.open(anchor, options.name, args);
};