/**
 * @class
 * @extends
 *
 * Toolbar Support
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
/* Button Parameters */
my.Controls.TBParams = function (req) {
    return Ext.apply({
        object: {},
        window: null,
        activeTab: null
    }, req);
};

/* Get the data in the form */
my.Controls.getFORMDATA = function (ctl) {
    list = {};
    if (ctl.aoFld) {
        list[ctl.aoFld] = ctl.getValue();
    } else if (Array.isArray(ctl.items)) {
        ctl.items.forEach(function (entry) {
            list = Ext.apply(list, my.Controls.getFORMDATA(entry));
        });
    } else if (ctl.items && Array.isArray(ctl.items.items)) {
        ctl.items.items.forEach(function (entry) {
            list = Ext.apply(list, my.Controls.getFORMDATA(entry));
        });
    }
    return list;
};

/* Fill the form fields */
my.Controls.putFORMDATA = function (ctl, values) {
    if (ctl.aoFld) {
        ctl.setValue(values[ctl.aoFld]);
    } else if (Array.isArray(ctl.items)) {
        ctl.items.forEach(function (entry) {
            my.Controls.putFORMDATA(entry, values);
        });
    } else if (ctl.items && Array.isArray(ctl.items.items)) {
        ctl.items.items.forEach(function (entry) {
            my.Controls.putFORMDATA(entry, values);
        });
    }
};

/* Height calculator */
my.Controls.computeeCHeight = function () {
    var ans = 30;
    for (var i = 0; i < arguments.length; i++) {
        ans += my.Controls.computeeCHeightSub(arguments[i]);
    }
    return ans;
};

/* Height calculator */
my.Controls.computeeCHeightSub = function (ctl) {
    var ans = 0;
    if (ctl) {
        if (ctl.height) {
            ans += ctl.height;
        } else if (Array.isArray(ctl.items)) {
            ctl.items.forEach(function (entry) {
                ans += my.Controls.computeeCHeightSub(entry);
            });
        } else if (ctl.items && Array.isArray(ctl.items.items)) {
            ctl.items.items.forEach(function (entry) {
                ans += my.Controls.computeeCHeightSub(entry);
            });
        } else {
            ans += ctl.height || 30;
            if (ctl.eCHeightAdjust) {
                ans += ctl.eCHeightAdjust;
            }
        }
    }
    return ans;
};

/* Icon Buttons */
my.Controls.ToolbarButton = function (shr, buttontext, buttonicon, cb, istoggled) {
    var ans = new Ext.Toolbar.Button({
        shared: shr,
        tooltip: buttontext,
        iconCls: buttonicon || 'magnifier',
        cls: 'x-btn-icon',
        handler: cb,
        enableToggle: istoggled !== null,
        pressed: istoggled === true,
        beganPressed: istoggled === true
    });

    ans.on('toggle', function (btn, pressed) {
        if (pressed !== btn.beganPressed) {
            btn.toggle();
        }
    });

    return ans;
};

/* Upload Buttons */
my.Controls.ToolbarUpload = function (shr, buttontext, buttonicon, url, cb) {
    var ans = new Ext.ux.ToolbarUpload({
        addIconTooltip: buttontext,
        addIconCls: buttonicon || 'magnifier',
        cls: 'x-btn-icon',
        url: url,
        handler: cb,
        shared: shr
    });

    ans.on('toggle', function (btn, pressed) {
        if (pressed !== btn.beganPressed) {
            btn.toggle();
        }
    });

    return ans;
};

/* Text Buttons */
my.Controls.ToolbarTextButton = function (shr, buttontext, cb) {
    var ans = new Ext.Toolbar.Button({
        shared: shr,
        text: buttontext,
        cls: 'x-btn-text',
        handler: cb
    });

    return ans;
};

Ext.ns('Ext.ux.form');

/**
 * Creates new ecHTML
 */
if (Ext.isiPad) {
    Ext.ux.form.ecHTML = Ext.extend(Ext.form.TextArea, {
        enableSourceEdit: false,
        enableLinks: false
    });
} else {
    Ext.ux.form.ecHTML = Ext.extend(Ext.form.HtmlEditor, {
        enableSourceEdit: false,
        enableLinks: false
    });
}

// register xtype
Ext.reg('echtml', Ext.ux.form.ecHTML);

Ext.ux.form.ecHTMLDisplay = Ext.extend(Ext.ux.form.ecHTML, {
    enableAlignments: false,
    enableColors: false,
    enableFont: false,
    enableFontSize: false,
    enableFormat: false,
    enableLists: false
});

Ext.reg('echtmld', Ext.ux.form.ecHTMLDisplay);

/**
 * Creates new Editable Grid
 *
 */
Ext.ux.form.ecEditGrid = function (cfg) {

    this.addEvents(
        /**
         * @event change
         * fired when data has changed
         * @param {Object} data
         */
        'change'
    );

    var localReader = new Ext.data.JsonReader();
    if (cfg.data) localReader.read(cfg.data);

    var localStore = new Ext.data.JsonStore(Ext.apply({
        reader: localReader,
        proxy: new Ext.data.MemoryProxy()
    }, cfg));

    if (cfg.sortCol) {
        localStore.on('load', function () {
            this.sort(this.sortCol, this.sortAD);
        }, localStore);
    }

    this.store = localStore;
    this.clicksToEdit = 1
    this.stripeRows = true;
    this.tbar = [{
        xtype: 'tbfill'
    }, {
        iconCls: 'eciGridRowAdd',
        scope: this,
        handler: function () {
            var localcm = this.colModel;
            if (!localcm.emptyRecord) {
                var eRec = [];
                for (var i = 0, len = localcm.getColumnCount(); i < len; i++) {
                    eRec.addEntry({
                        name: localcm.getColumnHeader(i)
                    });
                }
                localcm.emptyRecord = Ext.data.Record.create(eRec);
            }
            var eValues = {};
            for (var i = 0, len = localcm.getColumnCount(); i < len; i++) {
                eValues[localcm.getColumnHeader(i)] = null;
            }
            this.stopEditing();
            localStore.add(new localcm.emptyRecord(eValues));
            this.startEditing(localStore.getCount() - 1, 0);
        }
    }, {
        iconCls: 'eciGridRowDel',
        scope: this,
        handler: function () {
            if (typeof this.selectedRow !== 'undefined') {
                var index = this.selectedRow;
                delete this.selectedRow;
                var str = this.getStore();
                str.remove(str.getAt(index));
                my.AJAX.call('DeleteGridRow', {
                    fld: this.id,
                    row: index
                });
            }
        }
    }]

    this.setValue = function (value) {
        if (value) {
            this.store.proxy.data = value;
            this.store.load();
        }
    };
    this.getValue = function () {
        return null;
    };
    this.on('afteredit', function (o) {
        my.AJAX.call('UpdateGridCell', {
            fld: o.grid.id,
            value: o.valueOf,
            row: o.row,
            col: o.column
        });
        //o.grid.store.commitChanges();
    });
    this.on('rowclick', function (grid, row, e) {
        grid.selectedRow = row;
    });

    Ext.apply(this, cfg);
    Ext.ux.form.ecEditGrid.superclass.constructor.call(this);
};

Ext.extend(Ext.ux.form.ecEditGrid, Ext.grid.EditorGridPanel, {});

/* Register */
Ext.reg('eceditgrid', Ext.ux.form.ecEditGrid);

/**
 * Creates ecImage
 */
Ext.ux.form.ecImage = Ext.extend(Ext.Panel, {
    setValue: function (value) {
        my.Functions.setValueImage(this.getEl(), value);
    }
});

// register xtype
Ext.reg('ecimage', Ext.ux.form.ecImage);

/**
 * Creates ecForm - Handles multiple pages
 */
Ext.ux.form.ecForm = Ext.extend(Ext.Panel, {
    bodyBorder: false,
    collapsible: true,
    layout: 'border',
    initComponent: function () {
        this.imageArea = new Ext.Panel({
            region: 'center',
            id: this.id + '-tv'
        });

        this.imageHolder = new Ext.Panel({
            region: 'center',
            id: this.id + '-th',
            autoScroll: true,
            items: [this.imageArea]
        });

        this.pageSel = new Ext.TabPanel({
            region: 'south',
            id: this.id + '-t',
            height: 28,
            autoScroll: true,
            activeTab: 0,
            pages: [],
            showPage: function (tb) {
                var viewer = Ext.getCmp(tb.id + 'v');
                var pageno = tb.getActiveTab().pageIndex;
                //                if (viewer && viewer.rendered && tb.pages.length > pageno && pageno >= 0) {
                var pg = tb.pages[pageno];
                if (pg) {
                    my.Functions.setValueImage(viewer.getEl(), pg);
                } else {
                    var el = tb.getEl();
                    if (el) {
                        var xwidth = el.getComputedWidth();
                        if (!viewer.rendered) xwidth = 0;
                        var param = {
                            fld: this.id,
                            page: pageno,
                            width: xwidth
                        };
                        my.AJAX.call('GetFormPage', param, function (result) {
                            if (result) {
                                tb.setInternal(tb, result.data.v);
                                tb.showPage(tb);
                            }
                        });
                    }
                }
                //                }
            },
            setInternal: function (src, value) {
                if (value) {
                    if (!value.page) value = value.v;
                    var newcount = value.count;
                    if (typeof newcount != 'undefined') {
                        for (var i = 0, length = src.pages.length; i < length; i++) {
                            src.remove(src.id + '-' + i);
                        }
                        src.pages = [];
                        for (var i = 0; i < newcount; i++) {
                            src.add({
                                id: src.id + '-' + i,
                                title: 'Page #' + (i + 1),
                                pageIndex: i
                            });
                            src.pages.addEntry(null);
                        }
                        //if (newcount) setInterval.setActiveTab(src.id + '-0');
                    }
                    var xpage = value.page
                    if (typeof xpage != 'undefined') {
                        src.pages[xpage] = value.v;
                    }
                }
            }
        });
        this.pageSel.on('tabchange', function (tb, pnl) {
            tb.showPage(tb);
        });

        this.setValue = function (value) {
            this.pageSel.setInternal(this.pageSel, value);
        };

        this.items = [this.pageSel, this.imageHolder];
        Ext.ux.form.ecForm.superclass.initComponent.call(this, arguments);
    }
});

// register xtype
Ext.reg('ecform', Ext.ux.form.ecForm);

Ext.form.CenterLabel = Ext.extend(Ext.form.Label, {
    style: 'text-align: center',
    cls: 'x-window-mc x-form-item',
    eCHeightAdjust: -30
});
Ext.reg('centerlabel', Ext.form.CenterLabel);