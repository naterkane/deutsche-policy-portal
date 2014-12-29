/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["dojo", "../../lib/dijit/dijit", "../../../lib/dijit/_WidgetBase"], function(dojo, dijit, widgetBase){

return dojo.declare("idx.oneui._CssStateMixin", [], {
	
	cssStateNodes: {},
	hovering: false,
	active: false,

	// stateNode
	//		The original dijit domNode (inner field widget)
	
	// oneuiBaseClass
	//		The original dijit baseClass (inner field widget)

	_applyAttributes: function(){
		widgetBase.prototype._applyAttributes.apply(this, arguments);
		dojo.forEach(["onmouseenter", "onmouseleave", "onmousedown"], function(e){
			this.connect(this.stateNode, e, "_cssMouseEvent");
		}, this);

		// Monitoring changes to disabled, readonly, etc. state, and update CSS class of root node
		dojo.forEach(["disabled", "readOnly", "checked", "selected", "focused", "state", "hovering", "active", "required"], function(attr){
			this.watch(attr, dojo.hitch(this, "_setStateClass"));
		}, this);

		// Events on sub nodes within the widget
		for(var ap in this.cssStateNodes){
			this._trackMouseState(this[ap], this.cssStateNodes[ap]);
		}
		// Set state initially; there's probably no hover/active/focus state but widget might be
		// disabled/readonly/checked/selected so we want to set CSS classes for those conditions.
		this._setStateClass();
	},

	_cssMouseEvent: function(/*Event*/ event){
		// summary:
		//	Sets hovering and active properties depending on mouse state,
		//	which triggers _setStateClass() to set appropriate CSS classes for this.domNode.

		if(!this.disabled){
			switch(event.type){
				case "mouseenter":
				case "mouseover":	// generated on non-IE browsers even though we connected to mouseenter
					this._set("hovering", true);
					this._set("active", this._mouseDown);
					break;

				case "mouseleave":
				case "mouseout":	// generated on non-IE browsers even though we connected to mouseleave
					this._set("hovering", false);
					this._set("active", false);
					break;

				case "mousedown" :
					this._set("active", true);
					this._mouseDown = true;
					// Set a global event to handle mouseup, so it fires properly
					// even if the cursor leaves this.domNode before the mouse up event.
					// Alternately could set active=false on mouseout.
					var mouseUpConnector = this.connect(dojo.body(), "onmouseup", function(){
						this._mouseDown = false;
						this._set("active", false);
						this.disconnect(mouseUpConnector);
					});
					break;
			}
		}
	},
	
	_setStateClass: function(){
		// Compute new set of classes
		var newStateClasses = this._getModifiedClasses(this.oneuiBaseClass);
		this._applyStateClass(this.stateNode, newStateClasses);
		newStateClasses = this._getModifiedClasses(this.baseClass);
		this._applyStateClass(this.domNode, newStateClasses);
	},
	
	_getModifiedClasses: function(/*String*/className){
		var clazz = className.split(" ");
		function multiply(modifier){
			clazz = clazz.concat(dojo.map(clazz, function(c){ return c+modifier; }), "dijit"+modifier);
		}

		if(!this.isLeftToRight()){
			// For RTL mode we need to set an addition class like dijitTextBoxRtl.
			multiply("Rtl");
		}

		var checkedState = this.checked == "mixed" ? "Mixed" : (this.checked ? "Checked" : "");
		if(this.checked){
			multiply(checkedState);
		}
		if(this.state){
			multiply(this.state);
		}
		if(this.selected){
			multiply("Selected");
		}
		if(this.required){
			multiply("Required");
		}
		if(this.disabled){
			multiply("Disabled");
		}else if(this.readOnly){
			multiply("ReadOnly");
		}else{
			if(this.active){
				multiply("Active");
			}else if(this.hovering){
				multiply("Hover");
			}
		}

		if(this.focused){
			multiply("Focused");
		}
		return clazz;
	},
	
	_applyStateClass: function(/*DomNode*/ node, /*Array*/classes){
		// Compute new set of classes
		// Remove old state classes and add new ones.
		// For performance concerns we only write into stateNode.className and domNode.className once.
		var classHash = {};	// set of all classes (state and otherwise) for node
		
		dojo.forEach(node.className.split(" "), function(c){ classHash[c] = true; });

		if("_stateClasses" in node){
			dojo.forEach(node._stateClasses, function(c){ delete classHash[c]; });
		}

		dojo.forEach(classes, function(c){ classHash[c] = true; });

		var newClasses = [];
		for(var c in classHash){
			newClasses.push(c);
		}
		node.className = newClasses.join(" ");
		node._stateClasses = classes;
	},
	
	_trackMouseState: function(/*DomNode*/ node, /*String*/ clazz){
		// summary:
		//		Track mouse/focus events on specified node and set CSS class on that node to indicate
		//		current state.   Usually not called directly, but via cssStateNodes attribute.
		// description:
		//		Given class=foo, will set the following CSS class on the node
		//			- fooActive: if the user is currently pressing down the mouse button while over the node
		//			- fooHover: if the user is hovering the mouse over the node, but not pressing down a button
		//			- fooFocus: if the node is focused
		//
		//		Note that it won't set any classes if the widget is disabled.
		// node: DomNode
		//		Should be a sub-node of the widget, not the top node (this.domNode), since the top node
		//		is handled specially and automatically just by mixing in this class.
		// clazz: String
		//		CSS class name (ex: dijitSliderUpArrow).

		// Current state of node (initially false)
		// NB: setting specifically to false because dojo.toggleClass() needs true boolean as third arg
		var hovering=false, active=false, focused=false;

		var self = this,
			cn = dojo.hitch(this, "connect", node);

		function setClass(){
			var disabled = ("disabled" in self && self.disabled) || ("readonly" in self && self.readonly);
			dojo.toggleClass(node, clazz+"Hover", hovering && !active && !disabled);
			dojo.toggleClass(node, clazz+"Active", active && !disabled);
			dojo.toggleClass(node, clazz+"Focused", focused && !disabled);
		}

		// Mouse
		cn("onmouseenter", function(){
			hovering = true;
			setClass();
		});
		cn("onmouseleave", function(){
			hovering = false;
			active = false;
			setClass();
		});
		cn("onmousedown", function(){
			active = true;
			setClass();
		});
		cn("onmouseup", function(){
			active = false;
			setClass();
		});

		// Focus
		cn("onfocus", function(){
			focused = true;
			setClass();
		});
		cn("onblur", function(){
			focused = false;
			setClass();
		});

		// Just in case widget is enabled/disabled while it has focus/hover/active state.
		// Maybe this is overkill.
		this.watch("disabled", setClass);
		this.watch("readOnly", setClass);
	}
});
});