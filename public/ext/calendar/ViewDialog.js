/**
 * Copyright Intermesh
 *
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 *
 * If you have questions write an e-mail to info@intermesh.nl
 *
 * @version $Id: ViewDialog.js 1699 2009-01-13 10:41:35Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */

Ext.ux.go.calendar.ViewDialog = function(config)
{
	if(!config)
	{
		config = {};
	}
	
	var checkCol = new Ext.ux.go.grid.CheckColumn({
		header: Ext.ux.go.lang.strSelected,
		dataIndex: 'selected',
		width: 55
	});
	 
	this.calendarsStore = new Ext.ux.go.data.JsonStore({
		url: Ext.ux.go.settings.modules.calendar.url+'json.php',
		baseParams: {'task': 'view_calendars', view_id: this.view_id},
		root: 'results',
		totalProperty: 'total',
		id: 'id',
		fields:['id','name','user_name','selected'],
		remoteSort:true
	});
	 
	 
	this.calendarsGrid = new Ext.ux.go.grid.GridPanel( {
		region:'center',
		layout:'fit',
		paging:false,
		border:false,
		plugins:checkCol,
		store: this.calendarsStore,
		columns:[
		checkCol,
		{
			header:Ext.ux.go.lang.strName,
			dataIndex: 'name'
		},{
			header:Ext.ux.go.lang.strOwner,
			dataIndex: 'user_name'
		}],
		view:new  Ext.grid.GridView({
			autoFill:true,
			forceFit: true
		}),
		sm: new Ext.grid.RowSelectionModel(),
		loadMask: true
	});


	this.propertiesTab = new Ext.Panel({
		title:Ext.ux.go.lang.strProperties,
		layout:'border',
		//anchor: '100% 100%',
		items: [new Ext.Panel({
			layout:'form',
			region:'north',
			height:70,
			defaultType: 'textfield',
			defaults: {anchor: '100%'},
			cls:'go-form-panel',waitMsgTarget:true,
			labelWidth: 75,
			border:false,
			items: [
			this.selectUser = new Ext.ux.go.form.SelectUser({
				fieldLabel: Ext.ux.go.lang.strUser,
				disabled: !Ext.ux.go.settings.modules['calendar']['write_permission']
			}),
			{
				fieldLabel: Ext.ux.go.lang.strName,
				name: 'name',
				allowBlank:false
					
			}
			]
		}),
		this.calendarsGrid]

	});


	this.readPermissionsTab = new Ext.ux.go.grid.PermissionsPanel({
		title: Ext.ux.go.lang.strReadPermissions
	});

	this.writePermissionsTab = new Ext.ux.go.grid.PermissionsPanel({
		title: Ext.ux.go.lang.strWritePermissions
	});

	//this.readPermissionsTab.render(document.body);
	//this.writePermissionsTab.render(document.body);

	this.formPanel = new Ext.form.FormPanel({
		url: Ext.ux.go.settings.modules.calendar.url+'action.php',
		//labelWidth: 75, // label settings here cascade unless overridden
		defaultType: 'textfield',
		waitMsgTarget:true,
		border:false,
		items:[{
			hideLabel:true,
			deferredRender:false,
			xtype:'tabpanel',
			activeTab: 0,
			border:false,
			anchor: '100% 100%',
			items:[
			this.propertiesTab,
			this.readPermissionsTab,
			this.writePermissionsTab
			]
		}]
	});
	
	
	Ext.ux.go.calendar.ViewDialog.superclass.constructor.call(this,{
					title: Ext.ux.go.lang.strView,
					layout:'fit',
					modal:false,
					height:500,
					width:400,
					closeAction:'hide',
					items: this.formPanel,
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

Ext.extend(Ext.ux.go.calendar.ViewDialog, Ext.Window, {
	
	initComponent : function(){
		
		this.addEvents({'save' : true});
		
		Ext.ux.go.calendar.ViewDialog.superclass.initComponent.call(this);
		
		
	},
				
	show : function (view_id){
		if(!this.rendered)
			this.render(Ext.getBody());
					
		if(view_id > 0)
		{
			if(view_id!=this.view_id)
			{
				this.loadView(view_id);
			}
		}else
		{
			this.view_id=0;
			this.formPanel.form.reset();
			this.propertiesTab.show();

			this.readPermissionsTab.setDisabled(true);
			this.writePermissionsTab.setDisabled(true);
			
			
			this.calendarsStore.baseParams['view_id']=0;
			this.calendarsStore.reload();

			//this.selectUser.setValue(Ext.ux.go.settings['user_id']);
			//this.selectUser.setRawValue(Ext.ux.go.settings['name']);

			Ext.ux.go.calendar.ViewDialog.superclass.show.call(this);
		}
	},
	loadView : function(view_id)
	{
		this.formPanel.form.load({
			url: Ext.ux.go.settings.modules.calendar.url+'json.php',
			params: {
				view_id:view_id,
				task: 'view'
			},
			waitMsg:Ext.ux.go.lang.waitMsgLoad,
			success: function(form, action) {
				this.view_id=view_id;
				this.selectUser.setRawValue(action.result.data.user_name);
				this.readPermissionsTab.setAcl(action.result.data.acl_read);
				this.writePermissionsTab.setAcl(action.result.data.acl_write);
				
				this.calendarsStore.baseParams['view_id']=view_id;
				this.calendarsStore.reload();
				
				Ext.ux.go.calendar.ViewDialog.superclass.show.call(this);
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
		var calendars=[];
			
		for (var i = 0; i < this.calendarsStore.data.items.length;  i++)
		{
			if(this.calendarsStore.data.items[i].get('selected')=='1')
			{
				calendars.push(this.calendarsStore.data.items[i].get('id'));
			}
		}
		
		this.formPanel.form.submit({
			
			
				
			url:Ext.ux.go.settings.modules.calendar.url+'action.php',
			params: {
					'task' : 'save_view', 
					'view_id': this.view_id,
					'view_calendars' : Ext.encode(calendars)
			},
			waitMsg:Ext.ux.go.lang.waitMsgSave,
			success:function(form, action){
								
										
				if(action.result.view_id)
				{
					this.view_id=action.result.view_id;
					this.readPermissionsTab.setAcl(action.result.acl_read);
					this.writePermissionsTab.setAcl(action.result.acl_write);
					//this.loadAccount(this.view_id);
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
