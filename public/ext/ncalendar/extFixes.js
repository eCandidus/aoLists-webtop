/**
 * IE8 fixes
 */
if (Ext.isIE8) {
    /**
     * fix twin trigger field layout
     */
    Ext.form.TwinTriggerField.prototype.onRender = function(ct, position) {
        Ext.form.TwinTriggerField.superclass.onRender.call(this, ct, position);
        this.el.setTop.defer(10, this.el, ['1px']);
    }
    
    /**
     * fix datepicker width
     */
    Ext.DatePicker.prototype.onRender = Ext.DatePicker.prototype.onRender.createSequence(function(ct, position) {
        var wrap = ct.up('div[class="x-layer x-menu x-menu-plain x-date-menu"]');
        var orgWidth = this.el.getWidth();
        wrap.setWidth.defer(10, wrap, [orgWidth]);
    });
}

/**
 * fix broken ext email validator
 * 
 * @type RegExp
 */
Ext.form.VTypes.email = /^([0-9,a-z,A-Z]+)([.,_,-]([0-9,a-z,A-Z]+))*[@]([0-9,a-z,A-Z]+)([.,_,-]([0-9,a-z,A-Z]+))*[.]([a-z,A-Z]){2,6}$/;

/**
 * fix timezone handling for date picker
 * 
 * The getValue function always returns 00:00:00 as time. So if a form got filled
 * with a date like 2008-10-01T21:00:00 the form returns 2008-10-01T00:00:00 although 
 * the user did not change the fieled.
 * 
 * In a multi timezone context this is fatal! When a user in a certain timezone set
 * a date (just a date and no time information), this means in his timezone the 
 * time range from 2008-10-01T00:00:00 to 2008-10-01T23:59:59. 
 * _BUT_ for an other user sitting in a different timezone it means e.g. the 
 * time range from 2008-10-01T02:00:00 to 2008-10-02T21:59:59.
 * 
 * So on the one hand we need to make shure, that the date picker only returns 
 * changed datetime information when the user did a change. 
 * 
 * @todo On the other hand we
 * need adjust the day +/- one day according to the timeshift. 
 */
/**
 * @private
 */
 Ext.form.DateField.prototype.setValue = function(date){
    // preserv original datetime information
    this.fullDateTime = date;
    Ext.form.DateField.superclass.setValue.call(this, this.formatDate(this.parseDate(date)));
};
/**
 * @private
 */
Ext.form.DateField.prototype.getValue = function(){
    //var value = this.parseDate(Ext.form.DateField.superclass.getValue.call(this));
    
    // return the value that was set (has time information when unchanged in client) 
    // and not just the date part!
    value =  this.fullDateTime;
    return value || "";
};

/**
 * fix interpretation of ISO-8601  formatcode (Date.patterns.ISO8601Long) 
 * 
 * Browsers do not support timezones and also javascripts Date object has no 
 * support for it.  All Date Objects are in _one_ timezone which may ore may 
 * not be the operating systems timezone the browser runs on.
 * 
 * parsing dates in ISO format having the timeshift appended (Date.patterns.ISO8601Long) lead to 
 * correctly converted Date Objects in the browsers timezone. This timezone 
 * conversion changes the the Date Parts and as such, javascipt widget 
 * representing date time information print values of the browsers timezone 
 * and _not_ the values send by the server!
 * 
 * So in a multi timezone envireonment, datetime information in the browser 
 * _must not_ be parsed including the offset. Just the values of the server 
 * side converted datetime information are allowed to be parsed.
 */
Date.parseIso = function(isoString) {
    return Date.parseDate(isoString.replace(/\+\d{2}\d{2}/, ''), 'Y-m-d\\Th:i:s');
};

/**
 * rename window
 */
Ext.Window.prototype.rename = function(newId) {
    // Note PopupWindows are identified by name, whereas Ext.windows
    // get identified by id this should be solved some time ;-)
    this.manager.unregister(this);
    this.id = newId;
    this.manager.register(this);
};

/**
 * utility class used by Button
 * 
 * Fix: http://yui-ext.com/forum/showthread.php?p=142049
 * adds the ButtonToggleMgr.getSelected(toggleGroup, handler, scope) function
 */
Ext.ButtonToggleMgr = function(){
   var groups = {};
   
   function toggleGroup(btn, state){
       if(state){
           var g = groups[btn.toggleGroup];
           for(var i = 0, l = g.length; i < l; i++){
               if(g[i] != btn){
                   g[i].toggle(false);
               }
           }
       }
   }
   
   return {
       register : function(btn){
           if(!btn.toggleGroup){
               return;
           }
           var g = groups[btn.toggleGroup];
           if(!g){
               g = groups[btn.toggleGroup] = [];
           }
           g.push(btn);
           btn.on("toggle", toggleGroup);
       },
       
       unregister : function(btn){
           if(!btn.toggleGroup){
               return;
           }
           var g = groups[btn.toggleGroup];
           if(g){
               g.remove(btn);
               btn.un("toggle", toggleGroup);
           }
       },
       
       getSelected : function(toggleGroup, handler, scope){
           var g = groups[toggleGroup];
           for(var i = 0, l = g.length; i < l; i++){
               if(g[i].pressed === true){
                   if(handler) {
                        handler.call(scope || g[i], g[i]);   
                   }
                   return g[i];
               }
           }
           return;
       }
   };
}();

// ADDED BY ECANDIDUS
Ext.override(Ext.data.Store, {
    verifyAsDate: function(col) {
        this.each(function(row) {
            var value = row.get(col);
            if (!(value instanceof Date)) {
                row.beginEdit();
                row.set(col,  Date.parseDate(value, Date.patterns.ISO8601Long));
                row.endEdit();
            }
        }, this);
    }
});