/**
 * @class my.Definitions
 * @extends
 *
 * The tools to build/maintain display definitions
 *
 * @author    Jose Gonzalez
 * @copyright (c) 2014, by Candid.Concepts LC
 * @version   1.0
 * @date      <ul>
 * <li>1. June 17, 2014</li>
 * </ul>
 *
 * @license All code is licensed under the terms of
 * the Open Source LGPL 3.0 license.  Commercial use is permitted to the extent
 * that the code/component(s) do NOT become part of another Open Source or Commercially
 * licensed development library or toolkit without explicit permission.
 *
 * <p>License details: <a href="http://www.gnu.org/licenses/lgpl.html"
 * target="_blank">http://www.gnu.org/licenses/lgpl.html</a></p>
 *
 */

my.Definitions.Shared = function() {
    return {
        objds: null,
        objdsdesc: null,

        objid: null,
        objdesc: null,

        wkgobj: null,

        wkgdef: null,
        indefine: null,

        mergeif: null,
        callctl: null
    };
};

my.Definitions.Local = function() {
    return {
        wkgdef: null
    };
};

my.Definitions.get = function (ctl) {
    var def;
    if (ctl) {
        if (ctl.shared) {
            def = ctl.shared.wkgdef;
        } else if (ctl.local) {
            def = ctl.local.wkgdef;
        }
        if (!def && ctl.ownerCt) {
            def = my.Definitions.get(ctl.ownerCt);
        }
    }
    return def;
};

my.Definitions.getParent = function (ctl) {
    var def;
    if (ctl) {
        def = my.Definitions.get(ctl.ownerCt);
    }
    return def;
};

my.Definitions.Form = {
    // Standarize
    standarize: function (def) {
        def = def || {};
        def.size = my.Definitions.Size.standarize(def.size);

        def.fields = my.Definitions.Fields.standarize(def.fields);

        return def;
    }
};

my.Definitions.Field = {
    // Standarize
    standarize: function (def) {
        def = def || {};
        def.aoFld = def.aoFld || 'source';
        def.label = def.label || 'label';
        def.type = def.type || 'string';
        def.size = my.Definitions.Size.standarize(def.size);
        def.location = my.Definitions.Location.standarize(def.location);
        def.fields = my.Definitions.Fields.standarize(def.fields);
        
        return def;
    }
};

my.Definitions.Fields = {
    // Standarize
    standarize: function (def) {
        def = def || [];
        def.forEach(function (flddef) {
            flddef = my.Definitions.Field.standarize(flddef);
        });

        return def;
    },

    addField: function (local, def) {
        // Default
        def = my.Definitions.Field.standarize(def);
        // Save
        local.wkgdef.fields.push(def);

        // And make result
        return def;
    },
    removeField: function (local, index) {
        // Valid index?
        if (index >= 0 && index < local.wkgdef.fields.length) {
            // Bye
            local.wkgdef.fields.splice(index, 1);
        }
    },
    insertField: function (local, pos, def) {
        // Valid index?
        if (index >= 0 && index < local.wkgdef.fields.length) {
            // Default
            def = my.Definitions.Field.standarize(def);
            // Save
            local.wkgdef.fields.splice(index, 0, def);

            // And make result
            return def;
        }
    },

    generate: function (local, def) {
        // The local image
        var local = my.Functions.mergeRecursive(my.Definitions.Local(), {
            wkgdef: def,
            indefine: local.indefine
        });

        //
        var label = def.label;
        if (!label.endsWith(':')) {
            label += ':';
        }

        // Make the ExtJS config
        return {
            xtype: 'aov' + def.type,
            local: local,
            x: def.location.x,
            y: def.location.y,
            height: def.size.height,
            width: def.size.width,
            fieldLabel: label,
            aoFld: def.aoFld,
            primaryConfig: {
                text: label
            }
        };
    },

    handleInDefine: function (ctl) {
        // Get the storage
        var stg = my.Helper.getShared(ctl);
        if (stg && stg.indefine && ctl.initInDefine) {
            ctl.initInDefine(ctl);
        }
    }
};

my.Definitions.Size = {
    // Mins
    min_height: 25,
    min_width: 25,

    // Standarize
    standarize: function (def) {
        //
        def = def || {};
        def.height = def.height || 0;
        def.width = def.width || 0;

        if (def.height < my.Definitions.Size.min_height) {
            def.height = my.Definitions.Size.min_height;
        }

        if (def.width < my.Definitions.Size.min_width) {
            def.width = my.Definitions.Size.min_width;
        }

        //
        return def;
    },
    setHeight: function (def, value) {
        //
        def = my.Definitions.Size.standarize(def);

        if (def.height < my.Definitions.Size.min_height) {
            def.height = my.Definitions.Size.min_height;
        }

        return def;
    },
    setWidth: function (def, value) {
        //
        def = my.Definitions.Size.standarize(def);

        if (def.width < my.Definitions.Size.min_width) {
            def.width = my.Definitions.Size.min_width;
        }

        return def;
    }
};

my.Definitions.Location = {
    // Standarize
    standarize: function (def) {
        //
        def = def || {};
        def.x = def.x || 0;
        def.y = def.y || 0;

        //
        return def;
    }
};