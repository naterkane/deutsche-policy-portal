/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

(function() 
{
function factory(dDeclare,		// (dojo/_base/declare)
				 dWidget,		// (dijit/_Widget)
				 dTemplated,	// (dijit/_Templated)
				 dLang,			// (dojo/_base/lang)
				 dDomClass,		// (dojo/dom-class) for (dDomClass.add/remove)
				 dDomAttr,		// (dojo/dom-attr) for (dDomAttr.get/set)
				 dString,		// (dojo/string)
				 iUtil,			// (../util)
				 iResources,	// (../resources)
				 templateText)	// (dojo/text!./templates/WorkspaceTab.html)	
{
	/**
	 * @name idx.app.WorkspaceTab
	 * @class Application content/workspace area. 
	 * Appears in the TabMenuLauncher container as 
	 * the visual component of a Workspace.
	 * Contained/resides in a idx.app.TabMenuDock. 
	 * It provides the visual for a Workspace.
	 * @augments dijit._Widget
	 * @augments dijit._Templated
	 * @see idx.app.Workspace
	 * @see idx.app.TabMenuLauncher
	 * @see idx.app.TabMenuDock
	 */
	return dDeclare("idx.app.WorkspaceTab",[dWidget,dTemplated],
			/**@lends idx.app.WorkspaceTab#*/	
{		
	/**
   	 * Override of the base CSS class, set to "idxWorkspaceTab".
   	 * This string is used by the template, and gets inserted into
   	 * template to create the CSS class names for this widget.
   	 * @private
   	 * @constant
   	 * @type String
     * @default "idxWorkspaceTab"
   	 */
  baseClass: "idxWorkspaceTab",

  /**
   * The path to the widget template for the dijit._Templated base class.
   * @private
   * @constant
   * @type String
   * @default "app/templates/WorkspaceTab.html"
   */
  templateString: templateText,
  
  /**
   * Maps the title text to the proper node
   * @type Object
   * @default {   title: { node: "titleNode", type: "innerHTML" } }
   */
  attributeMap: {
    title: { node: "titleNode", type: "innerHTML" }
  },

  /**
   * 
   */
  workspace: null,
  
  /**
   * 
   */
  tabPosition: 0,
  
  /**
   * The resources used by this instance. 
   */
  resources: null,
  
	/**
	 * Constructor
	 * Constructs an instance of WorkspaceTab
	 * Sets states for: pre/post hovered, pre/post selected, 
	 * selected, first, and last.
	 * @param {Object} args
	 * @param {Object} node
	 */
  constructor: function(args, node) {
    this.stateChecks = {
       PreHovered: dLang.hitch(this, this._isPreHovered),
       PostHovered: dLang.hitch(this, this._isPostHovered),
       PreSelected: dLang.hitch(this, this._isPreSelected),
       PostSelected: dLang.hitch(this, this._isPostSelected),
       Hovered: dLang.hitch(this, this._isHovered),
       Selected: dLang.hitch(this, this._isSelected),
       First: dLang.hitch(this, this._isFirst),
       Last: dLang.hitch(this, this._isLast)
    };
  },

	/**
	 * Private method that sets the resources attribute with the
	 * specified value and if the state is started, calls
	 * the reset resources method.
	 * @param {Object} value
	 * @private
	 */
	_setResourcesAttr: function(/*Object*/ value) {
		this.resources = value;
		this._resetResources();
	},	
	
	/**
	 * Private method to get the resources attribute.
	 * @returns {Object} value
	 * @private
	 */
	_getResourcesAttr: function() {
	    return this._resources;
	},

	/**
	 * Private method that sets the default resources
	 * and if the state is started, calls reformat.
	 * @private
	 */
	_resetResources: function() {
		var defaultResources 
	      = iResources.getResources("idx/app/WorkspaceTab", this.lang);
	    // determine if custom resources were specified and if so override 
	    // the defaults as needed, otherwise use the defaults as-is
	    if (this.resources) {
	      var combinedResources = new Object();
	      dLang.mxin(combinedResources, defaultResources);
	      dLang.mxin(combinedResources, this.resources);
	      this._resources = combinedResources;

	    } else {
	      this._resources = defaultResources;
	    }
	    if (this._started) this._reformat();
	},

	/**
	 * 
	 */
	_getAltTitle: function() {
		var result = this.get("title");
		var format = this._resources.altTitle;
		if (format) {
			result = dString.substitute(format, {title: result});
		}
		return result;
	},
	
	/**
	 * 
	 */
	_reformat: function() {
		if (this.titleNode) {
			dDomAttr.set(this.titleNode, "alt", this._getAltTitle());
		}
	},
	
  /**
   * Overrides dijit._Widget.postMixInProperties() to set title
   * obtained from workspace.
   * @see dijit._Widget.postMixInProperties
   */
  postMixInProperties: function() {
	    this.inherited(arguments);
	    this.title = this.workspace.get("title");    
	    if (! this._rawResources) {
	      this._rawResources = null;
	      this._resetResources();
	    }
  },
  
  /**
   * Overridden to obtain CSS options before calling the base implementation.
   * Sets options, design and sizing.
   */
  buildRendering: function() {
        // summary:
        //            Overridden to obtain CSS options before calling the base
        //            implementation.
        //
    // get the CSS options for this class
    this.cssOptions = iUtil.getCSSOptions("idxWorkspaceTabOptions",
                                                    this.domNode);

    // set the default options if no CSS options could be found
    if (! this.cssOptions) {
      this.cssOptions = { };
    }

    // defer to the base function
    this.inherited(arguments);
    
  },
  
  /**
   * Called at startup to set style based on state
   */
  startup: function() {
	  	this.inherited(arguments);
	  	
	    // set the aria-controls property
	    var tabPanelID = null;
	    if ((this.workspace) && (this.workspace.domNode)) {
	    	tabPanelID = dDomAttr.get(this.workspace.domNode, "id")
	    }
	    if (tabPanelID) {
	    	dDomAttr.set(this.tabNode, "aria-controls", tabPanelID);
	    }
	    
	  	this._started = true;
		// reformat everything
		this._resetResources();
  },

  /**
   * Set CSS class style based on state
   * @param {int} tabCount
   * @param {int} tabIndex
   * @param {int} selectedIndex
   * @param {int} hoverIndex
   */
  setState : function(tabCount, tabIndex, selectedIndex, hoverIndex) {
    for (var state in this.stateChecks) {
      var stateCheck = this.stateChecks[state];
      var inState = stateCheck(tabCount, tabIndex, selectedIndex, hoverIndex);

      if (inState) {
        this.addStateStyles(state);
      } else {
        this.removeStateStyles(state);
      }
    }
    dDomAttr.set(this.tabNode, "aria-selected", "" + (selectedIndex == tabIndex));
  },

  /**
   * Private worker to return hover state based on workspace selection
   * and whether the hovered tab is before the selected tab. 
   * Called from constructor.
   * @private
   * @param {int} tabCount
   * @param {int} tabIndex
   * @param {int} selectedIndex
   * @param {int} hoverIndex
   * @returns {Boolean} true if specified tab precedes hovered tab.
   */
  _isPreHovered: function(tabCount, tabIndex, selectedIndex, hoverIndex) {
    return ((hoverIndex >= 0) && (tabIndex == (hoverIndex - 1)));
  },

  /**
   * Private worker to return hover state based on workspace selection
   * and whether the hovered tab is after the selected tab. 
   * Called from constructor.
   * @private
   * @param {int} tabCount
   * @param {int} tabIndex
   * @param {int} selectedIndex
   * @param {int} hoverIndex.
   * @returns {Boolean} true if specified tab follows hovered tab.
   */
  _isPostHovered: function(tabCount, tabIndex, selectedIndex, hoverIndex) {
    return ((hoverIndex >= 0) && (tabIndex == (hoverIndex + 1)));
  },

  /**
   * Private worker to return hover state based on workspace selection
   * and whether the selected tab is hovered one. 
   * Called from constructor.
   * @private
   * @param {int} tabCount
   * @param {int} tabIndex
   * @param {int} selectedIndex
   * @param {int} hoverIndex
   * @returns {Boolean} true if specified tab is hovered tab.
   */
  _isHovered: function(tabCount, tabIndex, selectedIndex, hoverIndex) {
    return ((hoverIndex >= 0) && (tabIndex == hoverIndex));
  },

  /**
   * Private worker to selected state, indicates if this tab is before the selected tab.   
   * Called from constructor.
   * @private
   * @param {int} tabCount
   * @param {int} tabIndex
   * @param {int} selectedIndex
   * @param {int} hoverIndex
   * @returns {Boolean} true if specified tab is prior to selected tab.
   */
  _isPreSelected: function(tabCount, tabIndex, selectedIndex, hoverIndex) {
    return ((selectedIndex >= 0) && (tabIndex == (selectedIndex - 1)));
  },

  /**
   * Private worker to selected state, indicates if this tab is after the selected tab.
   * Called from constructor.
   * @private
   * @param {int} tabCount
   * @param {int} tabIndex
   * @param {int} selectedIndex
   * @param {int} hoverIndex
   * @returns {Boolean} true if specified tab follows selected tab.
   */
  _isPostSelected: function(tabCount, tabIndex, selectedIndex, hoverIndex) {
    return ((selectedIndex >= 0) && (tabIndex == (selectedIndex + 1)));
  },

  /**
   * Private worker that determines if specified tab is selected.
   * Called from constructor.
   * @private
   * @param {int} tabCount
   * @param {int} tabIndex
   * @param {int} selectedIndex
   * @param {int} hoverIndex
   * @returns {Boolean} true if specified tab is selected.
   */
  _isSelected: function(tabCount, tabIndex, selectedIndex, hoverIndex) {
    return ((selectedIndex >= 0) && (tabIndex == selectedIndex));
  },

  /**
   * Private worker that determines if specified tab is first.
   * Called from constructor.
   * @private
   * @param {int} tabCount
   * @param {int} tabIndex
   * @param {int} selectedIndex
   * @param {int} hoverIndex
   * @returns {Boolean} true if specified tab is first.
   */
  _isFirst: function(tabCount, tabIndex, selectedIndex, hoverIndex) {
    return ((tabCount > 0) && (tabIndex == 0));
  },
  
  /**
   * Private worker that determines if specified tab is last.
   * Called from constructor.
   * @private
   * @param {int} tabCount
   * @param {int} tabIndex
   * @param {int} selectedIndex
   * @param {int} hoverIndex
   * @returns {Boolean} true if specified tab is last.
   */
  _isLast: function(tabCount, tabIndex, selectedIndex, hoverIndex) {
    return ((tabCount > 0) && (tabIndex == (tabCount - 1)));
  },

  /**
   * Adds styles to DOM and title nodes, for specified state.
   * @param {String} state
   */
  addStateStyles: function(state) {
    dDomClass.add(this.domNode, this.baseClass + state);
    dDomClass.add(this.titleNode, this.baseClass + "Title" + state);
  },
  
  /**
   * Removes styles from DOM and title nodes, for specified state.
   * @param {String} state
   */
  removeStateStyles: function(state) {
    dDomClass.remove(this.domNode, this.baseClass + state);
    dDomClass.remove(this.titleNode, this.baseClass + "Title" + state);
  },
  
  /**
   * Adds CSS class for "PostSelected" state - if post selected true
   * @param {boolean} postselected when true adds class. OTW removes
   */
  setPostSelect: function(postselected) {
    if (postSelected) {
      dDomClass.add(tab.domNode, tab.baseClass + "PostSelected");
    } else {
      dDomClass.remove(tab.domNode, tab.baseClass + "PostSelected");
    }
  },

  /**
   * Method to override ability to have focus
   * @returns {Boolean} true
   */
  isFocusable: function() {
    return true;
  },

  /**
   * Adds CSS class for pre-selection
   * @param {String} preselected
   */
  setPreselect: function(preselected) {
    dDomClass.add(tab.domNode, tab.baseClass + "PreSelected");
  },

  /**
   * Private worker to handler on mouse out tab event
   * @private
   * @param {Event} event
   */
  _onTabMouseOut: function(event) {
    this.onTabMouseOut(event, this, this.workspace);
  },

  /**
   * Private worker to handler on mouse over tab event
   * @private
   * @param {Event} event
   */
  _onTabMouseOver: function(event) {
    this.onTabMouseOver(event, this, this.workspace);
  },

  /**
   * Private worker. 
   * This is called whenever the mouse leaves the tab
   * so the dock can listen to such events.
   * @private
   * @param {Event} event
   */
  onTabMouseOut: function(event, tab, workspace) {

  },

  /**
   * Private worker.
   * This is called whenver the mouse pointer enters
   * the tab so the dock can list to such events.
   * @private
   * @param {Event} event
   */
  onTabMouseOver: function(event, tab, workspace) {

  },

  /**
   * Private worker.
   * Internal method that is called when the tab is selected.
   * calls "onTabSelect" passing selected workspace.
   * @private
   * @param {Event} event
   */
  _onTabSelect: function(event) {
    this.onTabSelect(event, this, this.workspace);
  },


  /**
   * This is called whever a tab is selected so the dock can
   * listen to such events.  A tab is selected by clicking on
   * the proper area of the tab.
   * @param {Event} event
   * @param {idx.app.TabMenuDock} tab
   * @param {idx.app.Workspace} workspace
   */
  onTabSelect: function(event, tab, workspace) {
    
  }
});
}

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){

	dojo.provide("idx.app.WorkspaceTab");

	dojo.require("dojo.string");
	dojo.require("dijit._Templated");
	dojo.require("idx.util");
	dojo.require("idx.resources");
	dojo.requireLocalization("idx","base");
	dojo.requireLocalization("idx.app","base");
	dojo.requireLocalization("idx.app","WorkspaceTab");


	var templateTxt = dojo.cache("idx", "app/templates/WorkspaceTab.html");

	factory(dojo.declare,				// dDeclare			(dijit/_base/declare)
			dijit._Widget,				// dWidget			(dijit/_Widget)
			dijit._Templated,			// dTemplated		(dijit/_Templated)
			dojo,						// dLang			(dojo/_base/lang)
			{add: dojo.addClass,		// dDomClass		(dojo/dom-class) for (dDomClass.add/remove)
			 remove: dojo.removeClass},
			{get: dojo.attr,			// dDomAttr 		(dojo/dom-attr) for (dDomAttr.get/set)
			 set: dojo.attr},
			dojo.string,				// dString 			(dojo/string)
			idx.util,					// iUtil			(../util)
			idx.resources,				// iResources,		(../resources)
			templateTxt);				// templateText		(dojo/text!./templates/WorkspaceTab.html)
} else {
	define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	        "../../../lib/dijit/_Widget",
	        "dijit/_Templated",
			"dojo/_base/lang",
			"dojo/dom-class",
			"dojo/dom-attr",
			"dojo/string",
			"../util",
			"../resources",
			"dojo/text!./templates/WorkspaceTab.html",
			"dojo/i18n!../nls/base",
			"dojo/i18n!./nls/base",
			"dojo/i18n!./nls/WorkspaceTab"],
			factory);	
}

})();