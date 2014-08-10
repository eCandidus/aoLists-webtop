/**
 * @class aoVisualTextField
 * @extends Ext.form.Field
 *
 * @author    Jose Gonzalez
 * @copyright (c) 2014, by Candid.Concepts LC
 * @version   1.0
 *
 * @license aoVisualTextField is licensed under the terms of
 * the Open Source LGPL 3.0 license.  Commercial use is permitted to the extent
 * that the code/component(s) do NOT become part of another Open Source or Commercially
 * licensed development library or toolkit without explicit permission.
 *
 *  Regular Expressions obtained from http://regexlib.com
 *
 * <p>License details: <a href="http://www.gnu.org/licenses/lgpl.html"
 * target="_blank">http://www.gnu.org/licenses/lgpl.html</a></p>
 *
 */
Ext.ux.form.aoVisualTextField = Ext.extend(Ext.ux.form.aoVisualHolder, {
});
Ext.reg('aovstring', Ext.ux.form.aoVisualTextField);

Ext.ux.form.aoVisualDateField = Ext.extend(Ext.ux.form.aoVisualHolder, {
    secondaryConfig: {
        regex: '^((((0[13578])|([13578])|(1[02]))[\/](([1-9])|([0-2][0-9])|(3[01])))|(((0[469])|([469])|(11))[\/](([1-9])|([0-2][0-9])|(30)))|((2|02)[\/](([1-9])|([0-2][0-9]))))[\/]\d{4}$|^\d{4}$'
    }
});
Ext.reg('aovdate', Ext.ux.form.aoVisualDateField);

Ext.ux.form.aoVisualTimeField = Ext.extend(Ext.ux.form.aoVisualHolder, {
    secondaryConfig: {
        regex: '^(([0-1]?[0-9])|([2][0-3])):([0-5]?[0-9])(:([0-5]?[0-9]))?$'
    }
});
Ext.reg('aovtime', Ext.ux.form.aoVisualTimeField);

Ext.ux.form.aoVisualPhoneField = Ext.extend(Ext.ux.form.aoVisualHolder, {
    secondaryConfig: {
        regex: '^(\(?\+?[0-9]*\)?)?[0-9_\- \(\)]*$'
    }
});
Ext.reg('aovphone', Ext.ux.form.aoVisualPhoneField);

Ext.ux.form.aoVisualZIPField = Ext.extend(Ext.ux.form.aoVisualHolder, {
    secondaryConfig: {
        regex: '^\d{5}((-|\s)?\d{4})?$'
    }
});
Ext.reg('aovzip', Ext.ux.form.aoVisualZIPField);

Ext.ux.form.aoVisualIntegerField = Ext.extend(Ext.ux.form.aoVisualHolder, {
    secondaryConfig: {
        regex: '^-?\d*$'
    }
});
Ext.reg('aovint', Ext.ux.form.aoVisualIntegerField);

Ext.ux.form.aoVisualPIntegerField = Ext.extend(Ext.ux.form.aoVisualHolder, {
    secondaryConfig: {
        regex: '^\d*$'
    }
});
Ext.reg('aovpositiveint', Ext.ux.form.aoVisualPIntegerField);

Ext.ux.form.aoVisualFloatField = Ext.extend(Ext.ux.form.aoVisualHolder, {
    secondaryConfig: {
        regex: '^-?\d*(\.\d+)?$'
    }
});
Ext.reg('aovfloat', Ext.ux.form.aoVisualFloatField);

Ext.ux.form.aoVisualUSCurrencyField = Ext.extend(Ext.ux.form.aoVisualHolder, {
    secondaryConfig: {
        regex: '^\-?$?(\d{1,3}(\,\d{3})*|(\d+))(\.\d{2})?$'
    }
});
Ext.reg('aovuscurrency', Ext.ux.form.aoVisualUSCurrencyField);

Ext.ux.form.aoVisualEMailField = Ext.extend(Ext.ux.form.aoVisualHolder, {
    secondaryConfig: {
        regex: '^((?>[a-zA-Z\d!#$%&\'*+\-/=?^_`{|}~]+\x20*|"((?=[\x01-\x7f])[^"\\]|\\[\x01-\x7f])*"\x20*)*(?<angle><))?((?!\.)(?>\.?[a-zA-Z\d!#$%&\'*+\-/=?^_`{|}~]+)+|"((?=[\x01-\x7f])[^"\\]|\\[\x01-\x7f])*")@(((?!-)[a-zA-Z\d\-]+(?<!-)\.)+[a-zA-Z]{2,}|\[(((?(?<!\[)\.)(25[0-5]|2[0-4]\d|[01]?\d?\d)){4}|[a-zA-Z\d\-]*[a-zA-Z\d]:((?=[\x01-\x7f])[^\\\[\]]|\\[\x01-\x7f])+)\])(?(angle)>)$'
    }
});
Ext.reg('aovemail', Ext.ux.form.aoVisualEMailField);