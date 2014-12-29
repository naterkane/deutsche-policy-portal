/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2011, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

(function(){

var factory = function(dojo_declare, dojo_lang, dojo_kernel, dojo_string, dojo_connect, dojo_style, idx_bus, idx_app__ConsoleLoaderMixin, dijit_layout__LayoutWidget, dijit__Templated,templateString, idx_resources) {

/**
 * @name idx.templates.ConsoleLayout
 * @class Templated Widget for a basic InfoSphere styled application
 * Uses supporting mixin to dynamically load from a registry and populate
 * the UI in this template.
 * @augments dijit._LayoutWidget
 * @augments dijit._Templated
 * @augments idx.app._ConsoleLoaderMixin
 * 
 */

var ConsoleLayout = dojo_declare("idx.templates.ConsoleLayout",[idx_app__ConsoleLoaderMixin,dijit_layout__LayoutWidget,dijit__Templated],
/**@lends idx.templates.ConsoleLayout#*/
{

	/**
 	 * Constant with the path to the widget template for the 
 	 * dijit._Templated base class.
 	 * @constant
 	 * @type String
 	 * @private
 	 * @default templates/ConsoleLayout.html
 	 */
	templateString: templateString,
	
	/**
 	 * Constant to indicate that this template contains dojo widgets that need parsing
 	 * @private
 	 * @constant
 	 * @type boolean
 	 * @default true
 	 */
	/*boolean*/ widgetsInTemplate: true,
	
	/**
 	 * CSS class name
 	 * @private
 	 * @constant
 	 * @type String
 	 * @default "idxConsoleLayout"
 	 */
	baseClass: "idxConsoleLayout",

	/**
	 * Border Container in HTML template
	 * for central part of console frame.
	 * @private
	 * @constant
	 * @type BorderContainer
	 */
	/*BorderContainer*/_frameContainer: null,
	/**
	 * Marquee in HTML template for
	 * header of console frame.
	 * @private
	 * @constant
	 * @type AppMarquee
	 */
	/*AppMarquee*/marqueeNode: null,
	
	/**
	 * Stack Container in HTML template
	 * @private
	 * @constant
	 * @type StackContainer
	 */
	/*StackContainer*/ _container: null,

	/**
	 * Context sensitive help URL which is the help url
	 * of the UI element with focus.
	 * @type String
	 * @default "http://www.ibm.com"
	 */
	/* String*/ _helpUrl:		"http://www.ibm.com",
    
	/**
	 * Dojo Topic name for notifications relating to application control
	 * @type String
	 * @default {idx.bus.NOTIFICATIONS}
	 */
    topic: idx_bus.NOTIFICATIONS,
	
    /**
	 * Counter used to indicate if a context switcher area is
	 * needed. If there are 2 contexts or more to show, then we
	 * need a switcher area to be visible.
	 * @type int
	 * @private
	 * @default 0
	 */
    /*int*/numCxt:	"0",
    
    /**
     * Flag indicating if status bar area at bottom of console is visible 
     * @type boolean
	 * @default false
     */
    hasStatusBar: false,
    
	/**
	 * NLS messages
	 * @type Object
	 * @default {}
	 */
    msg : {},
    
	/**
 	 * vendor name in marquee
 	 * @constant
 	 * @type String
 	 * @default "IBM &#0174;"
 	 */
    vendorName: "IBM &#0174;",
    
	/**
 	 * vendor logo in marquee
 	 * @constant
 	 * @type String
 	 * @default "<module-url>/resources/claro/ibm-logo-white.gif"
 	 */
	vendorLogo:  dojo_kernel.moduleUrl("idx.templates")+"/resources/claro/ibm-logo-white.gif",
	
	/**
 	 * user name in marquee
 	 * @constant
 	 * @type String
 	 * @default null
 	 */
	username:    "",
	
	/**
 	 * expanded marquee welcome message
 	 * @constant
 	 * @type String
 	 * @default ""
 	 */
	welcome:     "",
	
	/**
	 * Default constructor
	 * Note: If user sets inherited field "title".
	 * it will be used as the frame marquee/banner
	 * name as well as browser title (document.title).
	 * @param {Object} args
	 */
    constructor: function(args) { 
		// Add NLS messages to "msg" field
      this.msg = idx_resources.getResources("idx/templates/ConsoleLayout", this.lang);
    	this.title       = this.msg.marqueeName;	  
		if (args) { dojo_lang.mixin(this,args); }
		document.title = this.title; // set overall title in browser to match

		if(this.username!="") {
			this.welcome = 
				dojo_string.substitute( this.msg.userNameMessage,{"username": this.username} )
			+ " &nbsp;&nbsp; |";
		}
		
		
		dojo_connect.subscribe(
				this.topic ,
				dojo_lang.hitch(this, this._receiveNotification)
		);		
	},
	
	/**
	 * Prepares this object to be garbage-collected
	 */
	destroy: function(){
		this.inherited(arguments);
		// placeholder for cleanup actions
	},
	
	/**
	 * Post rendering processing. 
	 * Uses mixin to dynamically populate console
	 */
    postCreate : function() {
    	this.inherited(arguments);
    	this.loadUIFromRegistry(); // Dynamically populate UI   
    	// If more than one context switcher, show buttons to switch
    	
    	//Defect 5965: changed this._ctxSwitcher.id to this._ctxSwitcher.domNode
    	//For some reason, at this point in the lifecycle _ctxSwitcher
    	//does have an id, but dojo.byId on it does not find it
    	if(this.numCtx >= 2) dojo_style.set(this._ctxSwitcher.domNode, "visibility", "visible");
    	if(this.hasStatusBar) { dojo_style.set(this.footerNode.domNode, "display", "inline"); }
		if(this.username!="") { dojo_style.set(this.logoutNode, "display", "inline"); }		
    },
    
	
	/**
	 * 
	 * @see dijit.layout._LayoutWidget.layout
	 */
	layout: function()
	{
	    this._frameContainer.layout();
	    if(this.marqueeNode.layout)this.marqueeNode.layout();
	    this.inherited(arguments);
	},
	
	  /**
	   * Extends parent method by adding in a resize after the 
	   * child node is added.
	   * @param {Object} child
	   * @param {int} index
	   * @see dijit.layout._LayoutWidget.addChild
	   */
	  addChild: function(/*_LayoutWidget*/ child,/*int*/ index)
	  {
	    this.inherited(arguments);
	    this.resize();
	  },

	  /**
	   * Extends parent method 
	   * @param {Object} child
	   * @see dijit.layout._LayoutWidget.removeChild
	   */
	  removeChild: function(/*_LayoutWidget*/child)
	  {
	    this.inherited(arguments);
	    this.resize();
	  },
	  
	  /**
	   * Resize method that extends parent by also sizing the children
	   *
	   * @param {Object} changeSize
	   * @param {Object} resultSize
	   * @see dijit.layout._LayoutWidget.resize
	   */
	  resize: function(changeSize,resultSize)
	  {
	    if (! this._started) return;	    
	    this.inherited(arguments);	    
	    this._frameContainer.resize();
	    this.layout();
	  },
	  
	  /**
	   * Method called when 'help' link is clicked
	   */
	  onHelp: function()  {
		  var MN = this.declaredClass+".onHelp ";
		  window.open(this._helpUrl,"Help");		
	  },
	
	/**
	 * Method called when 'log out' link is clicked
	 */
	onLogout: function() {		
		var MN = this.declaredClass+".onLogout ";
		alert("onLogout - method not overridden by caller..");
	},

	/**
	 * Method called when 'about' link is clicked
	 */
	onAbout: function()  {
		var MN = this.declaredClass+".onAbout ";
		alert("onAbout - method not overridden by caller...");
	},
	
	//---------------------------------------------------------------	
	// Private worker methods
	//---------------------------------------------------------------
    
	/**
	 * Receive notifications relating to application control
	 * @param {Message} event
	 */
	_receiveNotification: function(/*Message*/ event) {
		var MN = this.declaredClass+"._receiveNotification";
		console.debug(MN,"name="+event.name,"type="+event.type,"event:",event);//tmp
    }

});

return ConsoleLayout;

}; // end of factory


var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
	dojo.provide("idx.templates.ConsoleLayout");     

	dojo.require("dojo.parser");                     
	dojo.require("dijit.layout._LayoutWidget");      
	dojo.require("dijit._Templated");                

	dojo.require("dijit.layout.BorderContainer");    
	dojo.require("dijit.layout.TabContainer");       
	dojo.require("dojox.layout.ContentPane");         
	dojo.require("dijit.layout.StackContainer");     
	dojo.require("dijit.layout.StackController");    
	dojo.require("dijit.Dialog");                    
	dojo.require("dojo.string");                     

	dojo.require("idx.app.AppMarquee");              
	dojo.require("idx.form.Link");                   
	dojo.require("idx.bus"); // for event constants  

	dojo.require("idx.app._ConsoleLoaderMixin");     

   //NLS includes
   dojo.require("dojo.i18n");
   dojo.require("idx.resources");
   dojo.requireLocalization("idx","base");
   dojo.requireLocalization("idx.templates","base");
   dojo.requireLocalization("idx.templates","ConsoleLayout");

	var templateString = dojo.cache("idx", "templates/templates/ConsoleLayout.html");

   var dojo_style = {"set": dojo.style, "get": dojo.style};

   factory(dojo.declare, dojo, dojo, dojo.string, dojo, dojo_style, idx.bus, idx.app._ConsoleLoaderMixin, dijit.layout._LayoutWidget, dijit._Templated, templateString, idx.resources);
}else{
	define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/declare"         ,
		    "../../../../dist/lib/dojo/_base/lang"            ,
            "dojo/_base/kernel"          ,
			"dojo/string"                ,
            "dojo/_base/connect"         ,
            "dojo/dom-style"             ,
            "idx/bus"                    ,
	        "idx/app/_ConsoleLoaderMixin",
	        "dijit/layout/_LayoutWidget" ,
	        "dijit/_Templated"           ,
	        "dojo/text!./templates/ConsoleLayout.html",
            "idx/resources",
            "dojo/i18n!../nls/base",
            "dojo/i18n!./nls/base",
            "dojo/i18n!./nls/ConsoleLayout",
            "dijit/layout/BorderContainer", // widgets used in the template follow
            "dijit/layout/ContentPane",     
            "dijit/layout/TabContainer",       
            "dojox/layout/ContentPane",        
            "dijit/layout/StackContainer",     
            "dijit/layout/StackController",
            "idx/app/AppMarquee"
            //"idxx/app/StatusPane",          
            //"idxx/app/AlertPane"  
	], factory);
}

})();
