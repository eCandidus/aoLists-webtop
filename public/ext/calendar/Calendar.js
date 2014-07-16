/** 
 * Copyright Intermesh
 * 
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 * 
 * If you have questions write an e-mail to info@intermesh.nl
 * 
 * @copyright Copyright Intermesh
 * @version $Id: Calendar.js 2218 2009-04-01 13:04:45Z mschering $
 * @author Merijn Schering <mschering@intermesh.nl>
 */
 
Ext.ux.go.calendar.formatQtip = function(data)
{
	var df = 'Y-m-d H:i';
	
	if(!data.startDate)
		data.startDate = Date.parseDate(data.start_time, df);
	
	if(!data.endDate)
		data.endDate = Date.parseDate(data.end_time, df);
	
	var new_df = Ext.ux.go.settings.time_format;
	if(data.startDate.format('Ymd')!=data.endDate.format('Ymd'))
	{
		new_df = Ext.ux.go.settings.date_format+' '+Ext.ux.go.settings.time_format;
	}

	var str = Ext.ux.go.calendar.lang.startsAt+': '+data.startDate.format(new_df)+'<br />'+
		Ext.ux.go.calendar.lang.endsAt+': '+data.endDate.format(new_df);
	
	if(data.location!='')
	{
		str += '<br />'+Ext.ux.go.calendar.lang.location+': '+data.location;
	}
	
	if(data.description!='')
	{
		str += '<br /><br />'+data.description;
	}
	
	return str;
}

Ext.ux.go.calendar.MainPanel = function(config){
	
	if(!config)
	{
		config = {};
	}			
	var datePicker = new Ext.DatePicker();
	
	datePicker.on("select", function(DatePicker, DateObj){			
				this.setDisplay({date: DateObj});			
		},this);		
		
	this.calendarsStore = new Ext.ux.go.data.JsonStore({
		url: Ext.ux.go.settings.modules.calendar.url+'json.php',
		baseParams: {'task': 'calendars'},
		root: 'results',
		totalProperty: 'total',
		id: 'id',
		fields:['id','name','user_name'],
		remoteSort:true
	});
	
	
	this.viewsStore = new Ext.ux.go.data.JsonStore({
		url: Ext.ux.go.settings.modules.calendar.url+'json.php',
		baseParams: {'task': 'views'},
		root: 'results',
		totalProperty: 'total',
		id: 'id',
		fields:['id','name','user_name'],
		remoteSort:true
	});	
	
	
	this.calendarList= new Ext.ux.go.calendar.CalendarList({store: this.calendarsStore});	
	
	this.viewsList = new Ext.ux.go.calendar.ViewList({store: this.viewsStore}); 
	
	this.calendarList.on('click', function(dataview, index){		
			this.viewsList.clearSelections();		
			
			this.setDisplay({
					calendar_id: dataview.store.data.items[index].id,
					saveState:true				
				});		
		}, this);
	
		this.calendarList.on('selectionchange', function(dv, selections){
			if(selections.length)
				this.calendarTitle.td.innerHTML=selections[0].innerHTML;			
		}, this);
	
	this.viewsList.on('click', function(dataview, index){	

			this.calendarList.clearSelections();							
			this.setDisplay({
					view_id: dataview.store.data.items[index].id,
					saveState:true				
				});
		}, this);
		
	this.viewsList.on('selectionchange', function(dv, selections){
			if(selections.length)
				this.calendarTitle.td.innerHTML=selections[0].innerHTML;			
		}, this);
	
	
	this.daysGridStore = new Ext.ux.go.data.JsonStore({

		url: Ext.ux.go.settings.modules.calendar.url+'json.php',
		baseParams: {task: 'events'},
		root: 'results',
		id: 'id',
		fields:['id','event_id','name','start_time','end_time','description', 'repeats', 'private','location', 'background']
	});
	
	this.monthGridStore = new Ext.ux.go.data.JsonStore({

		url: Ext.ux.go.settings.modules.calendar.url+'json.php',
		baseParams: {task: 'events'},
		root: 'results',
		id: 'id',
		fields:['id','event_id','name','start_time','end_time','description', 'repeats', 'private','location', 'background']
	});

	this.daysGrid = new Ext.ux.go.grid.CalendarGrid(
	{
		id: 'days-grid',
		store: this.daysGridStore, 
		border: false,
		firstWeekday: parseInt(Ext.ux.go.settings.first_weekday)
	});
	
	this.monthGrid = new Ext.ux.go.grid.MonthGrid({
		id: 'month-grid',
		store: this.monthGridStore,
		border: false,
		layout:'fit',
		firstWeekday: parseInt(Ext.ux.go.settings.first_weekday)
		
	});
	
	this.viewGrid = new Ext.ux.go.grid.ViewGrid({
		id: 'view-grid',
		border: false,
		firstWeekday: parseInt(Ext.ux.go.settings.first_weekday)
	});
	
	this.viewGrid.on('zoom', function(conf){	
		this.viewsList.clearSelections();
		this.calendarList.select('calendar-'+conf.calendar_id);
		this.setDisplay(conf);
	}, this);
	
	
	this.listGrid = new Ext.ux.go.calendar.ListGrid({
		id: 'list-grid',
		border: false,
		firstWeekday: parseInt(Ext.ux.go.settings.first_weekday)
	});

	this.listStore = this.listGrid.store;

	
	var calendarListPanel= new Ext.Panel({
					region:'center',
					title:Ext.ux.go.calendar.lang.navigation,
					border:true,							
					items:[this.calendarList, this.viewsList],
					autoScroll:true,
					split: true
				});
	
	this.displayPanel = new Ext.Panel({
          region:'center',
          titlebar: false,
					autoScroll:false,
					layout: 'card',
					activeItem: 0,
					border: true,
					split: true,
					cls: 'cal-display-panel',
					tbar: [this.calendarTitle = new Ext.Toolbar.TextItem({
						text:'Calendar'
					}),'-',{
						iconCls: 'btn-left-arrow',
						text: Ext.ux.go.lang.cmdPrevious,
						cls: 'x-btn-text-icon',
						handler: function(){
							
							var displayDate = this.getActivePanel().configuredDate;
							if(this.displayType=='month')
							{
								displayDate = displayDate.add(Date.MONTH, -1);
							}else
							{
								var days = this.days > 4 ? 7 : 1;
								displayDate = displayDate.add(Date.DAY, -days);
							}
							
							this.setDisplay({date: displayDate});		
						},
						scope: this
					},this.periodInfoPanel = new Ext.Panel({html: '', plain:true, border:true, cls:'cal-period'}),{
						iconCls: 'btn-right-arrow',
						text: Ext.ux.go.lang.cmdNext,
						cls: 'x-btn-text-icon',
						handler: function(){
							var displayDate = this.getActivePanel().configuredDate;
							if(this.displayType=='month')
							{
								displayDate = displayDate.add(Date.MONTH, 1);
							}else
							{
								var days = this.days > 4 ? 7 : 1;
								displayDate = displayDate.add(Date.DAY, days);
							}
							
							this.setDisplay({date: displayDate});						
						},
						scope: this
					}],
					keys:[{
						    key: Ext.EventObject.DELETE,
						    fn: this.deleteHandler,
						    scope: this
						}],	
					items: [this.daysGrid, this.monthGrid, this.viewGrid, this.listGrid]
      });
	
	config.keys=[{
						    key: Ext.EventObject.DELETE,
						    fn: this.deleteHandler,
						    scope: this
						},{
							key:Ext.EventObject.ENTER,
							fn: function(){alert('hoi');}
						}];
						
	var tbar = [{
									iconCls: 'btn-add',							
									text: Ext.ux.go.lang['cmdAdd'],
									cls: 'x-btn-text-icon',
									handler: function(){
							
										Ext.ux.go.calendar.eventDialog.show({
											calendar_id: this.displayType != 'view' ? this.calendar_id : 0
										});
										
									},
									scope: this
								},{
			
									iconCls: 'btn-delete',							
									text: Ext.ux.go.lang['cmdDelete'],
									cls: 'x-btn-text-icon',
									handler: this.deleteHandler,
									scope: this
								},{
			
									iconCls: 'btn-refresh',
									text: Ext.ux.go.lang['cmdRefresh'],
									cls: 'x-btn-text-icon',
									handler: function(){
										/*this.calendarsStore.load();	
										this.viewsStore.load();
										this.setDisplay();*/
										this.init();
									},
									scope: this
								},{
									iconCls: 'btn-settings',
									text: Ext.ux.go.lang['cmdSettings'],
									cls: 'x-btn-text-icon',
									handler: function(){
										this.showAdminDialog();	
									},
									scope: this
								},
								'-',
								this.dayButton = new Ext.Button({
									iconCls: 'btn-one-day',
									text: Ext.ux.go.calendar.lang.oneDay,
									cls: 'x-btn-text-icon',
									handler: function(){
										this.setDisplay({
											days:1,
											displayType: this.displayType == 'view' ? 'view' : 'days',
											saveState:true
										});
									},
									scope: this
								}),
								this.workWeekButton = new Ext.Button({
									iconCls: 'btn-five-days',
									text: Ext.ux.go.calendar.lang.fiveDays,
									cls: 'x-btn-text-icon',
									handler: function(){
			
										this.setDisplay({
												days: 5,
												displayType: this.displayType == 'view' ? 'view' : 'days',
												saveState:true				
										});
									},
									scope: this
								}),
								this.weekButton = new Ext.Button({
									iconCls: 'btn-seven-days',
									text: Ext.ux.go.calendar.lang.sevenDays,
									cls: 'x-btn-text-icon',
									handler: function(){								
										this.setDisplay({
											days: 7,
											displayType: this.displayType == 'view' ? 'view' : 'days',
											saveState:true
										});								
									},
									scope: this
								}),this.monthButton= new Ext.Button({
									iconCls: 'btn-month',
									text: Ext.ux.go.calendar.lang.month,
									cls: 'x-btn-text-icon',
									handler: function(){
										this.setDisplay({
											displayType:'month',
											saveState:true					
										});
									},
									scope: this
								}),
								this.listButton= new Ext.Button({
									iconCls: 'btn-list',
									text: Ext.ux.go.calendar.lang.list,
									cls: 'x-btn-text-icon',
									handler: function(item, pressed){
			        			
										this.setDisplay({
											displayType:'list',
											saveState:true					
										});
			        		
									},
									scope: this
								}),
								'-',
								this.printMessageButton = new Ext.Button({					
								iconCls: 'btn-print',
								text: Ext.ux.go.lang.cmdPrint,
								cls: 'x-btn-text-icon',
								handler: function(){									
									//this.getActivePanel().body.print({printCSS:'<style>.x-calGrid-grid-container{overflow:visible !important}}</style>'});
									
									var sD = this.getActivePanel().startDate;
									var eD = this.getActivePanel().endDate;
									
									var l = Ext.ux.go.settings.modules.calendar.url+'print.php?start_time='+sD.format('U')+'&end_time='+eD.format('U');
									
									if(this.displayType=='view')
									{
										l+='&view_id='+this.view_id;
									}else
									{
										l+='&calendar_id='+this.calendar_id;
									}
									document.location=l;
								},
								scope: this
							})
							
						];
	for(var i=0;i<Ext.ux.go.calendar.extraToolbarItems.length;i++)
	{
		tbar.push(Ext.ux.go.calendar.extraToolbarItems[i]);
	}
		
		
	config.layout='border';
	config.border=false;
	//config.tbar=;
	config.items=[
				new Ext.Panel({
					region:'north',
					height:32,
					baseCls:'x-plain',
					tbar:new Ext.Toolbar({		
						cls:'go-head-tb',
						items: tbar
						})

				}),
				
       new Ext.Panel({
          region:'west',
          titlebar: false,
					autoScroll:false,
					closeOnTab: true,
					width: 210,
					split:true,
					layout:'border',
					border:false,
					plain:true,
					items:[
						new Ext.Panel({
							region:'north',
							border:true,
							height:194,
							split:true,
							baseCls:'x-plain',
							items:datePicker
					}),
					calendarListPanel]
       }),
       this.displayPanel
       ];
	
	
		
	Ext.ux.go.calendar.MainPanel.superclass.constructor.call(this, config);
	
	//this.createCalendarList();
	
	
}

Ext.extend(Ext.ux.go.calendar.MainPanel, Ext.Panel, {
	/*
	 * The type of display. Can be days, month or view
	 */
	displayType : 'days',
	lastCalendarDisplayType : 'days',
	state : {},
	calendarId : 0,
	viewId : 0,


	onShow : function(){
		Ext.ux.go.calendar.MainPanel.superclass.onShow.call(this);
		this.daysGrid.scrollToLastPosition();
	},
	afterRender : function(){
		Ext.ux.go.calendar.MainPanel.superclass.afterRender.call(this);

  	
  	
	//couldn't add key events to panels so I add this event to the whole doc
			
		
		Ext.ux.go.calendar.eventDialog.on('save', function(newEvent,oldDomId){
			
			if(this.displayType=='list')
			{
				this.setDisplay();
			}else
			{
				var activeGrid = this.getActivePanel();
				//reload grid if old or new event repeats. Do not reload if an occurence of a repeating event is modified
				if(newEvent.repeats|| (activeGrid.remoteEvents[oldDomId] && activeGrid.remoteEvents[oldDomId].repeats && activeGrid.remoteEvents[oldDomId].event_id==newEvent.event_id))
				{
					activeGrid.store.reload();
				}else
				{
					activeGrid.removeEvent(oldDomId);			
			
					switch(this.displayType)
					{
						case 'month':
								if(newEvent.calendar_id==this.calendar_id)
									Ext.ux.go.calendar.eventDialog.oldDomId=this.monthGrid.addMonthGridEvent(newEvent);					
						break;				
						case 'days':	
								if(newEvent.calendar_id==this.calendar_id)
									Ext.ux.go.calendar.eventDialog.oldDomId=this.daysGrid.addDaysGridEvent(newEvent, true);
						break;		
								
						case 'view':						
								Ext.ux.go.calendar.eventDialog.oldDomId=this.viewGrid.addViewGridEvent(newEvent);						
						break;				
					}
				}
			}
						
		}, this);
		
		
		
		this.state = Ext.state.Manager.get('calendar-state');
		if(!this.state)
		{
			this.state = {
			displayType:'days',
			days: 5,
			calendar_id:0,
			view_id: 0
			};
		}else
		{
			this.state = Ext.decode(this.state);
		}
		
		if(this.state.displayType=='view')
			this.state.displayType='days';
			
		this.state.calendar_id=Ext.ux.go.calendar.defaultCalendar.id;
		this.state.view_id=0;
				
		this.init();	
		this.createDaysGrid();			
	},
	
	init : function(){

		this.calendarsStore.load({
			callback:function(){				
				if(this.state.displayType!='view')
				{
					if(this.state.calendar_id==0)
					{
						this.state.calendar_id = this.calendarsStore.data.items[0].id;
					}
					this.calendarList.select('calendar-'+this.state.calendar_id);
					this.setDisplay(this.state);
				}
			},
			scope:this			
		});		
		
		this.viewsStore.load({
			callback:function(){				
				if(this.state.displayType=='view')
				{
					this.viewsList.select('view-'+this.state.view_id);
					this.setDisplay(this.state);
				}		
				
			},
			scope:this			
		});	
	},
	
	deleteHandler : function(){
		switch(this.displayType)
		{
			case 'days':
				var event = this.daysGrid.getSelectedEvent();
				var callback = function(event, refresh){
					if(refresh)
					{
						this.daysGrid.store.reload();
					}else
					{
						this.daysGrid.removeEvent(event.domId);
					}
				};			
			break;
			
			case 'month':
				var event = this.monthGrid.getSelectedEvent();
				var callback = function(event, refresh){
					if(refresh)
					{
						this.monthGrid.store.reload();
					}else
					{
						this.monthGrid.removeEvent(event.domId);
					}
				};			
			break;
			
			case 'view':
				var event = this.viewGrid.getSelectedEvent();
				var callback = function(event, refresh){
					if(refresh)
					{
						this.viewGrid.reload();
					}else
					{
						this.viewGrid.removeEvent(event.domId);
					}
				};			
			break;
			
			case 'list':
				var event = this.listGrid.getSelectedEvent();
				var callback = function(event, refresh){
					if(refresh)
					{
						this.listGrid.store.reload();
					}else
					{
						this.listGrid.removeEvent();//will remove the selected row.
					}					
				};			
			break;
		}
									
		if(event)
		{
			this.deleteEvent(event, callback);
		}		
	},
	
	getActivePanel : function(){
		switch(this.displayType)
		{
			case 'days':
				return this.daysGrid;			
			break;
			
			case 'month':
				return this.monthGrid;			
			break;
			
			case 'view':
				return this.viewGrid;			
			break;
			
			case 'list':
				return this.listGrid;			
			break;
		}
		
	},
	
	updatePeriodInfoPanel : function (){
		
		var html = '';		
		var displayDate = this.getActivePanel().configuredDate;
		
		if(this.displayType=='month')
		{
			html = displayDate.format('F, Y');
		}else
		{
			html = Ext.ux.go.lang.strWeek+' '+displayDate.format('W');
		}
		
		this.periodInfoPanel.body.update(html);
	},
	
	
	deleteEvent : function(event, callback){
		
		//store them here so the already created window can use these values
		if(event.repeats)
		{
			this.currentDeleteEvent = event;
			this.currentDeleteCallback = callback;
			
				
			if(!this.recurrenceDialog)
			{
				
				this.recurrenceDialog = new Ext.Window({				
					width:400,
					autoHeight: true,
					closeable: false,
					closeAction: 'hide',
					plain: true,
					border: false,
					closable: false,
					title: Ext.ux.go.calendar.lang.recurringEvent,
					modal: true,
					html: Ext.ux.go.calendar.lang.deleteRecurringEvent,
					buttons: [{
							text: Ext.ux.go.calendar.lang.singleOccurence,
							handler: function(){
								
								var params={
									task: 'delete_event',
									create_exception: true,
									exception_date: this.currentDeleteEvent.startDate.format(this.daysGrid.dateTimeFormat),
									event_id: this.currentDeleteEvent.event_id
									};
								this.sendDeleteRequest(params, this.currentDeleteCallback, this.currentDeleteEvent);
													
								this.recurrenceDialog.hide();
							},
							scope: this
			   		},{
							text: Ext.ux.go.calendar.lang.entireSeries,
							handler: function(){
								
								var params={
									task: 'delete_event',									
									event_id: this.currentDeleteEvent.event_id
									};
								this.sendDeleteRequest(params, this.currentDeleteCallback, this.currentDeleteEvent, true);
								
								this.recurrenceDialog.hide();
							},
							scope: this
			   		},{
							text: Ext.ux.go.lang.cmdCancel,
							handler: function(){								
								this.recurrenceDialog.hide();
							},
							scope: this
			   		}]				
				});
			}
		
			this.recurrenceDialog.show();
		}else
		{
			Ext.MessageBox.confirm(Ext.ux.go.lang.strConfirm, Ext.ux.go.lang.strDeleteSelectedItem, function(btn){
				if(btn=='yes')
				{
					var params={
						task: 'delete_event',
						event_id: event.event_id
						};
					this.sendDeleteRequest(params, callback, event);
				}
			}, this);
		}
	},
	
	sendDeleteRequest : function(params, callback, event, refresh)
	{
		Ext.Ajax.request({
			url: Ext.ux.go.settings.modules.calendar.url+'action.php',
			params: params,
			callback:function(options, success, response){				
				
					if(!success)
					{
						Ext.MessageBox.alert(Ext.ux.go.lang.strError, Ext.ux.go.lang.strRequestError);
					}else
					{
						var responseParams = Ext.decode(response.responseText);
						if(!responseParams.success)
						{						
							Ext.MessageBox.alert(Ext.ux.go.lang.strError, responseParams.feedback);
						}else
						{
							callback.call(this, event, refresh);
						}
					}
			},
			scope:this
		});
	},

	/*
	 * 
	 * displayType: 'days', 'month', 'view'
	 * days: number of days to display in days grid
	 * calendar_id: calendar to display
	 * view_id: view to display
	 * 
	 * date: the date to display
	 * 
	 * 
	 */
	
	setDisplay : function(config){		
		if(!config)
		{
			config = {};
		}

		//when refresh is clicked remember state
		Ext.apply(this.state, config);
		delete this.state.saveState;
		
		if(config.displayType)
		{							
			this.displayType=config.displayType;
		}else if(config.calendar_id)
		{
			this.displayType=this.lastCalendarDisplayType;
		}else if(config.view_id)
		{
			this.displayType='view';
		}
		
		this.state.displayType=this.displayType;
		
	//	if(config.days && this.displayType=='month')
	//	{
			//this.displayType='days';
	//	}
		
		var lastDisplayType = 'view';
		
		if(this.displayType!='view')
		{
			this.lastCalendarDisplayType=this.displayType;
		}	
		
		
		
		switch(this.displayType)
		{
			case 'month':
				this.displayPanel.getLayout().setActiveItem(1);
			break;
			
			case 'days':					
				this.displayPanel.getLayout().setActiveItem(0);
			break;
			
			case 'view':
				this.displayPanel.getLayout().setActiveItem(2);
			break;
			
			case 'list':
				this.displayPanel.getLayout().setActiveItem(3);
			break;
		}
		
		this.monthButton.setDisabled(this.displayType=='view');
		this.listButton.setDisabled(this.displayType=='view');
		
		if(config.calendar_id)
		{
			this.calendar_id=config.calendar_id;
			this.daysGridStore.baseParams['calendars']=Ext.encode([config.calendar_id]);
			this.monthGridStore.baseParams['calendars']=Ext.encode([config.calendar_id]);
			this.listGrid.store.baseParams['calendars']=Ext.encode([config.calendar_id]);			
		}
		
		if(config.view_id)
		{
			this.view_id=config.view_id;
			this.viewGrid.setViewId(config.view_id);
		}		
		
		if(config.date)
		{
			if(!config.days)
			{				
				config.days = this.type=='days' ?  this.daysGrid.days : this.viewGrid.days;
			}
			this.daysGrid.setDate(config.date,config.days,this.displayType=='days');
			this.monthGrid.setDate(config.date,this.displayType=='month');
			this.viewGrid.setDate(config.date,config.days, this.displayType=='view');
			this.listGrid.setDate(config.date,config.days, this.displayType=='list');
			
			this.days=config.days;
		}else if(config.days && this.displayType!='month')
		{
			this.daysGrid.setDays(config.days, this.displayType=='days');
			this.viewGrid.setDays(config.days, this.displayType=='view');
			this.listGrid.setDays(config.days, this.displayType=='list');
			
			this.days=config.days;
		}else
		{
			if(config.days)
			{
				this.days=config.days;
			}
			switch(this.displayType)
			{
				case 'month':
					this.monthGridStore.reload();
				break;
				
				case 'days':					
					this.daysGridStore.reload();
				break;
				
				case 'view':
					this.viewGrid.load();
				break;
				
				case 'list':
					this.listGrid.store.reload();
				break;
			}
		}
		
		
		this.dayButton.toggle(this.displayType=='days' && this.days==1);
		this.workWeekButton.toggle(this.displayType=='days' && this.days==5);
		this.weekButton.toggle(this.displayType=='days' && this.days==7);
		
		this.monthButton.toggle(this.displayType=='month');
		this.listButton.toggle(this.displayType=='list');
		
		this.updatePeriodInfoPanel();
		
		if(config.saveState)
		{
			this.saveState();
		}
	},
	
	
	saveState : function()
	{
		var state = {
			displayType: this.displayType,
			calendar_id: this.calendar_id,
			view_id: this.view_id,
			days: this.days
		}
		
		Ext.state.Manager.set('calendar-state', Ext.encode(state));
	},
	
	refresh : function() {
		this.setDisplay();
	},
      
  createDaysGrid : function()
  {
		
		this.daysGrid.on("eventResize", function(grid, event, actionData){		
			
			var params = {
				task : 'update_grid_event',
				update_event_id : event['event_id'],
				duration : actionData.duration
			};
			
  		if(event.repeats && actionData.singleInstance)
  		{
  			params['createException']='true';
				params['exceptionDate']=actionData.dragDate.format(grid.dateTimeFormat);
				params['repeats']='true';
  		}
  		
  		Ext.Ajax.request({
					url: Ext.ux.go.settings.modules.calendar.url+'action.php',
					params: params,
					callback: function(options, success, response)
					{
    				var responseParams = Ext.decode(response.responseText);
						if(!responseParams.success)
						{
							Ext.MessageBox.alert(Ext.ux.go.lang.strError, responseParams.feedback);
						}else
						{
							if(event.repeats && !actionData.singleInstance)
							{
								grid.store.reload();
							}							
						}
					}
  		});
    		
				
		}, this);
		
		
		this.daysGrid.on("create", function(CalGrid, newEvent){
				var formValues={};
				
				formValues['start_date'] = newEvent['startDate'];//.format(Ext.ux.go.settings['date_format']);					
				formValues['start_hour'] = newEvent['startDate'].format("H");
				formValues['start_min'] = newEvent['startDate'].format("i");
				
				formValues['end_date'] = newEvent['endDate'];//.format(Ext.ux.go.settings['date_format']);
				formValues['end_hour'] = newEvent['endDate'].format("H");
				formValues['end_min'] = newEvent['endDate'].format("i");
				
				Ext.ux.go.calendar.eventDialog.show({
					values: formValues,
					calendar_id: this.calendar_id,
					calendar_name: this.calendar_name
				});
				
			}, this);		
			
		this.monthGrid.on("create", function(grid, date){

				var now = new Date();
				
				var formValues={
					start_date: date,
					end_date: date,
					start_hour: now.format('H'),
					end_hour: now.add(Date.HOUR, 1).format('H'),
					start_min: '00',
					end_min: '00'
				};	
				
				Ext.ux.go.calendar.eventDialog.show({
					values: formValues,
					calendar_id: this.calendar_id,
					calendar_name: this.calendar_name
				});				
			}, this);		
		
		this.monthGrid.on('changeview', function(grid, days, date){
			this.setDisplay({
				displayType:'days',
				days:days,
				date: date
				});
		}, this);
		
		this.daysGrid.on("eventDblClick", this.onDblClick, this);
		this.monthGrid.on("eventDblClick", this.onDblClick, this);
		this.viewGrid.on("eventDblClick", this.onDblClick, this);
		
		
		this.monthGrid.on("move", this.onEventMove,this);
		this.daysGrid.on("move", this.onEventMove,this);
		
	
		this.viewGrid.on("move", function(grid, event, actionData){
	    		
	  	var params = {
				task : 'update_grid_event',
				update_event_id : event['event_id']
			};
			
			if(actionData.offset)
				params['offset']=actionData.offset;
			
			if(actionData.offsetDays)
				params['offsetDays']=actionData.offsetDays;
			
			if(event.repeats && actionData.singleInstance)
			{
				params['createException']='true';
				params['exceptionDate']=actionData.dragDate.format(grid.dateTimeFormat);
				params['repeats']='true';
			}
			
			if(actionData.calendar_id)
			{
				params['update_calendar_id']=actionData.calendar_id;
			}
			 		
			Ext.Ajax.request({
					url: Ext.ux.go.settings.modules.calendar.url+'action.php',
					params: params,
					callback: function(options, success, response)
					{
	  				var responseParams = Ext.decode(response.responseText);
						if(!responseParams.success)
						{
							Ext.MessageBox.alert(Ext.ux.go.lang.strError, responseParams.feedback);
						}else
						{
							if(event.repeats && !actionData.singleInstance)
							{
								grid.store.reload();
							}else if(responseParams.new_event_id)
							{
								grid.setNewEventId(event['domId'], responseParams.new_event_id);
							}					
						}
					}
			});	  		
	  		
	  	},this);
  },
	  
  onDblClick : function(grid, event, actionData){	
			
		if(event.repeats && actionData.singleInstance)
		{
			var formValues={};
			
			formValues['start_date'] = event['startDate'].format(Ext.ux.go.settings['date_format']);					
			formValues['start_hour'] = event['startDate'].format("H");
			formValues['start_min'] = event['startDate'].format("i");
			
			formValues['end_date'] = event['endDate'].format(Ext.ux.go.settings['date_format']);
			formValues['end_hour'] = event['endDate'].format("H");
			formValues['end_min'] = event['endDate'].format("i");
			
			Ext.ux.go.calendar.eventDialog.show({
				values: formValues,
				exceptionDate: event['startDate'].format(this.daysGrid.dateTimeFormat),
				exception_event_id: event['event_id'],
				oldDomId : event.domId
			});
		}else
		{						
			Ext.ux.go.calendar.eventDialog.show({
				event_id: event['event_id'],
				oldDomId : event.domId
			});
		}
	},
    
  onEventMove : function(grid, event, actionData){
    		
		var params = {
			task : 'update_grid_event',
			update_event_id : event['event_id']
		};
		
		if(actionData.offset)
			params['offset']=actionData.offset;
		
		if(actionData.offsetDays)
			params['offsetDays']=actionData.offsetDays;
		
		if(event.repeats && actionData.singleInstance)
		{
			params['createException']='true';
			params['exceptionDate']=actionData.dragDate.format(grid.dateTimeFormat);
			params['repeats']='true';
		}
		
		if(actionData.calendar_id)
		{
			params['update_calendar_id']=actionData.calendar_id;
		}  		
 		
		Ext.Ajax.request({
				url: Ext.ux.go.settings.modules.calendar.url+'action.php',
				params: params,
				callback: function(options, success, response)
				{
  				var responseParams = Ext.decode(response.responseText);
					if(!responseParams.success)
					{
						Ext.MessageBox.alert(Ext.ux.go.lang.strError, responseParams.feedback);
					}else
					{
						if(event.repeats && !actionData.singleInstance)
						{
							grid.store.reload();
						}else if(responseParams.new_event_id)
						{
							grid.setNewEventId(event['domId'], responseParams.new_event_id);
						}					
					}
				}
		});		
	},

	showAdminDialog : function() {
		
		if(!this.adminDialog)
		{
			
			this.writableCalendarsStore = new Ext.ux.go.data.JsonStore({
				url: Ext.ux.go.settings.modules.calendar.url+'json.php',
				baseParams: {'task': 'writable_calendars'},
				root: 'results',
				totalProperty: 'total',
				id: 'id',
				fields:['id','name','user_name'],
				remoteSort:true
			});
			
			this.writableCalendarsStore.load();
			
					
			
			this.writableViewsStore = new Ext.ux.go.data.JsonStore({
				url: Ext.ux.go.settings.modules.calendar.url+'json.php',
				baseParams: {'task': 'writable_views'},
				root: 'results',
				totalProperty: 'total',
				id: 'id',
				fields:['id','name','user_name'],
				remoteSort:true
			});
			
			
			this.calendarDialog = new Ext.ux.go.calendar.CalendarDialog();
			
			this.calendarDialog.on('save', function(){
				this.writableCalendarsStore.reload();
				this.calendarsStore.reload();				
			}, this);
			
			
			
			this.calendarsGrid = new Ext.ux.go.grid.GridPanel( {
				title: Ext.ux.go.calendar.lang.calendars,
				paging: true,
				border: false,
				store: this.writableCalendarsStore,
				deleteConfig: {
					callback:function(){
						this.calendarsStore.reload();
					},
					scope:this
				},
				columns:[{
						header:Ext.ux.go.lang.strName,
						dataIndex: 'name'
					},{
						header:Ext.ux.go.lang.strOwner,
						dataIndex: 'user_name'
					}],						
				view:new  Ext.grid.GridView({
					autoFill:true
				}),
				sm: new Ext.grid.RowSelectionModel(),
				loadMask: true,
				tbar: [{
						id: 'addCalendar',
						iconCls: 'btn-add',
						text: Ext.ux.go.lang.cmdAdd,
						cls: 'x-btn-text-icon',
						handler: function(){
							this.calendarDialog.show();
						},
						scope: this
					},{
						id: 'delete',
						iconCls: 'btn-delete',
						text: Ext.ux.go.lang.cmdDelete,
						cls: 'x-btn-text-icon',
						handler: function(){
							this.calendarsGrid.deleteSelected();				
						},
						scope:this						
					}]
			});
			
			this.calendarsGrid.on("rowdblclick", function(grid, rowClicked, e){

				this.calendarDialog.show(grid.selModel.selections.keys[0]);
			}, this);
			
			
			
			this.viewDialog = new Ext.ux.go.calendar.ViewDialog();
			
			this.viewDialog.on('save', function(){
				this.writableViewsStore.reload();
				this.viewsStore.reload();				
			}, this);
			
			this.viewsGrid = new Ext.ux.go.grid.GridPanel( {
				title: Ext.ux.go.calendar.lang.views,
				paging: true,
				border: false,
				store: this.writableViewsStore,
				deleteConfig: {
					callback:function(){
						this.viewsStore.reload();
					},
					scope:this
				},
				columns:[{
						header:Ext.ux.go.lang.strName,
						dataIndex: 'name'
					},{
						header:Ext.ux.go.lang.strOwner,
						dataIndex: 'user_name'
					}],						
				view:new  Ext.grid.GridView({
					autoFill:true
				}),
				sm: new Ext.grid.RowSelectionModel(),
				loadMask: true,
				tbar: [{
						id: 'addView',
						iconCls: 'btn-add',
						text: Ext.ux.go.lang.cmdAdd,
						cls: 'x-btn-text-icon',
						handler: function(){
							this.viewDialog.show();
						},
						scope: this
					},{
						id: 'delete',
						iconCls: 'btn-delete',
						text: Ext.ux.go.lang.cmdDelete,
						cls: 'x-btn-text-icon',
						handler: function(){
							this.viewsGrid.deleteSelected();				
						},
						scope:this						
					}]
			});
			
			this.viewsGrid.on("rowdblclick", function(grid, rowClicked, e){
				this.viewDialog.show(grid.selModel.selections.keys[0]);
			}, this);
			
			this.viewsGrid.on('show', function(){
				this.writableViewsStore.load();
			},this, {single:true});
			
			
			
			
			this.adminDialog = new Ext.Window({
				title: Ext.ux.go.calendar.lang.administration,
				layout:'fit',
				modal:false,
				minWidth:300,
				minHeight:300,
				height:400,
				width:600,
				closeAction:'hide',
				
				items: new Ext.TabPanel({
					border:false,
					activeTab:0,
					items:[this.calendarsGrid,this.viewsGrid]
				}),
				buttons:[{
					text:Ext.ux.go.lang.cmdClose,
					handler: function(){this.adminDialog.hide()}, 
					scope: this
					}]
			});
			
		}
		
		this.adminDialog.show();			
	}	
});



Ext.ux.go.calendar.CalendarList = function(config){
	
	Ext.apply(config);
	var tpl = new Ext.XTemplate( 
		'<b>'+Ext.ux.go.calendar.lang.calendars+'</b>',
		'<tpl for=".">',
		'<div id="calendar-{id}" class="calendar-wrap">{name}</div>',
		'</tpl>'
	);
	
	Ext.ux.go.calendar.CalendarList.superclass.constructor.call(this, {
		store: config.store,
        tpl: tpl,
        singleSelect:true,
        autoHeight:true,
        overClass:'x-view-over',
        itemSelector:'div.calendar-wrap'
	});	
}

Ext.extend(Ext.ux.go.calendar.CalendarList,Ext.DataView, {
     onRender : function(ct, position){
          this.el = ct.createChild({
          	tag: 'div', 
          	id:"calendarList", 
          	cls:'calendar-list'
          });
          
          Ext.ux.go.calendar.CalendarList.superclass.onRender.apply(this, arguments);
     }

});



Ext.ux.go.calendar.ViewList = function(config){
	
	Ext.apply(config);
	var tpl = new Ext.XTemplate( 
		'<b>'+Ext.ux.go.calendar.lang.views+'</b>',
		'<tpl for=".">',
		'<div id="view-{id}" class="view-wrap">{name}</div>',
		'</tpl>'
	);
	
	Ext.ux.go.calendar.ViewList.superclass.constructor.call(this, {
		store: config.store,
        tpl: tpl,
        singleSelect:true,
        autoHeight:true,
        overClass:'x-view-over',
        itemSelector:'div.view-wrap'
	});	
}

Ext.extend(Ext.ux.go.calendar.ViewList,Ext.DataView, {
   onRender : function(ct, position){
      this.el = ct.createChild({
      	tag: 'div', 
      	id:"viewList",  
      	cls:'view-list'
      });
      
      Ext.ux.go.calendar.ViewList.superclass.onRender.apply(this, arguments);
   }

});

Ext.ux.go.moduleManager.addModule('calendar', Ext.ux.go.calendar.MainPanel, {
	title : Ext.ux.go.calendar.lang.calendar,
	iconCls : 'go-tab-icon-calendar'
});

Ext.ux.go.mainLayout.onReady(function(){
}); 

Ext.ux.go.linkHandlers[1]=function(id){
};

Ext.ux.go.newMenuItems.push({
	text: Ext.ux.go.calendar.lang.appointment,
	iconCls: 'go-link-icon-1',
	handler:function(item, e){				
		Ext.ux.go.calendar.eventDialog.show({
			link_config: item.parentMenu.link_config		
		});
	}
});


Ext.ux.go.calendar.extraToolbarItems = [];