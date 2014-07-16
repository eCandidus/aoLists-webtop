/*
 * Tine 2.0
 * 
 * @package     Tine
 * @subpackage  Tinebase
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * @version     $Id: extInit.js 7869 2009-04-24 17:52:34Z c.weiss@metaways.de $
 */

/** -------------------- Extjs Framework Initialisation -------------------- **/

// MODIFIED BY ECANDIDUS
Ext.BLANK_IMAGE_URL = "ext/s.gif";

/**
 * html encode all grid columns per defaut
 */
Ext.grid.ColumnModel.defaultRenderer = Ext.util.Format.htmlEncode;

/**
 * additional date patterns
 * @see{Date}
 */
Date.patterns = {
    ISO8601Long:"Y-m-d H:i:s",
    ISO8601Short:"Y-m-d",
    ISO8601Time:"H:i:s",
    ShortDate: "n/j/Y",
    LongDate: "l, F d, Y",
    FullDateTime: "l, F d, Y g:i:s A",
    MonthDay: "F d",
    ShortTime: "g:i A",
    LongTime: "g:i:s A",
    SortableDateTime: "Y-m-d\\TH:i:s",
    UniversalSortableDateTime: "Y-m-d H:i:sO",
    YearMonth: "F, Y"
};

Ext.util.JSON.encodeDate = function(o){
    var pad = function(n) {
        return n < 10 ? "0" + n : n;
    };
    return '"' + o.getFullYear() + "-" +
        pad(o.getMonth() + 1) + "-" +
        pad(o.getDate()) + " " +
        pad(o.getHours()) + ":" +
        pad(o.getMinutes()) + ":" +
        pad(o.getSeconds()) + '"';
};

/**
 * addidional formats
 */
Ext.util.Format = Ext.apply(Ext.util.Format, {
    euMoney: function(v){
        v.toString().replace(/,/, '.');
        
        v = (Math.round(parseFloat(v)*100))/100;
        
        v = (v == Math.floor(v)) ? v + ".00" : ((v*10 == Math.floor(v*10)) ? v + "0" : v);
        v = String(v);
        var ps = v.split('.');
        var whole = ps[0];
        var sub = ps[1] ? '.'+ ps[1] : '.00';
        var r = /(\d+)(\d{3})/;
        while (r.test(whole)) {
            whole = whole.replace(r, '$1' + '.' + '$2');
        }
        v = whole + sub;
        if(v.charAt(0) == '-'){
            return v.substr(1) + ' -€';
        }  
        return v + " €";
    },
    percentage: function(v){
        if(v === null) {
            return 'none';
        }
        if(!isNaN(v)) {
            return v + " %";                        
        } 
    },
    pad: function(v,l,s){
        if (!s) {
            s = '&nbsp;';
        }
        var plen = l-v.length;
        for (var i=0;i<plen;i++) {
            v += s;
        }
        return v;
   }
});