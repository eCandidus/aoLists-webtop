/**
 * @class aoVisualPanel
 * @class aoVisualTabs
 * @class aoVisualHolder
 * @extends Ext.Panel
 *
 * @author    Jose Gonzalez
 * @copyright (c) 2014, by Candid.Concepts LC
 * @version   1.0
 *
 * @license aoVisualPanel is licensed under the terms of
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
 * Creates new aoVisualPanel
 * @constructor
 * @param {Object} config A config object
 */
Ext.ux.form.aoVisualPanel = Ext.extend(Ext.Panel, {

    layout: 'absolute',

    /**
     * @private
     * creates both fields and installs the necessary event handlers
     */
    initComponent: function () {

        // call parent initComponent
        Ext.ux.form.aoVisualPanel.superclass.initComponent.call(this);

        // Get the definition
        var wkgdef = my.Definitions.get(this);
        // Any?
        if (wkgdef) {
            // Loop through fields
            for (var i = 0; i < wkgdef.fields.length; i++) {
                this.add(my.Definitions.Fields.generate(wkgdef, wkgdef.fields[i]));
            }
        }

        // Click event
        this.addEvents('panelclick');
    },
    /**
     * @private
     * Renders underlying primary and secondary and provides a workaround for side error icon bug
     */
    onRender: function (ct, position) {
        if (!this.isRendered) {
            // render underlying hidden field
            Ext.ux.form.aoVisualPanel.superclass.onRender.call(this, ct, position);

            // Do any indefine thing
            my.Definitions.Fields.handleInDefine(this);

            // we're rendered flag
            this.isRendered = true;

            // Do any indefine thing
            my.Definitions.Fields.handleInDefine(this);

            this.fireEvent("render", this);
        }
    },
    /**
     * @private
     * Sets up the menu to add objects to the panel
     */
    initInDefine: function (panel) {
        // Setup drop target
        var stg = my.Helper.get(this);
        if (!stg.dropTarget) {
            stg.dropTarget = new Ext.dd.DropTarget(this.body, { ddGroup: this.getId() });
            // And link in the fields
            for (var i = 0; i < this.items.items.length; i++) {
                var fld = this.items.items[i];
                if (fld.initInDefine) {
                    fld.initInDefine(fld);
                }
            }
        }

        // Setup add menu
        panel.getEl().on('mouseup', function (e) {
            var loc = my.Functions.getAllXY(this.getEl(), e);
            var menuitems = [];
            menuitems.push({
                text: 'Add Field',
                panel: panel,
                loc: loc,
                handler: function () {
                    this.panel.addDefinition('string', this.loc.relative);
                }
            });
            menuitems.push({
                text: 'Add Tabs',
                panel: panel,
                loc: loc,
                handler: function () {
                    this.panel.addDefinition('tabs', this.loc.relative);
                }
            });
            menuitems.push({
                text: 'Add Group',
                panel: panel,
                loc: loc,
                handler: function () {
                    this.panel.addDefinition('group', this.loc.relative);
                }
            });
            menuitems.push({
                text: 'Add Tabbed Group',
                panel: panel,
                loc: loc,
                handler: function () {
                    this.panel.addDefinition('tabgroup', this.loc.relative);
                }
            });
            var menu = new Ext.menu.Menu({
                renderTo: document.body,
                floating: true,
                items: menuitems
            });
            menu.showAt(loc.absolute);
        }, panel);
    },

    addDefinition: function (type, loc) {
        var def = my.Definitions.Fields.addField(this.local, { type: type, location: { x: loc[0], y: loc[1] } });
        var extdef = my.Definitions.Fields.generate(this.local, def);
        return this.add(extdef);
    }
});
Ext.reg('aovpanel', Ext.ux.form.aoVisualPanel);

/**
 * Creates new aoVisualTabs
 * @constructor
 * @param {Object} config A config object
 */
Ext.ux.form.aoVisualTabs = Ext.extend(Ext.Panel, {

    /**
     * @private
     * creates both fields and installs the necessary event handlers
     */
    initComponent: function () {

        // call parent initComponent
        Ext.ux.form.aoVisualTabs.superclass.initComponent.call(this);
    },
    /**
     * @private
     * Renders underlying primary and secondary and provides a workaround for side error icon bug
     */
    onRender: function (ct, position) {
        if (!this.isRendered) {
            // render underlying hidden field
            Ext.ux.form.aoVisualTabs.superclass.onRender.call(this, ct, position);

            // Do any indefine thing
            my.Definitions.Fields.handleInDefine(this);

            // we're rendered flag
            this.isRendered = true;

            // Do any indefine thing
            my.Definitions.Fields.handleInDefine(this);

            this.fireEvent("render", this);
        }
    }
});
Ext.reg('aovtabs', Ext.ux.form.aoVisualTabs);

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
     * @cfg {Number} separatorWidth Width of separator in pixels (defaults to 0)
     */
    separatorWidth: 0,
    /**
     * @cfg {Number} primaryyWidth Width of primary field in pixels (defaults to 40)
     */
    primaryWidth: 40,
    /**
     * @cfg {function} primaryBase Base for primary field (defaults to label).
     */
    primaryBase: function (src) {
        return new Ext.form.Label(src);
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
     * @cfg {Number} primaryyWidth Width of primary field in pixels (defaults to 40)
     */
    secondaryMinWidth: 25,
    /**
     * @cfg {function} secondaryBase Base for secondary field (defaults to textfield).
     */
    secondaryBase: function (src) {
        return new Ext.form.TextField(src);
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
     * @cfg {Number} tertiaryyWidth Width of tertiary field in pixels (defaults to 8)
     */
    tertiaryWidth: 8,
    /**
     * @cfg {function} tertiaryBase Base for tertiary field (defaults to button).
     */
    tertiaryBase: function (src) {
        return new Ext.Button(src);
    },
    /**
     * @cfg {Object} tertiaryConfig Config for tertiary constructor.
     */
    tertiaryConfig: {},
    /**
     * @cfg {string} tertiaryClickEvent Event for click event (default null for no event).
     */
    tertiaryClickEvent: null,

    /**
     * @private
     * creates both fields and installs the necessary event handlers
     */
    initComponent: function () {

        // Adjust fields
        this.fieldLabel = this.label;

        // call parent initComponent
        Ext.ux.form.aoVisualHolder.superclass.initComponent.call(this);

        // Compute width
        this.setComponentWidth(this.width);

        // create primary
        var primaryXConfig = Ext.apply({
            id: this.id + '-p',
            width: this.primaryWidth,
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

        // create tertiary
        var tertiaryXConfig = Ext.apply({
            id: this.id + '-t',
            width: this.tertiaryWidth,
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
                    fn: this.onTClick
                }
            }
        }, this.tertiaryConfig);
        this.bf = this.tertiaryBase(tertiaryXConfig);
        this.bf.ownerCt = this;

        // relay events
        this.relayEvents(this.df, ['focus', 'specialkey', 'invalid', 'valid']);
        this.relayEvents(this.tf, ['focus', 'specialkey', 'invalid', 'valid']);
        this.relayEvents(this.bf, ['focus', 'specialkey', 'invalid', 'valid']);
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
            this.bf.tabIndex = this.tabIndex;

            // render primary and secondary
            // create bounding table
            var t = Ext.DomHelper.append(ct, {
                tag: 'table',
                style: 'border-collapse:collapse',
                width: this.width,
                children: [{
                    tag: 'tr',
                    children: [{
                        tag: 'td',
                        //style: 'padding-right:' + this.separatorWidth.toString() + 'px',
                        cls: 'ux-primary'
                    }, {
                        tag: 'td',
                        cls: 'ux-secondary'
                    }, {
                        tag: 'td',
                        cls: 'ux-tertiary'
                    }]
                }]
            }, true);
            this.tableEl = t;
            this.wrap = t.wrap({
                cls: 'x-form-field-wrap'
            });
            this.wrap.setStyle('position', 'absolute');
            this.wrap.on("mousedown", this.onMouseDown, this, {
                delay: 10
            });

            // render primary & secondary
            this.df.render(t.child('td.ux-primary'));

            this.tf.render(t.child('td.ux-secondary'));

            if (this.menu) {
                this.bf.render(t.child('td.ux-tertiary'));
            } else {
                this.bf.destroy();
                this.bf = null;
            }

            this.setComponentWidth(this.width);

            // workaround for IE trigger misalignment bug
            if (Ext.isIE && Ext.isStrict) {
                t.select('input').applyStyles({
                    top: 0
                });
            }

            this.on('specialkey', this.onSpecialKey, this);
            this.df.el.swallowEvent(['keydown', 'keypress']);
            this.tf.el.swallowEvent(['keydown', 'keypress']);
            if (this.bf) {
                this.bf.el.swallowEvent(['keydown', 'keypress']);
            }

            // setup name for submit
            this.el.dom.name = this.hiddenName || this.name || this.id;

            // prevent helper fields from being submitted
            this.df.el.dom.removeAttribute("name");
            this.tf.el.dom.removeAttribute("name");
            if (this.bf) {
                this.bf.el.dom.removeAttribute("name");
            }

            // we're rendered flag
            this.isRendered = true;

            // update hidden field
            this.updateValue();

            // Do any indefine thing
            my.Definitions.Fields.handleInDefine(this);

            this.fireEvent("render", this);
        }
    },
    /**
     * @private
     * Sets up the rezie/reposition logic
     */
    initInDefine: function (ctl) {
        // Can we wrap?
        if (this.isRendered) {
            // Get the storage
            var stg = my.Helper.get(ctl);
            // Resize done?
            if (!stg.resizer) {
                stg.resizer = new Ext.Resizable(ctl.wrap.id, {
                    handles: 'e',
                    pinned: false,
                    draggable: true,
                    transparent: true,
                    listeners: {
                        resize: { fn: this.handleResize, scope: this }
                    }
                });
                stg.resizer.dd.vHolder = ctl;
                stg.resizer.dd.addToGroup(ctl.ownerCt.getId());

                stg.resizer.dd.onMouseDown = function (e, ctl) {
                    this.flagClick = true;
                };

                stg.resizer.dd.onMouseUp = function (e, ctl) {
                    if (this.flagClick) {
                        var stg = my.Helper.getLocal(this.vHolder);

                        var typeitems = [];
                        my.Menu.SetChecked(typeitems, { text: 'String', itype: 'string' }, stg.wkgdef.type);
                        my.Menu.SetChecked(typeitems, { text: 'Integer', itype: 'int' }, stg.wkgdef.type);
                        my.Menu.SetChecked(typeitems, { text: 'Positive Integer', itype: 'positiveint' }, stg.wkgdef.type);
                        my.Menu.SetChecked(typeitems, { text: 'Float', itype: 'float' }, stg.wkgdef.type);
                        my.Menu.SetChecked(typeitems, { text: 'Date', itype: 'date' }, stg.wkgdef.type);
                        my.Menu.SetChecked(typeitems, { text: 'Time', itype: 'time' }, stg.wkgdef.type);
                        my.Menu.SetChecked(typeitems, { text: 'Phone', itype: 'phone' }, stg.wkgdef.type);
                        my.Menu.SetChecked(typeitems, { text: 'ZIP Code', itype: 'zip' }, stg.wkgdef.type);
                        my.Menu.SetChecked(typeitems, { text: 'Currency', itype: 'currency' }, stg.wkgdef.type);
                        my.Menu.SetChecked(typeitems, { text: 'E-Mail', itype: 'email' }, stg.wkgdef.type);

                        var menuitems = [];
                        menuitems.push({
                            text: 'Edit Label',
                            source: this,
                            loc: e.xy,
                            handler: function () {
                                var a = 1;
                            }
                        });
                        menuitems.push({
                            text: 'Set Type',
                            source: this,
                            loc: e.xy,
                            handler: function () {
                                var a = 1;
                            },
                            menu: new Ext.menu.Menu({
                                items: typeitems
                            })
                        });
                        var menu = new Ext.menu.Menu({
                            renderTo: document.body,
                            floating: true,
                            items: menuitems
                        });
                        menu.showAt(e.xy);

                        //e.preventDefault();
                        //e.stopPropagation();
                        //e.stopEvent();
                    }
                };

                stg.resizer.dd.onDragDrop = function (e, id) {
                    this.flagClick = false;
                    var deltaX = this.lastPageX - this.startPageX;
                    var deltaY = this.lastPageY - this.startPageY;

                    var stg = my.Helper.getLocal(this.vHolder);
                    stg.wkgdef.location.x += deltaX;
                    stg.wkgdef.location.y += deltaY;

                    this.vHolder.wrap.setLeft(e.xy[0]);
                    this.vHolder.wrap.setTop(e.xy[1]);
                };
            }
        }
    },
    /**
     * @private
     */
    adjustSize: Ext.BoxComponent.prototype.adjustSize,
    handleResize: function (ctl, w) {
        this.setWidth(w + 8);
    },
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
        if (this.bf && this.bf.clearInvalid) {
            this.bf.clearInvalid();
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
        if (this.bf && this.bf.markInvalid) {
            this.bf.markInvalid(msg);
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
            if (this.bf) {
                this.bf.destroy();
            }
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
            if (this.bf) {
                this.bf.onDisable();
            }
        }
        this.disabled = true;
        this.df.disabled = true;
        this.tf.disabled = true;
        if (this.bf) {
            this.bf.disabled = true;
        }
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
            if (this.bf) {
                this.bf.onEnable();
            }
        }
        this.disabled = false;
        this.df.disabled = false;
        this.tf.disabled = false;
        if (this.bf) {
            this.bf.disabled = false;
        }
        this.fireEvent("enable", this);
        return this;
    },
    /**
     * @private Focus date filed
     */
    focus: function () {
        this.tf.focus();
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
        return this.tf.isValid();
    },
    /**
     * Returns true if this component is visible
     * @return {boolean}
     */
    isVisible: function () {
        return this.tf.rendered && this.tf.getActionEl().isVisible();
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
            if (!this.tf.hasFocus) {
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
    onPClick: function (ctl, e) {
        this.onClick(this.primaryClickEvent);
    },
    /**
     * @private Handles secondary click event
     */
    onSClick: function (ctl, e) {
        this.onClick(this.secondaryClickEvent);
    },
    /**
     * @private Handles tertiary click event
     */
    onTClick: function (ctl, e) {
        this.onClick(this.tertiaryClickEvent);
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
    setComponentWidth: function (w) {
        if (w) {

            // Compute width
            this.tertiaryWidth = (this.menu ? 8 : 0);
            this.secondaryWidth = w - (this.primaryWidth + this.tertiaryWidth);
            if (this.secondaryWidth < this.secondaryMinWidth) this.secondaryWidth = this.secondaryMinWidth;

            // Computed width
            this.width = this.primaryWidth + this.secondaryWidth + this.tertiaryWidth;

            if (this.isRendered) {
                // Adjust primary
                if (this.df && this.df.setWidth) {
                    this.df.setWidth(this.primaryWidth);
                    if (Ext.isIE) {
                        this.df.el.up('td').setWidth(this.primaryWidth);
                    }
                }

                // Adjust secondary
                if (this.tf && this.tf.setWidth) {
                    this.tf.setWidth(this.secondaryWidth);
                    if (Ext.isIE) {
                        this.tf.el.up('td').setWidth(this.secondaryWidth);
                    }
                }

                // Adjust tertiary
                if (this.menu) {
                    if (this.bf && this.bf.setWidth) {
                        this.bf.setWidth(this.tertiaryWidth);
                        if (Ext.isIE) {
                            this.bf.el.up('td').setWidth(this.tertiaryWidth);
                        }
                    }
                }

                // Set the wrap
                if (this.wrap) {
                    this.wrap.setWidth(this.width);
                }
            }

            // Definition
            var stg = my.Helper.getLocal(this);
            stg.wkgdef.size.width = this.width;
        }
    },
    setComponentHeight: function (h) {
        if (h) {

            if (this.tf && this.tf.setHeight) {
                this.tf.setHeight(h);
            }

            // Save
            this.height = h;

            // Set the wrap
            if (this.wrap) {
                this.wrap.setHeight(this.height);
            }

            // Definition
            var stg = my.Helper.getLocal(this);
            stg.wkgdef.size.height = this.height;
        }
    },
    /**
     * @private
     * Sets correct sizes of underlying primary and secondary
     * With workarounds for IE bugs
     */
    setSize: function (w, h) {
        this.setComponentHeight(h);
        this.setComponentWidth(w);
    },
    /**
     * Hide or show this component by boolean
     * @return {Ext.Component} this
     */
    setVisible: function (visible) {
        if (visible) {
            this.df.show();
            this.tf.show();
            if (this.bf) {
                this.bf.show();
            }
        } else {
            this.df.hide();
            this.tf.hide();
            if (this.bf) {
                this.bf.hide();
            }
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
     * calls validate methods of secondary
     */
    validate: function () {
        return this.tf.validate();
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
    setPrimary: function (value) {
        this.df.setText(value);
    },
    /**
     * @private Gets the value of primary
     */
    getPrimary: function () {
        return null;
    },
    /** 
     * @private Sets the value of secondary
     */
    setSecondary: function (value) {
        this.tf.setValue(name);
    },
    /** 
     * @private Gets the value of secondary
     */
    getSecondary: function () {
        return this.tf.getValue();
    },
    /**
     * @param {String} val Value to set
     * Sets the value of this field
     */
    setValue: function (val) {
        if (!val) {
            this.setSecondary('');
        } else {
            this.setSecondary(val);
        }
        this.updateValue();
    },
    /**
     * @return {String} Returns value of this field
     */
    getValue: function () {
        return this.getSecondary();
    }    
});
Ext.reg('aoxholder', Ext.ux.form.aoVisualHolder);