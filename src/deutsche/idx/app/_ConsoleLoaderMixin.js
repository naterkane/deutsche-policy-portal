/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

(function(){

var factory = function(dojo_declare, dojo_declaresafe, dojo_kernel, dojo_lang, dojo_array, dijit_registry, idx_app_registry, dijit_layout_TabContainer, dojox_layout_ContentPane, idx_app__HashHandlerMixin) {

/**
 * @name idx.app.ConsoleLoaderMixin
 * @class Class supporting dynamic load of UI content.
 * Handles all the UI registry processing and loading into the
 * actual templated UI widget.
 * Dynamic content can be loaded into specified UI elements, such as:
 * stack containers, tab containers, or even low level items like menus.
 * Loads UI from JSON registry, with following fields:<br/>
 * <b>Required:</b>
 * <ul>
 * <li><b>containerId:</b>  Identifies the id of this items parent UI element.  
 * For "tab" type items, this id would be a content pane in a Dojo tab container. 
 * For "menuitem" it is the id of the containing/parent "menu".  
 * In general, a containerId is always the id of the parent item.  
 * Note, that for items of type "context" and "tab", a default containerId 
 * will be assigned if none provided. 
 * This default is the top level context switcher for the application.
 * 
 * <li><b>href:</b>  URL to UI content html page. The common console application framework
 * uses this href as the content source to load into the widget ContentPane. 
 * Note: cross domain (server) loading of URLs must make use of the AjaxProxy
 * or cross domain errors will occur. 
 * 
 * <li><b>id:</b> Used to uniquely identify this UI component. 
 * Note:</b> must be unique in this application! 
 * This is the id that is used for the Dojo ContentPane widget that will wrap the UI
 * component described by this entry in the registry. 
 * Communication from anywhere in the application, to this content pane can be
 * done using this "id". For example, a Data Stage component with an id of
 * "iis_ds" could access the wrapping ContentPane via the following 
 * statement:</b>  var pane = dijit.byId("iis_ds");
 *
 * <li><b>name:</b> Name for UI component item such as a tab or menu item that
 *  is NLS translated. Defaults to value of "id".
 *  
 * <li><b>type:</b> Classification for type of UI element. Currently defined values are:
 * 	<ul>
 * 	  <li><b>context:</b> Loads this UI item as a context switched tab container
 * 	  <li><b>tab:</b> Loads this UI item as a content pane "tab", in a contextual tab container
 * 	  <li><b>menu:</b> Loads this UI item as a menu item.
 * 	</ul>
 * </ul>
 * 	
 * <b>Optional:</b>
 * <ul>
 * 
 * <li><b>cssclass:</b> Style to apply to this widget 
 * <li><b>dijt:</b> Used instead of an href to load a remote widget vs html page.
 *  Widget loaded as content in an enclosing ContentPane. Usually use in conjunction with modulePaths.
 * <li><b>dojoType:</b> Name of widget to represent this entry in the console. 
 *  The default for entries with type "context" is dijit.layout.TabContainer. 
 *  The default for entries with type "tab" is "dojox.layout.ContentPane". 
 *  Users can override with their own widgets as long as the type is 
 *  compatible with the defaults. Note that if this widget has not been loaded
 *  via a "dojo.require" it will automatically be performed before loading.
 *  <li><b>nls:</b> NLS message path and file 
 *  <li><b>iframe:</b> Identifies component is wrapped in an iFrame. 
 *  Currently not supported defaults to false.
 *  <li><b>modulePaths:</b> Sets a location for resolution of relative references
 *  (custom widgets, images, css, html, etc). 
 *  All relative references to widgets, css, images, html etc in a Dojo
 *  application are relative to the location that Dojo loaded from. 
 *  Because the Dojo runtime loaded from a different web application, 
 *  UIs will find they need to use the Dojo "modulePath" to set the path 
 *  for relative references to their own web application. 
 *  <li><b>requires:</b> Dojo classes needed for loading UI item.
 *  Causes a dojo.require to be performed for each item specified.
 *  <li><b>selected:</b>  Selects this item when shown
 *  <li><b>style:</b> Element style to apply to this widget
 *  <li><b>version:</b>  Version of this component. Defaults to "1.0".
 *  
 *  </ul>
 */
var ConsoleLoaderMixin = dojo_declare("idx.app._ConsoleLoaderMixin", [],
/**@lends idx.app.ConsoleLoaderMixin#*/
{

	/**
	 * Class name for debugging
	 * @type String
	 * @default "ConsoleFrameLoaderMixin"
	 * @private
	 */
	CN : "idx.app._ConsoleLoaderMixin",
	
	/**
	 * Constant type for UI registry context
	 * @constant
	 * @type String
	 * @default "context"
	 * @private
	 */
	/*String*/ TYPE_CONTEXT: "context",
	
	/**
	 * Constant type for UI registry tab
	 * @constant
	 * @type String
	 * @default "tab"
	 * @private
	 */
	/*String*/ TYPE_TAB:     "tab",
	
	/**
	 * Constant type for top app level 'context' container id
	 * @constant
	 * @type String
	 * @default "_ctxMain" use as: "${id}_ctxMain"
	 */
	CONTAINER_ID_TOP:		"_ctxMain", // "{id}_ctxMain"
	
	/**
	 * Constant type for top app level 'tab' container id
	 * @constant
	 * @type String
	 * @default "_tabMain" use as: "{id}_tabMain"
	 */
	TAB_ID_TOP:			"_tabMain", //"{id}_tabMain",
	
	/**
	 * Number of context switch areas created
	 * @type int
	 * @default 0
	 */
	numCtx: 0,
	
    /**
	 * URL indicating where to load registry from.
	 * @type String
	 * @default null
	 */
    href : "",
    
    /**
     * Determines if the url hash will be monitored and UI selection/visibility state updated
     * accordingly. See {@link idx.app._HashHandlerMixin} for more information.
     * @type boolean
     * @default true
     */
    useHash: true,

	/**
	 * Default constructor
	 * @param {Object} args
	 */
    constructor: function(args) { 
		if (args) { dojo_lang.mixin(this,args); }
    },
	
	/**
	 * Called to process UI registry data loaded into singleton
	 * instance registry's 'data' field.
	 * Calls '_loadContext' and '_loadTabs' methods.
	 */
	loadUIFromRegistry: function ()
	{
		var MN = this.CN+".loadUIFromRegistry";
		if(this.href) idx_app_registry.href = this.href;
		var data = idx_app_registry.getData();
		
		console.info(MN,"Registry at: "+idx_app_registry.href," Contents: ",data);//tmp dump registry
		
		//Mixin the hash handler, if needed.  Needed before the tabs are created so that the context
		//items can be setup properly
		if (this.useHash) {
            dojo_declaresafe.safeMixin(this, new idx_app__HashHandlerMixin());
		}
		
		this._validate(data);//validate registry entries
		
		// Perform any module path settings required
		this._loadModulePaths(data.items);
		
		// Any Dojo requires needed for loading specified here,
		// after the module load, but before any context or
		// loading of tabs
		this._loadRequires(data.items);

		// First load all context entries from the registry
		// Context entries will be tab containers.
		this._loadContext(data);
		
		// Next load all tab content panes into their respective tab
		// containers, depending on the context specified.
		this._loadTabs(data);
        
        //Now that the UI elements are constructed, add appropriate selection listeners
		//so that the hash can be reflected in the UI and vice versa.
        if (this.useHash) {
            this._setupHashHandler();
        }
	},
	
	/**
	 * Dynamically adds a content pane to the specified tab pane
	 * Creates a small 'context' object in that Dojo content pane. 
	 * @param {Object} item - contents of workspace tab
	 * @returns {ContentPane} new tab
	 */
	addTab: function(/*Object*/ item) 
	{
	
		var args = this._getArgs(item);
		if(!item.containerId) item.containerId = this.id+this.TAB_ID_TOP;
		var dojoType = item.dojoType ? item.dojoType : "dojox.layout.ContentPane";
        
        //if a loaded handler was specified, add it to the args.  Note that while the function is 
        //located on the item (and hence the CP's context object), when we call it we use the CP as the
        //this.  This is so the function looks as if it was a callback on the CP
        item.onLoad = item.onLoad || function() {};
		
		//setup the item for state/hash handling
		if (this.useHash) {
			item = this._createItemForHash(item);
		}
        
        //if content pane, it is loaded async via href, so the dojo.addOnLoad in the href won't work
        //correctly.  Need to use ContentPane#onLoad
        if (dojoType === "dojox.layout.ContentPane") {
            args.onLoad = function() {
				item.onLoad( dijit_registry.byId(item.id) );
            }
        }
        
		var content = this._add(item,args,dojoType) ;

		// Add support for setting a remote dijit into the CP
		// via "dijit" registry entry. Note that this causes
		// the dijit to be immediately loaded even if the tab
		// is not yet opened or added to the tabstrip.
		if(item.dijit && content && dojoType === "dojox.layout.ContentPane") { 
			if(args.id) args.id += "_"+item.dijit;// diff ID than parent CP
			var widget = this._createWidget(item.dijit,args);	
			if(widget!=null) { widget.placeAt(content.id); }
		} 

		return content;
	},
	
	/**
	 * Dynamically adds as a child, a dijit.layout.TabContainer 
	 * to the stack container context specified in "containerId".
	 * Note: If no containerId is specified, the top context
	 * container of the application will be used.
	 * @param {Object} item - contents of workspace tabcontainer
	 * Subscribes to focus gained and lost events so that the
	 * event/alert receiver for the console can be aware of 
	 * major focus changes.
	 * returns {TabContainer} new tab container
	 */
	addContext: function(/*Object*/item) 
	{
		//var MN = this.CN+".addContext";

		if(!item.containerId) item.containerId = this.id+this.CONTAINER_ID_TOP;
		var args = this._getArgsContext(item);
		var dojoType = item.dojoType ? item.dojoType : "dijit.layout.TabContainer";
		var container = this._add(item,args,dojoType) ;			

		return container;
	},
	
	//---------------------------------------------------------------
	// Private worker methods
	//---------------------------------------------------------------
		
	/**
	 * Dynamically adds as a child, the specified object 
	 * @param {Object} item - ui registry items
	 * @param {Object} args - arguments for widget (e.g. content pane
	 * or tab container)
	 * @param {String} dojoType - Type of widget to create such
	 * as dijit.layout.TabContainer or dojox.layout.ContentPane.
	 * @returns {Object} new container pane (tab, content etc)
	 * Publishes component loaded event to topic of this object.
	 * @private
	 */
	_add: function(/*Object*/item,/*Object*/args,/*String*/dojoType) 
	{
		//var MN = this.CN+".add";
			
		var container = dijit_registry.byId(item.containerId);
		if(!container) return; // Is OK, may just not be on this page so skip this entry
				
		if(item.cssclass) {
			if(item.cssclass=="idxConsoleFrameTabs") { console.warn("DEPRECATED: CSS class 'idxConsoleFrameTabs' is deprecated. Remove this cssclass entry from the registry. -- will be removed in next version."); } // deprecated warning
			else args["class"] += " "+item.cssclass; // add any styling class(es)
		}
		if(item.style)    args["style"] = item.style;//add any element styling
		
		var widget = this._createWidget( dojoType, args );
		if(widget!=null)container.addChild(widget);	 
		
		return widget;

	},
	
	/**
	 * Reads from registry data input and adds context containers based on registry fields. 
	 * @param  {Object} data (registry)
	 */
	_loadContext: function(/*Object*/data) 
	{
		//var MN = this.CN+"._loadContext ";	
		dojo_array.forEach(data.items, dojo_lang.hitch(this,function(item) {			
			if( item.type == this.TYPE_CONTEXT ) {
				var container = this.addContext(item);
				if(container) this.numCtx++; //count # context areas
			}
		}));		
	},

	/**
	 * Reads from registry data input and adds tabs based on registry fields. 
	 * @param  {Object} data (registry)
	 */
	_loadTabs: function(/*Object*/data) 
	{
		//var MN = this.CN+"._loadTabs "	
		dojo_array.forEach(data.items, dojo_lang.hitch(this,function(item) {
			if(!item.type) item.type = this.TYPE_TAB; //defaults to type tab
			if( item.type == this.TYPE_TAB) {				
				this.addTab(item);		
			}
		}));
	},	
			
	/**
	 * Get all the module paths that need to be registered with Dojo
	 * from the JSON registry.
	 * @param {Array} - items array read from UI JSON registry
	 */
	_loadModulePaths: function(items) 
	{
		var MN = this.CN+"._loadModulePaths";
		// Add remote web app module paths into main application
		dojo_array.forEach(items,dojo_lang.hitch(this, function(item) {
			if( null != item.modulePaths && item.modulePaths.length >= 1) 
			{
				dojo_array.forEach(item.modulePaths,dojo_lang.hitch(this, function(path) {
					console.debug(MN+" modulePaths: "+path.name+"="+path.value);
					dojo_kernel.registerModulePath(path.name,path.value);
				}));
			}
		}));
	},
	
	/**
	 * Issue any specified Dojo requires
	 *  Note: Use of addOnLoad is recommended versus requires from
	 *  registry defintions due to potential issues when 
	 *  using a cross domain build or async loads (e.g. Dojo 1.7).
	 * @param {Array} - items array read from UI JSON registry
	 */
	_loadRequires: function(items) 
	{
		var MN = this.CN+"._loadRequires";
		// Add remote web app module paths into main application
		dojo_array.forEach(items,dojo_lang.hitch(this, function(item) {
			if( null != item.requires && item.requires.length >= 1) 
			{
				dojo_array.forEach(item.requires,dojo_lang.hitch(this, function(classname) {
              		dojo_kernel.require(classname); 
				}));
			}
		}));
	},
	
	/**
	 * Creates the widget in the active HTML template. 
	 * Detects if no dojo.require has been issued for the widget
	 * and automatically performs it. Traps exceptions/errors
	 * in constructing this pane and reports via log and popup.
	 * @param {String} dojoType (e.g. "dojox.layout.ContentPane")
	 * @param {Object} args
	 * @returns {Object} pane (e.g. ContentPane, TabContainer, etc)
	 * @throws exception if unable to construct widget
	 */
	_createWidget: function(/*String*/dojoType,/*Object*/args) {
		var MN = this.CN+"._createWidget ";
		var pane = null;
		try {
           dojo_kernel.require(dojoType); 
		   var _cls = dojo_lang.getObject(dojoType);
		   pane = new _cls(args); 
		}catch(error) { // class not found, something else wrong in config
			var msg = MN+" "+dojoType+" "+error.message;
			console.error(msg);
			console.dir(error);
			alert(msg);			
		}
		return pane;
	},
	
	/**
	 * Returns arguments for the content pane
	 * @param {Object} item
	 * @returns Object
	 */
	_getArgs: function(/*Object*/item) {

		var args = {
			adjustPaths: true,
			id: item.id,
			renderStyles: true,
			executeScripts: true, // TODO check to see if we need to set like this?
			style: "width:100%;height:100%;",
			title: this._getLocalizedName(item),
			context: item,
			selected: (item.selected===true ? true : false),
			href: item.href
		};
		if (item.args) dojo_lang.mixin(args,item.args);	
		return args;
	},
	
	/**
	 * Returns arguments for the tab container
	 * @param {Object} item
	 * @returns Object
	 */
	_getArgsContext: function(/*Object*/item) {		
		var args = {
			id: item.id,
			title: this._getLocalizedName(item),
			selected: (item.selected===true ? true : false) 
		};
		if (item.args) dojo_lang.mixin(args,item.args);	
		return args;
	},
	
	/** 
	 * Returns a localized name, using the item's
	 * "name" field as the key and the "nls" field
	 * to identify the localized path and message file.
	 * For example, the registry entry for an nls entry is:
	 *     	"nls": { "path": "idx.app", "file": "RegistryNames" },
	 * @param item
	 * @returns name (localized)
	 */
	_getLocalizedName: function(/*Object*/item) {
		// Try to get a localized version of the name, using the name as the key
		var name = item.name?item.name:item.id;
		if(item.nls && item.nls.path && item.nls.file) {
			try {
				dojo_kernel.requireLocalization(item.nls.path, item.nls.file);
				var msgname = dojo_kernel.i18n.getLocalization(item.nls.path, item.nls.file )[name];
				if(msgname!=null) name = msgname;
			} catch(error) { // bypass nls, can't find it
                var MN = this.CN+"._getLocalizedName ";
				console.warn(MN+" "+error.message);
			}

		}
		return name;
	},

	/**
	 * Validates the registry entries. 
	 * @param  {Object} data (registry)
	 * @throws exception if registry errors found
	 */
	_validate: function(/*Object*/data) {
		//placeholder
	} 
	
});

return ConsoleLoaderMixin;

}; // end of factory

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
   dojo.provide("idx.app._ConsoleLoaderMixin");
   dojo.require("dijit.layout.TabContainer");  
   dojo.require("dojox.layout.ContentPane");   
   dojo.require("idx.app._HashHandlerMixin");  
   dojo.require("idx.layout.OpenMenuTabContainer");
   dojo.require("idx.app.registry");           
   factory (dojo.declare, dojo, dojo, dojo, dojo, dijit, idx.app.registry,dijit.layout.TabContainer, dojox.layout.ContentPane,idx.app._HashHandlerMixin);
}else{
	define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
           "../../../../dist/lib/dojo/_base/declare",
           "dojo/_base/kernel",
           "dojo/_base/lang",
	        "dojo/_base/array",
           "dijit/registry",
           "idx/app/registry",
           "dijit/layout/TabContainer",
           "dojox/layout/ContentPane",
           "idx/app/_HashHandlerMixin"
	], factory);
}

})();
