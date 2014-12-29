/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

(function() {
function factory(dLang,			// (dojo/_base/lang)
				 iMain,			// (idx)
				 dDomClass, 	// (dojo/dom-class) for (dDomClass.add/remove)
				 dWidget,		// (dijit/_WidgetBase)
				 dijitMgr,		// (dijit/_base/manager)
				 iString,		// (idx/string)
				 iUtil) 		// (idx/util)
{
	var iWidgets = dLang.getObject("widgets", true, iMain);
	
	dLang.extend(dWidget, {	
	/**
	 * Used for when the the default dijit base class needs to be left 
	 * unmodified, but a child widget or extension needs its a separate
	 * base class with an "idx" prefix. 
	 */
	idxBaseClass: "",
	
	/**
	 * The explicit CSS class to be used for finding the CSS defaults for
	 * the widget.
	 */
	idxDefaultsClass: "",
	
	/**
	 * The child class to be applied to children.  This
	 * should not contain spaces or commas and should be
	 * a single CSS class. 
	 */
	idxChildClass: "",

	/**
	 * The arguments to directly mixin.  This allows you to specify references
	 * to other objects for string properties if you like.  These will get
	 * automatically mixed through the postMixInProperties() implementation, 
	 * so if you override that function make sure to call the inherited 
	 * version before doing other work.
	 * @type Object
	 * @default null
	 */
	mixinArgs: null,
	
	/**
	 * 
	 */
	idxBeforePostMixInProperties: function() {
		// store the original mixin args
		var origMixInArgs = this.mixinArgs;
		
	    // we use a while loop in case the mixin args contain another "mixinArgs"
	    // in such a case there may be a nested mixinArgs 
	    while (this.mixinArgs != null) {
	    	// copy the reference
	    	var args = this.mixinArgs;

	    	// clear the reference
	    	this.mixinArgs = null;

	    	// perform the mixin
	    	dLang.mixin(this, args);
	    	if (! this.params) this.params = {};
	    	dLang.mixin(this.params, args); 
	    }
	     
	    // reset the mixin args back to original settings
	    this.mixinArgs = origMixInArgs;
	    if (this.params) {
	    	this.params.mixinArgs = origMixInArgs;
	    } else {
	    	this.params = { mixinArgs: origMixInArgs };
	    }		
	},
	
	/**
	 * 
	 */
	idxAfterPostMixInProperties: function() {
		// do nothing
	},
	
	/**
	 * 
	 */
	idxBeforeBuildRendering: function() {
		// do nothing
	},
	
	/**
	 * 
	 */
	idxAfterBuildRendering: function() {
		// apply the IDX base class
		if ((this.domNode) && (iString.nullTrim(this.idxBaseClass))) {
			dDomClass.add(this.domNode, this.idxBaseClass);
		}		
	},
	
	/**
	 * 
	 */
	idxBeforePostCreate: function() {
		// do nothing
	},
	
	/**
	 * 
	 */
	idxAfterPostCreate: function() {
		// do nothing
	},
	
	/**
	 * 
	 */
	idxBeforeStartup: function() {
		// do nothing
	},
	
	/**
	 * 
	 */
	idxAfterStartup: function() {
    	var children = this.getChildren();
		
    	// get child nodes that are part of this widget and style them
    	if ((this.domNode) && (iString.nullTrim(this.idxChildClass))) {
    		this._idxStyleChildNodes(this.idxChildClass, this.domNode);
    	}
		
    	// now style the children
    	this._idxStyleChildren();
    },
	
	_idxWidgetPostMixInProperties: function() {
		// ensure we don't clobber the postMixInProperties() function
		if (! ("_idxWidgetOrigPostMixInProperties" in this)) return;
		if (! this._idxWidgetOrigPostMixInProperties) return;
		
		// restore the postMixInProperties() function to its original state
		this.postMixInProperties = this._idxWidgetOrigPostMixInProperties;
		
	    // call the "before" function
	    this.idxBeforePostMixInProperties();
	    
		// proceed with normal postMixInProperties()
		this.postMixInProperties();
		
	    // call the "after" function
	    this.idxAfterPostMixInProperties();
	},
	
	_idxWidgetBuildRendering: function() {
		// ensure we don't clobber the postMixInProperties() function
		if (! ("_idxWidgetOrigBuildRendering" in this)) return;
		if (! this._idxWidgetOrigBuildRendering) return;
		
		// restore the buildRendering() function to its original state
		this.buildRendering = this._idxWidgetOrigBuildRendering;
		
		// call the "before" function
		this.idxBeforeBuildRendering();
		
		// proceed with normal buildRendering()
		this.buildRendering();
		
		// call the "after" function
		this.idxAfterBuildRendering();
	},
	
	_idxWidgetPostCreate: function() {
		// ensure we don't clobber the startup() function
		if (! ("_idxWidgetOrigPostCreate" in this)) return;
		if (! this._idxWidgetOrigPostCreate) return;
		
		// restore the startup() function to its original state
		this.postCreate = this._idxWidgetOrigPostCreate;
		
		// call the before function
		this.idxBeforePostCreate();
		
		// proceed with normal startup
		this.postCreate();
		
		// call the after function
		this.idxAfterPostCreate();
	},
	
	_idxWidgetStartup: function() {
		// ensure we don't clobber the startup() function
		if (! ("_idxWidgetOrigStartup" in this)) return;
		if (! this._idxWidgetOrigStartup) return;
		
		// restore the startup() function to its original state
		this.startup = this._idxWidgetOrigStartup;
		
		// call the before function
		this.idxBeforeStartup();
		
		// proceed with normal startup
		this.startup();
		
		// call the after function
		this.idxAfterStartup();
	},
	
	/**
	 * The function for applying classes to the child widgets if the
	 * idxChildClass attribute is non-empty.
	 */
	_idxStyleChildren: function() {
		if (! iString.nullTrim(this.idxChildClass)) return;
		if (! iString.nullTrim(this.baseClass)) return;

		// find all children that were previously styled
		var prevChildren = this._idxPrevStyledChildren;
		if ((prevChildren) && (prevChildren.length > 0)) {
			var childBase = this._idxPrevChildBase;
			var childClass = childBase + "-idxChild";
			var firstChildClass = childBase + "-idxFirstChild";
			var midChildClass = childBase + "-idxMiddleChild";
			var lastChildClass = childBase + "-idxLastChild";
			var onlyChildClass = childBase + "-idxOnlyChild";
			
			// loop through the previously styled children
			for (var index = 0; index < prevChildren.length; index++) {
				var child = prevChildren[index];
				
				if (! child.domNode) continue;
				if (child._idxUnstyleChildNodes) {
					child._idxUnstyleChildNodes(child.domNode, childBase);
				} else {
					dRemoveClass(child.domNode, childClass);
					dRemoveClass(child.domNode, firstChildClass);
					dRemoveClass(child.domNode, midChildClass);
					dRemoveClass(child.domNode, lastChildClass);
					dRemoveClass(child.domNode, onlyChildClass);
				}
			}
		}
		
		// clear the previous settings
		this._idxPrevStyledChildren = null;
		this._idxPrevChildBase = null;
		
		
		// get the children currently in the container node in order
		var index = 0;
		var children = this.getChildren();
    	if ((children) && (children.length > 0)) {
    		// create the prefix for the child class
    		var childBase = this.baseClass + "-" + this.idxChildClass;
    		var childClass = childBase + "-idxChild";
    		var firstChildClass = childBase + "-idxFirstChild";
    		var midChildClass = childBase + "-idxMiddleChild";
    		var lastChildClass = childBase + "-idxLastChild";
    		var onlyChildClass = childBase + "-idxOnlyChild";
    		
    		// set up the variables for next time to unstyle
    		this._idxPrevStyledChildren = [ ];
    		this._idxPrevChildBase = childBase;

    		// setup the classes
    		for (index = 0; index < children.length; index++) {
    			var child = children[index];
			
    			// check for a dom node
    			if (! child.domNode) continue;
    			this._idxPrevStyledChildren.push(child);
    			
    			// add the appropriate classes to the children
    			if (child._idxStyleChildNodes) child._idxStyleChildNodes(childClass, child.domNode);
    			else dDomClass.add(child.domNode, childClass);

    			if (index == 0) {
    				if (child._idxStyleChildNodes) child._idxStyleChildNodes(firstChildClass, child.domNode);
    				else dDomClass.add(child.domNode, firstChildClass); 
    			}

    			if ((index > 0) && (index < (children.length - 1))) {
    				if (child._idxStyleChildNodes) child._idxStyleChildNodes(midChildClass, child.domNode);
    				else dDomClass.add(child.domNode, midChildClass);
    			}

    			if (index == (children.length - 1)) {
    				if (child._idxStyleChildNodes) child._idxStyleChildNodes(lastChildClass, child.domNode);
    				else dDomClass.add(child.domNode, lastChildClass);
    			}

    			if (children.length == 1) {
    				if (child._idxStyleChildNodes) child._idxStyleChildNodes(onlyChildClass, child.domNode);
    				else dDomClass.add(child.domNode, onlyChildClass);
    			}
    			
    		}
    	}
    	
	},
	
	/**
	 * 
	 */
	_idxUnstyleChildNodes: function(rootNode, childBase) {
		if (!rootNode) rootNode = this.domNode;
		if (!rootNode) return;
		
		var childClass = childBase + "-idxChild";
		var firstChildClass = childBase + "-idxFirstChild";
		var midChildClass = childBase + "-idxMiddleChild";
		var lastChildClass = childBase + "-idxLastChild";
		var onlyChildClass = childBase + "-idxOnlyChild";
		
		dRemoveClass(rootNode, childClass);
		dRemoveClass(rootNode, firstChildClass);
		dRemoveClass(rootNode, midChildClass);
		dRemoveClass(rootNode, lastChildClass);
		dRemoveClass(rootNode, onlyChildClass);
		
		var childNodes = rootNode.childNodes;
		if (!childNodes) return;
		for (var index = 0; index < childNodes.length; index++) {
			var childNode = childNodes[index];
			if (dijitMgr.getEnclosingWidget(childNode) == this) {
				this._idxUnstyleChildNodes(childNode, childBase);
			}
		}
	},
	
	/**
	 * 
	 */
	_idxStyleChildNodes: function(childClass, rootNode) {
		if (!rootNode) rootNode = this.domNode;
		if (!rootNode) return;
		dDomClass.add(rootNode, childClass);
		var childNodes = rootNode.childNodes;
		if (!childNodes) return;
		for (var index = 0; index < childNodes.length; index++) {
			var childNode = childNodes[index];
			if (childNode.nodeType != 1) continue;
			if (dijitMgr.getEnclosingWidget(childNode) == this) {
				this._idxStyleChildNodes(childClass, childNode);
			}
		}
	}
	
	});

	// get the base prototype
    var widgetProto  = dWidget.prototype;
    
	// 
	// Get the base functions so we can call them from our overrides
	//
	var baseCreate = widgetProto.create;

	/**
	 * Overrides dijit._Widget.postCreate() to perform argument mixin.
	 */
	widgetProto.create = function(params,srcNodeRef) {
		var defaultsBase = "";
		var needsSuffix  = false;
		if (params) {
			if (params.idxDefaultsClass) {
				defaultsBase = params.idxDefaultsClass;
				defaultsBase = iString.nullTrim(defaultsBase);
				needsSuffix = false;
			}
			if ((! defaultsBase) && params.idxBaseClass) {
				defaultsBase = params.idxBaseClass;
				defaultsBase = iString.nullTrim(defaultsBase);
				needsSuffix = true;
			}
			if ((! defaultsBase) && params.baseClass) {
				defaultsBase = params.baseClass;
				defaultsBase = iString.nullTrim(defaultsBase);
				needsSuffix = true;
			}
		}
		if (! defaultsBase) {
			defaultsBase = iString.nullTrim(this.idxDefaultsClass);
			needsSuffix = false;
		}
		if (! defaultsBase) {
			defaultsBase = iString.nullTrim(this.idxBaseClass);
			needsSuffix = true;
		}
		if (! defaultsBase) {
			defaultsBase = iString.nullTrim(this.baseClass);
			needsSuffix = true;
		}
		if ((defaultsBase) && (srcNodeRef)) {
			// check if we need a suffix
			if (needsSuffix) defaultsBase = defaultsBase + "_idxDefaults";
			// get the CSS defaults - make sure to pass in a DOM node and not just an id
			var cssDefaults = iUtil.getCSSOptions(defaultsBase, dojo.byId(srcNodeRef), this);
			if (cssDefaults != null) {
				for (var field in cssDefaults) {
					if (! (field in params)) {
						params[field] = cssDefaults[field];
					}
				}
			}
		}
		
		// override the buildRendering function 
		if (! this._idxWidgetOrigBuildRendering) {
			this._idxWidgetOrigBuildRendering = this.buildRendering;
		}
		this.buildRendering = this._idxWidgetBuildRendering;			
		
		// override the postMixInProperties function
		if (! this._idxWidgetOrigPostMixInProperties) {
			this._idxWidgetOrigPostMixInProperties = this.postMixInProperties;
		}
		// replace the postMixInProperties() function temporarily
		this.postMixInProperties = this._idxWidgetPostMixInProperties;
		
		// override the post-create function
		if (! this._idxWidgetOrigPostCreate) {
			this._idxWidgetOrigPostCreate = this.postCreate;
		}
		// replace the postCreate() function temporarily
		this.postCreate = this._idxWidgetPostCreate;
		
		// override the startup function
		if (! this._idxWidgetOrigStartup) {
			this._idxWidgetOrigStartup = this.startup;
		}
		// replace the startup() function temporarily
		this.startup = this._idxWidgetStartup;
		
		// perform the base create function
		return baseCreate.call(this, params, srcNodeRef);		
	};
	
	return iWidgets;
}

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){

	dojo.provide("idx.widgets");

	dojo.require("dijit._Widget");
	dojo.require("idx.string");
	dojo.require("idx.util");

	factory(dojo, 							// dLang		(dojo/_base/lang)
			idx,							// iMain		(idx)
			{add: dojo.addClass, 			// dDomClass	(dojo/dom-class) for (dDomClass.add/remove)
			 remove: dojo.removeClass},
			dijit._WidgetBase, 				// dWidget		(dijit/_WidgetBase)
			dijit,							// dijitMgr		(dijit/_base/manager)
			idx.string, 					// iString		(idx/string)
			idx.util); 						// iUtil		(idx/util)
} else {
	define(["../../node_modules/intern-geezer/node_modules/dojo/_base/lang",
	        "idx",
	        "../../lib/dojo/dom-class",
	        "dijit/_WidgetBase",
	        "dijit/_base/manager",
	        "./string", 
	        "./util"],
	        factory);
}

})();
