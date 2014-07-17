/**
 * @class my.Cookies
 * @extends
 *
 * A. AJAX layer to comunicate with the eCandidus Web Portal JSON Services
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
my.Cookies = new Ext.app.Module({
    provider: null,
    getName: function (req) {
        return 'eC' + (req.name || '');
    },
    init: function () {
        this.provider = new Ext.state.CookieProvider({
            expires: new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 30)) // 1 year
        });
    },
    set: function (req) {
        this.provider.set(this.getName(req), req.value);
        Ext.state.Manager.setProvider(this.provider);
    },
    get: function (req) {
        return this.provider.get(this.getName(req));
    },
    clear: function (req) {
        this.provider.clear(this.getName(req));
        Ext.state.Manager.setProvider(this.provider);
    }
});