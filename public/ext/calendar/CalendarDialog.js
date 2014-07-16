/**
 * Copyright Intermesh
 *
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 *
 * If you have questions write an e-mail to info@intermesh.nl
 *
 * @version $Id: CalendarDialog.js 1699 2009-01-13 10:41:35Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */

Ext.ux.go.calendar.CalendarDialog = function(config)
{
	if(!config)
	{
		config = {};
	}
	
	this.propertiesTab = new Ext.form.FormPanel({
		url: Ext.ux.go.settings.modules.calendar.url+'action.php',		
		defaultType: 'textfield',
		waitMsgTarget:true,
		title:Ext.ux.go.lang['strProperties'],
		layout:'form',
		anchor: '100% 100%',
		defaultType: 'textfield',
		autoHeight:true,
		cls:'go-form-panel',
		waitMsgTarget:true,
		labelWidth: 75,
   
		items: [
			this.selectUser = new Ext.ux.go.form.SelectUser({
				fieldLabel: Ext.ux.go.lang.strUser,
				disabled: !Ext.ux.go.settings.modules['calendar']['write_permission'],
				value: Ext.ux.go.settings.user_id,
				anchor: '100%'
			}),
			{
				fieldLabel: Ext.ux.go.lang.strName,
				name: 'name',
				allowBlank:false,
				anchor: '100%'	
			},this.exportButton = new Ext.Button({			
				text:Ext.ux.go.lang.cmdExport,
				disabled:true,
				handler:function(){
					document.location=Ext.ux.go.settings.modules.calendar.url+'export.php?calendar_id='+this.calendar_id;
				},
				scope:this
			})
		]
	});


	this.readPermissionsTab = new Ext.ux.go.grid.PermissionsPanel({
		title: Ext.ux.go.lang.strReadPermissions
	});

	this.writePermissionsTab = new Ext.ux.go.grid.PermissionsPanel({
		title: Ext.ux.go.lang.strWritePermissions
	});
	
	var uploadFile = new Ext.ux.go.form.UploadFile({
		inputName : 'ical_file',	   
		max:1 			
	});
	
	uploadFile.on('filesChanged', function(input, inputs){
		this.importButton.setDisabled(inputs.getCount()==1);
	}, this);
	

	this.importTab = new Ext.form.FormPanel({
		fileUpload:true,
		waitMsgTarget:true,
		disabled:true,
		title:Ext.ux.go.lang.cmdImport,
		items: [{
			xtype: 'panel',
			html: Ext.ux.go.calendar.lang.selectIcalendarFile,
			border:false	
		},uploadFile,this.importButton = new Ext.Button({
				xtype:'button',
				disabled:true,
				text:Ext.ux.go.lang.cmdImport,
				handler: function(){						
					this.importTab.form.submit({
						waitMsg:Ext.ux.go.lang.waitMsgUpload,
						url:Ext.ux.go.settings.modules.calendar.url+'action.php',
						params: {task: 'import', calendar_id:this.calendar_id},
						success: function(form,action)
						{				
							uploadFile.clearQueue();		

							if(action.result.success)
							{
								Ext.MessageBox.alert(Ext.ux.go.lang.strSuccess,action.result.feedback);
							}else
							{
								Ext.MessageBox.alert(Ext.ux.go.lang.strError,action.result.feedback);
							}						
						},
						failure: function(form, action) {
							Ext.MessageBox.alert(Ext.ux.go.lang.strError, action.result.feedback);
						},
						scope: this
					});
				}, 
				scope: this
			})],
		cls: 'go-form-panel'
	});

	
	this.tabPanel = new Ext.TabPanel({
			hideLabel:true,
			deferredRender:false,
			xtype:'tabpanel',
			activeTab: 0,
			border:false,
			anchor: '100% 100%',
			items:[
			this.propertiesTab,
			this.readPermissionsTab,
			this.writePermissionsTab,
			this.importTab 
			]
		});

	
	Ext.ux.go.calendar.CalendarDialog.superclass.constructor.call(this,{
					title: Ext.ux.go.calendar.lang.calendar,
					layout:'fit',
					modal:false,
					height:500,
					width:450,
					closeAction:'hide',
					items: this.tabPanel,
					buttons:[
					{
						text:Ext.ux.go.lang.cmdOk,
						handler: function(){this.save(true)},
						scope: this
					},
					{
						text:Ext.ux.go.lang.cmdApply,
						handler: function(){this.save(false)},
						scope: this
					},

					{
						text:Ext.ux.go.lang.cmdClose,
						handler: function(){this.hide()},
						scope: this
					}
					]
				});

}

Ext.extend(Ext.ux.go.calendar.CalendarDialog, Ext.Window, {
	
	initComponent : function(){
		
		this.addEvents({'save' : true});
		
		Ext.ux.go.calendar.CalendarDialog.superclass.initComponent.call(this);
		
		
	},
				
	show : function (calendar_id){		
		
		if(!this.rendered)
			this.render(Ext.getBody());
			
		this.propertiesTab.show();
		
		if(calendar_id > 0)
		{
			if(calendar_id!=this.calendar_id)
			{
				this.loadCalendar(calendar_id);
			}else
			{
				Ext.ux.go.calendar.CalendarDialog.superclass.show.call(this);
			}
		}else
		{
			this.calendar_id=0;
			this.propertiesTab.form.reset();
			
			this.exportButton.setDisabled(true);
			this.importTab.setDisabled(true);	

			this.readPermissionsTab.setDisabled(true);
			this.writePermissionsTab.setDisabled(true);

			Ext.ux.go.calendar.CalendarDialog.superclass.show.call(this);
		}
	},
	loadCalendar : function(calendar_id)
	{
		this.propertiesTab.form.load({
			url: Ext.ux.go.settings.modules.calendar.url+'json.php',
			params: {
				calendar_id:calendar_id,
				task: 'calendar'
			},
			waitMsg:Ext.ux.go.lang.waitMsgLoad,
			success: function(form, action) {
				this.calendar_id=calendar_id;
				this.selectUser.setRawValue(action.result.data.user_name);
				this.readPermissionsTab.setAcl(action.result.data.acl_read);
				this.writePermissionsTab.setAcl(action.result.data.acl_write);
				this.exportButton.setDisabled(false);
				this.importTab.setDisabled(false);
				Ext.ux.go.calendar.CalendarDialog.superclass.show.call(this);
			},
			failure:function(form, action)
			{
				Ext.Msg.alert(Ext.ux.go.lang.strError, action.result.feedback)
			},
			scope: this
		});
	},
	save : function(hide)
	{
		this.propertiesTab.form.submit({
				
			url:Ext.ux.go.settings.modules.calendar.url+'action.php',
			params: {
					'task' : 'save_calendar', 
					'calendar_id': this.calendar_id
			},
			waitMsg:Ext.ux.go.lang.waitMsgSave,
			success:function(form, action){
										
				if(action.result.calendar_id)
				{
					this.calendar_id=action.result.calendar_id;
					this.readPermissionsTab.setAcl(action.result.acl_read);
					this.writePermissionsTab.setAcl(action.result.acl_write);
					this.exportButton.setDisabled(false);
					this.importTab.setDisabled(false);
					//this.loadAccount(this.calendar_id);
				}
				
				this.fireEvent('save');
				
				if(hide)
				{
					this.hide();
				}
			},

			failure: function(form, action) {
				var error = '';
				if(action.failureType=='client')
				{
					error = Ext.ux.go.lang.strErrorsInForm;
				}else
				{
					error = action.result.feedback;
				}
					
				Ext.MessageBox.alert(Ext.ux.go.lang.strError, error);
			},
			scope:this

		});
			
	}
});
