/*
 * Tine 2.0
 * 
 * @license     New BSD License
 * @author      www.steinarmyhre.com
 * @version     $Id: ButtonLockedToggle.js 2196 2008-04-28 19:45:07Z nelius_weiss $
 *
 */
 
Ext.namespace('Ext.ux');

/**
 * @class Ext.ux.ButtonLockedToggle & Ext.ux.tbButtonLockedToggle
 * @extends Ext.Button
 * @description
 * The normal button, when enableToggle is used and toggleGroup is set correctly, still allows the user
 * to toggle off the toggled button by pressing on it. This class overrides the toggle-method so that
 * the toggled button is impossible to 'untoggle' other than programmatically or as a reaction
 * to any of the other buttons in the group getting toggled on.
 *
 * Toggle is by the way a very strange word when you repeat it enough.
 *
 * @author www.steinarmyhre.com
 * @constructor
 * Identical to Ext.Button and/or Ext.Toolbar.Button except that enableToggle is true by default.
 * @param (Object/Array) config A config object
 */
Ext.ux.ButtonLockedToggle = Ext.extend(Ext.Button,{
    enableToggle: true,

    toggle: function(state){
        if(state === undefined && this.pressed) {
            return;
        }
        state = state === undefined ? !this.pressed : state;
        if(state != this.pressed){
            if(state){
                this.el.addClass("x-btn-pressed");
                this.pressed = true;
                this.fireEvent("toggle", this, true);
            }else{
                this.el.removeClass("x-btn-pressed");
                this.pressed = false;
                this.fireEvent("toggle", this, false);
            }
            if(this.toggleHandler){
                this.toggleHandler.call(this.scope || this, this, state);
            }
        }
    }
});

//Ext.ux.tbButtonLockedToggle = Ext.extend(Ext.Toolbar.Button, Ext.ux.ButtonLockedToggle);
Ext.reg('btnlockedtoggle', Ext.ux.ButtonLockedToggle);
Ext.reg('tbbtnlockedtoggle', Ext.ux.ButtonLockedToggle);
//Ext.reg('tbbtnlockedtoggle', Ext.ux.tbButtonLockedToggle);
