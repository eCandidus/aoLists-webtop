/**
 * @class mySys
 * @extends
 *
 * A. Prototypes
 * B. Extensions to Ext found as samples in various websites
 * C. A simple cursor busy function pair
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
/* Window */
my.Window = {
    findFirst: function (item) {
        if (!item.hidden && !item.disabled &&
            (item instanceof Ext.form.Field ||
                item instanceof Ext.form.TwinTriggerField)) {
            item.focus(false, 200); // delayed focus by 200 ms
            return true;
        }
        if (item.items && item.items.find) {
            var ans = item.items.find(this.findFirst, this);
            if (ans) return ans;
        }
        return false;
    },
    focus: function () {
        // set focus to first available field
        this.items.find(this.findFirst, this);
    }
};

/* From Ext */
my.Popup = {
    last: null,
    msgCt: null,

    createBox: function (t, s) {
        return ['<div class="msg">',
                '<div class="x-box-tl"><div class="x-box-tr"><div class="x-box-tc"></div></div></div>',
                '<div class="x-box-ml"><div class="x-box-mr"><div class="x-box-mc"><h3>', t, '</h3>', s, '</div></div></div>',
                '<div class="x-box-bl"><div class="x-box-br"><div class="x-box-bc"></div></div></div>',
                '</div>'].join('');
    },

    show: function (title, msg, delay) {
        if (!my.Popup.msgCt) my.Popup.msgCt = Ext.get("msg-div");
        if (!my.Popup.msgCt) {
            my.Popup.msgCt = Ext.DomHelper.insertFirst(document.body, {
                id: "msg-div"
            }, true);
        }
        my.Popup.msgCt.alignTo(document, "t-t");
        var m = Ext.DomHelper.append(my.Popup.msgCt, {
            html: my.Popup.createBox(title, msg)
        }, true);
        if (delay && delay < 0) {
            if (my.Popup.last) {
                my.Popup.last.ghost("t", {
                    remove: true
                });
            }
            if (delay < -100) my.Popup.last = m;
            m.on('click', function () {
                m.ghost("t", {
                    remove: true
                });
                my.Popup.last = null;
            });

            m.slideIn("t");
        } else {
            m.slideIn("t").pause(delay || 2).ghost("t", {
                remove: true
            });
        }
    },

    close: function () {
        if (my.Popup.last) {
            my.Popup.last.ghost("t", {
                remove: true
            });
            my.Popup.last = null;
        }
    },

    showQM: function (msg) {
        my.Popup.show('Quick Message from ' + msg.from, msg.msg, my.Constants.QMDelay);
    },

    showServerAlert: function (msg) {
        my.Popup.show('Alert from aoLists Server', msg, my.Constants.QMDelay);
    },

    showAlert: function (msg, delay, title) {
        my.Popup.show(title || 'FYI...', msg, delay);
    }
};

/* Prototypes */
String.prototype.replaceAll = function (s1, s2) {
    return this.replace(new RegExp(s1, "g"), s2);
};

String.prototype.cFormat = function () {
    var str = this;
    for (var i = 0, len = arguments.length; i < len; i++) str = ('{' + i + '}').replaceAll(arguments[i]);
    return str;
};

String.prototype.startsWith = function (str) {
    return (this.match("^" + str) == str)
};

String.prototype.endsWith = function (str) {
    return (this.match(str + "$") == str)
};

Object.prototype.isFunction = function () {
    return (typeof (this) === 'function');
};

Object.prototype.addEntry = function (a) {
    this[this.length] = a;
};

/* ??? */
Ext.form.Field.prototype.msgTarget = 'side';

/* Pseudo Wait Cursor */
showBusy = function () {
    Ext.get('waitGraphics').show();
};

showIdle = function () {
    Ext.get('waitGraphics').hide();
};

/* Converts data stream to JSON store */
my.Functions.MakeLocalStore = function (req, cfg) {
    var localReader = new Ext.data.JsonReader();
    if (req.data) localReader.read(req.data);

    var localStore = new Ext.data.JsonStore(Ext.apply({
        reader: localReader,
        sortCol: req.sortCol,
        sortAD: req.sortAD || 'ASC'
    }, cfg));

    return localStore;
};

/* Display an image */
my.Functions.setValueImage = function (ele, value) {
    if (Ext.isIE) {
        ele.update('<img src="' + my.AJAX.rootURL + '?' + Ext.urlEncode({
            ecimage: value
        }) + '"  />');
    } else {
        ele.update('<img src="data:image/png;base64,' + value + '"  />');
    }
};

/* Print a file */
my.Functions.print = function (url, title) {
    var type = page.substring(title.lastIndexOf('.') + 1);
    var gadget = new cloudprint.Gadget();
    gadget.setPrintDocument('application/' + type, title, url);
    gadget.openPrintDialog();
};