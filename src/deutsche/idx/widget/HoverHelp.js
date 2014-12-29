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
		         dDomAttr,		// (dojo/dom-attr) for (dDomAttr.set/remove)  
		         dConnect,		// (dojo/_base/connect)          
		         iString,		// (../string)
		         iUtil,			// (../util)
		         iResources,	// (../resources)
		         templateText)	// (dojo/text!./templates/HoverHelp.html)   
{
	/**
	 * @name idx.widget.HoverHelp
	 * @class Widget for a help HoverHelp.
	 * @augments dijit._Widget
	 * @augments dijit._Templated
	 * @example
	   Example usage:
	  	&lt;div dojoType="dijit.form.TextBox">&lt;/div>
	  	&lt;div dojoType="idx.widget.HoverHelp" message="Hello, World!"
	    href="http://www.ibm.com">&lt;/div>
	 */
  return dDeclare("idx.widget.HoverHelp",[dWidget,dTemplated],
		  /**@lends idx.widget.HoverHelp#*/	
{ 
  /**
   * This is the HTML message content to display in the popup.  If this is not 
   * specified, the widget attempts to lookup its content in the resources using 
   * the key formed by concatenating messageKeyPrefix, topicID, and 
   * messageKeySuffix.  If no content can be determined then default text is
   * displayed indicating that no help has been defined.
   * @type String
   * @default ""
   */
  message: "",

  /**
   * The URL or path to use for launching a new window with additional help on 
   * the topic.  If this is not privided then an attempt is made to lookup the
   * href in the resources using the key formed by concatenating hrefKeyPrefix, 
   * topicID, and hrefKeySuffix.  If no href can be found, then no link is shown 
   * for additional help.  If provided, a link is displayed using the
   * "moreInfoLabel".
   * @type String
   * @default 
   */
  href: "",

  /**
   * The prefix to prepend to the provided HREF.  Typically this is set through
   * the provided or installed resources, however, it can be overridden here.
   * If this value is not provided the default value will be taken from resources
   * using the "idx.widget.HoverHelp" scope and the "baseHref" key.  The default
   * value for this is empty-string.
   * @type String
   * @default ""
   */
  baseHref: "",

  /**
   * Alternatively to directly specifying the message or the href, the 
   * message ID can be specified in order to trigger lookup of the message in 
   * the provided resources object.  When looking up the message by message ID 
   * the key used for lookup is constructed by concatenating the 
   * messageKeyPrefix, the topicID, and the messageKeySuffix.  When looking up 
   * the href, the key for lookup is constructed by concatenating the
   * hrefKeyPrefix, topicID, and the hrefKeySuffix.  If no topicID is provided 
   * then no such lookups are performed.
   * @type String
   * @default ""
   */
  topicID: "",

  /**
   * This is the text label to give to the link that launches the external help 
   * system in a new window.  If this is not specified during construction, the
   * default is obtained from resources using the "idx.widget.HoverHelp" scope
   * and the "moreInfoLabel" key.  The default text will be something like 
   * "Learn more...".
   * @type String
   * @default ""
   */
  hrefLabel: "",

 /**
   * The prefix to prepend to the topicID to create the key for looking up the
   * message in the resources.  If this value is not provided the default value
   * will be taken from resources using the "idx.widget.HoverHelp" scope and
   * the "messageKeyPrefix" key.  The default value for this is "topic_".
   * @type String
   * @default ""
   */
  messageKeyPrefix: "",

  /**
   * The suffix to append to the topicID to create the key for looking up the 
   * message in the resources.  If this value is not provided the default value
   * will be taken from resources using the "idx.widget.HoverHelp" scope and
   * the "messageKeySuffix" key.  The default value for this is "_message".
   * @type String
   * @default ""
   */
  messageKeySuffix: "",

  /**
   * The prefix to prepend to the topicID to create the key for looking up the
   * href in the resources.  If this value is not provided the default value
   * will be taken from resources using the "idx.widget.HoverHelp" scope and
   * the "hrefKeyPrefix" key.  The default value for this is "topic_".
   * @type String
   * @default ""
   */
  hrefKeyPrefix: "",

  /**
   * The suffix to append to the topicID to create the key for looking up the
   * href in the resources.  If this value is not provided the default value
   * will be taken from resources using the "idx.widget.HoverHelp" scope and
   * the "hrefKeySuffix" key.  The default value for this is "_href".
   * @type String
   * @default ""
   */
  hrefKeySuffix: "",

  /**
   * The resources to use for optionally obtaining the message and href for this
   * instance.  This is also used to obtain the default resources used by this 
   * instance.  If not specified the default resources are pulled from 
   * idx.resources using the "idx.widget.HoverHelp" scope.  Any resources not 
   * overridden fallback to the default resources.
   *
   * The default resources that are used by this include:
   *   - defaultHrefLabel: The label for the href linking to additional information.
   *   - defaultTitle: Default title to use for the button.
   *   - defaultMessage: Text to display when the message has not been defined.
   *   - baseHref: The base Href to prepend to all hrefs provided.
   *
   * Typically, one would specify a resources attribute that defines messages and
   * hrefs for one or more topicIDs and the same object would be shared among 
   * many instances of this widget, with each one pulling its message and href 
   * using a different topicID.
   * @type Object
   * @default null
   */
  resources: null,
  
  /**
   * Set this to true if you want the help message to only open when clicked
   * rather than when hovered.
   */
  clickToOpen: false,
  
  /**
   * The flag indicating if this widget is disabled.
   */
  disabled: false,

	/**
 	 * Overrides of the base CSS class.
 	 * This string is used by the template, and gets inserted into
 	 * template to create the CSS class names for this widget.
 	 * @private
 	 * @constant
 	 * @type String
 	 * @default "idxHoverHelp"
 	 */
  baseClass: "idxHoverHelp",

	/**
	 * The path to the widget template for the dijit._Templated base class.
	 * @constant
	 * @type String
	 * @private
	 * @default templateText value
	 */ 
  templateString: templateText,

	/**
	 * Indicates that there are templates contained within the widget.
	 * @private
	 * @constant
	 * @type boolean
	 * @default true
	 */
  widgetsInTemplate: true,

	/**
	 * Constructor
	 * Handles the reading any attributes passed via markup.
	 * @param {Object} args
	 * @param {Object} node
	 */
  constructor: function(args, node) {
    this._started = false;
    this._built   = false;
  },

  /**
   * Overrides dijit._Widget.postMixInProperties() to ensure
   * that the dijit._Widget.attr() function is called for each
   * property that was set.
   * @see dijit._Widget.postMixInProperties
   */
  postMixInProperties: function() {
	// nullify some fields that were not explicitly set
    iUtil.nullify(this, this.params, 
    		["messageKeyPrefix",
    		 "messageKeySuffix",
    		 "hrefKeyPrefix",
    		 "hrefKeySuffix",
    		 "baseHref",
    		 "title"]);
    
    this.inherited(arguments);
    this._defaultResources 
      = iResources.getResources("idx/widget/HoverHelp", this.lang);
  },

  /**
   * Overridden to update contained entities.
   */
  buildRendering: function() {
    this.inherited(arguments);
    this._built = true;
    this._updateMessage();
    this._updateHref();
    this._updateTitle();
    this._updateHrefLabel();
  },

  /**
   * Private method overridden to set the fill message
   * @see dijit._Widget._fillContent
   * @param {String} source
   * @private
   */
  _fillContent: function(source) {
    this.inherited(arguments);
    this._fillMessage = iString.nullTrim(this.containerNode.innerHTML);
  },


  /**
   * Private worker. Sets the language
   * @param {Object} value
   * @private
   */
  _setLangAttr: function(/*Object*/ value) {
    this.inherited(arguments);
    this.lang = value;
    this._resetResources();
  },

  /**
   * Privte method.  Sets the disabled flag.
   * @param {Boolean} value
   * @private
   */
  _setDisabledAttr: function(/*Boolean*/ value) {
	this.disabled = value;
	this._button.set("disabled", value);
  },
  
  /**
   * Private worker. Handles resetting the saved resources.
   * @param {Object} value
   * @private
   */
  _setResourcesAttr: function(/*Object*/ value) {
    this.resources = value;
    this._resetResources();
  },

  /**
   * Private worker. Resets resources
   * by calling update methods for each.
   * @param {Object} value
   * @private
   */
  _resetResources: function() {
    this._updateMessage();
    this._updateTitle();
    this._updateHref();
    this._updateHrefLabel();
  },

  /**
   * Private convenience method to look up a resource
   * @param {String} key in resource file
   * @returns {String} result (message)
   * @private
   */
  _resourceLookup: function(key) {
    var result = null;
    if (this.resources) result = this.resources[key];
    if (! result) result = this._defaultResources[key];
    return result;
  },

  /**
   * Called at startup to set state and update all the
   * contained resources like the message and href.
   * Also connects the contained dialog's orient method
   * for tooltips.
   */
  startup: function() {
    this.inherited(arguments);
    var buttonOpts = iUtil.getCSSOptions(this.baseClass + "ButtonOptions", this.domNode, this._button);
    if (buttonOpts) {
    	for (field in buttonOpts) {
    		this._button.set(field, buttonOpts[field]);
    	}
    }
    this._started = true;
    this._updateMessage();
    this._updateHref();
    this._updateHrefLabel();
    
    // remove/restore title when help is shown/hidden to avoid double-hover
    dConnect.connect(this._button, "openDropDown", this, this._removeTitle);
    dConnect.connect(this._button, "closeDropDown", this, this._restoreTitle);
    
    // connect for the orentiation callback
    dConnect.connect(this._dialog,"orient",this,this._orient);
  },

  /**
   * Internal method for handling focus events to route to the button.
   * 
   * @private
   */
  _onFocus: function() {
	 if (this._button.focus)  {
		 this._button.focus();
	 } else if (this._button.focusNode) {
		 this._button.focusNode.focus();
	 }
  },
  
  /**
   * Callback to handle the hover event.
   */
  _onHoverMouseOver: function(e) {
	  if (this.clickToOpen) return;
	  if (!this._button._opened) {
		  this._button._onDropDownMouseDown(e);
	  }
  },
  
  /**
   * Calback to handle the hover-ending event. 
   */
  _onHoverMouseOut: function(e) {
	  if (this.clickToOpen) return;
	  if (this._button._opened) {
		  this._button._onDropDownMouseUp(e);
	  }
  },
  
  /**
   * This private method is connected to the TooltipDialog's "orient" method.
   * This allows us to apply an additional CSS class for handling
   * specifics to HoverHelp since "idxHoverHelp" is a peer with the various
   * dijit orientation CSS classes (e.g.: "dijitAbove" or "dijitBelow")
   * @param {Object} node
   * @param {Object} aroundCorner
   * @param {Object} corner
   * @private
   */
  _orient: function(node, aroundCorner, corner) {
	var c = this._currentOrientClass;
	if(c){
		dDomClass.remove(this._dialog.domNode, c);
	}
	c = "idxHoverHelpAB"+(corner.charAt(1) == 'L'?"Left":"Right")+" idxHoverHelp"+(corner.charAt(0) == 'T' ? "Below" : "Above");
	dDomClass.add(this._dialog.domNode, c);
	this._currentOrientClass = c;
  },

  /**
   * Private method that gets the prefix to use when building the message key.
   * @returns {String} msg prefix
   * @private
   */
  _getMessageKeyPrefix : function() {
    if (this.messageKeyPrefix) return this.messageKeyPrefix;
    var prefix = this._resourceLookup("messageKeyPrefix");
    return (prefix) ? prefix : "";
  },


  /**
   * Private method that gets the suffix to use when building the message key.
   * @returns {String} msg suffix
   * @private
   */
  _getMessageKeySuffix : function() {
    if (this.messageKeySuffix) return this.messageKeySuffix;
    var suffix = this._resourceLookup("messageKeySuffix");
    return (suffix) ? suffix : "";
  },

  /**
   * Private method that gets the prefix to use when building the href key.
   * @returns {String} msg prefix
   * @private
   */
  _getHrefKeyPrefix : function() {
    if (this.hrefKeyPrefix) return this.hrefKeyPrefix;
    var prefix = this._resourceLookup("hrefKeyPrefix");
    return (prefix) ? prefix : "";
  },

  /**
   * Private method that gets the suffix to use when building the href key.
   * @returns {String} msg prefix
   * @private
   */
  _getHrefKeySuffix : function() {
    if (this.hrefKeySuffix) return this.hrefKeySuffix;
    var suffix = this._resourceLookup("hrefKeySuffix");
    return (suffix) ? suffix : "";
  },

  /**
   * Private method that attempts to lookup a label for the
   * property name or construct one if it cannot find the lookup value.
   * @private
   * @returns {String} message
   */
  _getMessage: function() {
     // first check if the message is defined
     if (this.message) return this.message;

     var result = null;
     // check if the topic ID is defined
     if (this.topicID) {
       // attempt to lookup the message
       var result = null;
       var prefix = this._getMessageKeyPrefix();
       var suffix = this._getMessageKeySuffix();
       var key = (prefix + this.topicID + suffix);
       result = this._resourceLookup(key);
     }

     // check if we have fill content
     if ((!result) && (this._built)) {
       result = this._fillMessage;
     }
 
     // check if we don't have a label, and if not try to make one
     if (!result) result = this._resourceLookup("defaultMessage");
     
     return (result ? result : "");
  },

  /**
   * Private setter of message
   * @param {String} value
   * @private
   */
  _setMessageAttr: function(value) {
    this.message = value;
    if (this._built) this._messageNode.innerHTML = this._getMessage();
  },


  /**
   * Private setter of message - key prefix
   * @param {String} value
   * @private
   */
  _setMessageKeyPrefixAttr: function(value) {
    this.message = value;
    if (this._built) this._messageNode.innerHTML = this._getMessage();
  },

  /**
   * Private setter of message - key suffix
   * @param {String} value
   * @private
   */
  _setMessageKeySuffixAttr: function(value) {
    this.message = value;
    if (this._built) this._messageNode.innerHTML = this._getMessage();
  },

  /**
   * Private setter of topic ID
   * @param {String} value
   * @private
   */
  _setTopicIDAttr: function(value) {
    this.topicID = value;
    this._updateMessage();
    this._updateHref();
  },

  /**
   * Private setter of title
   * @param {String} value
   * @private
   */
  _setTitleAttr: function(value) {
    this.title = value;
    this._updateTitle();
  },

  /**
   * Private setter of Href
   * @param {String} value
   * @private
   */
  _setHrefAttr: function(value) {
    this.href = value;
    this._updateHref();
  },

  /**
   * Private setter of Href key prefix
   * @param {String} value
   * @private
   */
  _setHrefKeyPrefixAttr: function(value) {
    this.href = value;
    this._updateHref();
  },

  /**
   * Private setter of Href key suffix
   * @param {String} value
   * @private
   */
  _setHrefKeySuffixAttr: function(value) {
    this.href = value;
  },

  /**
   * Private setter of Href label
   * @param {String} value
   * @private
   */
  _setHrefLabelAttr: function(value) {
     this.hrefLabel = value;
     this._updateHrefLabel(); 
  },

  /**
   * Private method to update message node from message
   * @private
   */
  _updateMessage: function() {
    if (!this._built) return;
    this._messageNode.innerHTML = this._getMessage();
  },

  /**
   * Private method to update Href from Href full
   * @private
   */
  _updateHref: function() {
    if (!this._built) return;
    var href = this._getFullHref();
    if (href) {
      dDomClass.remove(this._linkNode, "idxHoverHelpLinkHidden");
      dDomClass.add(this._linkNode, "idxHoverHelpLink");
    } else {
      dDomClass.remove(this._linkNode, "idxHoverHelpLink");
      dDomClass.add(this._linkNode, "idxHoverHelpLinkHidden");
    }
    dDomAttr.set(this._anchorNode, "href", this._getFullHref());
  },

  /**
   * Removes the button title to avoid the double-hover effect when the 
   * button's help is shown.
   */
  _removeTitle: function() {
	 dDomAttr.remove(this._button.titleNode, "title");
  },
  
  /**
   * Restores the button title when the drop down closes to allow screen 
   * readers to leverage the title.
   */
  _restoreTitle: function() {
	 this._updateTitle();
  },
  
  /**
   * Private method to update title 
   * @private
   */
  _updateTitle: function() {
    if (!this._built) return;
    var titleText = this._getTitle();
    this._button.set("label", titleText);
    this._button.set("title", titleText);    
  },

  /**
   * Private method to update Href label 
   * @private
   */
  _updateHrefLabel: function() {
    if (!this._built) return;
    var label = this._getHrefLabel();
    dDomAttr.set(this._anchorNode, "innerHTML", label);
  },

  /**
   * Private method to look up a label for the property
   * name or construct one if it cannot find the lookup value.
   * @private
   * @returns {String} title
   */
  _getTitle: function() {
     if (iString.nullTrim(this.title)) return this.title;
     var result = this._resourceLookup("defaultTitle");
     return (result ? result : "");
  },

  /**
   * Private method to look up the Href full 
   * @private
   * @returns {String} Href full
   */
  _getFullHref: function() {
     var href = this._getHref();
     if (! href) return null;
     return this._getBaseHref() + href;
  },

  /**
   * Private method to look up the Href base 
   * @private
   * @returns {String} Href base
   */
  _getBaseHref: function() {
     if (this.baseHref) return this.baseHref;
     var result = this._resourceLookup("baseHref");
     return (result) ? result : "";
  },

  /**
   * Private method to look up the Href 
   * @private
   * @returns {String} Href
   */
  _getHref: function() {
     var href = iString.nullTrim(this.href);
     if (href) return href;

     // check if the topic ID is defined
     if (!this.topicID) return "";

     // attempt to lookup the message
     var result = null;
     var prefix = this._getHrefKeyPrefix();
     var suffix = this._getHrefKeySuffix();
     var key = (prefix + this.topicID + suffix);
     result = this._resourceLookup(key);
     
     return iString.nullTrim(result);
  },

  /**
   * Private method to look up the Href label 
   * @private
   * @returns {String} Href label
   */
  _getHrefLabel: function() {
    if (this.hrefLabel) return this.hrefLabel;
    var result = this._resourceLookup("defaultHrefLabel");
    return (result) ? result : "";
  }


});
}

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){

	dojo.provide("idx.widget.HoverHelp"); 

	dojo.require("dijit._Widget"); 
	dojo.require("dijit._Templated"); 

	dojo.require("idx.resources"); 
	dojo.require("idx.util"); 
	dojo.require("idx.string"); 
	dojo.require("idx.form.buttons"); 
	dojo.require("idx.ext"); 

	dojo.require("dijit.TooltipDialog"); 
	dojo.require("dijit.form.DropDownButton"); 
	dojo.requireLocalization("idx","base"); 
	dojo.requireLocalization("idx.widget","base"); 
	dojo.requireLocalization("idx.widget","HoverHelp"); 

	var templateText = dojo.cache("idx.widget", "templates/HoverHelp.html");

	factory(dojo.declare,				// dDeclare			(dojo/_base/declare)
			dijit._Widget,				// dWidget			(dijit/_Widget)
			dijit._Templated,			// dTemplated		(dijit/_Templated)
			dojo, 						// dLang   			(dojo/_base/lang)
			{add: dojo.addClass,		// dDomClass 		(dojo/dom-class) + (dDomClass.add/remove)
			 remove: dojo.removeClass},
			{remove: dojo.attr, 		// dDomAttr 		(dojo/dom-attr) + (dDomAttr.remove/set)
			 set: dojo.attr},
			dojo, 						// dConnect			(dojo/_base/connect)
			idx.string,					// iString			(../string)
			idx.util,					// iUtil			(../util)
			idx.resources,				// iResources		(../resources)
			templateText);				// (dojo/text!./templates/HoverHelp.html)
} else {
	define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	        "../../../lib/dijit/_Widget",
	        "dijit/_Templated",
	        "dojo/_base/lang",
	        "dojo/dom-class",
	        "dojo/dom-attr",
	        "dojo/_base/connect",
	        "../string",
	        "../util",
	        "../resources",
	        "dojo/text!./templates/HoverHelp.html",
	        "dijit/form/DropDownButton",
	        "dijit/TooltipDialog",
	        "../ext",
	        "dojo/i18n!../nls/base",
	        "dojo/i18n!./nls/base",
	        "dojo/i18n!./nls/HoverHelp"
	        ],
	        factory);
}  	
})();
