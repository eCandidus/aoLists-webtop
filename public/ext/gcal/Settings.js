/**
 * Copyright Intermesh
 * 
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 * 
 * If you have questions write an e-mail to info@intermesh.nl
 * 
 * @version $Id: RegionalSettingsPanel.js 2079 2008-06-10 15:04:01Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */

Ext.ux.go.calendar.SettingsPanel = function(config) {
	if (!config) {
		config = {};
	}

	var reminderValues = [['0', Ext.ux.go.calendar.lang.noReminder]];

	for (var i = 1; i < 60; i++) {
		reminderValues.push([i, i]);
	}

	this.reminderValue = new Ext.form.ComboBox({
				fieldLabel : Ext.ux.go.calendar.lang.reminder,
				hiddenName : 'reminder_value',
				triggerAction : 'all',
				editable : false,
				selectOnFocus : true,
				width : 148,
				forceSelection : true,
				mode : 'local',
				value : '0',
				valueField : 'value',
				displayField : 'text',
				store : new Ext.data.SimpleStore({
							fields : ['value', 'text'],
							data : reminderValues
						})
			});

	this.reminderMultiplier = new Ext.form.ComboBox({
				hiddenName : 'reminder_multiplier',
				triggerAction : 'all',
				editable : false,
				selectOnFocus : true,
				width : 148,
				forceSelection : true,
				mode : 'local',
				value : '60',
				valueField : 'value',
				displayField : 'text',
				store : new Ext.data.SimpleStore({
							fields : ['value', 'text'],
							data : [['60', Ext.ux.go.lang.strMinutes],
									['3600', Ext.ux.go.lang.strHours],
									['86400', Ext.ux.go.lang.strDays]

							]
						}),
				hideLabel : true,
				labelSeperator : ''
			});

	config.autoScroll = true;
	config.border = false;
	config.hideLabel = true;
	config.title = Ext.ux.go.calendar.lang.calendar;
	config.hideMode = 'offsets';
	config.layout = 'form';
	config.labelWidth=140;
	config.bodyStyle = 'padding:5px';
	config.items = {
		xtype : 'fieldset',
		autoHeight : true,
		layout : 'form',
		title : Ext.ux.go.calendar.lang.eventDefaults,
		items : [{
					border : false,
					layout : 'table',
					defaults : {
						border : false,
						layout : 'form',
						bodyStyle : 'padding-right:3px'
					},
					items : [{
								items : this.reminderValue
							}, {
								items : this.reminderMultiplier
							}]
				}, this.colorField = new Ext.ux.go.form.ColorField({
							fieldLabel : Ext.ux.go.lang.color,
							value : 'EBF1E2',
							name : 'background',
							colors : [
									'EBF1E2',
									'95C5D3',
									'FFFF99',
									'A68340',
									'82BA80',
									'F0AE67',
									'66FF99',
									'CC0099',
									'CC99FF',
									'996600',
									'999900',
									'FF0000',
									'FF6600',
									'FFFF00',
									'FF9966',
									'FF9900',
									/* Line 1 */
									'FB0467',
									'D52A6F',
									'CC3370',
									'C43B72',
									'BB4474',
									'B34D75',
									'AA5577',
									'A25E79',
									/* Line 2 */
									'FF00CC',
									'D52AB3',
									'CC33AD',
									'C43BA8',
									'BB44A3',
									'B34D9E',
									'AA5599',
									'A25E94',
									/* Line 3 */
									'CC00FF',
									'B32AD5',
									'AD33CC',
									'A83BC4',
									'A344BB',
									'9E4DB3',
									'9955AA',
									'945EA2',
									/* Line 4 */
									'6704FB',
									'6E26D9',
									'7033CC',
									'723BC4',
									'7444BB',
									'754DB3',
									'7755AA',
									'795EA2',
									/* Line 5 */
									'0404FB',
									'2626D9',
									'3333CC',
									'3B3BC4',
									'4444BB',
									'4D4DB3',
									'5555AA',
									'5E5EA2',
									/* Line 6 */
									'0066FF',
									'2A6ED5',
									'3370CC',
									'3B72C4',
									'4474BB',
									'4D75B3',
									'5577AA',
									'5E79A2',
									/* Line 7 */
									'00CCFF',
									'2AB2D5',
									'33ADCC',
									'3BA8C4',
									'44A3BB',
									'4D9EB3',
									'5599AA',
									'5E94A2',
									/* Line 8 */
									'00FFCC',
									'2AD5B2',
									'33CCAD',
									'3BC4A8',
									'44BBA3',
									'4DB39E',
									'55AA99',
									'5EA294',
									/* Line 9 */
									'00FF66',
									'2AD56F',
									'33CC70',
									'3BC472',
									'44BB74',
									'4DB375',
									'55AA77',
									'5EA279',
									/* Line 10 */
									'00FF00', '2AD52A',
									'33CC33',
									'3BC43B',
									'44BB44',
									'4DB34D',
									'55AA55',
									'5EA25E',
									/* Line 11 */
									'66FF00', '6ED52A', '70CC33',
									'72C43B',
									'74BB44',
									'75B34D',
									'77AA55',
									'79A25E',
									/* Line 12 */
									'CCFF00', 'B2D52A', 'ADCC33', 'A8C43B',
									'A3BB44',
									'9EB34D',
									'99AA55',
									'94A25E',
									/* Line 13 */
									'FFCC00', 'D5B32A', 'CCAD33', 'C4A83B',
									'BBA344', 'B39E4D',
									'AA9955',
									'A2945E',
									/* Line 14 */
									'FF6600', 'D56F2A', 'CC7033', 'C4723B',
									'BB7444', 'B3754D', 'AA7755',
									'A2795E',
									/* Line 15 */
									'FB0404', 'D52A2A', 'CC3333', 'C43B3B',
									'BB4444', 'B34D4D', 'AA5555', 'A25E5E',
									/* Line 16 */
									'FFFFFF', '949494', '808080', '6B6B6B',
									'545454', '404040', '292929', '000000']
						}),	
						this.selectCalendar = new Ext.ux.go.form.ComboBox({
							fieldLabel : Ext.ux.go.calendar.lang.default_calendar,
							hiddenName : 'default_calendar_id',
							anchor : '-20',
							emptyText : Ext.ux.go.lang.strPleaseSelect,
							store : new Ext.ux.go.data.JsonStore({
								url : Ext.ux.go.settings.modules.calendar.url + 'json.php',
								baseParams : {
									task : 'writable_calendars'
								},
								root : 'results',
								id : 'id',
								totalProperty : 'total',
								fields : ['id', 'name'],
								remoteSort : true
							}),
							pageSize : parseInt(Ext.ux.go.settings.max_rows_list),
							valueField : 'id',
							displayField : 'name',
							typeAhead : true,
							mode : 'remote',
							triggerAction : 'all',
							editable : false,
							selectOnFocus : true,
							forceSelection : true,
							allowBlank : false
						})					
					]
	};

	Ext.ux.go.calendar.SettingsPanel.superclass.constructor.call(this, config);
};

Ext.extend(Ext.ux.go.calendar.SettingsPanel, Ext.Panel, {
	onLoadSettings : function(action) {
		this.selectCalendar.setRemoteText(action.result.data.default_calendar_name);
	},

	onSaveSettings : function() {
		Ext.ux.go.calendar.eventDialog.reminderValue.originalValue = this.reminderValue
				.getValue();
		Ext.ux.go.calendar.eventDialog.reminderMultiplier.originalValue = this.reminderMultiplier
				.getValue();
		Ext.ux.go.calendar.eventDialog.colorField.originalValue = this.colorField
				.getValue();
	}

});

Ext.ux.go.mainLayout.onReady(function() {
			Ext.ux.go.moduleManager.addSettingsPanel('calendar',
					Ext.ux.go.calendar.SettingsPanel);
		});