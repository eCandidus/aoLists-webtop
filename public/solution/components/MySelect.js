/**
 * @class my.Select.Dataset
 * @extends
 *
 * A. Component that allows the selection of an object from the placeholder list
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
/* Proxy */
my.Select.Support.Proxy = function (config) {
    my.Select.Support.Proxy.superclass.constructor.call(this);
    Ext.apply(this, config);
};

my.Select.Support.Proxy.TRANS_ID = 1000;
my.Select.Transactions = {};

Ext.extend(my.Select.Support.Proxy, Ext.data.DataProxy, {
    storeInUse: null,
    load: function (params, reader, callback, scope, arg) {
        if (this.fireEvent("beforeload", this, params) !== false) {

            var p = Ext.apply(params, this.extraParams);

            var transId = ++my.Select.Support.Proxy.TRANS_ID;
            var trans = {
                id: transId,
                params: params,
                arg: arg,
                callback: callback,
                scope: scope,
                reader: reader
            };

            my.Select.Transactions[trans.id] = trans;

            var selection = this.storeInUse;
            if (this.storeInUse && this.storeInUse.baseParams) {
                selection = this.storeInUse.baseParams.query;
            }

            my.AJAX.call(this.req.fn, {
                startrow: p.start,
                rowlimit: p.limit,
                select: selection || '',
                transid: trans.id,
                objid: this.req.objid,
                objds: this.req.objds,
                objtype: this.req.objtype,
                mergeif: this.req.mergeif,
                qf: this.req.qf,
                targettable: this.req.targettable,
                noteid: this.req.noteid,
                calendarstart: this.req.calendarstart || params.from,
                calendarend: this.req.calendarend || params.until
            }, function (result) {
                if (result) {
                    var rData = result;
                    var trans = my.Select.Transactions[rData.transid];
                    var callResult;
                    try {
                        callResult = trans.reader.readRecords(rData.dataset);
                    } catch (e) {
                        //trans.scope.fireEvent("loadexception", this, callResult, trans.arg, e);
                        trans.callback.call(trans.scope || window, null, trans.arg, false);
                        return;
                    }
                    this.trans = false;
                    trans.callback.call(trans.scope || window, callResult, trans.arg, true);
                    delete my.Select.Transactions[rData.transid];
                }
            });
        } else {
            callback.call(scope || this, null, arg, false);
        }
    },

    isLoading: function () {
        return this.trans ? true : false;
    },

    abort: function () {
        if (this.isLoading()) {
            this.destroyTrans(this.trans);
        }
    }
});

my.Select.Support.Query = function (req, cfg) {
    var localProxy = new my.Select.Support.Proxy();
    localProxy.req = req;

    var localReader = new Ext.data.JsonReader();

    var localStore = new Ext.data.JsonStore(Ext.apply({
        proxy: localProxy,
        reader: localReader,
        req: req,
        calendarstart: null,
        calendarend: null,
        period: {
            from: null,
            until: null
        },
        setPeriod: function (period) {
            this.period = period;
            this.calendarstart = period.from;
            this.calendarend = period.until;
        },
        sortCol: req.sortCol,
        sortAD: req.sortAD || 'ASC'
    }, cfg));

    localProxy.storeInUse = localStore;
    if (req.sortCol) {
        localStore.on('load', function () {
            this.sort(this.sortCol, this.sortAD);
        }, localStore);
    }

    return localStore;
};

my.Select.Dataset = function (req) {

    var newreq = Ext.apply({
        fn: 'Placeholder_List'
    }, req);
    var localStore = new my.Select.Support.Query(newreq);

    var pagingBar = new Ext.PagingToolbar({
        pageSize: my.Constants.LinesPerPage,
        store: localStore,
        displayInfo: true,
        displayMsg: 'Displaying {0} - {1} of {2}',
        emptyMsg: "No entries to display"
    });

    var grid = new Ext.grid.GridPanel({
        store: localStore,
        trackMouseOver: true,
        disableSelection: false,
        autoExpandColumn: 1,
        req: req,
        columns: [{
            header: 'ID',
            dataIndex: 'id',
            hidden: true,
            hideable: false
        }, {
            header: req.objdsdesc,
            dataIndex: 'data',
            menuDisabled: true,
            sortable: false,
            width: 480
        }],
        plugins: [new Ext.ux.grid.Search({
            iconCls: 'bogus',
            minChars: 2,
            grid: this,
            defaultSearch: req.search,
            autoFocus: true
        })],
        bbar: pagingBar
    });

    grid.on('rowclick', function (grd, row, e) {
        var newreq = grd.req;
        var rowData = grd.store.getAt(row);
        // ECANDIDUS - CHANGE DUE TO IPAD
        if (newreq.objid == rowData.id) {
            my.AJAX.call('Object_Get', newreq, function (result) {
                newreq.obj = result;
                grd.fireEvent('idrequested', newreq);
                grd.fireEvent('closeWin');
            });
        } else {
            newreq.objid = rowData.id;
            newreq.objdesc = rowData.data.data;
            grd.fireEvent('idselected', newreq);
        }
    });

    grid.on('rowdblclick', function (grd, row, e) {
        var newreq = grd.req;
        var rowData = grd.store.getAt(row);
        newreq.objid = rowData.id;
        newreq.objdesc = rowData.data.data;
        my.AJAX.call('Object_Get', newreq, function (result) {
            newreq.obj = result;
            grd.fireEvent('idrequested', newreq);
            grd.fireEvent('closeWin');
        });
    });

    return grid;
};

my.Select.Array = function (req) {
    var localStore = new my.Select.Support.Query(req);

    var pagingBar = new Ext.PagingToolbar({
        pageSize: req.LinesPerPage || my.Constants.LinesPerPage,
        store: localStore,
        displayInfo: true,
        displayMsg: 'Displaying {0} - {1} of {2}',
        emptyMsg: "No entries to display"
    });

    var gridDef = {
        store: localStore,
        trackMouseOver: true,
        disableSelection: false,
        autoExpandColumn: 0,
        req: req,
        columns: [{
            header: 'ID',
            dataIndex: 'id',
            hidden: true,
            hideable: false
        }],
        bbar: pagingBar
    };

    if (!req.hideSearch) {
        gridDef.plugins = [new Ext.ux.grid.Search({
            iconCls: 'bogus',
            minChars: 2,
            grid: this,
            mode: req.mode || 'local'
        })];
    }

    for (var i = 0; i < req.cols.length; i++) {
        gridDef.columns.addEntry({
            header: req.cols[i],
            dataIndex: req.cols[i],
            sortable: true
        });
    }
    gridDef.autoExpandColumn = gridDef.columns.length - 1;

    var grid = new Ext.grid.GridPanel(gridDef);
    grid.on('render', function (ctl) {
        if (!ctl.hasBeenShown) {
            ctl.hasBeenShown = true;
            ctl.store.load({
                params: {
                    start: 0,
                    limit: this.req.LinesPerPage || my.Constants.LinesPerPage
                }
            });
        }
    }, grid);

    grid.on('rowclick', function (grd, row, e) {
        var params = {
            req: grd.req
        };
        var rowData = grd.store.getAt(row);
        if (rowData) {
            if (rowData.id) params['id'] = rowData.id;
            params['data'] = rowData.data;
        }
        if (row) params['source'] = row;
        if (grd.ctl) {
            var el = Ext.getCmp(grd.ctl);
            if (el && el.setValue) {
                el.pickedValue([params.data, params.id, params.table]);
            }
        } else {
            // ECANDIDUS - CHANGE DUE TO IPAD
            if (Ext.isiPad && this.iPadRow === row) {
                grd.fireEvent('idrequested', params);
                grd.fireEvent('closeWin');
            } else {
                this.iPadRow = row;
                grd.fireEvent('idselected', params);
            }
        }
    });

    grid.on('rowdblclick', function (grd, row, e) {
        var params = {
            req: grd.req
        };
        var rowData = grd.store.getAt(row);
        if (rowData) {
            if (rowData.id) params['id'] = rowData.id;
            params['data'] = rowData.data;
        }
        if (row) params['source'] = row;
        if (grd.ctl) {
            var el = Ext.getCmp(grd.ctl);
            if (el && el.setValue) {
                el.pickedValue([params.data, params.id, params.table]);
            }
        } else {
            grd.fireEvent('idrequested', params);
        }
        grd.fireEvent('closeWin');
    });

    return grid;
};

/* Addess Picker */
my.Select.Address = function (req, cb) {
    var entryParams = Ext.apply(Ext.apply({}, req), {
        fn: 'ObjectAddresses',
        cols: ['Type', 'Name'],
        LinesPerPage: -1
    });
    my.Select.Pick(entryParams, cb);
};