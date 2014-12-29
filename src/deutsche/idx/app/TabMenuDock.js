/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */
/**
 * @name idx.app.TabMenuDock
 * @class Class that houses (docks) and manages
 * workspaces and their corresponding visual, a
 * workspace tab. The TabMenuDock is contained
 * in the TabMenuLauncher
 * @augments idx.app._Dock
 * @augments dijit._Templated
 * @see idx.app.WorkSpace
 * @see idx.app.WorkSpaceTab
 * @see idx.appTabMenuLauncher
 */
(function() 
{
function factory(dDeclare,
			     iDock,
			     dTemplated,
			     dKernel,			// (dojo/_base/kernel)
			     dLang,				// (dojo/_base/lang)
			     dArray,			// (dojo/_base/array)
			     dDomConstruct,		// (dojo/dom-construct)
			     dDomGeo,			// (dojo/dom-geometry) for (dDomGeo.getMarginBox)
			     dDomStyle,			// (dojo/dom-style) for (dDomStyle.set)
			     dConnect,			// (dojo/_base/connect)
			     dWAI,				// (dijit/_base/wai)
			     iUtil,				// (../util)
			     iWorkspaceTab,		// (./WorkspaceTab)
			     templateText) 		// (dojo/text!./templates/TabMenuDock)
{
	/**
	 * @name idx.app.TabMenuDock
	 * @class Class that houses (docks) and manages
	 * workspaces and their corresponding visual, a
	 * workspace tab. The TabMenuDock is contained
	 * in the TabMenuLauncher
	 * @augments idx.app._Dock
	 * @augments dijit._Templated
	 * @see idx.app.WorkSpace
	 * @see idx.app.WorkSpaceTab
	 * @see idx.appTabMenuLauncher	
	 */
return dDeclare("idx.app.TabMenuDock",[iDock,dTemplated],
		/**@lends idx.app.TabMenuDock#*/
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
   * @type boolean 
   * @default false
   */
  showOverflow: false,

	/**
 	 * Override of the base CSS class, set to "idxTabMenuDock".
 	 * This string is used by the template, and gets inserted into
 	 * template to create the CSS class names for this widget.
 	 * @constant
 	 * @private
 	 * @type String
 	 */
  baseClass: "idxTabMenuDock",

	/**
	 * The path to the widget template for the dijit._Templated base class.
	 * @constant
	 * @type String
	 * @private
	 */
  templateString: templateText,

  /**
   * The class to use for the Tab widget.  If not set then an attempt is made
   * to retrieve from the CSS option "tabWidget", otherwise the default is used
   * which is idx.app.DockTab.
   * @type Object
   * @default null
   */
  tabWidgetClass: null,

	/**
	 * Constructor
	 * Constructs an instance of TabMenuDock
	 * @param {Object} args
	 * @param {Object} node
	 */
  constructor: function(args, node) {
    this.tabs = new Array();
    this.tabsByID = new Array();
    this.tabConnections = new Array();
  },

  /**
   * Overridden to obtain CSS options before calling the base implementation.
   * Sets options, design and sizing.
   * @see dijit._Templated implementation.
   */
  buildRendering: function() {
        // summary:
        //            Overridden to obtain CSS options before calling the base
        //            implementation.
        //
    // get the CSS options for this class
    this.cssOptions = iUtil.getCSSOptions(this.baseClass + "Options",
                                          this.domNode);

    // set the default options if no CSS options could be found
    if (! this.cssOptions) {
       this.cssOptions = {
        tabWidget: "idx.app.WorkspaceTab",
        autoHeight: "true" 
       }
    }
    if (this.cssOptions.autoHeight == "true") {
       this.cssOptions.autoHeight = true;
    } else {
       this.cssOptions.autoHeight = false;
    }

    // set the CSS option fields
    this.tabWidgetClass = iWorkspaceTab;

    this.autoHeight = this.cssOptions.autoHeight;
    
    // defer to the base function
    this.inherited(arguments);
  },

	/**
	 * Implemented to add a tab to the dock.
	 * @param {idx.app.Workspace} workspace
	 * @returns {Boolean} true
	 * @param {idx.app.Workspace
	 */
  _doAddWorkspace: function(/*Workspace*/ workspace) {
    var width = 0;
    var index = 0;
    for (index = 0; index < this.tabs.length; index++) {
     var tab = this.tabs[index];
     var box = dDomGeo.getMarginBox(tab.domNode);
     width += box.w;
    }

    // create the tab
    var tab = new this.tabWidgetClass({workspace: workspace, 
                                       tabPosition:  this.tabs.length});
    
    // register the tab
    this.tabs.push(tab);
    this.tabsByID[workspace.workspaceID] = tab;

    // connect to events on the tab
    var selectConnect = dConnect.connect(tab, "onTabSelect", 
                                     this, "_selectWorkspaceTab");
    var mouseOutConnect = dConnect.connect(tab, "onTabMouseOut",
                                       this, "_onTabMouseOut");
    var mouseOverConnect = dConnect.connect(tab, "onTabMouseOver",
                                        this, "_onTabMouseOver");

    var connections = new Array();
    this.tabConnections[workspace.workspaceID] = connections;
    connections.push(selectConnect);
    connections.push(mouseOutConnect);
    connections.push(mouseOverConnect);

    // place it and position it
    dDomConstruct.place(tab.domNode, this.tabsNode, "last");
    tab.startup();
    
    //For RTL languages, lay the tabs out starting on the right.
    if (dKernel._isBodyLtr()) {
	    dDomStyle.set(tab.domNode,
               { position: "absolute",
                 left: "" + width + "px"
               });
    } else {
	    dDomStyle.set(tab.domNode,
               { position: "absolute",
                 right: "" + width + "px"
               });
    }


    this.applyTabStyles();

    return true;
  },

  /**
   * Private method to apply style sheets when the user
   * exits the workspace tab.
   * Calls method 'applyTabStyles'. Resets hover vars to
   * indicate this tab/workspace is no longer active.
   * @private
   * @param {Event} event
   * @param {Object} tab
   * @param {idx.app.Workspace} workspace
   * @param {idx.app.Workspace
   */
  _onTabMouseOut: function(event, tab, workspace) {
    if (tab == this._hoverTab) {
      this._hoverTab = null;
      this._hoverIndex = -1;
    }
    this.applyTabStyles();
  },

  /**
   * Private method to apply style sheets when the user
   * exits the workspace tab.
   * Calls method 'applyTabStyles'. Sets hover vars to
   * indicate this tab/workspace is active.
   * @private
   * @param {Event} event
   * @param {Object} tab
   * @param {idx.app.Workspace} workspace
   */
  _onTabMouseOver: function(event, tab, workspace) {
    this._hoverIndex = dArray.indexOf(this.tabs, tab);
    this._hoverTab   = tab;
    this.applyTabStyles();
  },

  /**
   * Internal method that is called when the tab
   * is selected by the user clicking on it. 
   * Calls 'selectWorkspace'.
   * @private
   * @see idx.app._Dock._selectWorkspaceTab
   * @param {Event} event
   * @param {Object} tab
   * @param {idx.app.Workspace} workspace
   */
  _selectWorkspaceTab: function(event, tab, workspace) {
    this.selectWorkspace(workspace);
  },

  /**
   * Private method to handle actually selecting the workspace.
   * If this function returns false then it is assumed that the workspace
   * could not be selected.  The default implementation returns false, so you
   * must override to return true at the very least.
   * @private
   * @see idx.app._Dock._doSelectWorkspace
   * @param {idx.app.Workspace} toBeSelected - workspace to be selected
   * @param {idx.app.Workspace} previouslySelected - workspace previously selected
   * @returns {Boolean} true
   */
  _doSelectWorkspace: function(/*Workspace*/ toBeSelected,
                               /*Workspace*/ previouslySelected) {

    var toSelectTab = this.tabsByID[toBeSelected.workspaceID];

    this._selectedTab = toSelectTab;
    this._selectedIndex = dArray.indexOf(this.tabs, this._selectedTab);

    this.applyTabStyles();
    return true;
  },

  /**
   * Implemented to remove the tab for the workspace form the dock.
   * @private
   * @see idx.app._Dock._doRemoveWorkspace
   * @param {idx.app.Workspace} workspace to remove 
   * @param {boolean} selected indicator (true if selected, OTW false) 
   * @returns {boolean} true
   */
  _doRemoveWorkspace: function(/*Workspace*/ workspace, /*boolean*/ selected) {
    var tab = this.tabsByID[workspace.workspaceID];
    var tabIndex = dArray.indexOf(this.tabs, tab);
    var connections = this.tabConections[workspace.workspaceID];
    
    var index = 0;
    for (index = 0; index < connections.length; index++) {
      // disconnect events
      dConnect.disconnect(connections[index]);
    }

    // destroy the tab itself
    tab.destroyRecursively();

    // cleanup the arrays
    this.tabs.splice(tabIndex, 1);
    delete this.tabsByID[workspace.workspaceID];
    delete this.tabConnections[workspace.workspaceID];

    this.resize();

    // select an alternative tab
    if (selected) {
      var selectIndex = (this.tabs.length > tabIndex) 
                        ? tabIndex
                        : (tabIndex - 1);

      if (tabIndex >= 0) {
        this._selectedIndex = selectIndex;
        this.applyTabStyles();
        return selectIndex;
      }
    }
    
    // if we get here then return true
    return true;
  },

  /**
   * Implemented to ensure that a tab is selected if the selected
   * tab gets removed.
   * @private
   * @see idx.app._Dock._doPostRemoveWorkspace
   * @param {idx.app.Workspace} workspace to remove 
   * @param {boolean} selected indicator (true if selected, OTW false) 
   * @returns {boolean} true
   */
  _doPostRemoveWorkspace: function(/*Workspace*/ workspace,
                                   /*boolean*/   selected,
                                   /*int*/       removalResult) {
    if (! selected) return;
    var tabIndex = removalResult;

    if ((tabIndex < 0) || (tabIndex >= this.tabs.length)) return;

    // get the workspace
    var workspace = this._workspace[tabIndex];

    // select it
    this.selectWorkspace(workspace);

    this.applyTabStyles();
  },
  
  /**
   * Resize taking into account CSS class size-related
   * settings (e.g. margins etc).
   */
  resize: function() {
    // reposition all tabs
    var index = 0;
    var width = 0;
    for (index = 0; index < this.tabs.length; index++) {
      var tab = this.tabs[index];
      var box = dDomGeo.getMarginBox(tab.domNode);
      //For RTL languages, lay the tabs out starting on the right.
      if (dKernel._isBodyLtr()) {
	      dDomStyle.set(tab.domNode,
                 { position: "absolute",
                   left: "" + width + "px"
                 });
      } else {
	      dDomStyle.set(tab.domNode,
                 { position: "absolute",
                   right: "" + width + "px"
                 });
      }
      width += box.w;
    }

    if (this.autoHeight) {
      var height = 0;
      var index = 0;
      for (index = 0; index < this.tabs.length; index++) {
        var tab = this.tabs[index];
        var tabBox = dDomGeo.getMarginBox(tab.domNode);
        if (tabBox.h > height) height = tabBox.h;
      }
      dDomStyle.set(this.domNode, { height: "" + height + "px" });
    }

  },

  /**
   * Apply style to tab based on the selected or
   * hovered tab, and call 'resize' so the changes 
   * can be seen.
   */
  applyTabStyles: function() {
    var index = 0;
    for (index = 0; index < this.tabs.length; index++) {
      var tab = this.tabs[index];

      tab.setState(this.tabs.length, 
                   index, 
                   this._selectedIndex, 
                   this._hoverIndex);

      if (index == this._selectedIndex) {
          dWAI.setWaiState(tab.domNode, "selected", "true");
          dWAI.setWaiState(tab.domNode, "pressed", "true");
      } else {
          dWAI.setWaiState(tab.domNode, "selected", "false");
          dWAI.setWaiState(tab.domNode, "pressed", "false");
      }

    }
    this.resize();
  }
});
}
var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
	dojo.provide("idx.app.TabMenuDock");

	dojo.require("idx.app._Dock");
	dojo.require("dijit._Templated");
	dojo.require("idx.util");
	dojo.require("idx.app.WorkspaceTab");

	var templateTxt = dojo.cache("idx", "app/templates/TabMenuDock.html"); 

	factory(dojo.declare,					// dDeclare			(dojo/_base/declare)
			idx.app._Dock,					// iDock			(./_Dock)
			dijit._Templated,				// dTemplated		(dijit/_Templated)
			dojo,							// dKernel			(dojo/_base/kernel)
			dojo,							// dLang			(dojo/_base/lang)
			dojo,							// dArray			(dojo/_base/array)
			dojo,							// dDomConstruct	(dojo/dom-construct)
			{getMarginBox: dojo.marginBox},	// dDomGeo			(dojo/dom-geometry) for (dDomGeo.getMarginBox)
			{set: dojo.style},				// dDomStyle		(dojo/dom-style) for (dDomStyle.set)
			dojo,							// dConnect			(dojo/_base/connect)
			dijit,							// dWAI				(dijit/_base/wai)
			idx.util,						// iUtil			(../util)
			idx.app.WorkspaceTab,			// iWorkspaceTab	(./WorkspaceTab)
			templateTxt);  					// templateText		(dojo/text!./templates/TabMenuDock)
} else {
	define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	        "./_Dock",
	        "dijit/_Templated",
	        "dojo/_base/kernel",
	        "dojo/_base/lang",
	        "dojo/_base/array",
	        "dojo/dom-construct",
	        "dojo/dom-geometry",
	        "dojo/dom-style",
	        "dojo/_base/connect",
	        "dijit/_base/wai",
	        "../util",
	        "./WorkspaceTab",
	        "dojo/text!./templates/TabMenuDock.html"],
	        factory);
}
})();

