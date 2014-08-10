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
my.Options = {};
my.Dialogs = {};
my.Layouts = {};
my.Menu = {};
my.Select = {};
my.Select.Support = {};
my.Controls = {};
my.View = {};
my.Functions = {};
my.Socket = null;
my.Tools = {};
my.Definitions = {};
my.Generate = {};
my.Helper = {};

/* Constants */
my.Constants = {
    LinesPerPage: 15,
    QMPending: false,
    WindowID: 0,
    NextWindowID: function() {
        return 'win' + my.Constants.WindowID++;
    },
    QMDelay: -99
};

/* Window Manager */
my.Constants.NextWindowID = function() {
    if (!my.Constants.WindowID) my.Constants.WindowID = 0;

};

/* Prototypes */
String.prototype.replaceAll = function(s1, s2) {
    return this.replace(new RegExp(s1, "g"), s2);
};

String.prototype.cFormat = function() {
    var str = this;
    for (var i = 0, len = arguments.length; i < len; i++) str = ('{' + i + '}').replaceAll(arguments[i]);
    return str;
};

String.prototype.startsWith = function(str) {
    return (this.match("^" + str) == str)
};

String.prototype.endsWith = function(str) {
    return (this.match(str + "$") == str)
};

Object.prototype.isFunction = function() {
    return (typeof(this) === 'function');
};

Object.prototype.addEntry = function(a) {
    this.push(a);
};

/**
 *
 *  from http://www.sencha.com/forum/showthread.php?36846-Smart-Ext.util.Format.ellipsis
 */
Ext.apply(Ext.util.Format, {
    EllipsisPix: function(style, text, fixedWidth) {
        var attributes = {
            style: style,
            tag: 'div',
            id: 'EllipsisPix'
        };

        var el = Ext.get('EllipsisPix');
        if (!el) {

            el = Ext.DomHelper.append(document.body, attributes);
        } else {
            el = Ext.DomHelper.overwrite(el, attributes);
        }

        var string_length = Ext.util.TextMetrics.measure(el, text);
        if (string_length.width > fixedWidth) {
            var text = text.replace("...", "");
            var nString = Ext.util.Format.EllipsisPix(style, text.substr(0, (text.length - 2)) + "...", fixedWidth);
        } else {
            var nString = text;
        }
        return nString;
    }
});

/* ??? */
Ext.form.Field.prototype.msgTarget = 'side';

/* Level of calls */
my.Functions.busyLevel = 0;

/* Pseudo Wait Cursor */
my.Functions.showBusy = function() {
    my.Functions.busyLevel++;
    if (my.Functions.busyLevel == 1) {
        Ext.get('waitGraphics').show();
    }
};

my.Functions.showIdle = function() {
    my.Functions.busyLevel--;
    if (my.Functions.busyLevel <= 0) {
        Ext.get('waitGraphics').hide();
    }
};

my.Functions.busy = function(cb) {
    my.Functions.showBusy();
    if (cb) {
        cb();
    }
    my.Functions.showIdle();
};

/* Converts data stream to JSON store */
my.Functions.MakeLocalStore = function(req, cfg) {
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
my.Functions.setValueImage = function(ele, value) {
    if (Ext.isIE) {
        ele.update('<img src="' + my.AJAX.rootURL + '?' + Ext.urlEncode({
            ecimage: value
        }) + '"  />');
    } else {
        ele.update('<img src="data:image/png;base64,' + value + '"  />');
    }
};

/* Print a file */
my.Functions.print = function(url, title) {
    var type = page.substring(title.lastIndexOf('.') + 1);
    var gadget = new cloudprint.Gadget();
    gadget.setPrintDocument('application/' + type, title, url);
    gadget.openPrintDialog();
};

/**
 * mergeRecursive - Merge two objects
 * (From StackOverflow: http://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically)
 */
my.Functions.mergeRecursive = function(obj1, obj2) {
    for (var p in obj2) {
        try {
            // Property in destination object set; update its value.
            if (obj2[p].constructor == Object) {
                obj1[p] = aofn.mergeRecursive(obj1[p], obj2[p]);
            } else {
                obj1[p] = obj2[p];
            }
        } catch (e) {
            // Property in destination object not set; create it and set its value.
            obj1[p] = obj2[p];
        }
    }

    return obj1;
};

/**
 * getAllXY - Returns the XY relative to the component
 */
my.Functions.getAllXY = function (cmp, e) {
    return {
        relative: [
            e.getPageX() - cmp.getX(),
            e.getPageY() - cmp.getY()
        ],
        absolute: [
            e.getPageX(),
            e.getPageY()
        ]
    };
};