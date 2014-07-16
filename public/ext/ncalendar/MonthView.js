/* 
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: MonthView.js 8218 2009-05-26 09:41:01Z c.weiss@metaways.de $
 */

Ext.ns('Tine.Calendar');

Tine.Calendar.MonthView = function(config){
    Ext.apply(this, config);
    Tine.Calendar.MonthView.superclass.constructor.call(this);
    
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

Ext.extend(Tine.Calendar.MonthView, Ext.util.Observable, {
    // ADDED BY ECANDIDUS
    /**
    * @cfg {Object} commonObject
    * Holds shared data
    */
    commonObject: null
    // REMOVED BY ECANDIDUS
    //    /**
    //    * @cfg {Date} startDate
    //    * start date
    //    */
    //    startDate: new Date().clearTime(),
    /**
    * @cfg {String} newEventSummary
    */
    , newEventSummary: 'New Event'
    /**
    * @cfg {String} calWeekString
    */
    , calWeekString: 'WK'
    /**
    * @cfg String moreString
    */
    , moreString: '{0} more...'
    /**
    * @cfg {Array} monthNames
    * An array of textual month names which can be overriden for localization support (defaults to Date.monthNames)
    */
    , monthNames: Date.monthNames
    /**
    * @cfg {Array} dayNames
    * An array of textual day names which can be overriden for localization support (defaults to Date.dayNames)
    */
    , dayNames: Date.dayNames
    /**
    * @cfg {Number} startDay
    * Day index at which the week should begin, 0-based
    */
    , startDay: Ext.DatePicker.prototype.startDay
    /**
    * @property {Tine.Calendar.Event} activeEvent
    * @private
    */
    , activeEvent: null
    /**
    * @private {Date} toDay
    */
    , toDay: null
    /**
    * @private {Array} dateMesh
    */
    , dateMesh: null
    /**
    * @private {Tine.Calendar.ParallelEventsRegistry} parallelEventsRegistry
    */
    , parallelEventsRegistry: null

    /**
    * @private
    */
    , afterRender: function() {
        this.initElements();
        this.el.on('mousedown', this.onMouseDown, this);
        this.el.on('dblclick', this.onDblClick, this);
        this.el.on('click', this.onClick, this);

        this.initDragZone();
        this.initDropZone();

        // MODIFIED BY ECANDIDUS
        //this.updatePeriod({from: this.startDate});
        this.setBaseDate(this.getBaseDate());

        if (this.dsLoaded) {
            this.onLoad.apply(this);
        }

        this.rendered = true;
    }

    /**
    * @private calculates mesh of dates for month this.startDate is in
    */
    , calcDateMesh: function() {
        var mesh = [];
        // MODIFIED BY ECANDIDUS
        //var d = Date.parseDate(this.startDate.format('Y-m') + '-01 00:00:00', Date.patterns.ISO8601Long);
        var dStart = this.getStartDate();
        var d = Date.parseDate(dStart.format('Y-m') + '-01 00:00:00', Date.patterns.ISO8601Long);
        while (d.getDay() != this.startDay) {
            d = d.add(Date.DAY, -1);
        }

        // MODIFIED BY ECANDIDUS
        //while (d.getMonth() != this.startDate.add(Date.MONTH, 1).getMonth()) {
        var monthEnd = this.getEndDate().getMonth();
        while (d.getMonth() != monthEnd) {
            for (var i = 0; i < 7; i++) {
                mesh.push(d.add(Date.DAY, i).clone());
            }
            d = d.add(Date.DAY, 7);
        }

        this.dateMesh = mesh;
    }

    /**
    * gets currentlcy active event
    * 
    * @return {Tine.Calendar.Event} event
    */
    , getActiveEvent: function() {
        return this.activeEvent;
    }

    /**
    * returns index of dateCell given date is in
    * @param {Date} date
    */
    , getDayCellIndex: function(date) {
        return Math.round((date.clearTime(true).getTime() - this.dateMesh[0].getTime()) / Date.msDAY);
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
    * @private returns a child div in requested position
    * 
    * @param {dom} dayCell
    * @param {Number} pos
    * @return {dom}
    */
    , getEventSlice: function(dayCell, pos) {
        pos = Math.abs(pos);

        for (var i = dayCell.childNodes.length; i <= pos; i++) {
            Ext.DomHelper.insertAfter(dayCell.lastChild, '<div class="cal-monthview-eventslice"/>');
            //console.log('inserted slice: ' + i);
        }

        // make shure cell is empty
        while (dayCell.childNodes[pos].innerHTML) {
            pos++;

            if (pos > dayCell.childNodes.length - 1) {
                Ext.DomHelper.insertAfter(dayCell.lastChild, '<div class="cal-monthview-eventslice"/>');
            }
        }

        return dayCell.childNodes[pos];
    }

    /**
    * returns period of currently displayed month
    * @return {Object}
    */
    , getPeriod: function() {
        return {
            from: this.dateMesh[0]
            , until: this.dateMesh[this.dateMesh.length - 1]
        };
    }

    , getTargetDateTime: function(e) {
        var target = e.getTarget('td.cal-monthview-daycell', 3);

        if (target) {
            var dateIdx = this.dayCells.indexOf(target);
            var date = this.dateMesh[this.dayCells.indexOf(target)];

            // set some default time:
            date.add(Date.HOUR, 10);
            return date;
        }
    }

    , getTargetEvent: function(e) {
        var target = e.getTarget('div.cal-monthview-alldayevent', 10) || e.getTarget('div.cal-monthview-event', 10);

        if (target) {
            var parts = target.id.split(':');
            var event = this.ds.getById(parts[1]);
        }
    }

    /**
    * @private
    * @param {Tine.Calendar.CalendarPanel} calPanel
    */
    , init: function(calPanel) {
        this.calPanel = calPanel;

        // REMOVED BY ECANDIDUS
        //this.initData(calPanel.store);
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
//            //this.ds.un("datachanged", this.onDataChange, this);
//            this.ds.un("add", this.onAdd, this);
//            this.ds.un("remove", this.onRemove, this);
//            this.ds.un("update", this.onUpdate, this);
//            //this.ds.un("clear", this.onClear, this);
            this.ds = null;
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
//            //this.ds.on("datachanged", this.onDataChange, this);
//            this.ds.on("add", this.onAdd, this);
//            this.ds.on("remove", this.onRemove, this);
//            this.ds.on("update", this.onUpdate, this);
//            //this.ds.on("clear", this.onClear, this);
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
    //            //this.ds.un("datachanged", this.onDataChange, this);
    //            this.ds.un("add", this.onAdd, this);
    //            this.ds.un("remove", this.onRemove, this);
    //            this.ds.un("update", this.onUpdate, this);
    //            //this.ds.un("clear", this.onClear, this);
    //        }
    //        if (ds) {
    //            ds.on("beforeload", this.onBeforeLoad, this);
    //            ds.on("load", this.onLoad, this);
    //            // ds.on("datachanged", this.onDataChange, this);
    //            ds.on("add", this.onAdd, this);
    //            ds.on("remove", this.onRemove, this);
    //            ds.on("update", this.onUpdate, this);
    //            //ds.on("clear", this.onClear, this);
    //        }
    //        this.ds = ds;
    //    }

    /**
    * @private
    */
    , initDragZone: function() {
        this.dragZone = new Ext.dd.DragZone(this.el, {
            ddGroup: 'cal-event',
            view: this,
            scroll: false,

            getDragData: function(e) {
                var eventEl = e.getTarget('div.cal-monthview-alldayevent', 10) || e.getTarget('div.cal-monthview-event', 10);
                if (eventEl) {
                    var parts = eventEl.id.split(':');
                    var event = this.view.ds.getById(parts[1]);

                    this.view.setActiveEvent(event);

                    // we need to clone an event with summary in
                    var d = Ext.get(event.domIds[0]).dom.cloneNode(true);

                    var width = Ext.fly(eventEl).getWidth() * event.domIds.length;

                    Ext.fly(d).removeClass(['cal-monthview-alldayevent-cropleft', 'cal-monthview-alldayevent-cropright']);
                    Ext.fly(d).setWidth(width);
                    Ext.fly(d).setOpacity(0.5);
                    d.id = Ext.id();

                    return {
                        scope: this.view,
                        sourceEl: eventEl,
                        event: event,
                        ddel: d
                    }
                }
            },

            getRepairXY: function(e, dd) {
                Ext.fly(this.dragData.sourceEl).setOpacity(1, 1);
                return Ext.fly(this.dragData.sourceEl).getXY();
            }
        });
    }

    , initDropZone: function() {
        this.dd = new Ext.dd.DropZone(this.el.dom, {
            ddGroup: 'cal-event',

            notifyOver: function(dd, e, data) {
                var target = e.getTarget('td.cal-monthview-daycell', 3);
                return target ? 'cal-daysviewpanel-event-drop-ok' : 'cal-daysviewpanel-event-drop-nodrop';
            },

            notifyDrop: function(dd, e, data) {
                var v = data.scope;

                var target = e.getTarget('td.cal-monthview-daycell', 3);
                var targetDate = v.dateMesh[v.dayCells.indexOf(target)];

                if (targetDate) {
                    var event = data.event;

                    var diff = (targetDate.getTime() - event.get('dtstart').clearTime(true).getTime()) / Date.msDAY;
                    var diff = (targetDate.getTime() - dtStart.clearTime(true).getTime()) / Date.msDAY;
                    if (!diff) {
                        return false;
                    }

                    event.beginEdit();
                    event.set('dtstart', event.get('dtstart').add(Date.DAY, diff));
                    event.set('dtend', event.get('dtend').add(Date.DAY, diff));
                    event.endEdit();

                    v.fireEvent('updateEvent', event);
                }

                return !!targetDate;
            }
        });
    }

    /**
    * @private
    */
    , initElements: function() {
        var E = Ext.Element;

        var el = this.calPanel.body.dom.firstChild;
        var cs = el.childNodes;

        this.el = new E(el);

        this.mainHd = new E(this.el.dom.firstChild);
        this.mainBody = new E(this.el.dom.lastChild);

        this.dayCells = Ext.DomQuery.select('td[class=cal-monthview-daycell]', this.mainBody.dom);
    }

    /**
    * inits all tempaltes of this view
    */
    , initTemplates: function() {
        var ts = this.templates || {};

        ts.allDayEvent = new Ext.XTemplate(
            '<div id="{id}" class="cal-monthview-event cal-monthview-alldayevent {extraCls}" style="background-color: {bgColor};">' +
                '<tpl if="values.showInfo">' +
                    '<div class="cal-event-icon {iconCls}">' +
                        '<div class="cal-monthview-alldayevent-summary">{[Ext.util.Format.htmlEncode(values.summary)]}</div>' +
                    '</div>' +
                '</tpl>' +
            '</div>'
        );

        ts.event = new Ext.XTemplate(
            '<div id="{id}" class="cal-monthview-event {extraCls}" style="color: {color};background-color: {bgColor};">' +
                '<div class="cal-event-icon {iconCls}">' +
                    '<div class="cal-monthview-event-summary">{startTime} {[Ext.util.Format.htmlEncode(values.summary)]}</div>' +
                '</div>' +
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

    /**
    * @private
    * @param {Tine.Calendar.Event} event
    */
    , insertEvent: function(event) {
        var dtStart = event.get('dtstart');
        var startCellNumber = this.getDayCellIndex(dtStart);
        var dtEnd = event.get('dtend');
        var endCellNumber = this.getDayCellIndex(dtEnd);

        // skip out of range events
        if (endCellNumber < 0 || startCellNumber >= this.dateMesh.length) {
            return;
        }

        var parallels = this.parallelEventsRegistry.getEvents(dtStart, dtEnd, true);
        var pos = parallels.indexOf(event);

        // save some layout info
        event.is_all_day_event = event.get('is_all_day_event') || startCellNumber != endCellNumber;
        // REMOVED BY ECANDIDUS
        //event.color = '#FD0000';
        // ADDED BY ECANDIDUS
        var color = event.get('color');
        // ADDED BY ECANDIDUS
        if (!color) color = Tine.Calendar.Colors().eventColor;
        // MODIFIED BY ECANDIDUS
        //event.bgColor = '#FF9696';
        event.bgColor = Tine.Calendar.Colors().eventBackgroundColor;
        

        var data = {
            // MODIFIED BY ECANDIDUS
            //startTime: dtStart.format('H:i'),
            startTime: dtStart.format(this.minuteFormat)
            , summary: event.get('summary')
            // MODIFIED BY ECANDIDUS
            //, color: event.color
            , color: '#000000'
            // MODIFIED BY ECANDIDUS
            //, bgColor: event.bgColor
            , bgColor: color
        };

        //registry for dom ids
        event.domIds = [];

        for (var i = Math.max(startCellNumber, 0); i <= endCellNumber; i++) {
            data.id = Ext.id() + '-event:' + event.get('id');
            event.domIds.push(data.id);

            var tmpl = this.templates.event;
            data.extraCls = '';

            if (event.is_all_day_event) {
                tmpl = this.templates.allDayEvent;
                data.color = 'black';

                if (i > startCellNumber) {
                    data.extraCls += ' cal-monthview-alldayevent-cropleft';
                }
                if (i < endCellNumber) {
                    data.extraCls += ' cal-monthview-alldayevent-cropright';
                }

                // show icon on startCell and leftCells
                data.showInfo = i == startCellNumber || i % 7 == 0;
            }

            var posEl = this.getEventSlice(this.dayCells[i].lastChild, pos);
            var eventEl = tmpl.overwrite(posEl, data, true);
        }
    }

    , layout: function() {
        if (!this.mainBody) {
            return; // not rendered
        }

        var g = this.calPanel;
        var c = g.body;
        var csize = c.getSize(true);
        var vw = csize.width;

        //this.el.setSize(csize.width, csize.height);
        var hsize = this.mainHd.getSize(true);

        var hdCels = this.mainHd.dom.firstChild.childNodes;
        Ext.fly(hdCels[0]).setWidth(50);
        for (var i = 1; i < hdCels.length; i++) {
            Ext.get(hdCels[i]).setWidth((vw - 50) / 7);
        }

        var rowHeight = ((csize.height - hsize.height - 2) / (this.dateMesh.length > 35 ? 6 : 5)) - 1;

        var calRows = this.mainBody.dom.childNodes;
        for (var i = 0; i < calRows.length; i++) {
            Ext.get(calRows[i]).setHeight(rowHeight);
        }

        var dhsize = Ext.get(this.dayCells[0].firstChild).getSize();
        this.dayCellsHeight = rowHeight - dhsize.height;

        for (var i = 0; i < this.dayCells.length; i++) {
            Ext.get(this.dayCells[i].lastChild).setSize((vw - 50) / 7, this.dayCellsHeight);
        }

        this.layoutDayCells();
    }

    /**
    * layouts the contents (sets 'more items marker')
    */
    , layoutDayCells: function() {
        for (var i = 0; i < this.dayCells.length; i++) {
            if (this.dayCells[i].lastChild.childNodes.length > 1) {
                this.layoutDayCell(this.dayCells[i], true, true);
            }
        }
    }

    /**
    * layouts a single day cell
    * 
    * @param {dom} cell
    * @param {Bool} hideOverflow
    * @param {Bool} updateHeader
    */
    , layoutDayCell: function(cell, hideOverflow, updateHeader) {
        // clean empty slices
        while (cell.lastChild.childNodes.length > 1 && cell.lastChild.lastChild.innerHTML == '') {
            Ext.fly(cell.lastChild.lastChild).remove();
        }

        for (var j = 0, height = 0, hideCount = 0; j < cell.lastChild.childNodes.length; j++) {
            var eventEl = Ext.get(cell.lastChild.childNodes[j]);
            height += eventEl.getHeight();

            eventEl[height > this.dayCellsHeight && hideOverflow ? 'hide' : 'show']();

            if (height > this.dayCellsHeight && hideOverflow) {
                hideCount++;
            }
        }

        if (updateHeader) {
            cell.firstChild.firstChild.innerHTML = hideCount > 0 ? String.format(this.moreString, hideCount) : '';
        }

        return height;
    }

    /**
    * @private
    */
    , onAdd: function(ds, records, index) {
        for (var i = 0; i < records.length; i++) {
            var event = records[i];
            this.parallelEventsRegistry.register(event);

            var parallelEvents = this.parallelEventsRegistry.getEvents(event.get('dtstart'), event.get('dtend'));

            for (var j = 0; j < parallelEvents.length; j++) {
                this.removeEvent(parallelEvents[j]);
                this.insertEvent(parallelEvents[j]);
            }

            this.setActiveEvent(event);
        }

        this.layoutDayCells();
    }

    // REMOVED BY ECANDIDUS
//    /**
//    * @private
//    */
//    , onBeforeLoad: function() {
//        this.ds.each(this.removeEvent, this);
//    }

    , onClick: function(e, target) {
        /** distinct click from dblClick **/
        var now = new Date().getTime();

        if (now - parseInt(this.lastClickTime, 10) < 300) {
            this.lastClickTime = now;
            //e.stopEvent();
            return;
        }

        if (Math.abs(e.getTime() - now) < 100) {
            this.lastClickTime = now;
            return this.onClick.defer(400, this, [e, target]);
        }
        this.lastClickTime = now;
        /** end distinct click from dblClick **/

        switch (target.className) {
            case 'cal-monthview-dayheader-date':
            case 'cal-monthview-dayheader-more':
                var moreText = target.parentNode.firstChild.innerHTML;
                if (!moreText) {
                    return;
                }

                //e.stopEvent();
                // REMOVED BY ECANDIDUS
                //this.zoomDayCell(target.parentNode.parentNode);
                break;
        }
    }

    , onDblClick: function(e, target) {
        this.lastClickTime = new Date().getTime();

        e.stopEvent();
        switch (target.className) {
            case 'cal-monthview-wkcell':
                var wkIndex = Ext.DomQuery.select('td[class=cal-monthview-wkcell]', this.mainBody.dom).indexOf(target);
                var startDate = this.dateMesh[7 * wkIndex];
                this.fireEvent('changeView', 'week', startDate);
                break;

            case 'cal-monthview-dayheader-date':
            case 'cal-monthview-dayheader-more':
                var dateIndex = this.dayCells.indexOf(target.parentNode.parentNode);
                var date = this.dateMesh[dateIndex];
                this.fireEvent('changeView', 'day', date);
                break;

            case 'cal-monthview-daycell':
                var dateIndex = this.dayCells.indexOf(target);
                var date = this.dateMesh[dateIndex];
                //console.log("Create event at: " + date.format('Y-m-d'));
                break;
        }

        //console.log(Ext.get(target));
    }

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
        this.ds.sort('dtstart', 'ASC');
        // ADDED BY ECANDIDUS
        this.ds.resumeEvents();

        this.removeAllEvents();

        // create parallels registry
        this.parallelEventsRegistry = new Tine.Calendar.ParallelEventsRegistry({
            dtStart: this.dateMesh[0]
            , dtEnd: this.dateMesh[this.dateMesh.length - 1].add(Date.DAY, 1).add(Date.SECOND, -1)
            , granularity: 60 * 24
        });

        // calculate duration and parallels
        this.ds.each(function(event) {
            this.parallelEventsRegistry.register(event);
        }, this);

        this.ds.each(this.insertEvent, this);
        this.layoutDayCells();
    }

    /**
    * @private
    */
    , onMouseDown: function(e, target) {
        this.el.focus();
        // REMOVED BY ECANDIDUS
        //this.unZoom();
    }

//    /**
//    * @private
//    */
//    , onRemove: function(ds, event, index, isUpdate) {
//        this.parallelEventsRegistry.unregister(event);
//        this.removeEvent(event);
//    }

//    /**
//    * @private
//    */
//    , onUpdate: function(ds, event) {
//        // relayout original context
//        var originalDtstart = event.modified.hasOwnProperty('dtstart') ? event.modified.dtstart : event.get('dtstart');
//        var originalDtend = event.modified.hasOwnProperty('dtend') ? event.modified.dtend : event.get('dtend');

//        var originalParallels = this.parallelEventsRegistry.getEvents(originalDtstart, originalDtend);
//        for (var j = 0; j < originalParallels.length; j++) {
//            this.removeEvent(originalParallels[j]);
//        }
//        this.parallelEventsRegistry.unregister(event);

//        var originalParallels = this.parallelEventsRegistry.getEvents(originalDtstart, originalDtend);
//        for (var j = 0; j < originalParallels.length; j++) {
//            this.insertEvent(originalParallels[j]);
//        }


//        // relayout actual context
//        var parallelEvents = this.parallelEventsRegistry.getEvents(event.get('dtstart'), event.get('dtend'));
//        for (var j = 0; j < parallelEvents.length; j++) {
//            this.removeEvent(parallelEvents[j]);
//        }
//        this.parallelEventsRegistry.register(event);

//        var parallelEvents = this.parallelEventsRegistry.getEvents(event.get('dtstart'), event.get('dtend'));
//        for (var j = 0; j < parallelEvents.length; j++) {
//            this.insertEvent(parallelEvents[j]);
//        }

//        event.commit(true);
//        this.setActiveEvent(this.getActiveEvent());
//        this.layoutDayCells();
//    }

    /**
    * removes all events from dom
    */
    , removeAllEvents: function() {
        var els = Ext.DomQuery.filter(Ext.DomQuery.select('div[class^=cal-monthview-event]', this.mainBody.dom), 'div[class=cal-monthview-eventslice]', true);
        for (var i = 0; i < els.length; i++) {
            Ext.fly(els[i]).remove();
        }

        this.ds.each(function(event) {
            event.domIds = [];
        });
        this.layoutDayCells();
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
                if (eventEls[i]) {
                    eventEls[i].remove();
                }
            }
            event.domIds = [];
        }
    }

    , render: function() {
        var m = [
             '<table class="cal-monthview-inner" cellspacing="0"><thead><tr class="cal-monthview-inner-header" height="23px">',
             "<th class='cal-monthview-wkcell-header'><span >", this.calWeekString, "</span></th>"
         ];
        for (var i = 0; i < 7; i++) {
            var d = this.startDay + i;
            if (d > 6) {
                d = d - 7;
            }
            m.push("<th class='cal-monthview-daycell'><span>", this.dayNames[d], "</span></th>");
        }
        m[m.length] = "</tr></thead><tbody><tr><td class='cal-monthview-wkcell'></td>";
        for (var i = 0; i < 42; i++) {
            if (i % 7 == 0 && i != 0) {
                m[m.length] = "</tr><tr><td class='cal-monthview-wkcell'></td>";
            }
            m[m.length] =
                '<td class="cal-monthview-daycell">' +
                    '<div class="cal-monthview-dayheader">' +
                        '<div class="cal-monthview-dayheader-more"></div>' +
                        '<div class="cal-monthview-dayheader-date"></div>' +
                    '</div>' +
                    '<div class="cal-monthview-daybody"><div class="cal-monthview-eventslice" /></div>' +
                '</td>';
        }
        m.push('</tr></tbody></table></td></tr>');

        var el = this.calPanel.body.dom;
        el.className = "cal-monthview";
        el.innerHTML = m.join("");

        //container.dom.insertBefore(el, position);
        //this.calPanel.body
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
                curEls[i].removeClass('cal-monthview-active');
                if (this.activeEvent.is_all_day_event) {
                    curEls[i].setStyle({ 'background-color': this.activeEvent.bgColor });
                    curEls[i].setStyle({ 'color': '#000000' });
                } else {
                    curEls[i].setStyle({ 'background-color': '' });
                    curEls[i].setStyle({ 'color': event.color });
                }
            }
        }

        this.activeEvent = event;
        if (event) {
            var els = this.getEventEls(event);
            for (var i = 0; i < els.length; i++) {
                els[i].addClass('cal-monthview-active');
                if (event.is_all_day_event) {
                    els[i].setStyle({ 'background-color': event.color });
                    els[i].setStyle({ 'color': '#FFFFFF' });
                } else {
                    els[i].setStyle({ 'background-color': event.color });
                    els[i].setStyle({ 'color': '#FFFFFF' });
                }
            }
        }
    }

    // ADDED BY ECANDIDUS
    , getStartDate: function() {
        return this.calPanel.getTopToolbar().getPeriod().from;
    }
    // ADDED DBY ECANDIDUS
    , getEndDate: function() {
        return this.getStartDate().add(Date.MONTH, 1);
    }
    , getBaseDate: function() {
        return this.commonObject.getBaseDate();
    }
    // ADDED BY ECANDIDUS
    , setBaseDate: function(newdate) {
        this.commonObject.setBaseDate(newdate);
        this.calPanel.getTopToolbar().periodPicker.update(newdate);

        this.calcDateMesh();

        // update dates and bg colors
        var dayHeaders = Ext.DomQuery.select('div[class=cal-monthview-dayheader-date]', this.mainBody.dom);
        var todayDate = new Date().clearTime();
        var today = todayDate.getTime();
        var todayMonth = this.getBaseDate().getMonth();
        for (var i = 0; i < this.dateMesh.length; i++) {
            // MODIFIED BY ECANDIDUS
            //this.dayCells[i].style.background = this.dateMesh[i].getMonth() == todayMonth ? '#FFFFFF' : '#F9F9F9';
            this.dayCells[i].style.background = this.dateMesh[i].getMonth() == todayMonth ? Tine.Calendar.Colors().availableDay : Tine.Calendar.Colors().outsideDay;
            if (this.dateMesh[i].getTime() == today) {
                // MODIFIED BY ECANDIDUS
                //this.dayCells[i].style.background = '#EBF3FD';
                this.dayCells[i].style.background = Tine.Calendar.Colors().today;
            }

            dayHeaders[i].innerHTML = this.dateMesh[i].format('j');
        }

        // update weeks
        var wkCells = Ext.DomQuery.select('td[class=cal-monthview-wkcell]', this.mainBody.dom);
        for (var i = 0; i < wkCells.length; i++) {
            if (this.dateMesh.length > i * 7 + 1) {
                // NOTE: '+1' is to ensure we display the ISO8601 based week where weeks always start on monday!
                wkCells[i].innerHTML = this.dateMesh[i * 7 + 1].getWeekOfYear();
                //Ext.fly(wkCells[i]).unselectable(); // this supresses events ;-(
            }
        }

        this.layout();

        this.fireEvent('changePeriod', { at: this.getBaseDate(), from: this.getStartDate(), until: this.getEndDate() });
    }

    // REMOVED BY ECANDIDUS
    //    , updatePeriod: function(period) {
    //        this.toDay = new Date().clearTime();
    //        this.startDate = period.from;
    //        this.calcDateMesh();

    //        // update dates and bg colors
    //        var dayHeaders = Ext.DomQuery.select('div[class=cal-monthview-dayheader-date]', this.mainBody.dom);
    //        for (var i = 0; i < this.dateMesh.length; i++) {
    //            this.dayCells[i].style.background = this.dateMesh[i].getMonth() == this.startDate.getMonth() ? '#FFFFFF' : '#F9F9F9';
    //            if (this.dateMesh[i].getTime() == this.toDay.getTime()) {
    //                this.dayCells[i].style.background = '#EBF3FD';
    //            }

    //            dayHeaders[i].innerHTML = this.dateMesh[i].format('j');
    //        }

    //        // update weeks
    //        var wkCells = Ext.DomQuery.select('td[class=cal-monthview-wkcell]', this.mainBody.dom);
    //        for (var i = 0; i < wkCells.length; i++) {
    //            if (this.dateMesh.length > i * 7 + 1) {
    //                // NOTE: '+1' is to ensure we display the ISO8601 based week where weeks always start on monday!
    //                wkCells[i].innerHTML = this.dateMesh[i * 7 + 1].getWeekOfYear();
    //                //Ext.fly(wkCells[i]).unselectable(); // this supresses events ;-(
    //            }
    //        }

    //        this.layout();
    //        this.fireEvent('changePeriod', period);
    //    }

    // REMOVED BY ECANDIDUS
//    , unZoom: function() {
//        if (this.zoomCell) {
//            // this prevents reopen of cell on header clicks
//            this.lastClickTime = new Date().getTime();

//            var cell = Ext.get(this.zoomCell);
//            var dayBodyEl = cell.last();
//            var height = cell.getHeight() - cell.first().getHeight();
//            dayBodyEl.scrollTo('top');
//            dayBodyEl.removeClass('cal-monthview-daypreviewbox');
//            // REMOVED BY ECANDIDUS
//            //dayBodyEl.setStyle('background-color', cell.getStyle('background-color'));
//            dayBodyEl.setStyle('border-top', 'none');
//            dayBodyEl.setHeight(height);


//            // NOTE: we need both setWidht statements, otherwise safari keeps scroller space
//            for (var i = 0; i < dayBodyEl.dom.childNodes.length; i++) {
//                Ext.get(dayBodyEl.dom.childNodes[i]).setWidth(dayBodyEl.getWidth());
//                Ext.get(dayBodyEl.dom.childNodes[i]).setWidth(dayBodyEl.first().getWidth());
//            }

//            this.layoutDayCell(this.zoomCell, true, true);

//            this.zoomCell = false;
//        }

//    }

    // REMOVED BY ECANDIDUS
//    , zoomDayCell: function(cell) {
//        this.zoomCell = cell;

//        var dayBodyEl = Ext.get(cell.lastChild);
//        var box = dayBodyEl.getBox();
//        // REMOVED BY ECANDIDUS
////        var bgColor = Ext.fly(cell).getStyle('background-color');
////        bgColor == 'transparent' ? '#FFFFFF' : bgColor

//        dayBodyEl.addClass('cal-monthview-daypreviewbox');
//        dayBodyEl.setBox(box);
//        // REMOVED BY ECANDIDUS
////        dayBodyEl.setStyle('background-color', bgColor);
////        dayBodyEl.setStyle('border-top', '1px solid ' + bgColor);

//        var requiredHeight = this.layoutDayCell(cell, false, true) + 10;
//        var availHeight = this.calPanel.el.getBottom() - box.y;
//        dayBodyEl.setHeight(Math.min(requiredHeight, availHeight));
//    }
});
