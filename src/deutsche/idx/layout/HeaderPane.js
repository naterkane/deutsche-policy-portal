/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

(function() 
{

function factory(dDeclare,			// dDeclare			(dojo/_base_declare)
		         iContentPane,		// iContentPane		(./ContentPane)
		         dLayoutWidget,		// dLayoutWidget	(dijit/layout/_LayoutWidget)
		         dTemplated,		// dTemplated		(dijit/_Templated)
		         dCssStateMixin,	// dCssStateMixin	(dijit/_CssStateMixin)
		         dLang,				// dLang			(dojo/_base/lang)
		         dConnect,          // dConnect			(dojo/_base/connect)
		         dDomAttr,			// dDomAttr			(dojo/dom-attr) for (dDomAttr.set)
		         dDomClass,			// dDomClass		(dojo/dom-class) for (dDomClass.add/remove)
		         dWidget,			// dWidget			(dijit/_Widget)	
		         dArray,			// dArray 			(dojo/_base/array)
		         dString,			// dString			(dojo/string)
		         dQuery, 			// dQuery			(dojo/query) + (dojo/NodeList-dom) for (dQuery.NodeList)
		         domConstruct,		// domConstruct		(dojo/dom-construct)
		         dDomStyle,			// dDomStyle		(dojo/dom-style) for (dDomStyle.set)
		         dDomGeo, 			// dDomGeo			(dojo/dom-geometry) for (dDomGeo.getContentBox)
		         dEvent,			// dEvent			(dojo/_base/event) for (dEvent.stop)
		         dRegistry,			// dRegistry		(dijit/registry) for (dijit.byNode)
		         dButton,  			// dButton			(dijit/form/button)
		         iString,			// iString			(../string)
		         iUtil,				// iUtil			(../util)
		         iBorderLayout,		// iBorderLayout	(../border/BorderLayout)
		         iMaximizeMixin,	// iMaximizeMixin 	(../widget/_MaximizeMixin)
		         iResources,		// iResources		(../resources)
		         templateText) 		// templateText		(dojo/text!./templates/HeaderPane.html)
{
	/**
	 * @name idx.layout.HeaderPane
	 * @class HeaderPane widget.  Provides a non-collapsible container for a region of application content.
	 * @augments dijit.layout.ContentPane
	 * @augments dijit.layout._LayoutWidget
	 * @augments dijit._Templated
	 * @see idx.border.BorderLayout
	 */
return dDeclare("idx.layout.HeaderPane",[iContentPane,dLayoutWidget,dTemplated,dCssStateMixin],
		/**@lends idx.layout.HeaderPane#*/	
{
	/**
	 * The tab index to use for selecting the content area to help with keyboard scrolling navigation. 
	 */
	tabIndex: 0,
	
	/**
	 * Set this to true when the HeaderPane should compute its 
	 * height as a function of the height of its contained 
	 * content. 
	 * @type boolean
	 * @default false
	 */
	autoHeight: false,
	
	/**
   	 * Set this to true if you want the actions in the title
   	 * to disappear when the pane is not focused or hovered.
   	 * @type boolean
   	 * @default true
   	 */
    autoHideActions: false,

	/**
	 * Specifies whether the pane should have a button added
	 * to the title actions region with placement=toolbar
	 * and buttonType=close with that button's "onClick" event
	 * linked to this title pane's close() method. 
	 * 
	 * @type Boolean
	 * @default false
	 */
	closable: false,

	/**
	 * Specifies whether the pane is refreshable.  If so, then
	 * a button is added to the title actions region with
	 * placement=toolbar and buttonType=refresh with the 
	 * button's "onClick" event linked to this title pane's
	 * "refreshPane" function.
	 * @type Boolean
	 * @default false
	 */
	refreshable: false,

	/**
	 * Specifies whether the pane is resizable.  If so, then
	 * a button is added to the title actions region with
	 * placement=toolbar and buttonType=maxRestore with the
	 * button's "onClick" event linked to this title pane's 
	 * "maximizePane" and "restorePane" funtions.
	 * @type Boolean
	 * @default false
	 */
	resizable: false,

	/**
	 * Sets the interval in milliseconds for animating
	 * the resize event if resizable.  If this is set
	 * to zero (0) or a negative number then no 
	 * animation is used. 
	 */
	resizeDuration: 0,

	/**
	 * URL for a help document.  If provided then a button is
	 * added to the title actions with the placement=toolbar
	 * and buttonType=help with the button's "onClick" event
	 * configured to open a new browser window with the 
	 * specified URL. 
	 * 
	 * @type String
	 * @default ""
	 */
	helpURL: "",

	/**
	 * The default action displayMode to be set on buttons for the
	 * default actions such as "closable", "resizable", "helpURL,
	 * and "refreshable".  This can control whether you view buttons
	 * only, buttons and icons or icons only.  You can set the default
	 * display mode globally for the "toolbar" buttons using idx.buttons. 
	 */
	defaultActionDisplay: "",

	/**
	 * Set this to false if you want focus to path straght through to the
	 * child widgets without having keyboard navigation stop at the content
	 * region to allow screan readers to easily read the content.  
	 */
	contentFocus: true,
	
	/**
   	 * Overrides of the base CSS class.
   	 * Prevent the _LayoutWidget from overriding the "baseClass"
   	 * we want "idxHeaderPane".
   	 * @private
   	 * @constant
   	 * @type String
   	 * @default "idxHeaderPane"
   	 */
  baseClass: "idxHeaderPane",


	/**
	 * The html template for the dijit._Templated base class.
	 * @constant
	 * @type String
	 * @private
	 * @default "layout/templates/HeaderPane.html"
	 */
  templateString: templateText,

	/**
	 * Constant to indicate if there is an HTML file with this widget
	 * TODO: SHOULDNT THIS BE SET TO TRUE?
	 * @private
	 * @constant
	 * @type boolean
	 * @default false
	 */
  widgetsInTemplate: false,

	/**
	 * Constructor
	 * Handles the reading any attributes passed via markup.
	 * @param {Object} args
	 * @param {Object} node
	 */
  constructor: function(args, node) {
    this._majorActions      = [ ];
    this._minorActions      = [ ]; 
    this._titleActions      = [ ];
    this._built             = false;
    this._headerPaneStarted = false;
    this._maximizeMixin = new iMaximizeMixin();
  },

  /**
   * postMixinProperties - default behavior
   * @see dijit.layout.ContentPane.postMixinProperties
   */
  postMixInProperties: function() {
    this.inherited(arguments);
  },

  /**
   * Private method to set up contained nodes
   * @private
   */
  _setupNodes: function() {
    if (! this._built) return;
    if (this.isLeftToRight()) {
      this._leftTitleNode	  = this._leadingTitleNode;
      this._rightTitleNode	  = this._trailingTitleNode;
      this._leftActionsNode   = this._leadingActionsNode;
      this._rightActionsNode  = this._trailingActionsNode;
      this._titleNode         = this._leftTitleNode;
      this._titleActionsNode  = this._rightTitleNode;
      this._majorActionsNode  = this._leftActionsNode;
      this._minorActionsNode  = this._rightActionsNode;
    } else {
      this._leftTitleNode	  = this._trailingTitleNode;
      this._rightTitleNode    = this._leadingTitleNode;
      this._leftActionsNode   = this._trailingActionsNode;
      this._rightActionsNode  = this._leadingActionsNode;
      this._titleNode         = this._rightTitleNode;
      this._titleActionsNode  = this._leftTitleNode;
      this._majorActionsNode  = this._rightActionsNode;
      this._minorActionsNode  = this._leftActionsNode;
    }

    dDomClass.add(this._leftTitleNode, this.baseClass + "TitleLeft");
    dDomClass.add(this._rightTitleNode, this.baseClass + "TitleRight");
    dDomClass.add(this._leftActionsNode, this.baseClass + "ActionsLeft");
    dDomClass.add(this._rightActionsNode, this.baseClass + "ActionsRight");
    	
    this._regionLookup = {
      body: this.containerNode,
      titleActions: this._titleActionsNode,
      majorActions: this._majorActionsNode,
      minorActions: this._minorActionsNode
    };

    this._actionsLookup = {
      titleActions: this._titleActions,
      majorActions: this._majorActions,
      minorActions: this._minorActions      
    };

    dDomAttr.set(this._titleNode, {
    	"tabindex": "" + this.tabIndex,
    	"id": this.id + "_Title"
    });
    
    dDomClass.remove(this._titleActionsNode, this.baseClass+"TitleText");
    dDomClass.remove(this._titleNode, this.baseClass+"TitleActions");
    dDomClass.remove(this._majorActionsNode, this.baseClass+"MinorActions");
    dDomClass.remove(this._minorActionsNode, this.baseClass+"MajorActions");

    dDomClass.add(this._titleNode, this.baseClass+"TitleText");
    dDomClass.add(this._titleActionsNode, this.baseClass+"TitleActions");
    dDomClass.add(this._majorActionsNode, this.baseClass+"MajorActions");
    dDomClass.add(this._minorActionsNode, this.baseClass+"MinorActions");

    this._titleNode.innerHTML = this.title;
  },

  /**
   * Private setter of title
   * @param {String} value
   * @private
   */
  _setTitleAttr: function(value) {
    this.title = value;
    this.inherited(arguments);
    if (! this._built) return;
    this._titleNode.innerHTML = this.title;
    
    var contentTitleTemplate = iResources.get("contentTitleTemplate", 
    										  "idx/layout/HeaderPane");
    
    if (! iString.nullTrim(contentTitleTemplate)) {
    	contentTitleTemplate = "${title}";
    }
    
    var contentTitle = dString.substitute(contentTitleTemplate, {title: this.title});
    
    this._contentTitleNode.innerHTML = contentTitle;
    
    this.resize();
  },

  /**
   * Overridden to call setup nodes after calling parent.
   * @see dijit.layout.ContentPane.buildRendering 
   */
  buildRendering: function() {
    // defer to the base function
    this.inherited(arguments);
    this._built = true;
    this._updateActionHiding();
    this._setupNodes();
  },

  /**
   * Private method to handle setting the autoHideActions attribute.
   * @private
   */
  _setAutoHideActionsAttr: function(hide) {
  	this.autoHideActions = hide;
  	this._updateActionHiding();
  },
  
  /**
   * Private method to add or remove the auto hide class. 
   * @private
   */
  _updateActionHiding: function() {
    if (!this._built) return;
    if (this.autoHideActions) {
       dDomClass.add(this.domNode, this.baseClass + "AutoHide");
    } else {
       dDomClass.remove(this.domNode, this.baseClass + "AutoHide");
    }
  },

  /**
   * Call this method to have the HeaderPane adjust its size to what is
   * optimizal to display its content.
   * 
   */
  setOptimalSize: function() {
	  this.borderLayout.setOptimalSize();
  },
  
  /**
   * Private method to handle changes in the "displayMode" attribute
   * and update the default buttons accordingly.
   * @param (String) displayMode
   		*/
  _setDefaultActionDisplayAttr: function(displayMode) {
  	this.defaultActionDisplay = displayMode;
  	if (this._closeButton) {
  		this._closeButton.set("displayMode", this.defaultActionDisplay);
  	}
  	if (this._refreshButton) {
  		this._refreshButton.set("displayMode", this.defaultActionDisplay);
  	}
  	if (this._resizeButton) {
  		this._resizeButton.set("displayMode", this.defaultActionDisplay);
  	}
  	if (this._helpButton) {
  		this._helpButton.set("displayMode", this.defaultActionDisplay);
  	}
	this.resize();
  },
  
  /**
   * Private method to handle setting of the "Closable" attribute.  This
   * method will add or remove the close button depending on the parameter.
   * @param (Boolean) closable -- true if closable, otherwise false 
   * @private
   */		
  _setClosableAttr: function(closable) {
	var oldValue = this.closable;
  	this.closable = closable;
  	if (! this._idxStarted) return; // see note in startup() why not to use this._started
  	if (oldValue == this.closable) return;
  	if (this.closable) {
  		this._createDefaultCloseButton();
  	} else {
  		this._destroyDefaultCloseButton();
  	}
  },
  
  /**
   * Private method to handle setting of the "refreshable" attribute.  This
   * method will add or remove the refresh button depending on the parameter.
   * @param (Boolean) refreshable -- true if refreshable, otherwise false 
   * @private
   * 
   */
  _setRefreshableAttr: function(refreshable) {
  	var oldValue = this.refreshable;
  	this.refreshable = refreshable;
  	if (! this._idxStarted) return; // see note in startup() why not to use this._started
  	if (oldValue == this.refreshable) return;
  	if (this.refreshable) {
  		this._createDefaultRefreshButton();
  	} else {
  		this._destroyDefaultRefreshButton();
  	}
  },
  
  /**
   * Private method to handle setting of the "resizable" attribute.  This
   * method will add or remove the max/restore button depending on the parameter.
   * @param (Boolean) resizable -- true if resizable, otherwise false 
   * @	private
   */		
  _setResizableAttr: function(resizable) {
  	var oldValue = this.resizable;
  	this.resizable = resizable;
  	if (! this._idxStarted) return; // see note in startup() why not to use this._started
  	if (oldValue == this.resizable) return;
  	if (this.resizable) {
  		this._createDefaultResizeButton();
  	} else {
  		this._destroyDefaultResizeButton();
  		if (this._maximized) {
  			this._restorePane();
  		}
  	}
  },
  
  /**
   * Private method to handle setting of the "resizeDuration" attribute.  
   * @param (Number) duration -- the number of milliseconds
   * @private
   */
  _setResizeDurationAttr: function(duration) {
  	this.resizeDuration = duration;
      this._setupMaximizeAnimation();
  },
  
  /**
   * Internal method that should be called whenever the resize duration changes.
   * @private
   */
  _setupMaximizeAnimation: function() {
  	if (this.resizeDuration > 0) {
      	this._maximizeMixin.useAnimation = true;
  		this._maximizeMixin.duration = this.resizeDuration;
  	} else {
      	this._maximizeMixin.useAnimation = false;
  		this._maximizeMixin.duration = 0;
  	}
  },
  
  /**
   * Private method to handle setting of the "helpURL" attribute.  This
   * method will add or remove the help button depending on the parameter.
   * @param (String) helpURL -- The URL to open a page to when clicked.
   * @private
   */
  _setHelpURLAttr: function(url) {
  	var oldValue = this.helpURL;
  	this.helpURL = url;
  	if (! this._idxStarted) return; // see note in startup() why not to use this._started
  	var wasNull = (iString.nullTrim(oldValue) ? false : true);
  	var isNull  = (iString.nullTrim(this.helpURL) ? false : true);
  	if (wasNull == isNull) return;
  	if (! isNull) {
  		this._createDefaultHelpButton();
  	} else {
  		this._destroyDefaultHelpButton();
  	}
  },
  /**
   * Internal method for creating the default close button.
   * @private
   */
  _createDefaultCloseButton: function() {
    if (this._closeButton) return;
    
    this._closeButton = new dButton(
		  { buttonType: "close", placement: "toolbar", region: "titleActions",
			displayMode: this.defaultActionDisplay });
    this._closeConnection = dConnect.connect(this._closeButton, "onClick", this, "_closePane");
	this.addChild(this._closeButton);    	
	 // see note in startup() why not to use this._started
	if (this._idxStarted) this._closeButton.startup();
  },
  
  /**
   * Internal method for destroying the default close button.
   * @private
   */
  _destroyDefaultCloseButton: function() {
  	if (this._closeConnection) {
  		dConnect.disconnect(this._closeConnection);
  		this._closeConnection = null;
  	}
  	if (this._closeButton) {
  		this.removeChild(this._closeButton);
  		this._closeButton.destroy();
  		this._closeButton = null;
  	}
  },

  /**
   * Internal method for destroying the default refresh button.
   * @private
   */
  _createDefaultRefreshButton: function() {
    if (this._refreshButton) return;
	  this._refreshButton = new dButton(
			  { buttonType: "refresh", placement: "toolbar", region: "titleActions",
				displayMode: this.defaultActionDisplay  });
	  this._refreshConnection = dConnect.connect(this._refreshButton, "onClick", this, "refreshPane");
	  this.addChild(this._refreshButton);    	
	  // see note in startup() why not to use this._started
	  if (this._idxStarted) this._refreshButton.startup();
  },
  
  /**
   * Internal method for destroying the default refresh button.
   * @private
   */
  _destroyDefaultRefreshButton: function() {
  	if (this._refreshConnection) {
  		dConnect.disconnect(this._refreshConnection);
  		this._refreshConnection = null;
  	}
  	if (this._refreshButton) {
  		this.removeChild(this._refreshButton);
  		this._refreshButton.destroy();
  		this._refreshButton = null;
  	}
  },

  /**
   * Internal method for creating the default max/restore (resize) button.
   * @private
   */
  _createDefaultResizeButton: function() {
    if (this._resizeButton) return;
	  this._resizeButton = new dButton(
			  { buttonType: "maxRestore", placement: "toolbar", region: "titleActions",
				displayMode: this.defaultActionDisplay  });
	  this._resizeConnection = dConnect.connect(this._resizeButton, "onButtonTypeClick", this, "_resizePane");
	  this.addChild(this._resizeButton);
	  // see note in startup() why not to use this._started
	  if (this._idxStarted) this._resizeButton.startup();
  },
  
  /**
   * Internal method for creating the default max/restore (resize) button.
   * @private
   */
  _destroyDefaultResizeButton: function() {
  	if (this._resizeConnection) {
  		dConnect.disconnect(this._resizeConnection);
  		this._resizeConnection = null;
  	}
  	if (this._resizeButton) {
  		this.removeChild(this._resizeButton);
  		this._resizeButton.destroy();
  		this._resizeButton = null;
  	}
  },
  
  /**
   * Internal method for creating the default max/restore (resize) button.
   * @private
   */
  _createDefaultHelpButton: function() {
	  if (this._helpButton) return;
	  this._helpButton = new dButton(
			  { buttonType: "help", placement: "toolbar", region: "titleActions",
				displayMode: this.defaultActionDisplay  });
	  this._helpConnection = dConnect.connect(this._helpButton, "onClick", this, "_displayHelp");
	  this.addChild(this._helpButton);
	  // see note in startup() why not to use this._started
	  if (this._idxStarted) this._helpButton.startup();
  },
  
  /**
   * Internal method for destroying the defaulthelp button.
   * @private
   */
  _destroyDefaultHelpButton: function() {
  	if (this._helpConnection) {
  		dConnect.disconnect(this._helpConnection);
  		this._helpConnection = null;
  	}
  	if (this._helpButton) {
  		this.removeChild(this._helpButton);
  		this._helpButton.destroy();
  		this._helpButton = null;
  	}
  },
  
  /**
   * postCreate - default behavior
   * @see dijit.layout.ContentPane.postCreate 
   */
  postCreate: function() {
    this.inherited(arguments);
  },

  /**
   * Called at startup to create an idx.border.BorderLayout
   * given the input arguments.
   */
  startup: function() {
	// NOTE: we cannot use a check against this._started here because dijit.layout.ContentPane
	// will execute "delete this._started" with every time content is loaded
    if(this._idxStarted){
    	this.inherited("startup", arguments); // defer to base class
    	return;
    }
    this._idxStarted = true;
    this.borderLayout = new iBorderLayout({
        frameNode: this._frameNode,
        topNode: this._headerNode,
        bottomNode: null,
        leftNode: null,
        rightNode: null,
        centerNode: this.containerNode,
        design: "headline",
        leftToRight: this.isLeftToRight()});

    this.inherited(arguments);

    this._trackMouseState(this._headerNode, "idxHeaderPaneHeader");
    
    dArray.forEach(this.getChildren(), this._setupChild, this);

    // create the default buttons
    if (this.refreshable) {
  	  this._createDefaultRefreshButton();
    }
    if (iString.nullTrim(this.helpURL)) {
  	  this._createDefaultHelpButton();
    }
    if (this.resizable) {
  	  this._createDefaultResizeButton();
    }
    if (this.closable) {
  	  this._createDefaultCloseButton();
    }

    // update the visibility of the action bar
    this._updateActionBarVisibility();
    
    // resize the widget
    this.resize();

    // check if we intercepted the href
    if (this._href) {
       this.set("href", this._href);
    }

    // preload now (from ContentPane)
    if(this._isShown() || this.preload){
      this._onShow();
    }
    
    if (this.autoHeight) {
    	this.borderLayout.setOptimalHeight();
    }
  },

  /**
  * Internal method for removing the defaut buttons to make way for custom buttons.
  * 
  * @private
   */
  _removeDefaultButtons: function(child) {
  	if (this._restoringDefaultButtons) return false;
  	var result = false;
  	if (this._closeButton) {
  		if (child != this._closeButton) {
  			this.removeChild(this._closeButton);
  			result = true;
  		}
  	}
  	if (this._resizeButton) {
  		if (child != this._resizeButton) {
  			this.removeChild(this._resizeButton);
  			result = true;
  		}
  	}
  	if (this._helpButton) {
  		if (child != this._helpButton) {
  			this.removeChild(this._helpButton);
  			result = true;
  		}
  	}
  	if (this._refreshButton) {
  		if (child != this._refreshButton) {
  			this.removeChild(this._refreshButton);
  			result = true;
  		}
  	}
  	return result;
  },
  
  /**
   * Internal method for restoring the default buttons.
   * @private
   */
  _restoreDefaultButtons: function() {
  	if (this._restoringDefaultButtons) return;
  	this._restoringDefaultButtons = true;
  	if (this._refreshButton) {
 			this.addChild(this._refreshButton);
  	}
  	if (this._helpButton) {
 			this.addChild(this._helpButton);
  	}
  	if (this._resizeButton) {
 			this.addChild(this._resizeButton);
  	}
  	if (this._closeButton) {
 			this.addChild(this._closeButton);
  	}
  	this._restoringDefaultButtons = false;
  },
  
  /**
   * Pass through to call the idx.border.BorderLayout 'layout' method
   * @see dijit.layout.ContentPane.layout
   */
  layout: function(){
    this._checkIfSingleChild();
    this.borderLayout.layout();
    this.inherited(arguments);
  },

  /**
   * Extends parent method by adding in a resize after the 
   * child node is added.
   * @param {Object} child
   * @param {int} index
   * @see dijit.TitlePane.addChild
   */
  addChild: function(child, index) {
  	var restoreDefaults = this._removeDefaultButtons(child);
  	if ((!this._isDefaultButton(child)) || (! restoreDefaults)) {
  		this.inherited(arguments);
  	}
  	if (restoreDefaults) this._restoreDefaultButtons(child);
  	this.resize();
  },
  
  /**
   * 
   */
  _setContentFocusAttr: function(value) {
	  this.contentFocus = value;
	  
	  if (this.contentFocus) {
	  		dDomAttr.set(this.containerNode, "tabIndex", "" + this.tabIndex);
	  } else {
	  	// first child can be focused directly -- no need to capture focus
	  	dDomAttr.set(this.containerNode, "tabindex", "-1");
	  }	  
  },
  
  /**
   * Checks if the specified child is one of the default buttons.
   * @param {Object} child
   * 
   */
  _isDefaultButton: function(child) {
  	return ((child == this._closeButton)
  			|| (child == this._resizeButton)
  			|| (child == this._refreshButton)
  			|| (child == this._helpButton));
  },
  
  /**
   * Extends parent method 
   * @param {Object} child
   * @see dijit.layout.ContentPane.addChild
   */
  removeChild: function(child) {
    var index = 0;
    var foundIndex = -1;
    var actions = null;
    
    // check if the child is a major action
    for (index = 0; index < this._majorActions.length; index++) {
      if (child == this._majorActions[index].widget) {
         foundIndex = index;
         actions = this._majorActions;
         break;
      }
    } 

    // if not then check if the child is a minor action
    if (foundIndex < 0) {
       for (index = 0; index < this._minorActions.length; index++) {
         if (child == this._minorActions[index].widget) {
            foundIndex = index;
            actions = this._minorActions;
            break;
         }
       }
    }

    // if not then check if the child is a title action
    if (foundIndex < 0) {
       for (index = 0; index < this._titleActions.length; index++) {
         if (child == this._titleActions[index].widget) {
            foundIndex = index;
            actions = this._titleActions;
            break;
         }
       }
    }

    // check if the instance was found
    if (foundIndex >= 0) {
      var connection = actions[foundIndex].connection;
      if (connection) dConnect.disconnect(connection);         
      
      // remove the element from the array
      actions.splice(foundIndex, 1);
    }
    
    // let the base method remove it
    this.inherited(arguments);
    
    // check if the child is a widget title
    if ((child) && (child == this._enhancedTitle)) {
    	// the widget has already been detached so just set the title to empty-string
    	this._internalSet = true;
      	this.set("title", "");
      	this._internalSet = false;
    }

    // resize
    this.resize();
  },

  /**
   * Private worker to set up specified child 
   * @param {Widget} child
   * @private
   */
  _setupChild: function(/*Widget*/ child) {
    this.inherited(arguments);
    var region  = iString.nullTrim(child.get("region"));
    var actions = null;

    if (region == "title") {
  	  this.set("title", child);
  	  return;
    }

    if ((region == null) || (region.length == 0)) region = "body";

    var node = this._regionLookup[region];
    var actions = this._actionsLookup[region];
    if (node == null) {
      console.log("Child region unrecognized - defaulting to 'body': "
                  + region);
      node = this._regionLookup["body"];
      actions = null;
    }
    
    // check if the widget is already where it belongs
    if (node == this.containerNode) return;

    // otherwise move the widget
    var nodeList = new dQuery.NodeList(child.domNode);
    nodeList.orphan();
    domConstruct.place(child.domNode, node, "last");

    var connection = null;
    if (child.onResize) {
       connection = dConnect.connect(child, "onResize", this, "resize");
    } 
    
    actions.push({widget: child, connection: connection});
    
    // check if we need the second header line
    this._updateActionBarVisibility();
  },

  /**
   * Private method to update the action bar visibility
   * @private
   */
  _updateActionBarVisibility: function() {
    if ((this._majorActions.length + this._minorActions.length) > 0) {
      dDomClass.remove(this._headerActionsNode, this.baseClass+"ActionsHidden");
      dDomClass.remove(this._headerSpacerNode, this.baseClass+"SpacerHidden");
    } else {
      dDomClass.add(this._headerActionsNode, this.baseClass+"ActionsHidden");
      dDomClass.add(this._headerSpacerNode, this.baseClass+"SpacerHidden");
    }
  },

  /**
   * Resize method that extends parent by also sizing the 
   * children as well as calling the contained borderLayout
   * 'layout' method.
   * @param {Object} changeSize
   * @param {Object} resultSize
   * @see dijit.layout.ContentPane.resize
   */
  resize: function(changeSize,resultSize) {
    if (! this._idxStarted) return; // see note in startup() why not to use this._started
    // call the inherited function
    this.inherited(arguments);

    // determine the proper heights for header and actions nodes
    var ltSize = iUtil.getStaticSize(this._leftTitleNode);
    var rtSize = iUtil.getStaticSize(this._rightTitleNode);
    
    var laSize = iUtil.getStaticSize(this._leftActionsNode);
    var raSize = iUtil.getStaticSize(this._rightActionsNode);
    
    var tHeight = ((ltSize.h > rtSize.h) ? ltSize.h : rtSize.h);
  
    var aHeight = ((laSize.h > raSize.h) ? laSize.h : raSize.h);
  
    dDomStyle.set(this._leftTitleNode, {width: ltSize.w + "px", height: ltSize.h + "px"});
    dDomStyle.set(this._rightTitleNode, {width: rtSize.w + "px", height: rtSize.h + "px"});
    dDomStyle.set(this._leftActionsNode, {width: laSize.w + "px", height: laSize.h + "px"});
    dDomStyle.set(this._rightActionsNode, {width: raSize.w + "px", height: raSize.h + "px"});
    
    dDomStyle.set(this._headerTitleNode, {height: tHeight + "px"});
    dDomStyle.set(this._headerActionsNode, {height: aHeight + "px"});

   	this.borderLayout.layout();

    // determine if we have a single child
    if (this._singleChild && this._singleChild.resize) {
        var cb = dDomGeo.getContentBox(this.containerNode);
        // note: if widget has padding this._contentBox will have l and t set,
        // but don't pass them to resize() or it will doubly-offset the child
        this._singleChild.resize({w: cb.w, h: cb.h});
        var child = this.getChildren()[0];
        dDomClass.add(child.domNode, this.baseClass + "-onlyChild");
    }
  },

  /**
   * Returns the children that are in the "titleActions" region.
   * 
   */
  getTitleActionChildren: function() {
  	var result = [ ];
  	for (var index = 0; index < this._titleActions.length; index++) {
  		var action = this._titleActions[index];
  		result.push(action.widget);
  	}
  	return result;
  },
  
  /**
   * Returns the children that are in the "majorActions" region.
   * 
   */
  getMajorActionChildren: function() {
  	var result = [ ];
  	for (var index = 0; index < this._majorActions.length; index++) {
  		var action = this._majorActions[index];
  		result.push(action.widget);
  	}
  	return result;
  },
  
  /**
   * Returns the children that are in the "minorActions" region.
   * 
   */
  getMinorActionChildren: function() {
  	var result = [ ];
  	for (var index = 0; index < this._minorActions.length; index++) {
  		var action = this._minorActions[index];
  		result.push(action.widget);
  	}
  	return result;
  },
  
  
  /**
   * Private onShow callback
   * @private
   * @see dijit.layout.ContentPane._onShow
   */
   _onShow: function() {
      if (!this._idxStarted) return; // see note in startup() why not to use this._started
      this.inherited(arguments);
   },

   /**
    * Private worker to set the Href attr
    * @param {String} href
    * @private
    * @see dijit.layout.ContentPane._setHrefAttr
    */
   _setHrefAttr: function(/*String|Uri*/ href) {
	   if (! this._idxStarted) { // see note in startup() why not to use this._started
		   this._href = href;
           return;
       } else {
    	   this._href = null;
       }
	   if (href == this.href) return;
	   this.inherited(arguments);
   },
   
   /**
    * Allow replacement of the title node.
    * @param {String} name
    * @param {String} value
    */
   set: function(name, value) {
   	// Override default behavior
       if((!this._internalSet) && (name == "title")) {
       	this._setTitleObject(value);
        } else {
           this.inherited(arguments);
        }
   },
   
   /**
    * Allow replacement of the title node.
    * @param {String} name
    * @param {String} value
    */
   get: function(name) {
   	// Override default behavior
       if((!this._internalGet) && (name == "title") && (this._enhancedTitle)) {
       	return this._enhancedTitle;
        } else {
           return this.inherited(arguments);
        }
   },
   
   /**
    * Allow replacement of the title node.
    * @param {Objec} node
    */
   _setTitleObject: function(titleObj) {
	// check if we have existing title widgets
	if (this._enahncedTitle) {
		this.removeChild(this._enhancedTitle);
		if (this._enhancedTitle.destroy) {
			this._enhancedTitle.destroy();
		}
	}
    this._titleNode.innerHTML = "";
	   
   	// check if we have a basic string
   	if (iUtil.typeOfObject(titleObj) != "object") {
			this._internalSet = true;
			this.set("title", "" + titleObj);
			this._internalSet = false;
			this._enhancedTitle = null;
			return;
	}

	// set the enhanced title
	this._enhancedTitle = titleObj;
   	
	// get the node for the title
    var node = null;
    if (titleObj instanceof dWidget) {
    	node = titleObj.domNode;
       	
    } else {
       	node = titleObj;
    }
    // otherwise move the widget
    var nodeList = new dQuery.NodeList(node);
    nodeList.orphan();
    domConstruct.place(node, this._titleNode, "last");
    this.resize();
   },
   
	/**
	 * Closes the pane.
	 * @param {Obkect} e
	 * @private
	 */
	_closePane: function(e) {
		if (e) {
			dEvent.stop(e);
		}
		this.onClose();
		this.destroy();
	},
	
	/**
	 * Connect to this to be alerted to "refresh" button events.
	 */
	onRefresh: function(pane, href, deferred) {
		
	},
	
	/**
	 * Refreshes the pane.
	 * @param {Obkect} e
	 * @private
	 */
	refreshPane: function(e) {
		if (e) {
			dEvent.stop(e);
		}
		var href = this.get("href");
		if (! iString.nullTrim(href)) {
			this.onRefresh(this);
			return;
		}
		var contentBox = dDomGeo.getContentBox(this.containerNode);
		dDomStyle.set(this.containerNode, {height: "" + contentBox.h + "px"});
		this._refreshing = true;
		var result = this.refresh();
		this.onRefresh(this, href, result);
	},
	
	/**
     * Called to handle success when downloading content from the href attribute.
     * @private
	 * 
	 */
	onDownloadEnd: function() {
		this.inherited(arguments);
		this._refreshing = false;
		dDomStyle.set(this.containerNode, {height: null});
		this.resize();
	    if (this.autoHeight) {
	    	this.borderLayout.setOptimalHeight();
	    }		
	},
	
	/**
     * Called to handle errors when downloading content from the href attribute.
     * @private
	 */
	onDownloadError: function() {
		this.inherited(arguments);
		this._refreshing = false;
		dDomStyle.set(this.containerNode, {height: null});
		this.resize();
	    if (this.autoHeight) {
	    	this.borderLayout.setOptimalHeight();
	    } 
	},
	
	/**
	 * Resizes the pane.
	 * @param {Object} e
	 * @param {Object} linkNode
	 * @param {Object} iconNode
	 * @private
	 */
	_resizePane: function(e, buttonTypeState) {
		if (e) {
			dEvent.stop(e);
		}
		switch (buttonTypeState) {
		case "maximize":
			this.maximizePane();
			break;
		case "restore":
			this.restorePane();
			break;
		}
		return false;
	},

	/**
	 * Maximizes this TitlePane to fill its container, typically a parent
	 * or ancestor node.
	 * 
	 * @param container -- The container to fill.
	 */
	maximizePane: function(/*Node*/ container) {
		if (! container) container = this.domNode.parentNode;
		if (! container) return;
		var currentPos = this.domNode.style.position;
		this._restorePosition = (iString.nullTrim(currentPos) ? currentPos : "");
		switch (currentPos) {
		case "absolute":
			// do nothing
			break;
		default:
			dDomStyle.set(this.domNode, {position: "relative"});
		}
		this._maximizeMixin.maximize(this.domNode, container);
		this._maximized = true;
		if (this._resizeButton) {
			this._resizeButton.set("hovering", false);
			this._resizeButton.set("active", false);
		}
		this.onMaximize();
	},
	
	/**
	 * Restores this TitlePane to to its previous size.
	 */
	restorePane: function() {
		if (! this._maximized) return;
		this._maximizeMixin.restore();
		dDomStyle.set(this.domNode, {position: this._restorePosition});
		this._maximized = false;
		if (this._resizeButton) {
			this._resizeButton.set("hovering", false);
			this._resizeButton.set("active", false);
		}
		this.onRestore();
	},
	
	/**
	 * Callback to be called when maximized.
	 */
	onMaximize: function() {
		
	},

	/**
	 * Callback to be called when restored.
	 */
	onRestore: function() {

	},
	
	/**
	 * Opens help document.
	 * @param {Object} e
	 * @private
	 */
	_displayHelp: function(e) {
		// TODO(bcaceres): Update this to publish a message on the bus to see 
		// if there is a widget registered that can handle displaying online help
		// otherwise fallback to just opening a window
		if (e) {
			dEvent.stop(e);
		}
		if (iString.nullTrim(this.helpURL)) {
			if ( (! this._helpWindow) || (this._helpWindow.closed) ) {
				this._openNewHelpWindow();
			} else {
				try {
					this._helpWindow.location.assign(this.helpURL);
					this._helpWindow.focus();
				} catch (err) {
					this._openNewHelpWindow();
				}
			}
		}
	},
	
	/**
	 * Internal method for opening the help window.
	 * @private
	 */
	_openNewHelpWindow: function() {
		if (! iString.nullTrim(this.helpURL)) return;
		this._helpWindow = window.open(this.helpURL, "_blank");
		
		// check if we should discard the help window reference
		// -- do this if we cannot utilize it due to cross-site
		// scripting security measures
		if ((this.helpURL.indexOf("http://") == 0) 
			|| (this.helpURL.indexOf("https://") == 0)) {
			this._helpWindow = null;
		}
	}
   
});

}

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){

	dojo.provide("idx.layout.HeaderPane");
	
	dojo.require("dojo.string");
	dojo.require("idx.ext");
	dojo.require("dijit.layout._LayoutWidget");
	dojo.require("dijit._Templated");
	dojo.require("idx.layout.ContentPane");

	dojo.require("idx.string");
	dojo.require("idx.util");
	dojo.require("idx.border.BorderLayout");
	dojo.require("idx.widget._MaximizeMixin");
	dojo.require("dijit.form.Button");
	dojo.require("dijit.layout.BorderContainer"); // for extending dijit._Widget with "region" 
	dojo.require("dijit._CssStateMixin");
	
	dojo.require("dojo.i18n");
	dojo.require("idx.resources");
	dojo.requireLocalization("idx","base");
	dojo.requireLocalization("idx.layout","base");
	dojo.requireLocalization("idx.layout","HeaderPane");

	var templateTxt = dojo.cache("idx.layout", "templates/HeaderPane.html");

	factory(dojo.declare,				// dDeclare			(dojo/_base/declare)
			idx.layout.ContentPane,		// iContentPane		(./ContentPane)
			dijit.layout._LayoutWidget,	// dLayoutWidget	(dijit/layout/_LayoutWidget)
			dijit._Templated,			// dTemplated		(dijit/_Templated)
			dijit._CssStateMixin,		// dCssStateMixin	(dijit/_CssStateMixin)
			dojo,						// dLang			(dojo/_base/lang)
			dojo,						// dConnect			(dojo/_base/connect)
			{get: dojo.attr, 			// dDomAttr			(dojo/dom-attr) for (dDomAttr.set)
			 set: dojo.attr},			
			{add: dojo.addClass,		// dDomClass		(dojo/dom-class) for (dDomClass.add/remove)
			 remove: dojo.removeClass},	
			dijit._Widget,				// dWidget			(dijit/_Widget)
			dojo,						// dArray 			(dojo/_base/array)
			dojo.string,				// dString			(dojo/string)
			dojo, 						// dQuery			(dojo/query for dojo.nodeList)
			dojo,						// domConstruct		(dojo/dom-construct)
			{set: dojo.style},			// dDomStyle		(dojo/dom-style) for (dDomStyle.set)
			{getContentBox: 			// dDomGeo			(dojo/dom-geometry) for (dDomGeo.getContentBox)
				dojo.contentBox},
			{stop: dojo.stopEvent},		// dEvent			(dojo/_base/event) for (dEvent.stop)
			dijit,						// dRegistry		(dijit/registry)
			dijit.form.Button,  		// dButton			(dijit/form/Button)
			idx.string,					// iString			(../string)
			idx.util,					// iUtil			(../util)
			idx.border.BorderLayout,	// iBorderLayout	(../border/BorderLayout)
			idx.widget._MaximizeMixin,	// iMaximizeMixin 	(../widget/_MaximizeMixin)
			idx.resources,				// iResources		(../resources)
			templateTxt); 				// templateText	(dojo/text!./templates/HeaderPane.html)

} else {
	define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	        "idx/layout/ContentPane",
	        "../../../../dist/lib/dijit/layout/_LayoutWidget",
	        "dijit/_Templated",
	        "dijit/_CssStateMixin",
	        "dojo/_base/lang",
	        "dojo/_base/connect",
	        "dojo/dom-attr",
	        "dojo/dom-class",
	        "dijit/_Widget",
	        "dojo/_base/array",
	        "dojo/string",
	        "dojo/query",
	        "dojo/dom-construct",
	        "dojo/dom-style",
	        "dojo/dom-geometry",
	        "dojo/_base/event",
	        "dijit/registry",
	        "dijit/form/Button",
	        "../string",
	        "../util",
	        "../border/BorderLayout",
	        "../widget/_MaximizeMixin",
	        "../resources",
	        "dojo/text!./templates/HeaderPane.html",
	        "dojo/NodeList-dom",
	        "dijit/layout/BorderContainer"],
	        factory);
}
})();


