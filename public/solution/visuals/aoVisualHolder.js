/**
 * @class aoVisualHolder
 * @extends Ext.form.Field
 *
 * Creates a binary control
 *
 * @author    Slocum at Ext - Modified byJose Gonzalez
 * @copyright (c) 2014, by Candid.Concepts LC
 * @version   1.0
 *
 * @license myDualControl is licensed under the terms of
 * the Open Source LGPL 3.0 license.  Commercial use is permitted to the extent
 * that the code/component(s) do NOT become part of another Open Source or Commercially
 * licensed development library or toolkit without explicit permission.
 *
 * <p>License details: <a href="http://www.gnu.org/licenses/lgpl.html"
 * target="_blank">http://www.gnu.org/licenses/lgpl.html</a></p>
 *
 */
Ext.ns('Ext.ux.form');

/**
 * Creates new aoVisualHolder
 * @constructor
 * @param {Object} config A config object
 */
Ext.ux.form.aoVisualHolder = Ext.extend(Ext.form.Field, {

    /**
     * @cfg {String/Object} defaultAutoCreate DomHelper element spec
     * Let superclass to create hidden field instead of textbox. Hidden will be submittend to server
     */
    defaultAutoCreate: {
        tag: 'input',
        type: 'hidden'
    },
    /**
     * @cfg {Number} secondaryWidth Width of secondary field in pixels (defaults to 8)
     */
    secondaryWidth: 4,
    /**
     * @cfg {Number} separatorWidth Width of separator in pixels (defaults to 0)
     */
    separatorWidth: 0,
    /**
     * @cfg {function} primaryBase Base for primary field (defaults to textfield).
     */
    primaryBase: function (src) {
        return new Ext.form.TextField(src);
    },
    /**
     * @cfg {Object} primaryConfig Config for primary constructor.
     */
    primaryConfig: {},
    /**
     * @cfg {string} primaryClickEvent Event for click event (default null for no event).
     */
    primaryClickEvent: null,
    /**
     * @cfg {function} secondaryBase Base for secondary field (defaults to button).
     */
    secondaryBase: function (src) {
        return new Ext.Button(src);
    },
    /**
     * @cfg {Object} secondaryConfig Config for secondary constructor.
     */
    secondaryConfig: {},
    /**
     * @cfg {string} secondaryClickEvent Event for click event (default null for no event).
     */
    secondaryClickEvent: null,

    /**
     * @private
     * creates both fields and installs the necessary event handlers
     */
    initComponent: function () {
        // call parent initComponent
        Ext.ux.form.aoVisualHolder.superclass.initComponent.call(this);

        // create primary
        var primaryXConfig = Ext.apply({
            id: this.id + '-p',
            width: this.Width - this.secondaryWidth,
            selectOnFocus: this.selectOnFocus,
            readOnly: this.readOnly,
            listeners: {
                blur: {
                    scope: this,
                    fn: this.onBlur
                },
                focus: {
                    scope: this,
                    fn: this.onFocus
                },
                click: {
                    scope: this,
                    fn: this.onPClick
                }
            }
        }, this.primaryConfig);
        this.df = this.primaryBase(primaryXConfig);
        this.df.ownerCt = this;

        // create secondary
        var secondaryXConfig = Ext.apply({
            id: this.id + '-s',
            width: this.secondaryWidth,
            selectOnFocus: this.selectOnFocus,
            readOnly: this.readOnly,
            listeners: {
                blur: {
                    scope: this,
                    fn: this.onBlur
                },
                focus: {
                    scope: this,
                    fn: this.onFocus
                },
                click: {
                    scope: this,
                    fn: this.onSClick
                }
            }
        }, this.secondaryConfig);
        this.tf = this.secondaryBase(secondaryXConfig);
        this.tf.ownerCt = this;

        // relay events
        this.relayEvents(this.df, ['focus', 'specialkey', 'invalid', 'valid']);
        this.relayEvents(this.tf, ['focus', 'specialkey', 'invalid', 'valid']);

    },
    /**
     * @private
     * Renders underlying primary and secondary and provides a workaround for side error icon bug
     */
    onRender: function (ct, position) {
        if (!this.isRendered) {
            // render underlying hidden field
            Ext.ux.form.aoVisualHolder.superclass.onRender.call(this, ct, position);

            this.df.tabIndex = this.tabIndex;
            this.tf.tabIndex = this.tabIndex;

            // render primary and secondary
            // create bounding table
            var t = Ext.DomHelper.append(ct, {
                tag: 'table',
                style: 'border-collapse:collapse',
                children: [{
                    tag: 'tr',
                    children: [{
                        tag: 'td',
                        style: 'padding-right:' + this.separatorWidth.toString() + 'px',
                        cls: 'ux-primary'
                    }, {
                        tag: 'td',
                        cls: 'ux-secondary'
                    }]
                }]
            }, true);
            this.tableEl = t;
            this.wrap = t.wrap({
                cls: 'x-form-field-wrap'
            });
            //        this.wrap = t.wrap();
            this.wrap.on("mousedown", this.onMouseDown, this, {
                delay: 10
            });

            // render primary & secondary
            this.df.render(t.child('td.ux-primary'));
            this.tf.render(t.child('td.ux-secondary'));

            // workaround for IE trigger misalignment bug
            if (Ext.isIE && Ext.isStrict) {
                t.select('input').applyStyles({
                    top: 0
                });
            }

            this.on('specialkey', this.onSpecialKey, this);
            this.df.el.swallowEvent(['keydown', 'keypress']);
            this.tf.el.swallowEvent(['keydown', 'keypress']);

            // setup name for submit
            this.el.dom.name = this.hiddenName || this.name || this.id;

            // prevent helper fields from being submitted
            this.df.el.dom.removeAttribute("name");
            this.tf.el.dom.removeAttribute("name");

            // we're rendered flag
            this.isRendered = true;

            // update hidden field
            this.updateValue();

            this.fireEvent("render", this);
        }
    },
    /**
     * @private
     */
    adjustSize: Ext.BoxComponent.prototype.adjustSize,
    /**
     * @private
     */
    alignErrorIcon: function () {
        this.errorIcon.alignTo(this.tableEl, 'tl-tr', [2, 0]);
    },
    /**
     * Calls clearInvalid on the primary and secondary
     */
    clearInvalid: function () {
        if (this.df.clearInvalid) {
            this.df.clearInvalid();
        }
        if (this.tf.clearInvalid) {
            this.tf.clearInvalid();
        }
    },
    /**
     * Calls markInvalid on both primary and secondary
     * @param {String} msg Invalid message to display
     */
    markInvalid: function (msg) {
        if (this.df.markInvalid) {
            this.df.markInvalid(msg);
        }
        if (this.tf.markInvalid) {
            this.tf.markInvalid(msg);
        }
    },
    /**
     * @private
     * called from Component::destroy.
     * Destroys all elements and removes all listeners we've created.
     */
    beforeDestroy: function () {
        if (this.isRendered) {
            //            this.removeAllListeners();
            this.wrap.removeAllListeners();
            this.wrap.remove();
            this.tableEl.remove();
            this.df.destroy();
            this.tf.destroy();
        }
    },
    /**
     * Disable this component.
     * @return {Ext.Component} this
     */
    disable: function () {
        if (this.isRendered) {
            this.df.disabled = this.disabled;
            this.df.onDisable();
            this.tf.onDisable();
        }
        this.disabled = true;
        this.df.disabled = true;
        this.tf.disabled = true;
        this.fireEvent("disable", this);
        return this;
    },
    /**
     * Enable this component.
     * @return {Ext.Component} this
     */
    enable: function () {
        if (this.rendered) {
            this.df.onEnable();
            this.tf.onEnable();
        }
        this.disabled = false;
        this.df.disabled = false;
        this.tf.disabled = false;
        this.fireEvent("enable", this);
        return this;
    },
    /**
     * @private Focus date filed
     */
    focus: function () {
        this.df.focus();
    },
    /**
     * @private
     */
    getPositionEl: function () {
        return this.wrap;
    },
    // }}}
    // {{{
    /**
     * @private
     */
    getResizeEl: function () {
        return this.wrap;
    },
    /**
     * @return {Boolean} true = valid, false = invalid
     * @private Calls isValid methods of underlying primary and secondary and returns the result
     */
    isValid: function () {
        return this.df.isValid() && this.tf.isValid();
    },
    /**
     * Returns true if this component is visible
     * @return {boolean}
     */
    isVisible: function () {
        return this.df.rendered && this.df.getActionEl().isVisible();
    },
    /** 
     * @private Handles blur event
     */
    onBlur: function (f) {
        // called by both primary and secondary blur events

        // revert focus to previous field if clicked in between
        if (this.wrapClick) {
            f.focus();
            this.wrapClick = false;
        }

        this.updateValue();

        // fire events later
        (function () {
            if (!this.df.hasFocus && !this.tf.hasFocus) {
                var v = this.getValue();
                if (String(v) !== String(this.startValue)) {
                    if (this.rmtID) {
                        this.rmtID = null;
                    }
                    if (!this.handleChange || !this.handleChange()) {
                        this.fireEvent("change", this, v, this.startValue);
                    }
                }
                this.hasFocus = false;
                this.fireEvent('blur', this);
            }
        }).defer(200, this);

    },
    /**
     * @private Handles focus event
     */
    onFocus: function () {
        if (!this.hasFocus) {
            this.hasFocus = true;
            this.startValue = this.getValue();
            this.fireEvent("focus", this);
        }
    },
    /**
     * @private Handles generic click event
     */
    onClick: function (evt) {},
    /**
     * @private Handles primary click event
     */
    onPClick: function () {
        this.onClick(this.primaryClickEvent);
    },
    /**
     * @private Handles secondary click event
     */
    onSClick: function () {
        if (!this.secondaryClickEvent) {
            var custom = new Ext.Resizable(this.getEl().id, {
                wrap: true,
                pinned: true,
                handles: 'all',
                draggable: true,
                dynamic: true
            });
            var customEl = custom.getEl();
            // move to the body to prevent overlap on my blog
            document.body.insertBefore(customEl.dom, document.body.firstChild);

            customEl.on('dblclick', function () {
                customEl.hide(true);
            });
        } else {
            this.onClick(this.secondaryClickEvent);
        }
    },
    /**
     * @private Just to prevent blur event when clicked in the middle of fields
     */
    onMouseDown: function (e) {
        if (!this.disabled) {
            this.wrapClick = 'td' === e.target.nodeName.toLowerCase();
        }
    },
    /**
     * @private
     * Handles Tab and Shift-Tab events
     */
    onSpecialKey: function (t, e) {
        var key = e.getKey();
        if (key === e.TAB) {
            if (t === this.df && !e.shiftKey) {
                e.stopEvent();
                this.tf.focus();
            }
            if (t === this.tf && e.shiftKey) {
                e.stopEvent();
                this.df.focus();
            }
        }
        // otherwise it misbehaves in editor grid
        if (key === e.ENTER) {
            this.updateValue();
        }
    },
    /**
     * @private
     * Sets correct sizes of underlying primary and secondary
     * With workarounds for IE bugs
     */
    setSize: function (w, h) {
        if (w) {
            if (this.df.setSize) {
                this.df.setSize(w - this.secondaryWidth - this.separatorWidth, h);
            }
            if (this.tf.setSize) {
                this.tf.setSize(this.secondaryWidth, h);
            }

            if (Ext.isIE) {
                this.df.el.up('td').setWidth(w - this.secondaryWidth - this.separatorWidth);
                this.tf.el.up('td').setWidth(this.secondaryWidth);
            }
        }
    },
    /**
     * Hide or show this component by boolean
     * @return {Ext.Component} this
     */
    setVisible: function (visible) {
        if (visible) {
            this.df.show();
            this.tf.show();
        } else {
            this.df.hide();
            this.tf.hide();
        }
        return this;
    },
    show: function () {
        return this.setVisible(true);
    },
    hide: function () {
        return this.setVisible(false);
    },
    /**
     * @private Updates all of Date, Time and Hidden
     */
    updateValue: function () {
        if (this.isRendered) {
            this.el.dom.value = this.getValue();
        }
        this.value = this.getValue();
    },
    /**
     * @return {Boolean} true = valid, false = invalid
     * calls validate methods of primary and secondary
     */
    validate: function () {
        return this.df.validate() && this.tf.validate();
    },
    /**
     * Returns renderer suitable to render this field
     * @param {Object} Column model config
     */
    renderer: function (field) {
        var renderer = function (val) {
            return val;
        };
        return renderer;
    },
    /**
     * @private Sets the value of primary
     */
    setPrimary: function (name) {
        this.df.setValue(name);
    },
    /**
     * @private Gets the value of primary
     */
    getPrimary: function () {
        return this.df.getValue();
    },
    /** 
     * @private Sets the value of secondary
     */
    setSecondary: function (yn) {
    },
    /** 
     * @private Gets the value of secondary
     */
    getSecondary: function (yn) {
        return false;
    },
    /**
     * @param {String} val Value to set
     * Sets the value of this field
     */
    setValue: function (val) {
        if (!val) {
            this.setPrimary('');
            this.setSecondary(false);
        } else {
            this.setPrimary(val);
            this.setSecondary(false);
        }
        this.updateValue();
    },
    /**
     * @return {String} Returns value of this field
     */
    getValue: function () {
        return this.getPrimary();
    }
});
Ext.reg('visualholder', Ext.ux.form.aoVisualHolder);