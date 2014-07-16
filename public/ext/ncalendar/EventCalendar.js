/* 
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: EventCalendar.js 8211 2009-05-25 21:09:30Z c.weiss@metaways.de $
 */

Ext.ns('Tine.Calendar');

// COLORS FOR ITEMS
Tine.Calendar.Colors = function() {
    return {
        eventColor: '#FD0000'
        , eventBackgroundColor: '#FF9696'
        , today: '#EBF3FD'
        , availableDay: '#FFFFFF'
        , outsideDay: '#F0F0F0'
    };
};

// A DATA OBJECT TO KEEP ALL CALENDARS IN SYNC -- ADDED BY ECANDIDUS
Tine.Calendar.Synchron = function(config){
    Ext.apply(this, config);
    Tine.Calendar.Synchron.superclass.constructor.call(this);
    
    this.addEvents(
        /**
         * @event viewchanged
         * fired when the view is changed
         * @param {String} new view
         */
        'viewchanged'
        /**
         * @event datechanged
         * fired when the base date changes
         * @param {Date} base date
         */
        , 'datechanged'
    );

    // STARTING DATE
    this.privateBaseDate = new Date().clearTime()
};

Ext.extend(Tine.Calendar.Synchron, Ext.util.Observable, {
    /**
    * @cfg {String} currentView
    * View that is active at the moment
    */
    currentView: 'week'

    , getToday: function() {
        return (new Date()).clearTime();
    }

    , getBaseDate: function() {
        return this.privateBaseDate.clearTime();
    }
    , setBaseDate: function(newdate) {
        if (typeof newdate != 'Date') newdate = new Date(newdate);
        newdate = newdate.clone().clearTime();
        if (newdate.getTime() != this.getBaseDate().getTime()) {
            this.privateBaseDate = newdate;
            this.fireEvent('datechanged', this.getBaseDate());
        }
    }
    , getView: function() {
        return this.currentView;
    }
    , setView: function(newview) {
        if (newview && newview !== this.currentView) {
            this.currentView = newview;
            this.fireEvent('viewchanged', this.currentView);
        }
    }

    , getStartDate: function() {
        var ans = this.getBaseDate();
        switch (this.getView()) {
            case 'month':
                ans = Date.parseDate(ans.format('Y-m') + '-01 00:00:00', Date.patterns.ISO8601Long);
                break;
        }
        return ans.clearTime();
    }
    , getEndDate: function() {
        var ans = this.getStartDate();
        switch (this.getView()) {
            case 'day':
                ans = ans.add(Date.DAY, 1);
                break;
            case 'week':
                ans = ans.add(Date.DAY, 7);
                break;
            case 'month':
                ans = ans.add(Date.MONTH, 1);
                break;
        }
        return ans.clearTime();
    }
});

/* This is the calendar iteself */
Tine.Calendar.EventCalendar = Ext.extend(Ext.Panel, {
    // REMOVED BY ECANDIDUS
    //    /**
    //    * @cfg {String} activeView
    //    */
    //    activeView: 'week',

    //    startDate: new Date().clearTime(),

    // ADDED BY ECANDIDUS
    commonObject: new Tine.Calendar.Synchron()
    // ADDED BY ECANDIDUS
    , dayFormatString: 'D M d'
    // ADDED BY ECANDIDUS
    , minuteFormat: 'h A'

    // REMOVED BY ECANDIDUS -- REPLACED BELOW
    //calendarPanels: {},     

    , border: false
    , layout: 'border'

    , initComponent: function() {
        // ADDED BY ECANDIDUS
        this.calendarPanels = {};
        // END 

        this.initActions();
        this.initLayout();

        Tine.Calendar.EventCalendar.superclass.initComponent.call(this);

        // ADDED BY ECANDIDUS
        this.on('afterlayout', function(src, lay) {
            if (src.isVisible()) {
                src.currentView().loadStore();
            }
        });
    }

    , initActions: function() {
        // ADDED BY ECANDIDUS
        var togglegroup = my.Constants.NextWindowID() + '_tg';

        this.showDayView = new Ext.Toolbar.Button({
            // MODIFIED BY ECANDIDUS
            //pressed: this.activeView == 'day',
            pressed: this.commonObject.getView() == 'day'
            , text: 'Day View'                       // CAPITALIZED BY ECANDIDUS
            , iconCls: 'cal-day-view'
            , xtype: 'tbbtnlockedtoggle'
            , handler: this.changeView.createDelegate(this, ["day"])
            , enableToggle: true
            // MODIFIED BY ECANDIDUS
            //toggleGroup: 'Calendar_Toolbar_tgViews'
            , toggleGroup: togglegroup
        });
        this.showWeekView = new Ext.Toolbar.Button({
            // MODIFIED BY ECANDIDUS
            //pressed: this.activeView == 'week',
            pressed: this.commonObject.getView() == 'week'
            , text: 'Week View'                      // CAPITALIZED BY ECANDIDUS
            , iconCls: 'cal-week-view'
            , xtype: 'tbbtnlockedtoggle'
            , handler: this.changeView.createDelegate(this, ["week"])
            , enableToggle: true
            // MODIFIED BY ECANDIDUS
            //toggleGroup: 'Calendar_Toolbar_tgViews'
            , toggleGroup: togglegroup
        });
        this.showMonthView = new Ext.Toolbar.Button({
            // MODIFIED BY ECANDIDUS
            //pressed: this.activeView == 'month',
            pressed: this.commonObject.getView() == 'month'
            , text: 'Month View'                     // CAPITALIZED BY ECANDIDUS
            , iconCls: 'cal-month-view'
            , xtype: 'tbbtnlockedtoggle'
            , handler: this.changeView.createDelegate(this, ["month"])
            , enableToggle: true
            // MODIFIED BY ECANDIDUS
            //toggleGroup: 'Calendar_Toolbar_tgViews'
            , toggleGroup: togglegroup
        });

        this.changeViewActions = [
            this.showDayView
            , this.showWeekView
            , this.showMonthView
        ];
    },

    /**
    * @private
    * 
    * NOTE: Order of items matters! Ext.Layout.Border.SplitRegion.layout() does not
    *       fence the rendering correctly, as such it's impotant, so have the ftb
    *       defined after all other layout items
    */
    initLayout: function() {
        // ADDED BY ECANDIDUS
        var panel = this.getCalendarPanel(this.commonObject.getView());
        // ADDED BY ECANDIDUS
        panel.bindStore(this.store);
        this.items = [{
            region: 'center'
            , layout: 'card'
            , activeItem: 0
            , border: false
            // MODIFIED BY ECANDIDUS
            //items: [this.getCalendarPanel(this.activeView)]
            , items: [panel]}];

            // preload data
            // DELETED BY ECANDIDUS
            //this.getCalendarPanel(this.activeView).getStore().load({})
            //this.getCalendarPanel(this.commonObject.getView()).loadStore();

            // add detail panel
            if (this.detailsPanel) {
                this.items.push({
                    region: 'south'
                    , border: false
                    , collapsible: true
                    , collapseMode: 'mini'
                    , split: true
                    , layout: 'fit'
                    , height: this.detailsPanel.defaultHeight ? this.detailsPanel.defaultHeight : 125
                    , items: this.detailsPanel

                });
                this.detailsPanel.doBind(this.grid);
            }

            // add filter toolbar
            if (this.filterToolbar) {
                this.items.push(this.filterToolbar);
                this.filterToolbar.on('bodyresize', function(ftb, w, h) {
                    if (this.filterToolbar.rendered && this.layout.rendered) {
                        this.layout.layout();
                    }
                }, this);
            }
        }

        , currentView: function() {
            return this.getCalendarPanel(this.commonObject.getView());
        }

        , changeView: function(view, startDate) {
            // ADDED BY ECANDIDUS
            if (this.commonObject.getView()) this.getCalendarPanel(this.commonObject.getView()).unbindStore();
            // ADDED BY ECANDIDUS
            if (view.view) view = view.view;
            // ADDED BY ECANDIDUS
            this.commonObject.setView(view);

            if (startDate && Ext.isDate(startDate)) {
                // REMOVED BY ECANDIDUS
                this.startDate = startDate.clone()
                // ADDED BY ECANDIDUS
                this.commonObject.setBaseDate(startDate);
            }

            var panel = this.getCalendarPanel(view);
            var cardPanel = this.items.first();

            if (panel.rendered) {
                cardPanel.layout.setActiveItem(panel.id);
            } else {
                cardPanel.add(panel);
                cardPanel.layout.setActiveItem(panel.id);
                cardPanel.doLayout();
            }

            // move around changeViewButtons
            var tbar = panel.getTopToolbar();
            var spacerEl = Ext.fly(Ext.DomQuery.selectNode('div[class=ytb-spacer]', tbar.el.dom)).parent();
            for (var i = this.changeViewActions.length - 1; i >= 0; i--) {
                this.changeViewActions[i].getEl().parent().insertAfter(spacerEl);
            }
            this['show' + Ext.util.Format.capitalize(view) + 'View'].toggle(true);

            // MODIFIED BY ECANDIDUS
            //panel.getView().updatePeriod({ from: this.startDate });
            panel.getView().setBaseDate(this.commonObject.getBaseDate());
            // ADDED BY ECANDIDUS
            panel.bindStore(this.store);
            // MODIFIED BY ECANDIDUS
            //panel.getStore().load({})
            panel.loadStore();
        }

        , updateView: function(which) {
            // ADDED BY ECANDIDUS
            this.commonObject.setView(which);
            var panel = this.getCalendarPanel(which);
            // MODIFIED BY ECANDIDUS
            //var period = panel.getTopToolbar().getPeriod();
            //panel.getView().updatePeriod(period);
            panel.getView().setBaseDate(this.commonObject.getBaseDate());
            // MODIFIED BY ECANDIDUS
            //panel.getStore().load({})
            panel.loadStore();
        }

        /**
        * returns requested CalendarPanel
        * 
        * @param {String} which
        * @return {Tine.Calendar.CalendarPanel}
        */
        , getCalendarPanel: function(which) {
            if (!this.calendarPanels[which]) {
                // REMOVED BY ECANDIDUS - LET THE USER DEFINE THE STORE
                //                // @todo make this a Ext.data.Store
                //                // TEST ADED BY ECANDIDUS
                //                if (!this.store) {
                //                    // MODIFED BY ECANDIDUS
                //                    this.store = new Ext.data.Store({
                //                        // WAS 
                //                        //var store = new Ext.data.Store({
                //                        // END
                //                        //autoLoad: true,
                //                        id: 'id'
                //                        , fields: Tine.Calendar.Event
                //                        , proxy: Tine.Calendar.backend
                //                        , reader: new Ext.data.JsonReader({})//, //Tine.Calendar.backend.getReader(),
                //                    });
                //                }

                var tbar = new Tine.Calendar.PagingToolbar({
                    view: which
                    // ADDED BY ECANDIDUS
                    , commonObject: this.commonObject
                    // MODIFIED BY ECANDIDUS
                    //, store: store
                    , store: this.store
                    , listeners: {
                        scope: this
                        // NOTE: only render the button once for the toolbars
                        //       the buttons will be moved on chageView later
                        , render: function(tbar) {
                            for (var i = 0; i < this.changeViewActions.length; i++) {
                                if (!this.changeViewActions[i].rendered) {
                                    tbar.addButton(this.changeViewActions[i]);
                                }
                            }
                        }
                        , change: this.updateView.createDelegate(this, [which])
                    }
                });

                var view;
                switch (which) {
                    case 'day':
                        view = new Tine.Calendar.DaysView({
                            // REMOVED BY ECANDIDUS
                            //startDate: tbar.getPeriod().from
                            // ADDED BY ECANDIDUS
                            commonObject: this.commonObject
                            // ADDED BY ECANDIDUS
                            , tbar: tbar
                            // ADDED BY ECANDIDUS
                            , dayFormatString: this.dayFormatString
                            // ADDED BY ECANDIDUS
                            , minuteFormat: this.minuteFormat

                            , numOfDays: 1
                        });
                        break;
                    case 'week':
                        view = new Tine.Calendar.DaysView({
                            // REMOVED BY ECANDIDUS
                            //startDate: tbar.getPeriod().from
                            // ADDED BY ECANDIDUS
                            commonObject: this.commonObject
                            // ADDED BY ECANDIDUS
                            , tbar: tbar
                            // ADDED BY ECANDIDUS
                            , dayFormatString: this.dayFormatString
                            // ADDED BY ECANDIDUS
                            , minuteFormat: this.minuteFormat

                            , numOfDays: 7
                        });
                        break;
                    case 'month':
                        view = new Tine.Calendar.MonthView({
                            // REMOVED BY ECANDIDUS
                            //period: tbar.getPeriod()
                            // ADDED BY ECANDIDUS
                            commonObject: this.commonObject
                            // ADDED BY ECANDIDUS
                            , tbar: tbar
                            // ADDED BY ECANDIDUS
                            , minuteFormat: this.minuteFormat
                        });
                }

                view.on('changeView', this.changeView, this);
                view.on('changePeriod', function(period) {
                    // REMOVED BY ECANDIDUS
                    //this.startDate = period.from;
                    // ADDED BY ECANDIDUS
                    this.commonObject.setBaseDate(period.at);
                }, this);

                this.calendarPanels[which] = new Tine.Calendar.CalendarPanel({
                    tbar: tbar
                    // REMOVED BY ECANDIDUS
                    //, store: store
                    , view: view
                });

                // ADDED BY ECANDIDUS
                this.relayEvents(this.calendarPanels[which], ['changeView', 'changePeriod', 'addEvent', 'updateEvent']);
            }

            return this.calendarPanels[which];
        }

        , appendViewSelect: function(tbar) {
            //tbar.
            //if (! this.viewSelect)
        }
    });