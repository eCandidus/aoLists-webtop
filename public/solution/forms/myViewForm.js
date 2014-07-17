/**
 * @class my.View.Form
 * @extends
 *
 * A. Form to view object
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
/* Support */
my.View.SetID = function (root, req) {
    if (root.eCS) {
        root.req = req;
        root.id = 'f-' + req.objds + '-' + req.objid + '-' + root.eCS + '-' + root.eCI.toString();
        root.hideLabel = true;
        if (root.xtype === 'eceditgrid') {
            var cm = [];
            var ds = req.obj[root.eCS][root.eCI];
            if (ds && ds.v) {
                var metadata = ds.v.metaData;
                var fm = Ext.form;
                for (var i = 0, len = metadata.fields.length; i < len; i++) {
                    var fname = metadata.fields[i];
                    var ftype = metadata.fieldTypes[i];
                    var def = {
                        id: i,
                        header: fname,
                        dataIndex: fname
                    };
                    switch (ftype) {
                    case 'number':
                        def['editor'] = new fm.NumberField();
                        break;
                    case 'date':
                        def['editor'] = new fm.DateField({
                            format: 'm/d/y'
                        });
                        def['renderer'] = Ext.util.Format.dateRenderer('m/d/y');
                        break;
                    case 'string':
                        def['editor'] = new fm.TextField();
                        break;
                    }
                    cm.addEntry(def);
                }
            }
            root.cm = new Ext.grid.ColumnModel(cm);
            root.autoExpandColumn = cm.length - 1;
        }
    }
    if (root.items) {
        for (var item = 0; item < root.items.length; item++) {
            my.View.SetID(root.items[item], req);
        }
    }
};

my.View.SetValue = function (root, value, forcechange) {
    if (value) {
        var comp = root;
        if (typeof comp === 'string') comp = Ext.getCmp(root);
        if (typeof comp === 'string') comp = Ext.get(root);
        if (comp) {
            if (value.i) {
                var phy = Ext.get(comp.id);
                if (phy) {
                    my.Functions.setValueImage(phy, value.i);
                }
            } else {
                if (comp.setValue) {
                    comp.setValue(value.v, value.fc);
                } else {
                    var el = Ext.getDom(root);
                    if (el) {
                        el.value = value.v;
                    }
                }
            }
        }
    }
};

my.View.AddValidation = function (root) {
    if (root.eCS) {
        if ((root.eCT && !my.User.usability[root.eCT]) || (!root.eCT && root.eCS === 'WPID')) {
            root.readOnly = true;
            root.noAdd = true;
        }
        root.listeners = {};
        root.listeners.beforetabchange = function (tp, nt, pt) {
            nt.layout();
        };
        root.listeners.sync = function (src, html) {
            if (!src.inSync) {
                src.inSync = true;
                if (!src.syncCount) src.syncCount = 0;
                if (html !== src.startValue) {
                    src.startValue = html;
                    src.syncCount++;
                    (function () {
                        this.syncCount--;
                        if (this.syncCount === 0) {
                            src.fireEvent('change', this, this.getValue(), null);
                        }
                    }).defer(500, src);
                }
                delete src.inSync;
            }
        };
        root.listeners.change = function (fld, newv, oldv) {
            var def = fld.initialConfig;
            if (String(newv) !== String(oldv)) {
                my.AJAX.call('UpdateObject', {
                    objds: def.req.table,
                    fld: fld.id,
                    linkid: fld.rmtID,
                    linktable: fld.rmtTable,
                    value: newv
                }, function (result) {
                    if (result) {
                        var data = result.data;
                        if (data.updates) {
                            for (var i = 0; i < data.updates.length; i++) {
                                var upd = data.updates[i];
                                my.View.SetValue(upd.fld, upd);
                            }
                        }
                    }
                });
            }
        };
        root.listeners.check = function (fld, newv) {
            fld.fireEvent('change', fld, newv, !newv);
        };
        root.listeners.beforerender = function (fld) {
            if (fld.xtype === 'eceditgrid') {
                fld.fireEvent('render', fld);
            }
        }
        root.listeners.render = function (fld) {
            var req = fld.req;
            if (!req) req = fld.initialConfig.req;
            if (req) {
                var obj = req.obj;
                if (obj) {
                    var valueArray = obj[fld.eCS];
                    if (valueArray && valueArray.length > fld.eCI) {
                        my.View.SetValue(fld, valueArray[fld.eCI]);
                    }
                }
            }
        };
        root.listeners.blur = function (fld) {
            if (fld.eCError) fld.markInvalid();
        };
    }
    if (root.xtype) {
        if (root.xtype === 'panel' || root.xtype === 'form') {
            root.defaults = {
                border: false,
                xtype: 'textfield',
                x: 0,
                y: 0,
                height: 22,
                value: '',
                selectOnFocus: true,
                ctCls: 'x-form-label-right',
                typeAhead: true,
                mode: 'local'
            };
        } else if (root.xtype === 'tabpanel') {
            root.deferredRender = true;
            root.activeTab = 0;
            root.findFirst = function (item) {
                if (!item.hidden &&
                    !item.disabled &&
                    (item instanceof Ext.form.Field ||
                        item instanceof Ext.form.TwinTriggerField ||
                        item instanceof Ext.form.ComboBox)) {
                    item.focus(false, 50);
                    return true;
                }
                if (item.items && item.items.find) {
                    if (this.findFirst) {
                        var ans = item.items.find(this.findFirst, this);
                        if (ans) return ans;
                    }
                }
                return false;
            };
            root.listeners = root.listeners || {};
            root.listeners.tabchange = function (tp, pnl) {
                if (!pnl.winResized) {
                    pnl.winResized = true;
                    Ext.EventManager.fireWindowResize();
                }
                pnl.items.find(tp.findFirst, pnl);
            }
        } else if (root.xtype === 'label') {
            if (root.ctCls === 'l') root.ctCls = 'x-form-label-left';
        }
    }
    if (root.items) {
        for (var item = 0; item < root.items.length; item++) {
            my.View.AddValidation(root.items[item]);
        }
    }
};

my.View.Make = function (req, baselay) {
    var layout = Ext.apply({}, baselay);
    if (layout.width !== 0 && layout.height !== 0) {
        my.View.SetID(layout, req);
        var panel = my.Viewer(req);
        var baseDef = {
            title: Ext.util.Format.ellipsis((req.action || 'View') + ' ' + (req.objdtype || '') + (req.objdesc ? ' - ' + req.objdesc : ''), 75),
            width: layout.width + 18,
            height: layout.height + 60,
            iconCls: 'eci' + req.objds,
            shim: false,
            animCollapse: false,
            constrainHeader: true,
            maximizable: false,
            resizable: false,
            layout: 'fit',
            closable: false,
            originalRequest: req,
            items: [panel]
        };
        panel.shared.window = my.App.createWindow(baseDef);
    }
};

my.View.Form = function (req) {
    var open;
    if (req.objid) {
        Ext.Desktop.getManager().each(function (window) {
            if (window.objid === req.objid) {
                open = window;
            }
        });
    }
    if (open) {
        open.show();
        open.toFront();
    } else {
        if (req.objds) {
            var layout = my.Layouts[req.objds];
            if (!layout) {
                my.AJAX.call('Layout_Get', req, function (result) {
                    if (result && result.layout) {
                        layout = new my.Form(result.layout);
                        if (aofn.config.db.cachelayouts) {
                            my.Layouts[ds] = layout;
                        }
                        my.View.Make(req, layout);
                    }
                });
            } else {
                my.View.Make(req, layout);
            }
        }
    }
};