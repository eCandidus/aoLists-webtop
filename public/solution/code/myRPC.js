/**
 * @class my.AJAX
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
/* Server Process Interface */
my.AJAX = new Ext.app.Module({
    ID: null,
    hostURL: null,
    rootURL: null,
    callCount: 0,
    callDepth: 0,

    signature: null,

    init: function () {
        var loc = window.location.href;
        this.defaultURL = loc;
        loc = loc.substring(0, loc.lastIndexOf('/') + 1);
        this.rootURL = loc;
        this.hostURL = loc + 'service';
    },
    hello: function (cb) {
        this.internalCall("hello", {
            inline: !Ext.isIE
        }, cb);
    },
    call: function (func, data, cb) {
        this.internalCall(func, data, cb);
    },
    internalCall: function (func, data, cb) {

        var xmlrequest = null;
        var callback = cb;

        var request = {
            id: this.callCount++,
            signature: this.signature || '',
            method: func,
            params: data
        };

        if (typeof (window) !== 'undefined' && window.XMLHttpRequest) {
            xmlrequest = new XMLHttpRequest(); /* IE7, Safari 1.2, Mozilla 1.0/Firefox, and Netscape 7 */
        } else {
            xmlrequest = new ActiveXObject('Microsoft.XMLHTTP'); /* WSH and IE 5 to IE 6 */
        };

        if (callback) {
            if (++this.callDepth == 1) showBusy();
            xmlrequest.onreadystatechange = function () {
                if (xmlrequest.readyState === /* complete */ 4) {
                    clearTimeout(xmlto);
                    if (--my.AJAX.callDepth == 0) showIdle();
                    var retValue = null;
                    if (xmlrequest.status === 200) {
                        retValue = xmlrequest.responseText.parseJSON();
                    }
                    if (retValue && retValue.ERROR) {
                        my.Popup.showAlert(retValue.ERROR, -1, 'Oops...');
                    }
                    if (callback) {
                        if (callback.isFunction()) {
                            callback(retValue);
                        } else {
                            document.getElementById(callback).innerHTML = result;
                        }
                    }
                    if (retValue) {
                        var cmds = retValue.cmds;
                        if (cmds) {
                            for (var iCmd = 0; iCmds < cmds.length; iCmd++) {
                                my.Command(cmds[iCmds]);
                            }
                        }
                    }
                }
            }
        }

        var xmlto = (function () {
            xmlrequest.abort();
        }).defer(60000);

        xmlrequest.open('POST', this.hostURL, true);
        xmlrequest.setRequestHeader('Content-Type', 'text/plain; charset=utf-8');
        xmlrequest.setRequestHeader('X-JSON-RPC', func);
        xmlrequest.send(request.toJSONString());
    },
    cleanupParams: function (value, cfg) {
        return Ext.apply({
            objid: value.objid,
            objds: value.objds,
            objdesc: value.objdesc,
            objdsdesc: value.objdsdesc
        }, cfg);
    }
});