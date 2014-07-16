/* 
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: DaysView.js 8212 2009-05-26 07:38:43Z c.weiss@metaways.de $
 */

Ext.ns('Tine.Calendar');

Tine.Calendar.DaysView = function(config){
    Ext.apply(this, config);
    Tine.Calendar.DaysView.superclass.constructor.call(this);
    
    this.addEvents(
        /**
         * @event changeView
         * fired if user wants to change view
         * @param {String} requested view name
         * @param {mixed} start param of requested view
         */
        'changeView'
        /**
         * @event changePeriod
         * fired when period changed
         * @param {Object} period
         */
        , 'changePeriod'
        /**
         * @event addEvent
         * fired when a new event got inserted
         * 
         * @param {Tine.Calendar.Event} event
         */
        , 'addEvent'
        /**
         * @event updateEvent
         * fired when an event go resised/moved
         * 
         * @param {Tine.Calendar.Event} event
         */
        , 'updateEvent'
    );
};

Ext.extend(Tine.Calendar.DaysView, Ext.util.Observable, {
    // ADDED BY ECANDIDUS
    /**
    * @cfg {Object} commonObject
    * Holds shared data
    */
    commonObject: null
    // ADDED BY ECANDIDUS
    , minuteFormat: 'H:i'
    // REMOVED BY ECANDIDUS
    //    /**
    //    * @cfg {Date} startDate
    //    * start date
    //    */
    //    startDate: new Date(),
    //    /**
    //    * @cfg {Number} numOfDays
    //    * number of days to display
    //    */
    //    , numOfDays: 4
    /**
    * @cfg {String} newEventSummary
    */
    , newEventSummary: 'New Event'
    /**
    * @cfg {String} dayFormatString
    */
    , dayFormatString: 'D, jS \\o\\f F'
    /**
    * @cfg {Number} timeGranularity
    * granularity of timegrid in minutes
    */
    // MODIFIED BY ECANDIDUS
    , timeGranularity: 30
    /**
    * @cfg {Number} granularityUnitHeights
    * heights in px of a granularity unit
    */
    // MODIFIED BY ECANDIDUS
    //, granularityUnitHeights: 18
    , granularityUnitHeights: 30
    /**
    * @property {Ext.data.Store} timeScale
    * store holding timescale 
    */
    , timeScale: null
    /**
    * The amount of space to reserve for the scrollbar (defaults to 19 pixels)
    * @type Number
    */
    , scrollOffset: 19
    /**
    * @property {bool} editing
    * @private
    */
    , editing: false
    /**
    * @property {Tine.Calendar.Event} activeEvent
    * @private
    */
    , activeEvent: null
    /**
    * @property {Ext.data.Store}
    * @private
    */
    , ds: null

    // ADDED BY ECANDIDUS
    , getStartDate: function() {
        return this.commonObject.getStartDate();
    }
    // ADDED DBY ECANDIDUS
    , getEndDate: function() {
        return this.commonObject.getEndDate();
    }
    // ADDED BY ECANDISUS
    , getNumberOfDays: function() {
        return Math.ceil((this.getEndDate().getTime() - this.getStartDate().getTime()) / (1000 * 60 * 60 * 24));
    }
    // ADDED BY ECANDIDUS    
    , getBaseDate: function() {
        return this.commonObject.getBaseDate();
    }
    // ADDED BY ECANDIDUS
    , setBaseDate: function(newdate) {
        this.commonObject.setBaseDate(newdate);
        this.tbar.periodPicker.update(newdate);

        this.updateDayHeaders();

        this.fireEvent('changePeriod', { at: this.getBaseDate(), from: this.getStartDate(), until: this.getEndDate() });
    }

    // REMOVED BY ECANDIDUS    
    //    /**
    //    * updates period to display
    //    * @param {Array} period
    //    */
    //    , updatePeriod: function(period) {
    //        this.toDay = new Date().clearTime();

    //        this.startDate = period.from;

    //        var tbar = this.calPanel.getTopToolbar();
    //        if (tbar) {
    //            tbar.periodPicker.update(this.startDate);
    //            this.startDate = tbar.periodPicker.getPeriod().from;
    //        }

    //        this.endDate = this.startDate.add(Date.DAY, this.numOfDays + 1);

    //        //this.parallelScrollerEventsRegistry = new Tine.Calendar.ParallelEventsRegistry({dtStart: this.startDate, dtEnd: this.endDate});
    //        //this.parallelWholeDayEventsRegistry = new Tine.Calendar.ParallelEventsRegistry({dtStart: this.startDate, dtEnd: this.endDate});
    //        //this.ds.each(this.removeEvent, this);

    //        this.updateDayHeaders();

    //        this.fireEvent('changePeriod', period);
    //    }

    /**
    * init this view
    * 
    * @param {Tine.Calendar.CalendarPanel} calPanel
    */
    , init: function(calPanel) {
        this.calPanel = calPanel;

        // REMOVED BY ECANDIDUS
        //        this.startDate.setHours(0);
        //        this.startDate.setMinutes(0);
        //        this.startDate.setSeconds(0);

        //        this.endDate = this.startDate.add(Date.DAY, this.numOfDays + 1);

        // MODIFIED BY ECANDIDUS
        //this.parallelScrollerEventsRegistry = new Tine.Calendar.ParallelEventsRegistry({ dtStart: this.startDate, dtEnd: this.endDate });
        //this.parallelWholeDayEventsRegistry = new Tine.Calendar.ParallelEventsRegistry({ dtStart: this.startDate, dtEnd: this.endDate });
        var dStart = this.getStartDate();
        var dEnd = this.getEndDate();
        this.parallelScrollerEventsRegistry = new Tine.Calendar.ParallelEventsRegistry({ dtStart: dStart, dtEnd: dEnd });
        this.parallelWholeDayEventsRegistry = new Tine.Calendar.ParallelEventsRegistry({ dtStart: dStart, dtEnd: dEnd });

        // REMOVED BY ECANDIDUS
        //this.initData(calPanel.store);

        this.initTimeScale();
        this.initTemplates();
    }

    // ADDED BY ECANDIDUS
    , getStore: function() {
        return this.ds;
    }

    // ADDED BY ECANDIDUS
    , unbindStore: function() {
        if (this.ds) {
            // REMOVED BY ECANDIDUS
            //this.ds.un("beforeload", this.onBeforeLoad, this);
            this.ds.un("load", this.onLoad, this);
            // REMOVED BY ECANDIDUS
            //            this.ds.un("datachanged", this.onDataChange, this);
            //            this.ds.un("add", this.onAdd, this);
            //            this.ds.un("remove", this.onRemove, this);
            //            this.ds.un("update", this.onUpdate, this);
            //            this.ds.un("clear", this.onClear, this);
            //            this.ds = null;
        }
    }

    // ADDED BY ECANDIDUS
    , bindStore: function(store) {
        this.unbindStore();
        this.ds = store;
        if (this.ds) {
            // REMOVED BY ECANDIDUS
            //this.ds.on("beforeload", this.onBeforeLoad, this);
            this.ds.on("load", this.onLoad, this);
            // REMOVED BY ECANDIDUS
            //            this.ds.on("datachanged", this.onDataChange, this);
            //            this.ds.on("add", this.onAdd, this);
            //            this.ds.on("remove", this.onRemove, this);
            //            this.ds.on("update", this.onUpdate, this);
            //            this.ds.on("clear", this.onClear, this);
        }
    }

    // REMOVED BY ECANDIDUS
    //    /**
    //    * @private
    //    * @param {Ext.data.Store} ds
    //    */
    //    , initData: function(ds) {
    //        if (this.ds) {
    //            this.ds.un("beforeload", this.onBeforeLoad, this);
    //            this.ds.un("load", this.onLoad, this);
    //            this.ds.un("datachanged", this.onDataChange, this);
    //            this.ds.un("add", this.onAdd, this);
    //            this.ds.un("remove", this.onRemove, this);
    //            this.ds.un("update", this.onUpdate, this);
    //            this.ds.un("clear", this.onClear, this);
    //        }
    //        if (ds) {
    //            ds.on("beforeload", this.onBeforeLoad, this);
    //            ds.on("load", this.onLoad, this);
    //            ds.on("datachanged", this.onDataChange, this);
    //            ds.on("add", this.onAdd, this);
    //            ds.on("remove", this.onRemove, this);
    //            ds.on("update", this.onUpdate, this);
    //            ds.on("clear", this.onClear, this);
    //        }
    //        this.ds = ds;
    //    }

    /**
    * inits time scale
    * @private
    */
    , initTimeScale: function() {
        var data = [];
        var scaleSize = Date.msDAY / (this.timeGranularity * Date.msMINUTE);
        // MODIFIED BY ECANDIDUS
        //var baseDate = this.startDate.clone();
        var baseDate = this.getStartDate().clone();

        var minutes;
        for (var i = 0; i < scaleSize; i++) {
            minutes = i * this.timeGranularity;
            // MODIFIED BY ECANDIDUS
            //data.push([i, minutes, minutes * Date.msMINUTE, baseDate.add(Date.MINUTE, minutes).format('H:i')]);
            data.push([i, minutes, minutes * Date.msMINUTE, baseDate.add(Date.MINUTE, minutes).format(this.minuteFormat)]);
        }

        this.timeScale = new Ext.data.SimpleStore({
            fields: ['index', 'minutes', 'milliseconds', 'time']
            , data: data
            , id: 'index'
        });
    }

    , initDropZone: function() {
        this.dd = new Ext.dd.DropZone(this.mainWrap.dom, {
            ddGroup: 'cal-event'

            , notifyOver: function(dd, e, data) {
                var sourceEl = Ext.fly(data.sourceEl);
                sourceEl.setStyle({ 'border-style': 'dashed' });
                sourceEl.setOpacity(0.5);

                var target = Tine.Calendar.DaysView.prototype.getTargetDateTime.call(data.scope, e);
                if (target) {
                    return Math.abs(target.getTime() - data.event.get('dtstart').getTime()) < Date.msMINUTE ? 'cal-daysviewpanel-event-drop-nodrop' : 'cal-daysviewpanel-event-drop-ok';
                }

                return 'cal-daysviewpanel-event-drop-nodrop';
            }

            , notifyOut: function() {
                //console.log('notifyOut');
                //delete this.grid;
            }

            , notifyDrop: function(dd, e, data) {
                var v = data.scope;

                var targetDate = v.getTargetDateTime(e);
                if (targetDate) {
                    var event = data.event;

                    // REMOVED BY ECANDIDUS
                    // deny all day drop on the same day
                    //                    if (Math.abs(targetDate.getTime() - event.get('dtstart').getTime()) < Date.msMINUTE) {
                    //                        return false;
                    //                    }

                    event.beginEdit();
                    event.set('dtstart', targetDate);

                    if (!event.get('is_all_day_event') && targetDate.is_all_day_event && event.duration < Date.msDAY) {
                        // draged from scroller -> dropped to allDay and duration less than a day
                        event.set('dtend', targetDate.add(Date.DAY, 1));
                    } else if (event.get('is_all_day_event') && !targetDate.is_all_day_event) {
                        // draged from allDay -> droped to scroller will be resetted to hone hour
                        event.set('dtend', targetDate.add(Date.HOUR, 1));
                    } else {
                        event.set('dtend', targetDate.add(Date.MILLI, event.duration));
                    }

                    event.set('is_all_day_event', targetDate.is_all_day_event);
                    event.endEdit();
                    
                    event.dirty = false;

                    alert('b99');
                    if (v) v.fireEvent('updateEvent', event);
                    alert('b100');

                }

                return !!targetDate;
            }
        });
    }

    /**
    * @private
    */
    , initDragZone: function() {
        this.scroller.ddScrollConfig = {
            vthresh: 50
            , hthresh: -1
            , frequency: 100
            , increment: 100
        };
        Ext.dd.ScrollManager.register(this.scroller);

        // init dragables
        this.dragZone = new Ext.dd.DragZone(this.el, {
            ddGroup: 'cal-event'
            , daysView: this
            , scroll: false
            , containerScroll: true,

            getDragData: function(e) {
                var eventEl = e.getTarget('div.cal-daysviewpanel-event', 10);
                if (eventEl) {
                    var parts = eventEl.id.split(':');
                    var event = this.daysView.ds.getById(parts[1]);

                    // don't allow dragging of dirty events
                    if (event.dirty) {
                        return;
                    }

                    this.daysView.setActiveEvent(event);

                    // we need to clone an event with summary in
                    var d = Ext.get(event.domIds[0]).dom.cloneNode(true);
                    d.id = Ext.id();

                    if (event.get('is_all_day_event')) {
                        Ext.fly(d).setLeft(0);
                    } else {
                        var width = (Ext.fly(this.daysView.dayCols[0]).getWidth() * 0.9);
                        Ext.fly(d).setTop(0);
                        Ext.fly(d).setWidth(width);
                        Ext.fly(d).setHeight(this.daysView.getTimeHeight.call(this.daysView, event.get('dtstart'), event.get('dtend')));
                    }

                    return {
                        scope: this.daysView
                        , sourceEl: eventEl
                        , event: event
                        , ddel: d
                    }
                }
            },

            getRepairXY: function(e, dd) {
                Ext.fly(this.dragData.sourceEl).setStyle({ 'border-style': 'solid' });
                Ext.fly(this.dragData.sourceEl).setOpacity(1, 1);

                return Ext.fly(this.dragData.sourceEl).getXY();
            }
        });
    }

    /**
    * renders the view
    */
    , render: function() {
        this.templates.master.append(this.calPanel.body, {
            header: this.templates.header.applyTemplate({
                daysHeader: this.getDayHeaders(),
                wholeDayCols: this.getWholeDayCols()
            })
            , body: this.templates.body.applyTemplate({
                timeRows: this.getTimeRows(),
                dayColumns: this.getDayColumns()
            })
        });

        this.initElements();
    }

    /**
    * fill the events into the view
    */
    , afterRender: function() {

        this.mainWrap.on('dblclick', this.onDblClick, this);
        this.mainWrap.on('mousedown', this.onMouseDown, this);
        this.mainWrap.on('mouseup', this.onMouseUp, this);

        this.initDropZone();
        this.initDragZone();

        // MODIFIED BY ECANDIDUS
        //this.updatePeriod({ from: this.startDate });
        this.setBaseDate(this.getBaseDate());

        if (this.dsLoaded) {
            this.onLoad.apply(this);
        }

        this.layout();
        this.rendered = true;
    },

    scrollToNow: function() {
        this.scroller.dom.scrollTop = this.getTimeOffset(new Date()) / 2;
    }

    /**
    * renders a single event into this daysview
    * @param {Tine.Calendar.Model.Event} event
    * 
    * @todo Add support vor Events spanning over a day boundary
    */
    , insertEvent: function(event) {

        // ADDED BY ECANDIDUS
        event.dirty = false;

        // @todo fetch color from calendar
        // REMOVED BY ECANDIDUS
        //var color = '#FD0000';

        var extraCls = '';
        // ADDED BY ECANDIDUS
        var color = event.get('color');
        // ADDED BY ECANDIDUS
        if (!color) color = Tine.Calendar.Colors().eventColor;
        // ADDED BY ECANDIDUS
        var iNumberOfDays = this.getNumberOfDays();

        // lighten up background
        var r = Math.min(this.hex2dec(color.substring(1, 3)) + 150, 255);
        var g = Math.min(this.hex2dec(color.substring(3, 5)) + 150, 255);
        var b = Math.min(this.hex2dec(color.substring(5, 7)) + 150, 255);
        var bgColor = 'rgb(' + r + ',' + g + ',' + b + ')';

        var dtStart = event.get('dtstart');
        var startColNum = this.getColumnNumber(dtStart);
        var dtEnd = event.get('dtend'); //.add(Date.SECOND, -1);
        var endColNum = this.getColumnNumber(dtEnd);

        // skip dates not in our diplay range
        // MODIFIED BY ECANDIDUS
        //if (endColNum < 0 || startColNum > this.numOfDays - 1) {        
        if (endColNum < 0 || startColNum > iNumberOfDays - 1) {
            return;
        }

        var registry = event.get('is_all_day_event') ? this.parallelWholeDayEventsRegistry : this.parallelScrollerEventsRegistry;
        var parallels = registry.getEvents(dtStart, dtEnd);
        var pos = parallels.indexOf(event);

        // poperties might be missing on quickAdd
        event.parallels = event.parallels > 0 ? event.parallels : 1;
        pos = pos >= 0 ? pos : 0;

        //registry for dom ids
        event.domIds = [];

        if (event.get('is_all_day_event')) {
            var offsetWidth = Ext.fly(this.wholeDayArea).getWidth();

            // MODIFIED BY ECANDIDUS
            //var width = Math.round(offsetWidth * (dtEnd.getTime() - dtStart.getTime()) / (this.numOfDays * Date.msDAY)) - 5;
            var width = Math.round(offsetWidth * (dtEnd.getTime() - dtStart.getTime()) / (iNumberOfDays * Date.msDAY)) - 5;
            // MODIFIED BY ECANDIDUS
            //var left = Math.round(offsetWidth * (dtStart.getTime() - this.startDate.getTime()) / (this.numOfDays * Date.msDAY));
            var left = Math.round(offsetWidth * (dtStart.getTime() - this.getStartDate().getTime()) / (iNumberOfDays * Date.msDAY));

            if (startColNum < 0) {
                // MODIFIED BY ECANDIDUS
                //width = width - Math.abs(startColNum) * (offsetWidth / this.numOfDays);
                width = width - Math.abs(startColNum) * (offsetWidth / iNumberOfDays);
                left = 0;
                extraCls = extraCls + ' cal-daysviewpanel-event-cropleft';
            }

            // MODIFIED BY ECANDIDUS
            //if (endColNum > this.numOfDays) {
            if (endColNum > iNumberOfDays) {
                //  MODIFIED BY ECANDIDUS
                //width = width - Math.abs(endColNum - this.numOfDays) * (offsetWidth / this.numOfDays);
                width = width - Math.abs(endColNum - iNumberOfDays) * (offsetWidth / iNumberOfDays);
                extraCls = extraCls + ' cal-daysviewpanel-event-cropright';
            }

            var domId = Ext.id() + '-evnet:' + event.get('id');
            event.domIds.push(domId);

            var eventEl = this.templates.wholeDayEvent.insertFirst(this.wholeDayArea, {
                id: domId
                , summary: event.get('summary')
                // ADDED BY ECANDIDUS
                , note: event.get('note')
                , startTime: dtStart.format('H:i')
                , extraCls: extraCls
                , color: color
                , bgColor: bgColor
                , zIndex: 100
                , width: width + 'px'
                , height: '15px'
                , left: left + 'px'
                , top: pos * 18 + 'px'//'1px'
            }, true);

            // MODIFIED BY ECANDIDUS
            //if (!(endColNum > this.numOfDays)) {
            if (!(endColNum > iNumberOfDays)) {
                event.resizeable = new Ext.Resizable(eventEl, {
                    handles: 'e'
                    , disableTrackOver: true
                    //dynamic: !!event.isRangeAdd,
                    // MODIFIED BY ECANDIDUS
                    //, widthIncrement: Math.round(offsetWidth / this.numOfDays)
                    , widthIncrement: Math.round(offsetWidth / iNumberOfDays)
                    // MODIFIED BY ECANDIDUS
                    //, minWidth: Math.round(offsetWidth / this.numOfDays)
                    , minWidth: Math.round(offsetWidth / iNumberOfDays)
                    , listeners: {
                        scope: this
                        , resize: this.onEventResize
                        , beforeresize: this.onBeforeEventResize
                    }
                });
            }

        } else {

            for (var currColNum = startColNum; currColNum <= endColNum; currColNum++) {

                extraCls = '';
                // MODIFIED BY ECANDIDUS
                //if (currColNum < 0 || currColNum > this.numOfDays) {
                if (currColNum < 0 || currColNum > iNumberOfDays) {
                    continue;
                }

                var top = this.getTimeOffset(dtStart);
                var height = startColNum == endColNum ? this.getTimeHeight(dtStart, dtEnd) : this.getTimeOffset(dtEnd);

                if (currColNum != startColNum) {
                    top = 0;
                    extraCls = extraCls + ' cal-daysviewpanel-event-croptop';
                }

                if (endColNum != currColNum) {
                    height = this.getTimeHeight(dtStart, dtStart.add(Date.DAY, 1));
                    extraCls = extraCls + ' cal-daysviewpanel-event-cropbottom';
                }

                var domId = Ext.id() + '-evnet:' + event.get('id');
                event.domIds.push(domId);

                var eventEl = this.templates.event.append(this.getDateColumnEl(currColNum), {
                    id: domId
                    , summary: event.get('summary')
                    // ADDED BY ECANDIDUS
                    , note: event.get('note')
                    , startTime: dtStart.format('H:i')
                    , extraCls: extraCls
                    , color: color
                    , bgColor: bgColor
                    , zIndex: 100
                    , width: Math.round(90 * 1 / event.parallels) + '%'
                    , height: height + 'px'
                    , left: Math.round(pos * 90 * 1 / event.parallels) + '%'
                    , top: top + 'px'
                }, true);

                if (currColNum == endColNum) {
                    event.resizeable = new Ext.Resizable(eventEl, {
                        handles: 's'
                        , disableTrackOver: true
                        , dynamic: !!event.isRangeAdd
                        , heightIncrement: this.granularityUnitHeights / 2
                        , listeners: {
                            scope: this
                            , resize: this.onEventResize
                            , beforeresize: this.onBeforeEventResize
                        }
                    });
                }
            }
        }
    }

    /**
    * returns events dom
    * @param {Tine.Calendar.Model.Event} event
    * @return {Array} of Ext.Element
    */
    , getEventEls: function(event) {
        if (event.domIds) {
            var domEls = [];
            for (var i = 0; i < event.domIds.length; i++) {
                domEls[i] = Ext.get(event.domIds[i]);
            }
            return domEls;
        }
    }

    /**
    * removes all events from dom
    */
    , removeAllEvents: function() {
        var els = Ext.DomQuery.select('div[class^=cal-daysviewpanel-event]', this.mainWrap.dom);
        for (var i = 0; i < els.length; i++) {
            Ext.fly(els[i]).remove();
        }

        this.ds.each(function(event) {
            event.domIds = [];
        });
    }

    /**
    * removes a evnet from the dom
    * @param {Tine.Calendar.Model.Event} event
    */
    , removeEvent: function(event) {
        if (event == this.activeEvent) {
            this.activeEvent = null;
        }

        var eventEls = this.getEventEls(event);
        if (Ext.isArray(eventEls)) {
            for (var i = 0; i < eventEls.length; i++) {
                if (eventEls[i] && typeof eventEls[i].remove == 'function') {
                    eventEls[i].remove();
                }
            }
            event.domIds = [];
        }
    }

    /**
    * sets currentlcy active event
    * 
    * @param {Tine.Calendar.Event} event
    */
    , setActiveEvent: function(event) {
        if (this.activeEvent) {
            var curEls = this.getEventEls(this.activeEvent);
            for (var i = 0; i < curEls.length; i++) {
                curEls[i].removeClass('cal-daysviewpanel-event-active');
                curEls[i].setStyle({ 'z-index': 100 });
            }
        }

        this.activeEvent = event;
        if (event) {
            var els = this.getEventEls(event);
            for (var i = 0; i < els.length; i++) {
                els[i].addClass('cal-daysviewpanel-event-active');
                els[i].setStyle({ 'z-index': 1000 });
            }
        }
    }

    /**
    * gets currentlcy active event
    * 
    * @return {Tine.Calendar.Event} event
    */
    , getActiveEvent: function() {
        return this.activeEvent;
    }

    // REMOVED BY ECANDiDUS
    //    /**
    //    * creates a new event directly from this view
    //    * @param {} event
    //    */
    //    , createEvent: function(e, event) {

    //        // only add range events if mouse is down long enough
    //        if (this.editing || (event.isRangeAdd && !this.mouseDown)) {
    //            return;
    //        }

    //        // insert event silently into store
    //        this.editing = true;
    //        this.ds.suspendEvents();
    //        this.ds.add(event);


    //        // draw event
    //        var registry = event.get('is_all_day_event') ? this.parallelWholeDayEventsRegistry : this.parallelScrollerEventsRegistry;
    //        registry.register(event);
    //        this.insertEvent(event);
    //        this.setActiveEvent(event);
    //        this.layout();

    //        //var eventEls = this.getEventEls(event);
    //        //eventEls[0].setStyle({'border-style': 'dashed'});
    //        //eventEls[0].setOpacity(0.5);

    //        // start sizing for range adds
    //        if (event.isRangeAdd) {
    //            // don't create events with very small duration
    //            event.resizeable.on('resize', function() {
    //                if (event.get('is_all_day_event')) {
    //                    var keep = true;
    //                } else {
    //                    var keep = (event.get('dtend').getTime() - event.get('dtstart').getTime()) / Date.msMINUTE >= this.timeGranularity;
    //                }

    //                if (keep) {
    //                    this.startEditSummary(event);
    //                } else {
    //                    this.abortCreateEvent(event);
    //                }
    //            }, this);

    //            // fix duration when mouse already has been moved
    //            event.resizeable.onMouseMove = event.resizeable.onMouseMove.createSequence(function(e, target) {
    //                var eventXY = e.getXY();

    //                if (event.get('is_all_day_event')) {

    //                    //this.resizeElement();
    //                } else {
    //                    var height = eventXY[1] - this.proxy.getTop();

    //                    this.proxy.setHeight(height);
    //                    this.resizeElement();
    //                }
    //            }, event.resizeable);

    //            var rzPos = event.get('is_all_day_event') ? 'east' : 'south';

    //            if (Ext.isIE) {
    //                e.browserEvent = { type: 'mousedown' };
    //            }

    //            event.resizeable[rzPos].onMouseDown.call(event.resizeable[rzPos], e);
    //            //event.resizeable.startSizing.defer(2000, event.resizeable, [e, event.resizeable[rzPos]]);
    //        } else {
    //            this.startEditSummary(event);
    //        }
    //    }

    //    , abortCreateEvent: function(event) {
    //        var registry = event.get('is_all_day_event') ? this.parallelWholeDayEventsRegistry : this.parallelScrollerEventsRegistry;

    //        this.ds.suspendEvents();
    //        this.ds.remove(event);
    //        this.ds.resumeEvents();

    //        registry.unregister(event);
    //        this.removeEvent(event);
    //        this.editing = false;
    //    }

    //    , startEditSummary: function(event) {
    //        var eventEls = this.getEventEls(event);

    //        var bodyCls = event.get('is_all_day_event') ? 'cal-daysviewpanel-wholedayevent-body' : 'cal-daysviewpanel-event-body';
    //        new Ext.form.TextField({
    //            event: event
    //            , renderTo: eventEls[0].down('div[class=' + bodyCls + ']')
    //            , width: '90%'
    //            , value: this.newEventSummary
    //            , listeners: {
    //                scope: this
    //                , render: function(field) {
    //                    field.focus(true, 100);
    //                }
    //                , blur: this.endEditSummary
    //                , specialkey: this.endEditSummary
    //            }

    //        });
    //    }

    //    , endEditSummary: function(field, e) {
    //        if (!this.editing) {
    //            return;
    //        }
    //        this.editing = false;

    //        var summary = field.getValue();
    //        var event = field.event;

    //        // abort edit on ESC key
    //        if (!summary || (e && e.getKey() == e.ESC)) {
    //            return this.abortCreateEvent(event);
    //        }

    //        // only commit edit on Enter & blur
    //        if (e && e.getKey() != e.ENTER) {
    //            return;
    //        }

    //        event.set('summary', summary);

    //        this.ds.suspendEvents();
    //        this.ds.remove(event);
    //        this.ds.resumeEvents();

    //        var registry = event.get('is_all_day_event') ? this.parallelWholeDayEventsRegistry : this.parallelScrollerEventsRegistry;
    //        registry.unregister(event);
    //        this.removeEvent(event);

    //        this.ds.add(event);
    //        this.fireEvent('addEvent', event);

    //        //this.ds.resumeEvents();
    //        //this.ds.fireEvent.call(this.ds, 'add', this.ds, [event], this.ds.indexOf(event));
    //    }

    /**
    * @private
    */
    , onDblClick: function(e, target) {
        e.stopEvent();

        var dtStart = this.getTargetDateTime(e);
        if (dtStart) {
            // ADDED BY ECANDIDUS
            this.fireEvent('addEvent', dtStart);
            // REMOVED BY ECANDIDUS
            //            var newId = 'cal-daysviewpanel-new-' + Ext.id();
            //            var event = new Tine.Calendar.Event({
            //                id: newId
            //                , dtstart: dtStart
            //                , dtend: dtStart.add(Date.HOUR, dtStart.is_all_day_event ? 24 : 1).add(Date.SECOND, -1)
            //                , is_all_day_event: dtStart.is_all_day_event
            //            }, newId);

            //            this.createEvent(e, event);
        } else if (target.className == 'cal-daysviewpanel-dayheader-day') {
            var dayHeaders = Ext.DomQuery.select('div[class=cal-daysviewpanel-dayheader-day]', this.innerHd);
            // ADDED BY ECANDIDUS - TEST TO AVOID ERROR
            var dayIndex = dayHeaders.indexOf(target);
            if (dayIndex) {
                var date = this.getBaseDate().add(Date.DAY, dayIndex);
                this.fireEvent('changeView', 'day', date);
            }
        }
    }

    /**
    * @private
    */
    , onMouseDown: function(e, target) {
        this.scroller.focus();
        this.mouseDown = true;

        var dtStart = this.getTargetDateTime(e);
        if (!this.editing && dtStart) {
            var newId = 'cal-daysviewpanel-new-' + Ext.id();
            var event = new Tine.Calendar.Event({
                id: newId
                , dtstart: dtStart
                , dtend: dtStart.is_all_day_event ? dtStart.add(Date.HOUR, 24).add(Date.SECOND, -1) : dtStart.add(Date.MINUTE, this.timeGranularity / 2)
                , is_all_day_event: dtStart.is_all_day_event
            }, newId);
            event.isRangeAdd = true;

            e.stopEvent();
            this.createEvent.defer(400, this, [e, event]);
        }
    }

    /**
    * @private
    */
    , onMouseUp: function() {
        this.mouseDown = false;
    }

    /**
    * @private
    */
    , onBeforeEventResize: function(rz, e) {
        var parts = rz.el.id.split(':');
        var event = this.ds.getById(parts[1]);

        rz.event = event;
        rz.originalHeight = rz.el.getHeight();

        rz.el.setStyle({ 'border-style': 'dashed' });
        rz.el.setOpacity(0.5);

        // rz supresses resize event if element is not resized
        rz.onMouseUp = rz.onMouseUp.createSequence(function() {
            rz.el.setStyle({ 'border-style': 'solid' });
            rz.el.setOpacity(1);
        });

        //rz.onMouseMove = rz.onMouseMove.createSequence(function() {
        //    console.log('move');
        //});

        this.setActiveEvent(event);
    }

    /**
    * @private
    */
    , onEventResize: function(rz, width, height) {
        var event = rz.event;

        var originalDuration = event.duration / Date.msMINUTE;

        if (event.get('is_all_day_event')) {
            // MODIFIED BY ECANDIDUS
            //var dayWidth = Ext.fly(this.wholeDayArea).getWidth() / this.numOfDays;
            var dayWidth = Ext.fly(this.wholeDayArea).getWidth() / this.getNumberOfDays();
            var diff = Math.round((rz.el.getRight() - rz.startPoint[0]) / dayWidth);

            // MODIFIED BY ECANDIDUS
            //event.set('dtend', event.get('dtend').add(Date.DAY, diff).add(Date.SECOND, -1));
            event.set('dtend', event.get('dtend').add(Date.DAY, diff).add(Date.SECOND, -1));
        } else {

            var diff = Math.round((height - rz.originalHeight) * (this.timeGranularity / this.granularityUnitHeights));
            // neglegt diffs due to borders etc.
            diff = diff - diff % 15;

            var duration = originalDuration + diff;

            event.set('dtend', event.get('dtstart').add(Date.MINUTE, duration));
        }

        // don't fire update events on rangeAdd
        if (!event.isRangeAdd) {
            this.fireEvent('updateEvent', event);
        }
    }

    , refresh: function() {
        this.onLoad();
    }

    // REMOVED BY ECANDIDUS
    //    /**
    //    * @private
    //    */
    //    , onDataChange: function() {
    //        //console.log('onDataChange');
    //        this.refresh();
    //    }

    //    /**
    //    * @private
    //    */
    //    , onClear: function() {
    //        //console.log('onClear')
    //        this.refresh();
    //    }

    //    /**
    //    * @private
    //    */
    //    , onUpdate: function(ds, event) {
    //        //console.log('onUpdate');
    //        // relayout original context
    //        var originalRegistry = (event.modified.hasOwnProperty('is_all_day_event') ? event.modified.is_all_day_event : event.get('is_all_day_event')) ?
    //            this.parallelWholeDayEventsRegistry :
    //            this.parallelScrollerEventsRegistry;
    //        var registry = event.get('is_all_day_event') ? this.parallelWholeDayEventsRegistry : this.parallelScrollerEventsRegistry;
    //        var originalDtstart = event.modified.hasOwnProperty('dtstart') ? event.modified.dtstart : event.get('dtstart');
    //        var originalDtend = event.modified.hasOwnProperty('dtend') ? event.modified.dtend : event.get('dtend');



    //        var originalParallels = originalRegistry.getEvents(originalDtstart, originalDtend);
    //        for (var j = 0; j < originalParallels.length; j++) {
    //            this.removeEvent(originalParallels[j]);
    //        }
    //        originalRegistry.unregister(event);

    //        var originalParallels = originalRegistry.getEvents(originalDtstart, originalDtend);
    //        for (var j = 0; j < originalParallels.length; j++) {
    //            this.insertEvent(originalParallels[j]);
    //        }

    //        // relayout actual context
    //        var parallelEvents = registry.getEvents(event.get('dtstart'), event.get('dtend'));
    //        for (var j = 0; j < parallelEvents.length; j++) {
    //            this.removeEvent(parallelEvents[j]);
    //        }

    //        registry.register(event);
    //        var parallelEvents = registry.getEvents(event.get('dtstart'), event.get('dtend'));
    //        for (var j = 0; j < parallelEvents.length; j++) {
    //            this.insertEvent(parallelEvents[j]);
    //        }

    //        event.commit(true);
    //        this.setActiveEvent(this.getActiveEvent());
    //        this.layout();
    //    }

    //    /**
    //    * @private
    //    */
    //    , onAdd: function(ds, records, index) {
    //        //console.log('onAdd');
    //        for (var i = 0; i < records.length; i++) {
    //            var event = records[i];

    //            var registry = event.get('is_all_day_event') ? this.parallelWholeDayEventsRegistry : this.parallelScrollerEventsRegistry;
    //            registry.register(event);

    //            var parallelEvents = registry.getEvents(event.get('dtstart'), event.get('dtend'));

    //            for (var j = 0; j < parallelEvents.length; j++) {
    //                this.removeEvent(parallelEvents[j]);
    //                this.insertEvent(parallelEvents[j]);
    //            }

    //            this.setActiveEvent(event);
    //        }

    //        this.layout();
    //    }

    //    /**
    //    * @private
    //    */
    //    , onRemove: function(ds, event, index, isUpdate) {
    //        if (isUpdate !== true) {
    //            //this.fireEvent("beforeeventremoved", this, index, record);
    //        }
    //        var registry = event.get('is_all_day_event') ? this.parallelWholeDayEventsRegistry : this.parallelScrollerEventsRegistry;
    //        registry.unregister(event);
    //        this.removeEvent(event);

    //        this.layout();
    //    }

    // REMOVED BY ECANDIDUS
    //    /**
    //    * @private
    //    */
    //    , onBeforeLoad: function() {
    //        //this.parallelScrollerEventsRegistry = new Tine.Calendar.ParallelEventsRegistry({dtStart: this.startDate, dtEnd: this.endDate});
    //        //this.parallelWholeDayEventsRegistry = new Tine.Calendar.ParallelEventsRegistry({dtStart: this.startDate, dtEnd: this.endDate});
    //        this.ds.each(this.removeEvent, this);
    //    }

    /**
    * @private
    */
    , onLoad: function() {
        if (!this.rendered) {
            this.dsLoaded = true;
            return;
        }

        // ADDED BY ECANDIDUS
        this.ds.suspendEvents();
        // ADDED BY ECANDIDUS
        this.ds.verifyAsDate('dtstart');
        // ADDED BY ECANDIDUS
        this.ds.verifyAsDate('dtend');
        // ADDED BY ECANDIDUS
        this.ds.resumeEvents();

        // remove all old events from dom
        this.removeAllEvents();

        // setup registry
        // MODIFIED BY ECANDIDUS
        //this.parallelScrollerEventsRegistry = new Tine.Calendar.ParallelEventsRegistry({ dtStart: this.startDate, dtEnd: this.endDate });
        //this.parallelWholeDayEventsRegistry = new Tine.Calendar.ParallelEventsRegistry({ dtStart: this.startDate, dtEnd: this.endDate });
        var dStart = this.getStartDate();
        var dEnd = this.getEndDate();
        this.parallelScrollerEventsRegistry = new Tine.Calendar.ParallelEventsRegistry({ dtStart: dStart, dtEnd: dEnd });
        this.parallelWholeDayEventsRegistry = new Tine.Calendar.ParallelEventsRegistry({ dtStart: dStart, dtEnd: dEnd });

        this.ds.each(function(event) {
            var registry = event.get('is_all_day_event') ? this.parallelWholeDayEventsRegistry : this.parallelScrollerEventsRegistry;
            registry.register(event);
        }, this);

        // put the events in
        this.ds.each(this.insertEvent, this);
        this.scrollToNow();

        this.layout();
    }

    , hex2dec: function(hex) {
        var dec = 0;
        hex = hex.toString();
        var length = hex.length, multiplier, digit;
        for (var i = 0; i < length; i++) {

            multiplier = Math.pow(16, (Math.abs(i - hex.length) - 1));
            digit = parseInt(hex.toString().charAt([i]), 10);
            if (isNaN(digit)) {
                switch (hex.toString().charAt([i]).toUpperCase()) {
                    case 'A': digit = 10; break;
                    case 'B': digit = 11; break;
                    case 'C': digit = 12; break;
                    case 'D': digit = 13; break;
                    case 'E': digit = 14; break;
                    case 'F': digit = 15; break;
                    default: return NaN;
                }
            }
            dec = dec + (multiplier * digit);
        }

        return dec;
    }

    /**
    * get date of a (event) target
    * 
    * @param {Ext.EventObject} e
    * @return {Date}
    */
    , getTargetDateTime: function(e) {
        var target = e.getTarget();
        if (target.id.match(/^ext-gen\d+:\d+/)) {
            var parts = target.id.split(':');

            // MODIFIED BY ECANDIDUS
            //var date = this.startDate.add(Date.DAY, parseInt(parts[1], 10));
            var date = this.getStartDate().add(Date.DAY, parseInt(parts[1], 10));
            date.is_all_day_event = true;

            if (parts[2]) {
                var timePart = this.timeScale.getAt(parts[2]);
                date = date.add(Date.MINUTE, timePart.get('minutes'));
                date.is_all_day_event = false;
            }
            return date;
        }
    }

    /**
    * gets event el of target
    * 
    * @param {dom} target
    * @return {Tine.Calendar.Model.Event}
    */
    , getTargetEvent: function(target) {
        var el = Ext.fly(target);
        if (el.hasClass('cal-daysviewpanel-event') || (el = el.up('[class=cal-daysviewpanel-event]', 5))) {
            var parts = el.dom.id.split(':');

            return this.ds.getById(parts[1]);
        }
    }

    , getTimeOffset: function(date) {
        var d = this.granularityUnitHeights / this.timeGranularity;

        return Math.round(d * (60 * date.getHours() + date.getMinutes()));
    }

    , getTimeHeight: function(dtStart, dtEnd) {
        var d = this.granularityUnitHeights / this.timeGranularity;
        //((dtEnd.getTime() - dtStart.getTime()) / Date.msMinute);
        return Math.round(d * ((dtEnd.getTime() - dtStart.getTime()) / Date.msMINUTE));
    }

    /**
    * fetches elements from our generated dom
    */
    , initElements: function() {
        var E = Ext.Element;

        var el = this.calPanel.body.dom.firstChild;
        var cs = el.childNodes;

        this.el = new E(el);

        this.mainWrap = new E(cs[0]);
        this.mainHd = new E(this.mainWrap.dom.firstChild);

        this.innerHd = this.mainHd.dom.firstChild;

        this.wholeDayArea = this.innerHd.firstChild.childNodes[1];

        this.scroller = new E(this.mainWrap.dom.childNodes[1]);
        this.scroller.setStyle('overflow-x', 'hidden');

        this.mainBody = new E(this.scroller.dom.firstChild);

        this.dayCols = this.mainBody.dom.firstChild.lastChild.childNodes;

        this.focusEl = new E(this.scroller.dom.childNodes[1]);
        this.focusEl.swallowEvent("click", true);
    }

    // THERE IS A PROBLEM HERE!
    , getColumnNumber: function(date) {
        // REMOVED BY ECANDIDUS
        //return Math.floor((date.add(Date.SECOND, 1).getTime() - this.startDate.getTime()) / Date.msDAY);
        // ADDED BY ECANDIDUS
        var ans = -1;
        if (date) {
            ans = Math.floor((date.add(Date.SECOND, 1).getTime() - this.getStartDate().getTime()) / Date.msDAY);
        }
        return ans;
    }

    , getDateColumnEl: function(pos) {
        return this.dayCols[pos];
    }

    , checkWholeDayEls: function() {
        var freeIdxs = [];
        for (var i = 0; i < this.wholeDayArea.childNodes.length - 1; i++) {
            console.log(this.wholeDayArea.childNodes[i]);
            if (this.wholeDayArea.childNodes[i].childNodes.length === 1) {
                freeIdxs.push(i);
            }
        }

        for (var i = 1; i < freeIdxs.length; i++) {
            Ext.fly(this.wholeDayArea.childNodes[freeIdxs[i]]).remove();
        }
    }

    /**
    * layouts the view
    */
    , layout: function() {
        if (!this.mainBody) {
            return; // not rendered
        }

        var g = this.calPanel;
        var c = g.body;
        var csize = c.getSize(true);
        var vw = csize.width;

        this.el.setSize(csize.width, csize.height);

        this.layoutWholeDayHeader();
        var hdHeight = this.mainHd.getHeight();

        var vh = csize.height - (hdHeight);

        this.scroller.setSize(vw, vh);
        this.innerHd.style.width = (vw) + 'px';
    }

    , layoutWholeDayHeader: function() {
        var headerEl = Ext.get(this.wholeDayArea);

        for (var i = 0, bottom = headerEl.getTop(); i < this.wholeDayArea.childNodes.length - 1; i++) {
            bottom = Math.max(parseInt(Ext.get(this.wholeDayArea.childNodes[i]).getBottom(), 10), bottom);
        }

        headerEl.setHeight(bottom - headerEl.getTop() + 10);
    }

    /**
    * returns HTML frament of the day headers
    */
    , getDayHeaders: function() {
        var html = '';
        // ADDED BY ECANDIDUS
        var iNumberOfDays = this.getNumberOfDays();
        // MODIFIED BY ECANDIUDUS
        //var width = 100 / this.numOfDays;
        var width = 100 / iNumberOfDays;

        // MODIFIED BY ECANDIDUS
        //for (var i = 0; i < this.numOfDays; i++) {
        for (var i = 0; i < iNumberOfDays; i++) {
            html += this.templates.dayHeader.applyTemplate({
                // MODIFIED BY ECANDIDUS
                //day: this.startDate.add(Date.DAY, i).format(this.dayFormatString),
                day: this.getStartDate().add(Date.DAY, i).format(this.dayFormatString)
                , height: this.granularityUnitHeights
                , width: width + '%'
                , left: i * width + '%'
            });
        }
        return html;
    }

    /**
    * updates HTML of day headers
    */
    , updateDayHeaders: function() {
        var dayHeaders = Ext.DomQuery.select('div[class=cal-daysviewpanel-dayheader-day]', this.innerHd);

        // ADDED BY ECANDIDUS
        var today = (new Date()).clearTime().getTime();
        for (var i = 0, date, isToDay, headerEl, dayColEl; i < dayHeaders.length; i++) {

            // MODIFIED BY ECANDIDUS
            //date = this.startDate.add(Date.DAY, i);
            date = this.getStartDate().add(Date.DAY, i);
            // MODIFIED BY ECANDIDUS
            //isToDay = date.getTime() == this.toDay.getTime();
            isToDay = date.getTime() == today;

            headerEl = Ext.fly(dayHeaders[i]);

            headerEl.update(date.format(this.dayFormatString));
            headerEl.parent()[(isToDay ? 'add' : 'remove') + 'Class']('cal-daysviewpanel-dayheader-today');
            Ext.fly(this.dayCols[i])[(isToDay ? 'add' : 'remove') + 'Class']('cal-daysviewpanel-body-daycolumn-today');
        }
    }

    /**
    * returns HTML fragment of the whole day cols
    */
    , getWholeDayCols: function() {
        var html = '';
        // ADDED BY ECANDIDUS
        var iNumberOfDays = this.getNumberOfDays();
        // MODIFIED BY ECANDIDUS
        //var width = 100 / this.numOfDays;
        var width = 100 / iNumberOfDays;

        var baseId = Ext.id();
        // MODIFIED BY ECANDIDUS
        //for (var i = 0; i < this.numOfDays; i++) {
        for (var i = 0; i < iNumberOfDays; i++) {
            html += this.templates.wholeDayCol.applyTemplate({
                //day: date.get('dateString'),
                //height: this.granularityUnitHeights,
                id: baseId + ':' + i
                , width: width + '%'
                , left: i * width + '%'
            });
        };

        return html;
    }

    /**
    * gets HTML fragment of the horizontal time rows
    */
    , getTimeRows: function() {
        var html = '';
        this.timeScale.each(function(time) {
            var index = time.get('index');
            html += this.templates.timeRow.applyTemplate({
                cls: index % 2 ? 'cal-daysviewpanel-timeRow-off' : 'cal-daysviewpanel-timeRow-on'
                , height: this.granularityUnitHeights + 'px'
                , top: index * this.granularityUnitHeights + 'px'
                , time: index % 2 ? '' : time.get('time')
            });
        }, this);

        return html;
    }

    /**
    * gets HTML fragment of the day columns
    */
    , getDayColumns: function() {
        var html = '';
        // ADDED BY ECANDIDUS
        var iNumberOfDays = this.getNumberOfDays();
        // MODIFIED BY ECANDIDUS
        //var width = 100 / this.numOfDays;
        var width = 100 / iNumberOfDays;

        // MODIFIED BY ECANDIDUS
        //for (var i = 0; i < this.numOfDays; i++) {
        for (var i = 0; i < iNumberOfDays; i++) {
            html += this.templates.dayColumn.applyTemplate({
                width: width + '%'
                , left: i * width + '%'
                , overRows: this.getOverRows(i)
            });
        }

        return html;
    }

    /**
    * gets HTML fragment of the time over rows
    */
    , getOverRows: function(dayIndex) {
        var html = '';
        var baseId = Ext.id();

        this.timeScale.each(function(time) {
            var index = time.get('index');
            html += this.templates.overRow.applyTemplate({
                id: baseId + ':' + dayIndex + ':' + index
                , cls: 'cal-daysviewpanel-daycolumn-row-' + (index % 2 ? 'off' : 'on')
                , height: this.granularityUnitHeights + 'px'
            });
        }, this);

        return html;
    }

    /**
    * inits all tempaltes of this view
    */
    , initTemplates: function() {
        var ts = this.templates || {};

        ts.master = new Ext.XTemplate(
            '<div class="cal-daysviewpanel" hidefocus="true">',
                '<div class="cal-daysviewpanel-viewport">',
                    '<div class="cal-daysviewpanel-header"><div class="cal-daysviewpanel-header-inner"><div class="cal-daysviewpanel-header-offset">{header}</div></div><div class="x-clear"></div></div>',
                    '<div class="cal-daysviewpanel-scroller"><div class="cal-daysviewpanel-body">{body}</div><a href="#" class="cal-daysviewpanel-focus" tabIndex="-1"></a></div>',
                '</div>',
        //'<div class="cal-daysviewpanel-resize-marker">&#160;</div>',
        //'<div class="cal-daysviewpanel-resize-proxy">&#160;</div>',
            '</div>'
        );

        ts.header = new Ext.XTemplate(
            '<div class="cal-daysviewpanel-daysheader">{daysHeader}</div>' +

            '<div class="cal-daysviewpanel-wholedayheader">' +
                '<div class="cal-daysviewpanel-wholedayheader-daycols">{wholeDayCols}</div>' +
            '</div>'
        );

        ts.dayHeader = new Ext.XTemplate(
            '<div class="cal-daysviewpanel-dayheader" style="height: {height}; width: {width}; left: {left};">' +
                '<div class="cal-daysviewpanel-dayheader-day-wrap">' +
                    '<div class="cal-daysviewpanel-dayheader-day">{day}</div>' +
                '</div>',
            '</div>'
        );

        ts.wholeDayCol = new Ext.XTemplate(
            '<div class="cal-daysviewpanel-body-wholedaycolumn" style="left: {left}; width: {width};">' +
                '<div id="{id}" class="cal-daysviewpanel-body-wholedaycolumn-over">&#160;</div>' +
            '</div>'
        );

        ts.body = new Ext.XTemplate(
            '<div class="cal-daysviewpanel-body-inner">' +
                '{timeRows}' +
                '<div class="cal-daysviewpanel-body-daycolumns">{dayColumns}</div>' +
            '</div>'
        );

        ts.timeRow = new Ext.XTemplate(
            '<div class="{cls}" style="height: {height}; top: {top};">',
                '<div class="cal-daysviewpanel-timeRow-time">{time}</div>',
            '</div>'
        );

        ts.dayColumn = new Ext.XTemplate(
            '<div class="cal-daysviewpanel-body-daycolumn" style="left: {left}; width: {width};">' +
                '<div class="cal-daysviewpanel-body-daycolumn-inner">&#160;</div>' +
                '{overRows}' +
            '</div>'
        );

        ts.overRow = new Ext.XTemplate(
            '<div class="cal-daysviewpanel-daycolumn-row" style="height: {height};">' +
                '<div id="{id}" class="{cls}" >&#160;</div>' +
            '</div>'
        );

        ts.event = new Ext.XTemplate(
            '<div id="{id}" class="cal-daysviewpanel-event {extraCls}" style="width: {width}; height: {height}; left: {left}; top: {top}; z-index: {zIndex}; background-color: {bgColor}; border-color: {color};">' +
                '<div class="cal-daysviewpanel-event-header" style="background-color: {color};">' +
        // MODIFIED BY ECANDiDUS
        //'<div class="cal-daysviewpanel-event-header-inner">{startTime}</div>' +
                    '<div class="cal-daysviewpanel-event-header-inner">{[Ext.util.Format.nl2br(Ext.util.Format.htmlEncode(values.summary))]}</div>' +
                    '<div class="cal-daysviewpanel-event-header-icons"></div>' +
                '</div>' +
        // MODIFIED BY ECANDIDUS
        //'<div class="cal-daysviewpanel-event-body">{[Ext.util.Format.nl2br(Ext.util.Format.htmlEncode(values.summary))]}</div>' +
                '<div class="cal-daysviewpanel-event-body">{[Ext.util.Format.nl2br(Ext.util.Format.htmlEncode(values.note))]}</div>' +
            '</div>'
        );

        ts.wholeDayEvent = new Ext.XTemplate(
            '<div id="{id}" class="cal-daysviewpanel-event {extraCls}" style="width: {width}; height: {height}; left: {left}; top: {top}; z-index: {zIndex}; background-color: {bgColor}; border-color: {color};">' +
                '<div class="cal-daysviewpanel-wholedayevent-body">{[Ext.util.Format.nl2br(Ext.util.Format.htmlEncode(values.summary))]}</div>' +
                '<div class="cal-daysviewpanel-event-icons"></div>' +
            '</div>'
        );

        for (var k in ts) {
            var t = ts[k];
            if (t && typeof t.compile == 'function' && !t.compiled) {
                t.disableFormats = true;
                t.compile();
            }
        }

        this.templates = ts;
    }
});