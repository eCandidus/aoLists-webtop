/* 
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: CalendarPanel.js 8208 2009-05-25 18:02:55Z c.weiss@metaways.de $
 */
 
Date.msSECOND = 1000;
Date.msMINUTE = 60 * Date.msSECOND;
Date.msHOUR   = 60 * Date.msMINUTE;
Date.msDAY    = 24 * Date.msHOUR;

Ext.ns('Tine.Calendar');

Tine.Calendar.CalendarPanel = Ext.extend(Ext.Panel, {
    /**
    * @cfg {Tine.Calendar.someView} view
    */
    view: null
    /**
    * @cfg {Ext.data.Store} store
    */
    , store: null
    /**
    * @cfg {Bool} border
    */
    , border: false
    /**
    * @private
    */
    , initComponent: function() {
        Tine.Calendar.CalendarPanel.superclass.initComponent.call(this);

        this.autoScroll = false;
        this.autoWidth = false;

        this.relayEvents(this.view, ['changeView', 'changePeriod', 'addEvent', 'updateEvent']);
    }

    , getView: function() {
        return this.view;
    }

    , getStore: function() {
        return this.getView().getStore();
    }

    , loadStore: function() {
        if (this.getStore()) {
            var co = this.getView().commonObject;
            this.getStore().load({ params: { from: co.getStartDate(), until: co.getEndDate()} });
        }
    }
    , unbindStore: function() {
        this.view.unbindStore();
    }
    , bindStore: function(store) {
        this.view.bindStore(store);
    }

    , setLoading: function(bool) {
        var tbar = this.getTopToolbar();
        if (tbar && tbar.loading) {
            tbar.loading[bool ? 'disable' : 'enable']();
        }
    }

    /**
    * @private
    */
    , onRender: function(ct, position) {
        Tine.Calendar.CalendarPanel.superclass.onRender.apply(this, arguments);

        var c = this.body;
        this.el.addClass('cal-panel');
        this.view.init(this);

        this.view.on('addEvent', this.onAddEvent, this);
        this.view.on('updateEvent', this.onUpdateEvent, this);

        //c.on("mousedown", this.onMouseDown, this);
        //c.on("click", this.onClick, this);
        //c.on("dblclick", this.onDblClick, this);
        c.on("contextmenu", this.onContextMenu, this);
        c.on("keydown", this.onKeyDown, this);

        this.relayEvents(c, ["mousedown", "mouseup", "mouseover", "mouseout", "keypress"]);

        this.view.render();
    }

    /**
    * @private
    */
    , afterRender: function() {
        Tine.Calendar.CalendarPanel.superclass.afterRender.call(this);
        this.view.layout();
        this.view.afterRender();

        this.viewReady = true;
    }

    /**
    * @private
    */
    , onResize: function(ct, position) {
        Tine.Calendar.CalendarPanel.superclass.onResize.apply(this, arguments);
        if (this.viewReady) {
            this.view.layout();
        }
    }

    /**
    * @private
    */
    , processEvent: function(name, e) {
        this.fireEvent(name, e);
        var v = this.view;

        var date = v.getTargetDateTime(e);
        if (!date) {
            // fetch event id;
            var event = v.getTargetEvent(e);
        }

        if (name == 'click') {
            if (event) {
                this.view.setActiveEvent(event);
            }
        }
    }

    /**
    * @private
    */
    , onAddEvent: function(event) {
        // TBD
    }

    /**
    * @private
    */
    , onUpdateEvent: function(event) {
        this.loadStore();
    }

    /**
    * @private
    */
    , onClick: function(e) {
        this.processEvent("click", e);
    }

    /**
    * @private
    */
    , onMouseDown: function(e) {
        this.processEvent("mousedown", e);
    }

    /**
    * @private
    */
    , onContextMenu: function(e, t) {
        this.processEvent("contextmenu", e);
    }

    /**
    * @private
    */
    , onDblClick: function(e) {
        this.processEvent("dblclick", e);
    }

    /**
    * @private
    */
   , onKeyDown: function(e) {
       this.fireEvent("keydown", e);
   }

});