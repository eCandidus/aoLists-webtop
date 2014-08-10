/**77
 * @class mySys
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
/* Tool */
my.Tool = function (name, req, cb) {
    var fn = my.Tools[name];
    if (fn && fn.isFunction()) {
        fn(req, cb);
    } else {
        my.Popup.showAlert('Unable to call tool: ' + name);
    }
};

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
            if (ans) {
                return ans;
            }
        }
        return false;
    },
    focus: function () {
        // set focus to first available field
        this.items.find(this.findFirst, this);
    }
};

/* Popups */
my.Popup = {
    // Stack
    stack: [],

    // private
    handleButton: function (dlg, button) {
        dlg.fireEvent(button.toLowerCase());
        dlg.close();
    },

    create: function (cfg) {
        cfg.buttonDefs = cfg.buttonDefs || ['Ok'];
        var baseDef = {
            autoCreate: true,
            title: cfg.title,
            resizable: false,
            constrain: true,
            constrainHeader: true,
            minimizable: false,
            maximizable: false,
            stateful: false,
            modal: false,
            shim: true,
            buttonAlign: "center",
            width: 400,
            height: 100,
            minHeight: 80,
            plain: true,
            icon: cfg.icon,
            footer: (cfg.buttonDefs && cfg.buttonDefs.length > 0),
            closable: true,
            listeners: {}
        };
        baseDef = my.Functions.mergeRecursive(baseDef, cfg);
        baseDef.listeners.close = function () {
            for (var i = 0; i < my.Popup.stack.length; i++) {
                if (this.id == my.Popup.stack[i].id) {
                    my.Popup.stack.splice(i, 1);
                    if (i < my.Popup.stack.length) {
                        my.Popup.repos(i);
                    }
                    break;
                }
            }
        };

        var dlg = new Ext.Window(baseDef);

        if (cfg.buttonDefs) {
            cfg.buttonDefs.forEach(function (btn) {
                dlg.addButton(btn, my.Popup.handleButton.createCallback(dlg, btn));
            });
        }
        dlg.render(document.body);
        dlg.getEl().addClass('x-window-dlg');
        mask = dlg.mask;
        bodyEl = dlg.body.createChild({
            html: '<div class="ext-mb-icon ext-mb-' + (cfg.icon || 'info') + '"></div><div class="ext-mb-content"><span class="ext-mb-text"></span><br /></div>'
        });

        iconEl = Ext.get(bodyEl.dom.firstChild);

        var contentEl = bodyEl.dom.childNodes[1];
        msgEl = Ext.get(contentEl.firstChild);
        bodyEl.createChild({
            cls: 'x-clear'
        });

        msgEl.update(cfg.msg || '&#160;');

        var iw = iconEl.getWidth();
        var mw = msgEl.getWidth() + msgEl.getMargins('lr');
        var fw = dlg.getFrameWidth('lr');
        var bw = dlg.body.getFrameWidth('lr');
        if (Ext.isIE && iw > 0) {
            //3 pixels get subtracted in the icon CSS for an IE margin issue,
            //so we have to add it back here for the overall width to be consistent
            iw += 3;
        }
        var w = Math.max(Math.min(cfg.width || iw + mw + fw + bw, this.maxWidth),
            Math.max(cfg.minWidth, 0));
        if (Ext.isIE && w == bwidth) {
            w += 4; //Add offset when the content width is smaller than the buttons.    
        }
        dlg.setSize(w, 'auto').center();

        if (cfg.autoclose) {
            setInterval(function () {
                dlg.close();
            }, cfg.autoclose);
        }

        return dlg;
    },

    show: function (config, uconfig) {
        // Apply type congig stuff first
        var fconfig = Ext.apply({
            title: 'FYI...'
        }, config);
        // And then overwrite with users
        fconfig = Ext.apply(fconfig, uconfig);
        // Make the popup
        var window = my.Popup.create(fconfig);
        // Add to stack
        my.Popup.stack.push(window);
        // Reposition
        my.Popup.repos(my.Popup.stack.length - 1);
        //
        window.show();
    },

    repos: function (at) {
        // The window
        var window = my.Popup.stack[at];
        // Get the desktop
        var desktop = my.App.getDesktop();
        // Location
        var x, y;
        //
        var xadjust = 20;
        var yadjust = 40;
        // Find last in stack
        if (at) {
            var last = my.Popup.stack[at - 1];
            x = desktop.getWinWidth() - (window.width + xadjust);
            y = last.y - (window.height + 10);
            if (y < 100) {
                y = desktop.getWinHeight() - (window.height + yadjust);
            }
        } else {
            x = desktop.getWinWidth() - (window.width + xadjust);
            y = desktop.getWinHeight() - (window.height + yadjust);
        }
        // Next
        at++;
        // Do we need to move?
        if (window.x != x || window.y != y) {
            window.getEl().moveTo(x, y, true, 0.35, function () {
                window.setPosition(x, y);
                // Keep on trucking
                if (at < my.Popup.stack.length) {
                    my.Popup.repos(at);
                }
            });
        }
    },

    removeIfIcon: function (icon) {
        my.Popup.stack.forEach(function (dlg) {
            if (dlg.icon == icon) {
                dlg.close();
            }
        });
    },

    showQM: function (msg, ucfg) {
        my.Popup.show({
            title: 'Quick Message from ' + msg.from,
            from: msg.from,
            msg: msg.message,
            icon: 'qm',
            buttonDefs: ['Reply', 'Ok'],
            listeners: {
                reply: function () {
                    my.Tools.QMRespond({
                        to: this.from
                    });
                }
            }
        }, ucfg);
    },

    showServerAlert: function (msg, ucfg) {
        my.Popup.removeIfIcon('aolists');
        my.Popup.show({
            title: 'Alert from aoLists Server',
            msg: msg,
            icon: 'aolists'
        }, ucfg);
    },

    showAlert: function (msg, delay, title) {
        my.Popup.show({
            title: 'FYI...',
            msg: msg,
            icon: 'warning',
            autoclose: 8000
        });
    }
};