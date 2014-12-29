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
				 dWindow,		// (dojo/_base/window)
				 dDomClass,		// (dojo/dom-class) for (dDomClass.add/remove)
				 dDomConstruct,	// (dojo/dom-construct)
				 dDomAttr,		// (dojo/dom-attr) for (dDomAttr.set/remove)
				 dDomStyle,		// (dojo/dom-style) for (dDomStyle.set/getComputedStyle)
				 dDomGeom,		// (dojo/dom-geometry)
				 dXHR,			// (dojo/_base/xhr) for (dXHR.get)
				 iUtil,			// (../util)
				 iString,		// (../string)
				 iBorderDesign,	// (../border/BorderDesign)
				 iBorderLayout,	// (../border/BorderLayout)
				 templateText)	// (dojo/text!./templates/AppMarquee.html)
{
	/**
	 * @name idx.app.AppMarquee
	 * @class AppMarquee repsents the basic "header-type" information for
	 * an application.  For example, for some OS desktops this would be
	 * a "start menu", task bar, tray icons, and clock at the bottom,
	 * while for others it might be a menu bar, tray icons, and clock
	 * at the top.  Applications typically have an area that is similar
	 * where an application logo is displayed and optionally a vendor
	 * logo along with some basic content.
	 * 
	 * CSS Options can control which of the BorderContainer regions
	 * serves as the "marquee" and "body" regions using the following
	 * @augments dijit._Widget
	 * @augments dijit._Templated
	 * @example
	   CSS URL query options: 
	   TODO:  NEED EXAMPLE OF HOW TO USE OPTIONS
	   - app: [ header | top | leader | left | center | trailer | right | footer | bottom ]
	   - vendor: [ header | top | leader | left | center | trailer | right | footer | bottom ]
	   - body: [ header | top | leader | left | center | trailer | right | footer | bottom ]
	   - borderDesign: [see idx.border.BorderDesign ]
	   - fixedSize: [ true | false ]
	   Example usage:
	   &lt;div dojoType="idx.app.AppMarquee" 
	      region="marquee"
	       appName="Your Product Name Here"
	       appLogo="images/header.png"
	       vendorName="IBM &#0174;"
	       vendorLogo="images/ibm-logo-white.gif">

	 */
return dDeclare("idx.app.AppMarquee",[dWidget,dTemplated], 
		/**@lends idx.app.AppMarquee#*/
{
	/**
   	 *  The name of the application.  This is displayed in the "app"
   	 *  region of the marquee, unless an appLogo URL is provided, in
   	 *  which case this becomes the "alternate" text for image for
   	 *  accessibility purposes.
   	 * @type String
   	 */
  appName: "",

	/**
 	 * The URL to the application logo to display in the marquee
 	 * of the page.  This is optional, but if provided is used
 	 * in place of the "appName" in the "app" region of the
 	 * of the marquee.
 	 * @type String
 	 */
  appLogo: "",

  /**
  * The name of the vendor that provides the application.  This is
  * displayed in the vendor region of the marquee, unless
  * a vendorLogo URL is provided, in which case this becomes the
  * "alternate" text for image for accessibility purposes.
  * @type String
  */
  vendorName: "",

  /**
  * The URL to the vendor logo to display in the marquee
  * of the page.  This is optional, but if provided is used
  * in place of the "vendorName" in the "vendor" region of the
  * of the marquee.
  * @type String
  */
  vendorLogo: "",
  
	/**
 	 * Override of the base CSS class, set to "idxAppMarquee".
 	 * This string is used by the template, and gets inserted into
 	 * template to create the CSS class names for this widget.
 	 * @constant
 	 * @private
 	 * @type String
 	 */
  baseClass: "idxAppMarquee",

	/**
	 * The widget template text for the dijit._Templated base class.
	 * @see dijit._Templated
	 * @constant
	 * @type String
	 * @private
	 */
  templateString: templateText,

  /**   
   * Defaults to true -- this enables the ability for the widget
   * to automatically determine certain aspects of its dimensions.
   * Set this to false if you are explicitly setting dimensions via CSS.
   * @type boolean
   * @default true
   */
  autoSizing: true,
  
  /**
   * Set this to true to prefer showing the vendor logo rather than the
   * vendor name if the vendor logo is provided.
   */
  preferVendorLogo: true,
  
  /**
   * Set this to true to prefer showing the application logo rather than
   * the application name if the application logo is provided. 
   */
  preferAppLogo: true,
  
	/**
	 * Constructor
	 * Handles the reading any attributes passed via markup.
	 * @param {Object} args
	 * @param {Object} node
	 */
  constructor: function(args, node) {
      if (node) this.domNode = node; // set this for now
  },
  
  /**
   * Overrides dijit._Templated._fillContent() to ensure that
   * the container node is properly set via CSS options.
   * @see dijit._Templated._fillContent
   * @param {Node} srcNodeRef
   */
  _fillContent: function(/*Node*/srcNodeRef) {
    if (this.isLeftToRight()) {
      this.leaderNode = this.leftNode;
      this.trailerNode = this.rightNode;
    } else {
      this.leaderNode = this.rightNode;
      this.trailerNode = this.leftNode;
    }

    // set the container node
    this.nodeLookup = {
      header: this.headerNode,
      top: this.headerNode,
      left: this.leftNode,
      leader: this.leaderNode,
      center: this.centerNode,
      trailer: this.trailerNode,
      right: this.rightNode,
      footer: this.footerNode,
      bottom: this.footerNode
    };

    var unusedClass = this.baseClass + "Unused";
    
    // mark all nodes unused
    for (node in this.nodeLookup) {
    	dDomClass.add(this.nodeLookup[node], unusedClass);
    }
    // set the app node and vendor node
    this.appNode     = this.nodeLookup[this.cssOptions.app];
    this.vendorNode  = this.nodeLookup[this.cssOptions.vendor];
    this.bodyNode  = this.nodeLookup[this.cssOptions.body];
    
    // in case the CSS is ill-formed, then log that and use defaults
    if (! this.appNode) {
      console.log("Bad region name for 'app' node - defaulting "
                  + "to 'leader': " + this.cssOptions.app);
      this.appNode = this.leaderNode;
    }
    if (! this.vendorNode) {
      console.log("Bad region name for 'vendor' node - defaulting "
                  + "to 'trailer': " + this.cssOptions.vendor);
      this.vendorNode = this.trailerNode;
    }
    if (! this.bodyNode) {
      console.log("Bad region name for 'body' node - defaulting "
                  + "to 'center': " + this.cssOptions.body);
      this.bodyNode = this.centerNode;
    }

    // remove the unused class from used nodes
    if (this.appNode) dDomClass.remove(this.appNode, unusedClass);
    if (this.vendorNode) dDomClass.remove(this.vendorNode, unusedClass);
    if (this.bodyNode) dDomClass.remove(this.bodyNode, unusedClass);
    
    // create the container node within the body
    var divAttrs = { "class": this.baseClass + "Body" };
    this.containerNode = dDomConstruct.create("div", divAttrs, this.bodyNode);
    this.inherited(arguments);
  },

  /**
   * Overridden to obtain CSS options before calling the base implementation.
   * Sets options, design and sizing.
   */
  buildRendering: function() {
    // get the CSS options for this class
    this.cssOptions = iUtil.getCSSOptions(this.baseClass + "Options",
                                          this.domNode);

    // set the default options if no CSS options could be found
    if (! this.cssOptions) {
      console.log("NO CSS OPTIONS FOUND FOR: " + this.baseClass + "Options");
      this.cssOptions = {
        app: "leader",
        vendor: "trailer",
        body: "center",
        borderDesign: "sidebar",
        fixedSize: "false"
      };
    }
    
    // determine the border design
    this.borderDesign = this.cssOptions.borderDesign;
    if (!this.borderDesign) this.borderDesign = "sidebar";
    var bd = iBorderDesign.create(this.borderDesign);
    if (bd == null) {
      console.log("Unrecognized 'borderDesign' CSS option, defaulting to "
                  + "'sidebar': " + this.borderDesign);
      this.borderDesign = new iBorderDesign("sidebar");
    } else {
      this.borderDesign = bd;
    }

    // determine if we have "fixed sizing"
    this.fixedSize = this.cssOptions.fixedSize;
    if (this.fixedSize == null) this.fixedSize = "false";
    if ((this.fixedSize != "true") && (this.fixedSize != "false")) {
      console.log("Unrecognized 'fixedSize' CSS option, defaulting to "
                  + "'false': " + this.fixedSize);
      this.fixedSize = false;
    } else {
      this.fixedSize = (this.fixedSize == "true");
    }

    // call the base function
    this.inherited(arguments);

    // create the app logo node & app name node
    var imgAttrs = { "class": this.baseClass + "AppLogo", 
    				 "id": this.id + "_AppLogo",
    		         "aria-labelledby" : this.id + "_AppName"};
	this.appLogoNode = dDomConstruct.create("img", imgAttrs, this.appNode);
    var divAttrs = { "class": this.baseClass + "AppName", "id": this.id + "_AppName" };
    this.appNameNode = dDomConstruct.create("div", divAttrs, this.appNode);
    this._updateAppDOM(true);
    
    // create the app logo node & app name node
    imgAttrs = { "class": this.baseClass + "VendorLogo", 
    			 "id": this.id + "_VendorLogo",
    		     "aria-labelledby": this.id + "_VendorName"};
	this.vendorLogoNode = dDomConstruct.create("img", imgAttrs, this.vendorNode);
    divAttrs = { "class": this.baseClass + "VendorName", "id": this.id + "_VendorName" };
    this.vendorNameNode = dDomConstruct.create("div", divAttrs, this.vendorNode);
    this._updateVendorDOM(true);
  },
  
  /**
   * postCreate - default behavior
   */
  postCreate: function() {
    this.inherited(arguments);
  },
  
  /**
   * Called at startup to create an border.BorderLayout
   * given the input arguments.
   */
  startup: function() {
    if(this._started){ return; }

    this.borderLayout = new iBorderLayout({
        frameNode: this.domNode,
        topNode: this.headerNode,
        bottomNode: this.footerNode,
        leftNode: this.leftNode,
        rightNode: this.rightNode,
        centerNode: this.centerNode,
        design: this.borderDesign,
        leftToRight: this.isLeftToRight()});

    this.inherited(arguments);

    this.resize();
  },
  
  /**
   * Resize method that extends parent by factoring in space
   * for the name and logo. Calls contained borderLayout
   * 'layout' method.
   */
  resize: function() {
    if (! this._started) {return;}
    
	// check if we are in high-contrast mode
	var body = dWindow.body();
	var highContrast = dDomClass.contains(body, "dijit_a11y");

	// determine the size of the body
	dDomStyle.set(this.bodyNode, { width: "auto", left: "auto", right: "auto", top: "auto", bottom: "auto"});
    var minBodySize = iUtil.getStaticSize(this.containerNode);
    
    var anode = null;
    if (this.appLogo || this.appName) {
    	anode = (this.appLogo && (!highContrast) && (this.preferAppLogo || (!this.appName))) 
    			 ? this.appLogoNode : this.appNameNode;
    }
    var adim = null;
    if (anode) {
      adim = iUtil.fitToWidth(this.appNode, anode);
    }
    
    var vnode = null;
    if (this.vendorLogo || this.vendorName) {
    	vnode = (this.vendorLogo && (!highContrast) && (this.preferVendorLogo || (!this.vendorName)))
    			? this.vendorLogoNode : this.vendorNameNode;
    }
    var vdim = null;
    if (vnode) {
      vdim = iUtil.fitToWidth(this.vendorNode, vnode);
    }
    this.borderLayout.layout();        
    
    // attempt to favor the the body of the marquee over the app name with respect to size
    var marginBox = dDomGeom.getMarginBox(this.containerNode);
	if (marginBox.w < minBodySize.w) {    	
    	var diff = minBodySize.w - marginBox.w;
    	var appSize = dDomGeom.getMarginBox(this.appNode);
    	var newWidth = appSize.w - diff;
    	if (newWidth < 0) newWidth = 0;
    	dDomStyle.set(this.appNode, "width", "" + newWidth + "px");
    	this.borderLayout.layout();
    }
    
    // check if one of the logos is being shown and the loading of the logo is not complete then resize
    if ((this.appLogo && (this.preferAppLogo || (!this.appName)) && (!this.appLogoNode.complete))
            || (this.vendorLogo && (this.preferVendorLogo || (!this.vendorName)) && (!this.vendorLogoNode.complete))) {
    	setTimeout(dLang.hitch(this, this.resize), 500);
    	return;
    }
    
    // (bcaceres): work-around for Firefox not properly displaying marquee content
    if (iUtil.isFF) {   
    	// 2012-01-06 (bcaceres): Firefox 3.6, 7 work-around for RTL mode of AppMarquee
    	// this is the most perplexing FF work-around I have seen.  FF seems to be baffled by
    	// "text-align: left" in RTL mode, so if I change it to "text-align: right" and then
    	// have the browser recompute the style AND use the return value in some way to avoid
    	// optimization of the code, AND then remove the node-specific styling, then FF seems
    	// to behave just fine with "text-align: left", otherwise it shows nothing.  Incidentally,
    	// computing the style on the node BEFORE the change shows a computed value of "start"
    	// for the "text-align" which does not match with the applied CSS classes in current 
    	// themes provided with IDX
    	
    	dDomStyle.set(this.bodyNode, {textAlign: "right"}); // style it for right, regardless
    	var cs = dDomStyle.getComputedStyle(this.bodyNode); // get the computed style, somehow important
    	var x = cs.textAlign + "-ffProblem"; // somehow this matters, perhaps JS optimization?
    	dDomStyle.set(this.bodyNode, {textAlign: null}); // remove the node-specific styling
    }
  },

  /**
   * Worker to set the app logo and call a method to render 
   * it '_renderAppLogo'.
   * @private
   */
  _setAppLogoAttr: function(value) {
	var oldLogo = this.appLogo;
    this.appLogo = iString.nullTrim(value);
    if (!this._started) return;

    this._updateAppDOM(oldLogo != this.appLogo);
  },
  
  /**
   * Worker to set the name attribute and call a method to render 
   * it '_renderAppName'.
   * @private
   */
  _setAppNameAttr: function(value) {
    this.appName = iString.nullTrim(value);
    if (!this._started) return;

    this._updateAppDOM(false);
  },

  /**
   * Handles setting the vendor logo preference attribute.
   */
  _setPreferAppLogoAttr: function(value) {
	this.preferAppLogo = value;
	if (!this._started) return;
	
	this._updateAppDOM(false);
  },

  /**
   * Handles setting the vendor logo attribute.
   */
  _setVendorLogoAttr: function(value) {
	var oldLogo = this.vendorLogo;
    this.vendorLogo = iString.nullTrim(value);
    if (!this._started) return;

    this._updateVendorDOM(oldLogo != this.vendorLogo);
  },

  /**
   * Handles setting the vendor name attribute.
   */
  _setVendorNameAttr: function(value) {
    this.vendorName = iString.nullTrim(value);
    if (!this._started) return;

    this._updateVendorDOM(false);
  },
  
  /**
   * Handles setting the vendor logo preference attribute.
   */
  _setPreferVendorLogoAttr: function(value) {
	this.preferVendorLogo = value;
	if (!this._started) return;
	
	this._updateVendorDOM(false);
  },

  /**
   * Updates the app-related DOM elements when related attributes change.
   */
  _updateAppDOM: function(reloadLogo) {
	  // check the app preference attributes
	  if (this.appLogo && (this.preferAppLogo || (!this.appName))) {
		  dDomClass.add(this.domNode, this.baseClass + "ShowAppLogo");
		  dDomClass.remove(this.domNode, this.baseClass + "ShowAppName");    	
	  } else if (this.appName) {
		  dDomClass.add(this.domNode, this.baseClass + "ShowAppName");
		  dDomClass.remove(this.domNode, this.baseClass + "ShowAppLogo");
	  }
	  
	  if (this.appLogo) {
		  dDomAttr.set(this.appLogoNode, "src", this.appLogo);
	  }
	  if (this.appName) {
	   	this.appNameNode.innerHTML = this.appName;
	   	dDomAttr.set(this.appLogoNode, "alt", this.appName);
	  }
	  if (this.appLogo && reloadLogo) {
        dXHR.get({url: this.appLogo, sync: true, preventCache: false,
      		 handle: dLang.hitch(this, this.resize)});		  
        if( iUtil.isIE == 7) setTimeout(dLang.hitch(this, this.resize), 500); //Delay resize until after image loaded
	  }
	  this.resize();
  },
  
  /**
   * Updates the vendor-related DOM elements when related attributes change.
   */
  _updateVendorDOM: function(reloadLogo) {
	  // check the vendor preference attributes
	  if (this.vendorLogo && (this.preferVendorLogo || (!this.vendorName))) {
		  dDomClass.add(this.domNode, this.baseClass + "ShowVendorLogo");
		  dDomClass.remove(this.domNode, this.baseClass + "ShowVendorName");    	
	  } else if (this.vendorName) {
		  dDomClass.add(this.domNode, this.baseClass + "ShowVendorName");
		  dDomClass.remove(this.domNode, this.baseClass + "ShowVendorLogo");
	  }
	  
	  if (this.vendorLogo) {
	    	dDomAttr.set(this.vendorLogoNode, "src", this.vendorLogo);
	  }
	  if (this.vendorName) {
	   	this.vendorNameNode.innerHTML = this.vendorName;
	   	dDomAttr.set(this.vendorLogoNode, "alt", this.vendorName);
	  }
	  if (this.vendorLogo && reloadLogo) {
        dXHR.get({url: this.vendorLogo, sync: true, preventCache: false,
      		 handle: dLang.hitch(this, this.resize)});
        if( iUtil.isIE == 7) setTimeout(dLang.hitch(this, this.resize), 500); //Delay resize until after image loaded		  
	  }
	  this.resize();
  }
});
}

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){

	dojo.provide("idx.app.AppMarquee");

	dojo.require("dojo.parser");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.require("idx.util");
	dojo.require("idx.string");
	dojo.require("idx.border.BorderLayout");
	dojo.require("idx.border.BorderDesign");
	dojo.require("idx.ext");
	
	var templateTxt = dojo.cache("idx", "app/templates/AppFrame.html");

	factory(dojo.declare,					// dDeclare			(dojo/_base/declare)
			dijit._Widget,					// dWidget			(dijit/_Widget)
			dijit._Templated,				// dTemplated		(dijit/_Templated)
			dojo,							// dLang			(dojo/_base/lang)
			dojo,							// dWindow			(dojo/_base/window)
			{add:      dojo.addClass,		// dDomClass 		(dojo/dom-class) (for dDomClass.add/remove)
			 contains: dojo.hasClass,
			 remove:   dojo.removeClass},	
			dojo,							// dDomConstruct 	(dojo/dom-construct)
			{set: dojo.attr,				// dDomAttr 		(dojo/dom-attr) for (dDomAttr.set/remove)
			 remove: dojo.removeAttr},
			{set: dojo.style,				// dDomStyle 		(dojo/dom-style) for (dDomStyle.set/getComputedStyle)
		     getComputedStyle: 
		    	 dojo.getComputedStyle},
		    { getMarginBox: dojo.marginBox,	// dDomGeom			(dojo/dom-geometry)
		      getContentBox: dojo.contentBox	 
		    },
			{get: dojo.xhrGet}	,			// dXHR 			(dojo/_base/xhr) for (dXHR.get)
			idx.util,						// iUtil 			(../util)
			idx.string,						// iString,			(../string)
			idx.border.BorderDesign,		// iBorderDesign	(../border/BorderDesign)
			idx.border.BorderLayout,		// iBorderLayout	(../border/BorderLayout)
			templateTxt);					// templateText		(dojo/text!./templates/AppMarquee.html)

} else {
	define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	        "../../../lib/dijit/_Widget",
	        "dijit/_Templated",
	        "dojo/_base/lang",
	        "dojo/_base/window",
	        "dojo/dom-class",
	        "dojo/dom-construct",
	        "dojo/dom-attr",
	        "dojo/dom-style",
	        "dojo/dom-geometry",
	        "dojo/_base/xhr",
	        "../util",
	        "../string",
	        "../border/BorderDesign",
	        "../border/BorderLayout",
	        "dojo/text!./templates/AppMarquee.html",
	        "../ext"],
	        factory);
}
})();
