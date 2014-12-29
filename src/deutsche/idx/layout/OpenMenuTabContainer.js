/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

(function(){

var factory = function(dojo_declare, dojo_lang, dijit_registry, dojo_domclass, dojo_style, dojo_query, layoutUtils, dijit_MenuItem, dijit_MenuSeparator, dijit_layout_TabContainer, dijit_layout_ScrollingTabController, idx_resources){

/**
 * @name idx.layout.OpenMenuTabContainer
 * @class idx.layout.OpenMenuTabContainer specializes
 * the TabContainer by letting the user configure the maximum
 * number of tabs that appear on the tab strip when the
 * tab container is loaded, using new parm of "numinit"
 * with a default value of 3. 
 * Also sets the controllerWidget to the new "idx.layout.OpenMenuTabController" 
 * if object instance variable flag "useMenu" is true.
 * @augments dijit.layout.TabContainer
 * @see idx.layout.OpenMenuTabController
 */	
var OpenMenuTabContainer = dojo_declare("idx.layout.OpenMenuTabContainer", 
[dijit_layout_TabContainer],
/**@lends idx.layout.OpenMenuTabContainer#*/
{  
	  /**
      * CSS style for this widget
      * @type String
      * @default "idxConsoleLayoutTabs"
      */
   baseclass : "idxConsoleLayoutTabs", 

	/**
	 * Indicates # of tabs to show initially
	 * Normalized in controller 
	 * @type int
	 * @default 3 (in constructor)
	 */
	numinit: null,	

	/**
	 * Default constructor
	 * @param {Object} args
	 * Init data fields:
	 * 		numinit - 3
	 */
    constructor: function(args) { 

    	this.numinit = 3;
    	if (args) { dojo_lang.mixin(this,args); } 
        // If flag indicates use the menu, then enable the open
    	// menu button controller, and disable the slider.
		if(this.useMenu) {
			this.controllerWidget = "idx.layout.OpenMenuTabController";
			this.useSlider = false;
		}
    },
    
    /**
     * @Override dijit.layout.TabContainer.buildRendering
     * Extends by adding CSS class to dom node of this widget.
     */
    buildRendering: function(){
    	this.inherited(arguments);
    	dojo_domclass.add(this.domNode, this. baseclass);
    }	
    
});



/**
 * @name idx.layout.OpenMenuTabController
 * @class idx.layout.OpenMenuTabController specializes
 * the ScrollingTabController drop down menu button and
 * number of tabs on the strip when the tab container opens.
 * The purpose of the base menu button was to let users select a
 * tab that may not be visible on the tab strip (scrolled out of view).
 * New/changed features include:
 * <ul>
 * <li> Always show the drop down menu button (as opposed to only
 *  showing it when tabs are scrolled out of view).
 * <li> Let users add new items to the tab strip by selecting
 * a drop down item - in addition to just letting them select an existing one.
 * <li> Restrict the number of initial tabs placed on the tab strip using the
 * "numinit" user configurable value. (This parm is normalized to a minimum of
 * 3 and a maximum of 10 tabs on the strip.) When the number of tabs on the 
 * strip exceeds "numinit" the open menu button must be used to add them. 
 * The "onAddChild" method is extended to store initial tab items that
 * exceed "numinit". Note: user configures "numinit" using OpenTabContainer 
 * subclass of the Dojo TabContainer class.
 * <li> Position drop down menu button on the opposite end of the tab
 * strip than current base menu button. New button is placed on far left when
 * LTR and far right when RTL.
 * <li> Show the drop down menu as a styled "Open" button that is a different
 * color when hovered or selected.
 * <li> Special styling of the drop down itself (pending).
 * </ul>
 * @augments dijit.layout.ScrollingTabController
 * Note: This controller can be used with the OpenTabContainer
 * or directly with the default Dojo tab container. 
 * @see idx.layout.OpenMenuTabContainer
 */	

dojo_declare("idx.layout.OpenMenuTabController", [dijit_layout_ScrollingTabController], 
/**@lends idx.layout.OpenMenuTabController#*/
{

	/**
	 * Minimum # of tabs to show
	 * @constant
	 * @type int
	 * @default 3
	 */
	MIN_NUM: 3,
	
	/**
	 * Maximum # of tabs to show
	 * @constant
	 * @type int
	 * @default 10
	 */
	MAX_NUM: 10,
	
	/**
	 * Indicates # of tabs added/showing
	 * in tab container
	 * @type int
	 * @default 0(in constructor)
	 */
	num: null,
	
	/**
	 * Indicates # of tabs to show initially. Set on startup
	 * from the tab container if available.
	 * Normalized in controller to MIN_NUM if less than, 
	 * or MAX_NUM if greater than.
	 * @type int
	 * @default MIN_NUM (in constructor)
	 */
	numinit: null,	

	/**
	 * NLS messages
	 * @type Object
	 * @default {}
	 */
    msg : {},
    
	/**
	 * Hashtable of pages to add with the id as the key 
	 * @type Object
	 * @default {} (in constructor)
	 */
	pane2add: null,
	
	/**
	 * Default constructor
	 * Init data fields:
	 * 		pane2add - {}
	 * 		num      - 0
	 */
	constructor: function() {
    	this.pane2add = new Object();
    	this.num      = 0;
    	this.numinit  = this.MIN_INIT;
	},

	/**
	 * Initializes globalization resource.
	 */
	postMixInProperties: function() {
		this.inherited(arguments);
		this.msg = idx_resources.getResources("idx/layout/OpenMenuTabContainer", this.lang);
	},
	
	/**
	 * Post process by adding in loadDropDown
	 * extension for the menu button
	 * Special processing ... for "numinit"..
	 * Resets user specified "numinit" to valid range if configured less than
	 * min or greater than max # allowed tabs.
	 */
	postCreate: function() {
		var MN = this.declaredClass+".postCreate";
		this.inherited(arguments);

		this.num = 0;
			
		var btn = { loadDropDown: dojo_lang.hitch(this._menuBtn,this._loadDropDown) };
		dojo_lang.mixin( this._menuBtn, btn );
		
		var container = dijit_registry.byId(this.containerId); 
		if(!container) throw Error(MN+" Error. Unable to find tab container with id : "+this.containerId);
		
		//get user configured value for numinit from tab container if there		
		this.numinit = container.numinit ? container.numinit : this.numinit;		
		if     (this.numinit<this.MIN_NUM) this.numinit = this.MIN_NUM;	
		else if(this.numinit>this.MAX_NUM) this.numinit = this.MAX_NUM;
	},
		
	/**
	 * Extend base method to only add tabs up to limit
	 * per "numinit". Place extra tabs in "pane2add"
	 * to only allow adding via drop down menu.
	 * @see dijit.layout.ScrollingTabController.onAddChild
	 */
	onAddChild: function(/*dijit._Widget*/ page, /*Integer?*/ insertIndex){
		var MN = this.declaredClass+".onAddChild";
		
		var container = dijit_registry.byId(this.containerId);
		if(!container) throw new Error(MN+" Error. Unable to find tab container with id : "+this.containerId);
		
		// If this tab was in the waiting to be added list,
		// (found) bypass number of tab restrictions and add it. 
		// It means user added via menu, which has no limits
		// on # of tabs to add.
		var found = this.pane2add[page.title] ? true : false;
		
		if( this.num < this.numinit|| found ) {				
			this.num++;		
			this.inherited(arguments);	
		}
		else if ( !found ){			
			this.pane2add[page.title] = page;
			container.removeChild(page); //test
		}
	},
	
	/**
	 * Extend base by showing menu button on left for LTR
	 * and right on RTL. Also unconditionally show the menu button.
	 * @see dijit.layout.ScrollingTabController.resize
	 */
	resize: function(dim) {
		//var MN = this.declaredClass+".resize";	
		this.inherited(arguments);

		this._menuBtn.layoutAlign = this.isLeftToRight() ? "left" : "right";
		layoutUtils.layoutChildren(this.domNode, this._contentBox,
		[this._menuBtn, this._leftBtn, this._rightBtn, {domNode: this.scrollNode, layoutAlign: "client"}]);
		dojo_style.set(this._menuBtn.id, "visibility", "visible");
   
	},
	
	/**
	 * Extend base by remove "tabStripButton" class from the 
	 * open menu so that it is not styled per the left and right
	 * scroll buttons. 
	 * @see dijit.layout.ScrollingTabController._initButtons
	 */
	_initButtons: function(){
		//var MN = this.declaredClass+"._initButtons";
	    
      
	    //styling classes are removed so that superclass does not hide the menu button
		 var style = "tabStripButton-"+this.tabPosition;		
		 dojo_domclass.remove(this._menuBtn.domNode, style);
		 dojo_domclass.remove(this._menuBtn.domNode, "tabStripButton");
		
		 this._menuBtn.set("label", this.msg.open);
		 this._menuBtn.set("showLabel", true);
		
		 this._buttons = dojo_query("> .tabStripButton", this.domNode).filter(function(btn){ ;}, this);
      
		this.inherited(arguments);
		
		dojo_domclass.add(this._menuBtn.domNode, "tabStripButton");
	
	},
	
	/**
	 * Extend menu button behavior to show
	 * additional tabs pending but not added yet.
	 * When user selects a pending tab, it will be
	 * added. Note: runs in context of drop down menu
	 * button "this" not the controller.
	 * @see dijit.layout._ScrollingTabControllerButton.loadDropDown
	 */
	_loadDropDown: function(callback) {
		var MN = this.declaredClass+"._loadDropDown";	
		this.inherited("loadDropDown",arguments);
		
		var container = dijit_registry.byId(this.containerId);  
		if(!container) throw new Error(MN+" Error. Unable to find tab container with id : "+this.containerId);
		var controller = container.tablist;
		
		var numAdded = 0;
		for(var key in controller.pane2add){
			
			var page = controller.pane2add[key];
			
			var menuItem = new dijit_MenuItem({
				id:        page.id + "_stcMi",
				label:     page.title,
				iconClass: page.iconClass,
				dir:       page.dir,
				lang:      page.lang,
				onClick: function() {					
					var page = controller.pane2add[this.label];						
					container.addChild(page);
					container.selectChild(page);
					delete controller.pane2add[this.label];					
				}
			});
			numAdded++;
			if( numAdded == 1)this.dropDown.addChild(new dijit_MenuSeparator() );
			this.dropDown.addChild(menuItem);			
		}
	}


});

return OpenMenuTabContainer;

}; // end of factory

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
   dojo.provide("idx.layout.OpenMenuTabContainer");               
   dojo.require("dijit.layout._LayoutWidget");// dijit.layout.layoutChildren
   dojo.require("dijit.layout.TabContainer");                     
   dojo.require("dijit.layout.ScrollingTabController");           
   dojo.require("dijit.MenuItem");                                
   dojo.require("dijit.MenuSeparator");                                
   dojo.require("dojo.i18n");
   dojo.require("idx.resources");
   dojo.requireLocalization("idx","base");
   dojo.requireLocalization("idx.layout","base");
   dojo.requireLocalization("idx.layout","OpenMenuTabContainer");
   var dojo_domclass = {"add": dojo.addClass, "remove": dojo.removeClass};
   var dojo_style = {"set": dojo.style, "get": dojo.style};
   var layoutUtils = { "layoutChildren": dijit.layout.layoutChildren };
   factory (dojo.declare, dojo, dijit, dojo_domclass, dojo_style, dojo.query, layoutUtils, dijit.MenuItem, dijit.MenuSeparator, dijit.layout.TabContainer, dijit.layout.ScrollingTabController, idx.resources);
}else{
  define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
         "../../../../dist/lib/dojo/_base/lang",
          "dijit/registry",
          "dojo/dom-class", 
          "dojo/dom-style",
          "dojo/query",
          "dijit/layout/utils", // "dijit/layout/utils.layoutChildren", 
          "dijit/MenuItem",
          "dijit/MenuSeparator",
          "dijit/layout/TabContainer",
          "dijit/layout/ScrollingTabController",
          "idx/resources",
          "dojo/i18n!../nls/base",
          "dojo/i18n!./nls/base",
          "dojo/i18n!./nls/OpenMenuTabContainer"
	], factory);
}

})();
