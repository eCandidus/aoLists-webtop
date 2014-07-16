/* 
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: ParallelEventsRegistry.js 8201 2009-05-25 15:07:12Z c.weiss@metaways.de $
 */

Ext.ns('Tine.Calendar');

/**
 * registry to cope with parallel events
 * 
 * @class Tine.Events.ParallelEventsRegistry
 * @constructor
 */
Tine.Calendar.ParallelEventsRegistry = function(config) {
    Ext.apply(this, config);
    
    this.dtStartTs = this.dtStart.getTime();
    this.dtEndTs = this.dtEnd.getTime();
    this.dt = this.granularity * Date.msMINUTE;
    
    var timeScale = Math.ceil((this.dtEndTs - this.dtStartTs) / this.dt);
    this.map = new Array(timeScale);
}

Tine.Calendar.ParallelEventsRegistry.prototype = {
    /**
    * @cfg {Date} dtStart
    * start of range for this registry
    */
    dtStart: null,
    /**
    * @cfg {Date} dtEnd
    * end of range for this registry 
    */
    dtEnd: null,
    /**
    * @cfg {Number} granularity
    * granularity of this registry in minutes
    */
    granularity: 5,
    /**
    * @cfg {String} dtStartProperty
    */
    dtStartProperty: 'dtstart',
    /**
    * @cfg {String} dtEndProperty
    */
    dtEndProperty: 'dtend',

    /**
    * @private {Array} map
    * hols registry 
    */
    map: null,
    /**
    * @private {Number} dtStartTs
    */
    dtStartTs: null,
    /**
    * @private {Number} dtEndTs
    */
    dtEndTs: null,
    /**
    * @private {Number} dt
    */
    dt: null,

    /**
    * register event
    * @param {Ext.data.Record} event
    * @param {bool} returnAffected
    * @return mixed
    */
    register: function(event, returnAffected) {
    var dtStart = event.get(this.dtStartProperty);
        // TEST ADDED BY ECANDIDUS
        if (Ext.isDate(dtStart)) {
            var dtStartTs = dtStart.getTime();
            var dtEnd = event.get(this.dtEndProperty);
            var dtEndTs = dtEnd.getTime() - 1000;

            // layout helper
            event.duration = dtEndTs - dtStartTs;

            var startIdx = this.tsToIdx(dtStart); // +1;
            var endIdx = this.tsToIdx(dtEndTs); // -1;

            for (var i = Math.max(startIdx, 0); i <= Math.min(endIdx, this.map.length - 1); i++) {
                if (!Ext.isArray(this.map[i])) {
                    this.map[i] = [];
                }

                this.map[i].push(event);
            }

            //console.info('pushed event from startIdx"' + startIdx + '" to endIdx "' + endIdx + '".');
            if (returnAffected) {
                return this.getEvents(dtStart, dtEnd);
            }
        }
    },

    /**
    * unregister event
    * @param {Ext.data.Record} event
    */
    unregister: function(event) {
        for (var i = 0; i < this.map.length; i++) {
            if (Ext.isArray(this.map[i])) {
                this.map[i].remove(event);
            }
        }
    },

    /**
    * returns events of current range sorted by duration
    * 
    * @param  {Date} dtStart
    * @param  {Date} dtEnd
    * @return {Array}
    */
    getEvents: function(dtStart, dtEnd, sortByDtStart) {
        var dtStartTs = dtStart.getTime();
        var dtEndTs = dtEnd.getTime();

        var startIdx = this.tsToIdx(dtStart);
        var endIdx = this.tsToIdx(dtEndTs);
        //console.info('get events from startIdx"' + startIdx + '" to endIdx "' + endIdx + '".'   )

        return this.getEventsFromIdx(startIdx, endIdx, sortByDtStart);
    },

    /**
    * @private
    * @param  {Number} startIdx
    * @param  {Number} endIdx
    * @return {Array}
    */
    getEventsFromIdx: function(startIdx, endIdx, sortByDtStart) {
        var events = [];
        var parallels = 1;
        for (var i = startIdx; i <= endIdx; i++) {
            if (Ext.isArray(this.map[i])) {
                parallels = this.map[i].length > parallels ? this.map[i].length : parallels;
                for (var j = 0; j < this.map[i].length; j++) {
                    if (events.indexOf(this.map[i][j]) === -1) {
                        events.push(this.map[i][j]);
                    }
                }
            }
        }

        // sort by duration and dtstart
        var scope = this;
        events.sort(function(a, b) {
            var d = b.duration - a.duration;
            var s = a.get(scope.dtStartProperty).getTime() - b.get(scope.dtStartProperty).getTime();

            return sortByDtStart ?
                s ? s : d :
                d ? d : s;
        });

        // layout helper
        for (var i = 0; i < events.length; i++) {
            events[i].parallels = parallels;
        }

        return events;
    },

    /**
    * @private
    * @param  {Number} ts
    * @return {Number}
    */
    tsToIdx: function(ts) {
        return Math.floor((ts - this.dtStartTs) / this.dt);
    }
};