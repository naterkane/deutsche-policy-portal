/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

(function() 
 {
function factory(dDeclare,		// (dojo/_base/declare)
				 dLayoutWidget,	// (dijit/layout/_LayoutWidget)
				 dTemplated,	// (dijit/_Templated)
				 dLang,			// (dojo/_base/lang)
				 dArray,        // (dojo/_base/array)    
				 dQuery,		// (dojo/query) + (dojo/NodeList-dom) for (dQuery.NodeList) 
				 dConstruct,    // (dojo/dom-construct)  
				 dDomClass,		// (dojo/dom-class) for (dDomClass.add/remove)
				 dConnect,		// (dojo/_base/connect)
				 iString,		// (../string)
				 templateText)	// (dojo/text!./templates/ButtonBar.html)   
{
	var dNodeList = dQuery.NodeList;
	/**
	 * @name idx.layout.ButtonBar
	 * @class  Button Bar Widget.
	 * Provides a button bar where buttons can be added to a "primary"
	 * and/or "secondary" region.  The added buttons inherit the "placement"
	 * value of "primary" or "secondary.  Currently ButtonBar does not have
	 * a "toolbar" region for a toolbar styling.
	 * 
	 * @augments dijit._LayoutWidget
	 * @augments dijit._Templated
	 */
  return dDeclare("idx.layout.ButtonBar",[dLayoutWidget,dTemplated], 
		  /**@lends idx.layout.ButtonBar#*/			  
{

  /**
   * The default region to place buttons that have no specified region. 
   * This can be either "primary" or "secondary".
   * @type String
   * @default "primary"
   */
  defaultRegion: "primary",

  /*
   * The alignment indicates the positioning of the primary buttons (either in
   * in the "leading" or "trailing" position).  Whether the leading position is
   * on the left or the right depends on the BiDi state.  Settings this attribute
   * to an unrecognized value will cause it to default to "leading".  This is also
   * changes the order in which the buttons are added.
   * @type String
   * @default "leading" 
   */
  alignment: "leading",
  
	/**
 	 * Overrides of the base CSS class.
 	 * This string is used by the template, and gets inserted into
 	 * template to create the CSS class names for this widget.
 	 * @private
 	 * @constant
 	 * @type String
 	 * @default "idxButtonBar"
 	 */
  baseClass: "idxButtonBar",

  /**
   * The CSS class applied as the first class to the container for the primary
   * buttons.
   * @type String
   * @default "secondary"   
   */
  secondaryClass: "secondary",

  /*
   * The CSS class applied as the first class to the container for the secondary
   * buttons.
   * @type String
   * @default "primary"   
   */
  primaryClass: "primary",

  /**
   * Indicates whether or not the button bar should be sensitive
   * to the direction of the widget.  In many themes, the button
   * bar uses an "inline" layout which means the "leadingNode" and
   * "trailingNode" automatically align themselves properly for
   * right-to-left or left-to-right display.  However, if the 
   * ButtonBar is not "inline" in some themes, then it may be 
   * neccessary to flip the meaning of "leading" and "trailing"
   * if a right-to-left direction is detected.
   */
  directionSensitive: false,
  
  	/**
 	 * The widget text for the dijit._Templated base class.
 	 * @constant
 	 * @type String
 	 * @private
 	 * @default "layout/templates/ButtonBar.html"
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
    // get the CSS options for this class
    this._secondaryButtons = [ ];
    this._primaryButtons   = [ ]; 
    this._secondarySpacers = [ ];
    this._primarySpacers   = [ ]; 
    this._connections      = { };
    this._built            = false;
    this._started          = false;
  },
  
  /**
   * Overrides dijit._Widget.postMixInProperties() to ensure
   * that the dijit._Widget.attr() function is called for each
   * property that was set.
   * @see dijit._Widget.postMixInProperties
   */
  postMixInProperties: function() {
    this.inherited(arguments);
  },
 
  /**
   * Overridden to set state and setup nodes 
   * @see dijit._Widget.buildRendering
   */
  buildRendering: function() {
    // defer to the base function
    this.inherited(arguments);
    this._built = true;
    this._setupNodes();
  },

  /**
   * postCreate - default behavior
   * @see dijit._Widget.postCreate
   */
  postCreate: function() {
    this.inherited(arguments);
  },

  /**
   * Private method to set up contained nodes
   * @private
   */
  _setupNodes: function() {
    if (! this._built) return;
    if (this.directionSensitive && (!this.isLeftToRight())) {
        this._leaderNode = this.trailingNode;
        this._trailerNode = this.leadingNode;
    } else {
        this._leaderNode = this.leadingNode;
        this._trailerNode = this.trailingNode;
    }

    this._primaryNode = ((this._alignLeading) 
                         ? this._leaderNode : this._trailerNode);
    this._secondaryNode = ((this._alignLeading) 
                           ? this._trailerNode : this._leaderNode);

    dDomClass.remove(this._primaryNode, this.baseClass+"Secondary");
    dDomClass.remove(this._secondaryNode, this.baseClass+"Primary");

    dDomClass.add(this._primaryNode, this.baseClass+"Primary");
    dDomClass.add(this._secondaryNode, this.baseClass+"Secondary");
   
    this._fillPosition = ((this._alignLeading) ? "last" : "first");
  },
  
  /**
   * Called at startup to set state, init children and resize when done.
   * @see dijit._Widget.startup
   */
  startup: function() {
    if(this._started){ return; }

    this.inherited(arguments);

    // setup each child
    dArray.forEach(this.getChildren(), this._setupChild, this);

    this._started = true;

    // resize the widget
    this.resize();
  },

  /**
   * Pass through parent layout method
   * @see dijit._Widget.layout
   */
  layout: function(){
    this.inherited(arguments);    
  },

  /**
   * This function is called whenever any one of the buttons contained within is clicked. 
   */
  onAnyClick: function(button,event) {
	  // connect to this to be notified of click events
  },
  
  /**
   * Specializes parent method by calling resize afterwards.
   * @param {Widget} child
   * @param {int} index
   * @see dijit._Widget.addChild
   */
  addChild: function(child, index) {
    this.inherited(arguments);
    this.resize();
  },

  /**
   * Specializes parent method by searching through
   * primary and secondary buttons to find the button
   * of interest for removal.
   * @param {Widget} child
   * @see dijit._Widget.removeChild
   */
  removeChild: function(child) {
    var index = 0;
    var foundIndex = -1;
    var buttons = null;
    var spacers = null;
    
    // check if the child is a primary button
    for (index = 0; index < this._primaryButtons.length; index++) {
      if (child == this._primaryButtons[index]) {
         foundIndex = index;
         buttons = this._primaryButtons;
         spacers = this._primarySpacers;

         break;
      }
    } 

    // if not then check if the child is a secondary button
    if (foundIndex < 0) {
       for (index = 0; index < this._secondaryButtons.length; index++) {
         if (child == this._secondaryButtons[index]) {
            foundIndex = index;
            buttons = this._secondaryButtons;
            spacers = this._secondarySpacers;
            break;
         }
       }
    }

    // check if the instance was found
    if (foundIndex >= 0) {
      // remove the element from the array
      buttons.splice(foundIndex, 1);

      // destroy the corresponding spacer
      if ((foundIndex <= (buttons.length - 1)) 
          && (foundIndex < spacers.length)) {

        dConstruct.destroy(spacers[foundIndex]);
      }
    }

    if (child.onClick) {
    	var connection = this._connections[child.id];
    	if (connection) {
    		dConnect.disconnect(connection);
    	}
    	delete this._connections[child.id];
    }
    // let the base method remove it
    this.inherited(arguments);
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
    var node    = null;
    var buttons = null;
    var spacers = null;    

    // check if region was not recognized
    if ((region != "secondary") && (region != "primary")) {
      if (region) {
          console.log("Child region unrecognized - defaulted to '" 
                      + this.defaultRegion + "': " + region);
      }
      region = this.defaultRegion; 
    }

    // determine where it goes
    if (region == "secondary") {
      node = this._secondaryNode;
      buttons  = this._secondaryButtons;
      spacers  = this._secondarySpacers;
    } else if (region == "primary") {
      node = this._primaryNode;
      buttons  = this._primaryButtons;
      spacers  = this._primarySpacers;
    }

    // if this is not the first, then add the spacer first
    if (buttons.length > 0) {
      var spacer = dConstruct.create(
        "div", {"class":this.baseClass+"Spacer"}, node, this._fillPosition);
      spacers.push(spacer);
    }

    var nodeList = new dNodeList(child.domNode);
    nodeList.orphan();
    dConstruct.place(child.domNode, node, this._fillPosition);
    buttons.push(child);
    child.set("placement", region);

    if ((this._primaryButtons.length > 0) 
        && (this._secondaryButtons.length > 0)) {
      dDomClass.remove(this.separatorNode, this.baseClass+"SeparatorHidden");
    } else {
      dDomClass.add(this.separatorNode, this.baseClass+"SeparatorHidden");
    }
    if (child.onClick) {
    	var connection = dConnect.connect(child, "onClick", null, dLang.hitch(this, "onAnyClick", child));
    	this._connections[child.id] = connection;
    }
  },

  /**
   * Custom setter for "alignment" to force "leading" for any unrecognized value.
   * @private
   */
  _setAlignmentAttr: function(value) {
     this.alignment = ((value == "trailing") ? value : "leading");
     this._alignLeading = (this.alignment == "leading");
     this._alignTrailing = (this.alignment == "trailing");
     this._setupNodes();
  },

  /**
   * Custom setter for "defaultRegion" to force "primary" for any unrecognized 
   * value.
   * @private
   */
  _setDefaultRegionAttr: function(value) {
     this.defaultRegion = ((value == "secondary") ? value : "primary");
     this._setupNodes();
  }

});
}

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){

	dojo.provide("idx.layout.ButtonBar");        

	dojo.require("idx.ext");
	dojo.require("idx.util");
	dojo.require("idx.string");
	dojo.require("dijit.layout._LayoutWidget");  
	dojo.require("dijit._Templated");

	var templateText = dojo.cache("idx.layout", "templates/ButtonBar.html");
	factory(dojo.declare,				// dDeclare			(dojo/_base/declare)
			dijit.layout._LayoutWidget,	// dLayoutWidget	(dijit/layout/_LayoutWidget)
			dijit._Templated,			// dTemplated		(dijit/_Templated)
			dojo,          	 			// dLang   	  		(dojo/_base/lang)
			dojo,           		 	// dArray     	  	(dojo/_base/array) 
			dojo,	 				 	// dQuery	  		(dojo/query) + (dojo/NodeList-dom) for (dQuery.NodeList)
			dojo,            			// dConstruct   	(dojo/dom-construct)    
			{add: dojo.addClass,   		// dDomClass 	  	(dojo/dom-class) for (dDomClass.add/remove)
			 remove: dojo.removeClass},
			dojo,
			idx.string,     			// iString      (idx/string)
			templateText); 				// (dojo/text!./templates/ButtonBar.html)
} else {
	define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	        "../../../../dist/lib/dijit/layout/_LayoutWidget",
	        "dijit/_Templated",
	        "dojo/_base/lang",
            "dojo/_base/array",   
            "dojo/query",
            "dojo/dom-construct", 
	        "dojo/dom-class",
	        "dojo/_base/connect",
	        "../string",
	        "dojo/text!./templates/ButtonBar.html",
            "dojo/NodeList-dom"],
            factory);
}  	
})();

