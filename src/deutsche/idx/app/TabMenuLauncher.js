/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

(function()
{
function factory(
		dDeclare,			// (dojo/_base/declare)
		iLauncher,			// (./_Launcher)
		dTemplated,			// (dijit/_Templated)
		dLang,				// (dojo/_base/lang)
		dDomConstruct,		// (dojo/dom-construct)
		dDomAttr,			// (dojo/dom-attr) for (dDomAttr.set)
		dDomStyle,			// (dojo/dom-style) for (dDomStyle.set)
		dDomGeo,			// (dojo/dom-geometry) for (dDomGeo.getContentBox/getMarginBox)
		dConnect,			// (dojo/_base/connect)
		dFocus,				// (dijit/focus)
		dStackContainer,	// (dijit/layout/StackContainer)
		iUtil,				// (../util)
		iTabMenuDock,		// (./TabMenuDock)
		iWorkspace,			// (./Workspace)
		templateText		// dojo/text!./templates/TabMenuLauncher.html)
		) {
	/**
	 * @name idx.app.TabMenuLauncher
	 * @class TabMenuLauncher widget encapsulates the primary tabs described by the Vienna guidelines
	 * and acts as a container. A future enhancement to this widget may provide the Open menu
	 * pictured in the Vienna guidelines, but currently the variation with the Open menu is not
	 * supported in order to ease transition to IBM One UI since IBM One UI does not currently have
	 * such a variant in application layout.
	 * This class contains a TabMenuDock and uses
	 * the Dojo StackContainer to switch between tabs.
	 * @augments idx.app._Launcher
	 * @augments dijit._Templated
	 * @see idx.app.TabMenuDock

	 * @example
	   Example usage:
	   <b>&lt;div dojoType="idx.app.TabMenuLauncher"</b> 
			 defaultWorkspaceTypeID="HOME" 
			 stateCookieName="idx.app.launcher">
	   			&lt;div dojoType="idx.app.WorkspaceType"
	   				 workspaceTypeID="HOME" 
	   				 urlTemplate="tests/home.html" 
	   				 mixinArgs="{workspaceTypeName: 
	   				 resources.homeTabTitle}"/>
	   &lt;/div>
	 */
return dDeclare("idx.app.TabMenuLauncher",[iLauncher,dTemplated],
        /**@lends idx.app.TabMenuLauncher#*/	             
{
	/**
   	 * Indicates whether or not to show the menu for launching new tabs.  This
   	 * can be set to false to prevent showing when all the workspaces that can be
   	 * directly opened are visible at startup.
   	 * TODO: we currently ignore if set to true
   	 * @type boolean 
   	 * @default false
   	 */
  showMenu: false,  

  /**
   * Indicates whether or not the overflow menu should ALWAYS be visible 
   * regardless if there is overflow.  The overflow menu allows you to flip
   * between open tabs whether or not they are visible.  Typically, this menu 
   * will only appear if the need arises (i.e.: if there is not enough room to
   * show all open tabs).
   * TODO: we currently do not support the overflow menu, but the attribute exists
   * @type boolean 
   * @default false
  */
  showOverflow: false,

	/**
 	 * Overrides of the base CSS class.
 	 * This string is used by the template, and gets inserted into
 	 * template to create the CSS class names for this widget.
 	 * @private
 	 * @constant
 	 * @type String
 	 * @default "dxTabMenuLauncher"
 	 */
  baseClass: "idxTabMenuLauncher",

	/**
	 * The text for the widget template for the dijit._Templated base class.
	 * @constant
	 * @type String
	 * @private
	 * @default "app/templates/TabMenuLauncher.html"
	 */
  templateString: templateText,
  
	/**
	 * Constructor - currently does nothing
	 * @param {Object} args
	 * @param {Object} node
	 */
  constructor: function(args, node) {

  },

  /**
   * Overrides dijit._Widget.postMixInProperties(), calls the inherited method.
   * @see idx.app._Launcher.postMixInProperties
   */
  postMixInProperties: function() {
    this.inherited(arguments);
  },

  /**
   * Overridden to obtain CSS options before calling the base implementation.
   * Sets options, design and sizing.
   */
  buildRendering: function() {
    // get the CSS options for this class
    this.cssOptions = iUtil.getCSSOptions(
           this.baseClass + "Options", this.domNode);

    // set the default options if no CSS options could be found
    if (! this.cssOptions) {
      this.cssOptions = { 
        dockWidget: "idx.app.TabMenuDock"
      }; 
    }
    
    // set the CSS option fields
    this.dockWidgetClass = iTabMenuDock;
    
    // defer to the base function
    this.inherited(arguments);

    // create the tab dock
    this.tabDock = new this.dockWidgetClass(
       { showMenu: this.showMenu, showOverflow: this.showOverflow },
       this.dockNode);
    
    this.contentStack = new dStackContainer();
    dDomConstruct.place(this.contentStack.domNode, this.stackNode, "last");
  },

  /**
   * Override to make sure the selected workspace is flagged as "open" upon creation.
   * @private
   * @see idx.app._Launcher._createWorkspaceArgs
   * @param{idx.app.WorkspaceType}  wsType
   * @param {String} workspaceID
   * @param {String} title
   * @param {Object} args
   * @param wsType
   * @returns {Object} wsArgs
   */
  _createWorkspaceArgs: function(wsType        /*WorkspaceType*/,
                             workspaceID   /*String*/, 
                             title         /*String*/,
                             args          /*?Object?*/) 
  {
    var wsArgs = this.inherited(arguments);
    var wsTypeID = this._initialWorkspaceTypeID;

    // if the launcher has not yet been started then we may
    // need to flag the workspace as starting in the "open"
    // state in order to render properly
    if (! this._launcherStarted) {
        if ((wsTypeID == null) || (wsTypeID.length == 0)) {
            // if no default workspace type was specified
            // and this is our first workspace, then create
            // it in the "open" state
            wsArgs.open = (this._workspaceCount == 0);
        } else if (wsType.get("workspaceTypeID") == wsTypeID) {        
            // if we have a valid default workspace type then
            // open the first such workspace
            var openCount = this.getOpenWorkspaceCount(wsTypeID);
            wsArgs.open = (openCount == 0);
        }
    }
    return wsArgs;
  },

  /**
   * After the workspace is loaded make sure we tell the content stack to resize
   * in order to force an update of the content on-screen.
   * @param {idx.app.Workspace}  workspace
   * @param {Object} data
   * @see idx.app.Workspace
   */
  workspaceLoaded: function(workspace, data) {
    this.contentStack.resize();
  },
   
	/**
	 * 
	 */
	_getA11yMainNode: function() {
		if (! this.contentStack) return null;
		return this.contentStack.domNode;
	},
	
	/**
	 * 
	 */
	_getA11yNavigationNode: function() {
		if (! this.tabDock) return null;
		return this.tabDock.domNode;
	},
	
  /**
   * Extends base method by connecting the onWorkspaceSelected
   * event to the private _onWorkspaceSelected method.
   */
  startup: function() {
    this.inherited(arguments);
    this.contentStack.startup();    
    this.selectConnection = dConnect.connect(this.tabDock, "onWorkspaceSelected",
    										 this, "_onWorkspaceSelected");
    
    // setup the accessibility attributes for registration
    this._started = true;
    this.a11yStartup();
    this.resize();
  },
  
  /**
   * Workspace selection method. 
   * Selects the specified workspace
   * with the contained tabDock and contentStack.
   * @param {idx.app.Workspace} workspace
   * @see idx.app.Workspace}
   */
  selectWorkspace: function(workspace) {
    this.inherited(arguments);
    this.tabDock.selectWorkspace(workspace);
    this.contentStack.selectChild(workspace);
  },

  /**
   * If the specified workspace type ID is provided, then this
   * method returns an array of all workspace IDs for that workspace
   * type.  If not provided, this returns an array of all workspace
   * IDs in order of how they appear.
   */
  getWorkspaces: function(workspaceTypeID) {
	  if (workspaceTypeID) {
		  return this.inherited(arguments);
	  } else {
		  var result = new Array();
		  var children = this.contentStack.getChildren();
		  for (var index = 0; index < children.length; index++) {
			  var child = children[index];
			  if (! (child instanceof iWorkspace)) continue;
			  var workspaceID = child.get("workspaceID");
			  if (this._workspacesByID[workspaceID] != child) continue;
			  result.push(child);
		  }
		  return result;
	  }  
  },
  
  /**
   * This method extends the base class by selecting
   * the specified workspace in the embedded
   * contentStack. It also sets the workspace "open" attributes
   * accordingly. The previously open workspace is no
   * longer "open" and the specified one is.
   * @private
   * @param {idx.app.Workspace} selectedWorkspace 
   * @param {idx.app.Workspace} previousWorkspace 
   */
  _onWorkspaceSelected: function(workspace, previous) {
    this.inherited(arguments);

    this.contentStack.selectChild(workspace);
    
    if (previous) previous.set("open", false);
    if (workspace) workspace.set("open", true);
  },

  /**
   * Overridden from _Launcher, this method is called whenever a
   * workspace is created.  It creates a tab for the workspace.
   * @private
   * @param {idx.app.Workspace} workspace
   * @see idx.app.Workspace
   */
  _workspaceCreated: function(workspace) {
    // create tab for the workspace
    this.tabDock.addWorkspace(workspace);
    this.contentStack.addChild(workspace);
    var contentBox = dDomGeo.getContentBox(this.contentStack.domNode);
    workspace.startup();    
    this.resize();
    if ((workspace) && (workspace.domNode)) {
    	dDomAttr.set(workspace.domNode,
    			{role: "tabpanel", wairole: "tabpanel"});
    }
  },

  /**
   * Called to do cleanup when workspace closing
   * Placeholder
   * @private
   * @param {idx.app.Workspace} workspace
   * @returns {Boolean} false
   */
  _workspaceClosing: function(workspace) {
    // indicate that we do not want the workspace to be preserved
    return false;
  },

  /**
   * Called after workspace closed
   * Currently calls the inherited method from _Launcher.
   * @private
   * @param {idx.app.Workspace} workspace
   */
  _workspaceClosed: function(workspace) {
        this.inherited(arguments);
  },

  /**
   * Resize the widget and its contained elements,
   * using style attributes
   * @param {Object} changeSize
   * @param {Object} resultSize
   */
  resize: function(changeSize, resultSize) {
	if (! this._started) return;
	this.inherited(arguments);
    this.tabDock.resize();
    var dockBox = dDomGeo.getMarginBox(this.tabDock.domNode);
    var height  = dockBox.h;

    dDomStyle.set(this.stackNode, 
               { position: "absolute",
    			 top: "" + height + "px", 
                 left: "0px", 
                 right: "0px", 
                 bottom: "0px" });

    var contentBox = dDomGeo.getContentBox(this.stackNode);
    this.contentStack.resize({w: contentBox.w, h: contentBox.h});
    
    // Calling this.contentStack.resize() causes redraw issues during
    // resize on IE-7.  Removing the line does not have any bad effects
    // this.contentStack.resize();    
  },


  /**
   * Called when the widget gets focus.
   * Forces focus to the contained 
   * idx.app.TabMenuDock object.
   */
  onFocus: function() {
        this.inherited(arguments);
        dFocus.focus(this.tabDock.domNode);
  }
});
}
var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){

	dojo.provide("idx.app.TabMenuLauncher");

	dojo.require("idx.app._Launcher");
	dojo.require("dijit.layout.StackContainer");
	dojo.require("dijit._Templated");
	dojo.require("idx.util");
	dojo.require("idx.a11y");
	dojo.require("idx.app.Workspace");
	dojo.require("idx.app.WorkspaceType");
	dojo.require("idx.app.TabMenuDock");

	var templateTxt = dojo.cache("idx", "app/templates/TabMenuLauncher.html");

	factory(dojo.declare,						// dDeclare
			idx.app._Launcher,					// iLauncher
			dijit._Templated,					// dTemplated
			dojo,								// dLang			(dojo/_base/lang)
			dojo,								// dDomConstruct	(dojo/dom-construct)
			{set: dojo.attr},					// dDomAttr			(dojo/dom-attr) for (dDomAttr.set)
			{set: dojo.style},					// dDomStyle		(dojo/dom-style) for (dDomStyle.set)
			{getContentBox: dojo.contentBox,	// dDomGeo			(dojo/dom-geometry) for (dDomGeo.getContentBox/getMarginBox)	
			 getMarginBox: dojo.marginBox},
			dojo,								// dConnect			(dojo/_base/connect)
			dijit,								// dFocus			(dijit/focus)
			dijit.layout.StackContainer,		// dStackContainer	(dijit/layout/StackContainer)
			idx.util,							// iUtil			(../util)
			idx.app.TabMenuDock,				// iTabMenuDock		(./TabMenuDock)
			idx.app.Workspace,					// iWorkspace		(./Workspace)
			templateTxt);						// templateText		(dojo/text!./templates/TabMenuLauncher.html

} else {
	define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	        "./_Launcher",
	        "dijit/_Templated",
	        "dojo/_base/lang",
	        "dojo/dom-construct",
	        "dojo/dom-attr",
	        "dojo/dom-style",
	        "dojo/dom-geometry",
	        "dojo/_base/connect",
	        "dijit/focus",
	        "dijit/layout/StackContainer",
	        "../util",
	        "./TabMenuDock",
	        "./Workspace",
	        "dojo/text!./templates/TabMenuLauncher.html"],
	        factory);
}

})();

