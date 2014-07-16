/**
 * Copyright Intermesh
 *
 * This file is part of Group-Office. You should have received a copy of the
 * Group-Office license along with Group-Office. See the file /LICENSE.TXT
 *
 * If you have questions write an e-mail to info@intermesh.nl
 *
 * @version $Id: ListGrid.js 1800 2009-01-30 13:42:00Z mschering $
 * @copyright Copyright Intermesh
 * @author Merijn Schering <mschering@intermesh.nl>
 */

Ext.ux.go.calendar.ListGrid = function(config)
{
	if(!config)
	{
		config = {};
	}
	
	config.store = new Ext.data.GroupingStore({
	    reader: new Ext.data.JsonReader({
			    totalProperty: "count",
			    root: "results",
			    id: "id",
			    fields: [
						'id',
						'event_id',
						'name',
						'time',
						'start_time',
						'end_time',
						'description',
						'location',
						'private',
						'repeats',
						'background',
						'day'			
					]
	    	}),
			baseParams: {task:'events'},
			proxy: new Ext.data.HttpProxy({
		      url: Ext.ux.go.settings.modules.calendar.url+'json.php'
		  }),        
	    groupField:'day',
	    sortInfo: {field: 'start_time', direction: 'ASC'},
	    remoteGroup:true
	  });
	
	config.paging=false,			
	config.autoExpandColumn='summary-calendar-name-heading';
	config.autoExpandMax=2500;
	config.enableColumnHide=false;
  config.enableColumnMove=false;
  config.autoScroll=true;
  
	config.columns=[
		{
			header:Ext.ux.go.lang.strDay,
			dataIndex: 'day'
		},		
		{
			header:Ext.ux.go.lang.strTime,
			dataIndex: 'time',
			width:80,
			renderer: function(v, metadata, record)
			{
				return '<div style="border:1px solid #c0c0c0;padding:2px;margin:2px;background-color:#'+record.data.background+';">'+v+'</div>';
			}
		},		
		{
			id:'summary-calendar-name-heading',
			header:Ext.ux.go.lang.strName,
			dataIndex: 'name',
			renderer: this.renderName
		}];
		
	config.view=  new Ext.grid.GroupingView({
    hideGroupedColumn:true,
    groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "'+Ext.ux.go.lang.items+'" : "'+Ext.ux.go.lang.item+'"]})',
   	emptyText: Ext.ux.go.calendar.lang.noAppointmentsToDisplay,
   	showGroupName:false
	});
	config.sm=new Ext.grid.RowSelectionModel({singleSelect:true});
	config.loadMask=true;
	
	Ext.ux.go.calendar.ListGrid.superclass.constructor.call(this, config);
	
	
	
	if(!this.startDate)
	{
		//lose time
		var date = new Date();
		this.startDate=Date.parseDate(date.format(this.dateFormat), this.dateFormat);
	}
	
	this.configuredDate=this.startDate;
	
};


Ext.extend(Ext.ux.go.calendar.ListGrid, Ext.grid.GridPanel, {
	
	/**
   * @cfg {String} The components handles dates in this format
   */
	dateFormat : 'Y-m-d',
	/**
   * @cfg {String} The components handles dates in this format
   */
	dateTimeFormat : 'Y-m-d H:i',
	
	timeFormat : 'H:i',
	/**
   * @cfg {Number} Start day of the week. Monday or sunday
   */
	firstWeekday : 1,
	/**
   * @cfg {Date} The date set by the user
   */
	configuredDate : false,
	/**
   * @cfg {Date} The date where the grid starts. This can be recalculated after a user sets a date
   */
	startDate : false,
	
	/**
   * @cfg {Integer} amount of days to display
   */
	days : 7,
	
	renderName : function(grid, value, record)
	{		
		return '<div style="font-weight:bold;">'+record.data.name+'</div>'+Ext.ux.go.calendar.formatQtip(record.data);		
	},
		
	afterRender : function()
	{
		Ext.ux.go.calendar.ListGrid.superclass.afterRender.call(this);
    
    /*Ext.ux.go.calendar.eventDialog.on('save', function(){
    	if(this.isVisible())
    	{
    		this.store.reload();
    	}    	
    }, this);*/
    
    this.on("rowdblclick", function(grid, rowIndex, e){
    	var record = grid.getStore().getAt(rowIndex);	
					 
			Ext.ux.go.calendar.eventDialog.show({event_id: record.data.event_id});
		}, this);		  
	},
	
	getFirstDateOfWeek : function(date)
	{
		//Calculate the first day of the week		
		var weekday = date.getDay();
		var offset = this.firstWeekday-weekday;
		if(offset>0)
		{
			offset-=7;
		}
		return date.add(Date.DAY, offset);
	},
	setDays : function(days, load)
	{
		this.setDate(this.configuredDate, 7, load);		
	},
	
	getSelectedEvent : function(){
		
		var sm = this.getSelectionModel();
		var record = sm.getSelected();
		var event = record.data; 
		
		event.startDate = Date.parseDate(event.start_time, this.dateTimeFormat);
		event.endDate = Date.parseDate(event.end_time, this.dateTimeFormat);
		
		return event;
		
	},
	
	removeEvent : function(){		
		var sm = this.getSelectionModel();
		var record = sm.getSelected();		
		this.store.remove(record)
	},
	
  setDate : function(date, days, load)
  {    	
    	
  	var oldStartDate = this.startDate;
  	var oldEndDate = this.endDate;
  	
/*  	if(days)
  	{
  		this.days=days;	
  	}   	*/
  	
  	this.configuredDate = date;	    	

  	if(this.days>4)
  	{
  		this.startDate = this.getFirstDateOfWeek(date);
  	}else
  	{
  		this.startDate = date;
  	}    	
    this.endDate = this.startDate.add(Date.DAY, this.days);
  	this.setStoreBaseParams();
  	
  	if(load)
  	{
    	//if(!oldEndDate || !oldStartDate || oldEndDate.getElapsed(this.endDate)!=0 || oldStartDate.getElapsed(this.startDate)!=0)
    	//{    			     		
	    	this.store.reload();    			    	
    	//}
  	}
  },
  
  setStoreBaseParams : function(){
  	this.store.baseParams['start_time']=this.startDate.format(this.dateTimeFormat);
    this.store.baseParams['end_time']=this.endDate.format(this.dateTimeFormat);  
  }
	
});

	
	
