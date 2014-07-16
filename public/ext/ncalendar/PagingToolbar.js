/* 
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: PagingToolbar.js 8138 2009-05-21 19:28:28Z c.weiss@metaways.de $
 */

Ext.ns('Tine.Calendar');

Tine.Calendar.PagingToolbar = Ext.extend(Ext.Toolbar, {
    /**
    * @cfg {Object} commonObject
    * Holds shared data
    */
    commonObject: null
    //    /**
    //    * @cfg {Date} dtstart
    //    */
    //    dtStart: null,
    /**
    * @cfg view
    */
    , view: 'day'
    /**
    * @private
    * @property periodPicker
    */
    , periodPicker: null

    /**
    * @private
    */
    , initComponent: function() {
        this.addEvents(
        /**
        * @event change
        * Fired whenever a viewstate changes
        * @param {Tine.Calendar.PagingToolbar} this
        * @param {String} activeView
        * @param {Array} period
        */
            'change'
        );
        // REMOVED BY ECANDIDUS
        //        if (! Ext.isDate(this.dtStart)) {
        //            this.dtStart = new Date();
        //        }

        this.periodPicker = new Tine.Calendar.PagingToolbar[Ext.util.Format.capitalize(this.view) + 'PeriodPicker']({
            tb: this
            , listeners: {
                scope: this
                , change: function(picker, view, period) {
                    // MODIFIED BY ECANDIDUS
                    //this.dtStart = period.from.clone();
                    this.setStartDate(period.from);
                    this.fireEvent('change', this, view, period);
                }
            }
        });

        Tine.Calendar.PagingToolbar.superclass.initComponent.call(this);
        this.bind(this.store);
    }

    /**
    * @private
    */
    , onRender: function(ct, position) {
        Tine.Calendar.PagingToolbar.superclass.onRender.call(this, ct, position);
        this.prevBtn = this.addButton({
            tooltip: Ext.PagingToolbar.prototype.prevText
            , iconCls: "x-tbar-page-prev"
            , handler: this.onClick.createDelegate(this, ["prev"])
        });
        this.addSeparator();
        this.todayBtn = this.addButton({
            text: Ext.DatePicker.prototype.todayText
            , iconCls: 'cal-today-action'
            , handler: this.onClick.createDelegate(this, ["today"])
        });
        this.periodPicker.render();
        this.addSeparator();
        this.nextBtn = this.addButton({
            tooltip: Ext.PagingToolbar.prototype.nextText
            , iconCls: "x-tbar-page-next"
            , handler: this.onClick.createDelegate(this, ["next"])
        });
        this.addSeparator();
        this.loading = this.addButton({
            tooltip: Ext.PagingToolbar.prototype.refreshText
            , iconCls: "x-tbar-loading"
            , handler: this.onClick.createDelegate(this, ["refresh"])
        });

        this.addFill();

        /*
        if(this.dsLoaded){
        this.onLoad.apply(this, this.dsLoaded);
        }
        //this.loading.disable();
        */

    }

    /**
    * @private
    * @param {String} which
    */
    , onClick: function(which) {
        switch (which) {
            case 'today':
            case 'next':
            case 'prev':
                this.periodPicker[which]();
                this.fireEvent('change', this, this.activeView, this.periodPicker.getPeriod());
                break;
            case 'refresh':
                this.fireEvent('change', this, this.activeView, this.periodPicker.getPeriod());
                break;
        }
    }

    /**
    * returns requested period
    * @return {Array}
    */
    , getPeriod: function() {
        return this.periodPicker.getPeriod();
    }

    // private
    , beforeLoad: function() {
        if (this.rendered && this.loading) {
            this.loading.disable();
        }
    }

    // private
    , onLoad: function(store, r, o) {
        if (this.rendered && this.loading) {
            this.loading.enable();
        }
    }

    /**
    * Unbinds the paging toolbar from the specified {@link Ext.data.Store}
    * @param {Ext.data.Store} store The data store to unbind
    */
    , unbind: function(store) {
        store = Ext.StoreMgr.lookup(store);
        store.un("beforeload", this.beforeLoad, this);
        store.un("load", this.onLoad, this);
        //store.un("loadexception", this.onLoadError, this);
        this.store = undefined;
    }

    /**
    * Binds the paging toolbar to the specified {@link Ext.data.Store}
    * @param {Ext.data.Store} store The data store to bind
    */
    , bind: function(store) {
        store = Ext.StoreMgr.lookup(store);
        store.on("beforeload", this.beforeLoad, this);
        store.on("load", this.onLoad, this);
        //store.on("loadexception", this.onLoadError, this);
        this.store = store;
    }

    // private
    , onDestroy: function() {
        if (this.store) {
            this.unbind(this.store);
        }
        Tine.Calendar.PagingToolbar.superclass.onDestroy.call(this);
    }
});

/**
 * @class Tine.Calendar.PagingToolbar.AbstractPeriodPicker
 * @extends Ext.util.Observable
 * @constructor
 * @param {Object} config
 */
Tine.Calendar.PagingToolbar.AbstractPeriodPicker = function(config) {
    Ext.apply(this, config);
    this.addEvents(
        /**
         * @event change
         * Fired whenever a period changes
         * @param {Tine.Calendar.PagingToolbar.AbstractPeriodPicker} this
         * @param {String} corresponding view
         * @param {Array} period
         */
        'change'
    );
    Tine.Calendar.PagingToolbar.AbstractPeriodPicker.superclass.constructor.call(this);
    
    // REMOVED BY ECANDIDUS
    //this.dtStart = this.tb.dtStart.clone();
    this.init();
};
Ext.extend(Tine.Calendar.PagingToolbar.AbstractPeriodPicker, Ext.util.Observable, {
    init: function() { }
    , hide: function() { this.button.hide(); }
    , show: function() { this.button.show(); }
    , update: function(dtStart) { }
    , render: function() { }
    , prev: function() { }
    , next: function() { }
    , today: function() { this.update(new Date().clearTime()); }
    , getPeriod: function() { }
    // ADDED BY ECANDIDUS
    , getStartDate: function() { return this.tb.commonObject.getBaseDate(); }
    , setStartDate: function(newdate) { this.tb.commonObject.setBaseDate(newdate); }
});

/**
 * @class Tine.Calendar.PagingToolbar.DayPeriodPicker
 * @extends Tine.Calendar.PagingToolbar.AbstractPeriodPicker
 * @constructor
 */
Tine.Calendar.PagingToolbar.DayPeriodPicker = Ext.extend(Tine.Calendar.PagingToolbar.AbstractPeriodPicker, {
    init: function() {
        this.button = new Ext.Button({
            // MODIFIED BY ECANDIDUS
            //text: this.tb.dtStart.format(Ext.DatePicker.prototype.format),
            text: this.getStartDate().format(Ext.DatePicker.prototype.format)
            //hidden: this.tb.activeView != 'day',
            , menu: new Ext.menu.DateMenu({
                listeners: {
                    scope: this
                    , select: function(field) {
                        if (typeof(field.getValue) == 'function') {
                            this.update(field.getValue());
                            this.fireEvent('change', this, 'day', this.getPeriod());
                        }
                    }
                }
            })
        });
    }
    , update: function(dtStart) {
        // MODIFIED BY ECANDIDUS
        //this.dtStart = dtStart.clone();
        this.setStartDate(dtStart);
        if (this.button.rendered) {
            this.button.setText(dtStart.format(Ext.DatePicker.prototype.format));
        }
    }
    , render: function() {
        this.button = this.tb.addButton(this.button);
    }
    , next: function() {
        // MODIFIED BY ECANDIDUS
        //this.dtStart = this.dtStart.add(Date.DAY, 1);
        //this.update(this.dtStart);
        this.update(this.getStartDate().add(Date.DAY, 1));
    }
    , prev: function() {
        // MODIFIED BY ECANDIDUS
        //this.dtStart = this.dtStart.add(Date.DAY, -1);
        //this.update(this.dtStart);
        this.update(this.getStartDate().add(Date.DAY, -1));
    }
    , getPeriod: function() {
        // MODIFIED BY ECANDIDUS
        //var from = Date.parseDate(this.dtStart.format('Y-m-d') + ' 00:00:00', Date.patterns.ISO8601Long);
        var from = Date.parseDate(this.getStartDate().format('Y-m-d') + ' 00:00:00', Date.patterns.ISO8601Long);
        return {
            from: from,
            until: from.add(Date.DAY, 1).add(Date.SECOND, -1)
        };
    }
});

/**
 * @class Tine.Calendar.PagingToolbar.WeekPeriodPicker
 * @extends Tine.Calendar.PagingToolbar.AbstractPeriodPicker
 * @constructor
 */
Tine.Calendar.PagingToolbar.WeekPeriodPicker = Ext.extend(Tine.Calendar.PagingToolbar.AbstractPeriodPicker, {
    init: function() {
        // REMOVED BY ECANDIDUS
//        this.label = new Ext.form.Label({
//            text: 'Week'                       // CAPITALIZED BY ECANDIDUS
//            , style: 'padding-right: 3px'
//            //hidden: this.tb.activeView != 'week'
//        });
//        this.field = new Ext.form.TextField({
//            // MODIFIED BY ECANDIDUS
//            //value: this.tb.dtStart.getWeekOfYear()
//            value: this.getStartDate().getWeekOfYear()
//            , width: 30
//            , cls: "x-tbar-page-number"
//            //hidden: this.tb.activeView != 'week',
//            , listeners: {
//                scope: this
//                , specialkey: this.onSelect
//                , blur: this.onSelect
//            }
//        });
    }
//    , onSelect: function(field, e) {
//        if (e && e.getKey() == e.ENTER) {
//            return field.blur();
//        }
//        // MODIFIED BY ECANDIDUS
//        //var diff = field.getValue() - this.dtStart.getWeekOfYear() - parseInt(this.dtStart.getDay() < 1 ? 1 : 0, 10);
//        var atDate = this.getStartDate();
//        var diff = field.getValue() - atDate.getWeekOfYear() - parseInt(atDate.getDay() < 1 ? 1 : 0, 10);
//        if (diff !== 0) {
//            // MODIFIED BY ECANDIDUS
//            //this.update(this.dtStart.add(Date.DAY, diff * 7))
//            this.update(atDate.add(Date.DAY, diff * 7))
//            this.fireEvent('change', this, 'week', this.getPeriod());
//        }
//        
//    }
    , update: function(dtStart) {
        // MODIFIED BY ECANDIDUS
        //this.dtStart = dtStart.clone();
        this.setStartDate(dtStart);
        // REMOVED BY ECANDIDUS
//        if (this.field.rendered) {
//            // NOTE: '+1' is to ensure we display the ISO8601 based week where weeks always start on monday!
//            this.field.setValue(parseInt(dtStart.getWeekOfYear(), 10) + parseInt(dtStart.getDay() < 1 ? 1 : 0, 10));
//        }
    }
    , render: function() {
        // REMOVED BY ECANDIDUS
//        this.tb.addField(this.label);
//        this.tb.addField(this.field);
    }
    , hide: function() {
        // REMOVED BY ECANDIDUS
//        this.label.hide();
//        this.field.hide();
    }
    , show: function() {
        // REMOVED BY ECANDIDUS
//        this.label.show();
//        this.field.show();
    }
    , next: function() {
        // MODIFIED BY ECANDIDUS
        //this.dtStart = this.dtStart.add(Date.DAY, 7);
        //this.update(this.dtStart);
        this.update(this.getStartDate().add(Date.DAY, 7));

    }
    , prev: function() {
        // MODIFIED BY ECANDIDUS
        //this.dtStart = this.dtStart.add(Date.DAY, -7);
        //this.update(this.dtStart);
        this.update(this.getStartDate().add(Date.DAY, -7));
    }
    , getPeriod: function() {
        // period is the week current startDate is in
        var startDay = Ext.DatePicker.prototype.startDay;
        // ADDED BY ECANDIDUS
        var atDate = this.getStartDate();
        // MODIFIED BY ECANDIDUS
        //var diff = startDay - this.dtStart.getDay();
        var diff = startDay - atDate.getDay();
        // MODIFIED BY ECANDIDUS
        //var from = Date.parseDate(this.dtStart.add(Date.DAY, diff).format('Y-m-d') + ' 00:00:00', Date.patterns.ISO8601Long);
        var from = Date.parseDate(atDate.add(Date.DAY, diff).format('Y-m-d') + ' 00:00:00', Date.patterns.ISO8601Long);
        return {
            from: from,
            until: from.add(Date.DAY, 7).add(Date.SECOND, -1)
        };
    }
});

/**
 * @class Tine.Calendar.PagingToolbar.MonthPeriodPicker
 * @extends Tine.Calendar.PagingToolbar.AbstractPeriodPicker
 * @constructor
 */
Tine.Calendar.PagingToolbar.MonthPeriodPicker = Ext.extend(Tine.Calendar.PagingToolbar.AbstractPeriodPicker, {
    init: function() {
        this.button = new Ext.Button({
            // MODIFIED BY ECANDIDUS
            //text: Ext.DatePicker.prototype.monthNames[this.tb.dtStart.getMonth()] + this.tb.dtStart.format(' Y')
            text: Ext.DatePicker.prototype.monthNames[this.getStartDate().getMonth()] + this.getStartDate().format(' Y')
            //hidden: this.tb.activeView != 'month',
            , menu: new Ext.menu.DateMenu({
                hideMonthPicker: Ext.DatePicker.prototype.hideMonthPicker.createSequence(function() {
                    if (this.monthPickerActive) {
                        this.monthPickerActive = false;
                        
                        this.value = this.activeDate;
                        this.fireEvent('select', this, this.value);
                    }
                })
                , listeners: {
                    scope: this
                    , select: function(field) {
                        if (typeof(field.getValue) == 'function') {
                            this.update(field.getValue());
                            this.fireEvent('change', this, 'month', this.getPeriod());
                        }
                    }
                }
            })
            , listeners: {
                scope: this
                , menushow: function(btn, menu) {
                    menu.picker.showMonthPicker();
                    menu.picker.monthPickerActive = true;
                }
                , menuhide: function(btn, menu) {
                    menu.picker.monthPickerActive = false;
                }
            }
        });
    }
    , update: function(dtStart) {
        // MODIFIED BY ECANDIDUS
        //this.dtStart = dtStart.clone();
        this.setStartDate(dtStart);
        if (this.button.rendered) {
            var monthName = Ext.DatePicker.prototype.monthNames[dtStart.getMonth()];
            this.button.setText(monthName + dtStart.format(' Y'));
        }
    }
    , render: function() {
        this.button = this.tb.addButton(this.button);
    }
    , next: function() {
        // MODIFIED BY ECANDIDUS
        //this.dtStart = this.dtStart.add(Date.MONTH, 1);
        //this.update(this.dtStart);
        this.update(this.getStartDate().add(Date.MONTH, 1));    
    }
    , prev: function() {
        // MODIFIED BY ECANDIDUS
        //this.dtStart = this.dtStart.add(Date.MONTH, -1);
        //this.update(this.dtStart);
        this.update(this.getStartDate().add(Date.MONTH, -1));    
    }
    , getPeriod: function() {
        // MODIFIED BY ECANDIDUS
        //var from = Date.parseDate(this.dtStart.format('Y-m') + '-01 00:00:00', Date.patterns.ISO8601Long);
        var from = Date.parseDate(this.getStartDate().format('Y-m') + '-01 00:00:00', Date.patterns.ISO8601Long);
        return {
            from: from,
            until: from.add(Date.MONTH, 1).add(Date.SECOND, -1)
        };
    }
});