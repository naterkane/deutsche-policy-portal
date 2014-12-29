/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	"../../../../../dist/lib/dojo/_base/kernel",
	"dojo/_base/array",
	"dojo/_base/sniff",
	"dojo/dom-attr",
	"dojo/dom-class",
	"dojo/dom-style",
	"dojo/query",
	"dojo/i18n",
	"dijit/Tooltip",
	"dojo/i18n!./nls/_InputListMixin"
], function(declare, kernel, array, has, domAttr, domClass, domStyle, query, i18n, Tooltip){
	
	//	module:
	//		idx/oneui/form/_InputListMixin
	//	summary:
	//		An internal mix in class for CheckBoxList and RadioButtonSet

	return declare("idx.oneui.form._InputListMixin", null, {
		// summary:
		//		An internal mix in class for CheckBoxList and RadioButtonSet

		instantValidate: true,
		
		groupAlignment: "vertical",
		
		lastFocusedChild: null,
		
		postCreate: function(){
			this.extension = {
				"input" : "onChange",
				"blur" 	: "_onBlur",
				"focus" : "_onFocus"
			}
			if(this.instantValidate){;
				this.connect(this, "_onFocus", function(){
					if(this.message == ""){return;}
					this.displayMessage(this.message);
				});
			}
			
			this.inherited(arguments);
			this.connect(this, "focusChild", function(){this.lastFocusedChild = this.focusedChild;});
			domAttr.set(this.stateNode, {tabIndex: -1});
			
			// Indicate that the widget is just loaded.
			// Do not perform the _isEmpty() check.
			this.initLoaded = true;
		},
		
		setStore: function(store, selectedValue, fetchArgs){
			// summary:
			//		If there is any items selected in the store, the value
			//		of the widget will be set to the values of these items.
			this.inherited(arguments);
			var setSelectedItems = function(items){
				var value = array.map(items, function(item){ return item.value[0]; });
				if(value.length){
					this.set("value", value);
				}
			};
			this.store.fetch({query:{selected: true}, onComplete: setSelectedItems, scope: this});
		},
		
		postMixInProperties: function(){
			this.inherited(arguments);
			this._nlsResources = i18n.getLocalization("idx.oneui.form", "_InputListMixin", this.lang);
			if(this.invalidMessage == "$_unset_$"){ this.invalidMessage = this._nlsResources.invalidMessage; }
		},
		
		_fillContent: function(){
			// summary:
			//		Overwrite dijit.form._FormSelectWidget._fillContent to fix a typo 
			var opts = this.options;
			if(!opts){
				opts = this.options = this.srcNodeRef ? query("> *",
							this.srcNodeRef).map(function(node){
								if(node.getAttribute("type") === "separator"){
									return { value: "", label: "", selected: false, disabled: false };
								}
								return {
									value: (node.getAttribute("data-" + kernel._scopeName + "-value") || node.getAttribute("value")),
											label: String(node.innerHTML),
									// FIXME: disabled and selected are not valid on complex markup children (which is why we're
									// looking for data-dojo-value above.  perhaps we should data-dojo-props="" this whole thing?)
									// decide before 1.6
											selected: node.getAttribute("selected") || false,
									disabled: node.getAttribute("disabled") || false
								};
							}, this) : [];
			}
			if(!this.value){
				this._set("value", this._getValueFromOpts());
			}else if(this.multiple && typeof this.value == "string"){
				this._set("value", this.value.split(","));
			}
		},
		
		_getValueFromOpts: function(){
			// summary:
			//		Returns the value of the widget by reading the options for
			//		the selected flag
			var opts = this.getOptions() || [];
			if(!this.multiple && opts.length){
				// Mirror what a select does - choose the first one
				var opt = array.filter(opts, function(i){
					return i.selected && i.selected !== "false";
				})[0];
				if(opt && opt.value){
					return opt.value
				}
			}else if(this.multiple){
				// Set value to be the sum of all selected
				return array.map(array.filter(opts, function(i){
					return i.selected && i.selected !== "false";
				}), function(i){
					return i.value;
				}) || [];
			}
			return "";
		},
		
		onAfterAddOptionItem: function(item, option){
			// summary:
			//		a function that can be connected to in order to receive a
			//		notification that an item as been added to this dijit.
		},
	
		onChange: function(newValue){
			// summary:
			//		Validate if selection changes.
			this.validate(this.focused);
		},
		
		reset: function(){
			// summary: Overridden so that the state will be cleared.
			this.inherited(arguments);
			Tooltip.hide(this.oneuiBaseNode);
			Tooltip.hide(this.iconNode);
		},
		
		_onMouseDown: function(e){
			// summary:
			//		Cancels the mousedown event to prevent others from stealing
			//		focus
			this.mouseFocus = true;
			domAttr.set(this.domNode, "tabIndex", "-1");
			if(has("ie") < 9 || has("quirks")){
				e.cancelBubble = true;
			}else{
				e.stopPropagation();
			}
		},
		
		_onContainerFocus: function(evt){
			if(evt.target !== this.domNode){ return; }
			if(!this.mouseFocus){
				if(this.lastFocusedChild){
					this.focusChild(this.lastFocusedChild);
				}else{
					this.focusFirstChild();
				}
			}
			domAttr.set(this.domNode, "tabIndex", "-1");
		},
		
		_updateSelection: function(){
			this.inherited(arguments);
			domAttr.set(this.valueNode, "value", this.value);
			array.forEach(this._getChildren(), function(item){ 
				item._updateBox(); 
			});
		},
		
		_getChildren: function(){
			return this.getChildren();
		},
		
		invertSelection: function(onChange){
			// summary: Invert the selection
			// onChange: Boolean
			//		If null, onChange is not fired.
			array.forEach(this.options, function(i){
				i.selected = !i.selected;
			});
			this._updateSelection();
			this._handleOnChange(this.value);
		},
		
		_setDisabledAttr: function(value){
			// summary:
			//		Disable (or enable) all the children as well
			this.inherited(arguments);
			// Fixed dojo.attr(this.focusNode, "disabled", false) bug
			value || domAttr.remove(this.valueNode, "disabled");
			
			array.forEach(this.getChildren(), function(node){
				if(node && node.set){
					node.set("disabled", value);
				}
			});
		},
		
		_setReadOnlyAttr: function(value){
			// summary:
			//		Sets read only (or unsets) all the children as well
			this.inherited(arguments);
			array.forEach(this.getChildren(), function(node){
				if(node && node.set){
					node.set("readOnly", value);
				}
			});
		},
		
		_setGroupAlignmentAttr: function(/*String*/ value){
			this._set("groupAlignment", value);
			array.forEach(this.getChildren(), function(item){
				domClass.toggle(item.domNode, "dijitInline", !(value == "vertical"));
			}, this);	
		},
		
		_setRequiredAttr: function(required){
			this._set("required", required);
			this.inherited(arguments);
		},
		
		_isEmpty: function(){
			if(this.initLoaded){ return false; }
			return this.value == "";
		},
		
		_relayout: function(node){
			domStyle.set(node, "zoom", "1");
			domStyle.set(node, "zoom", "");
		},
		
		startup: function(){
			this.inherited(arguments);
			this.initLoaded = false;
		},
		
		displayMessage: function(/*String*/ message){
			// summary:
			//		Overridable method to display validation errors/hints.
			//		By default uses a tooltip.
			// tags:
			//		extension
			Tooltip.hide(this.oneuiBaseNode);
			Tooltip.hide(this.iconNode);
			if(message){
				var node = domStyle.set(this.iconNode, "visibility") == "hidden" ? this.oneuiBaseNode : this.iconNode;
				Tooltip.show(message, node, this.tooltipPosition, !this.isLeftToRight());
			}
		},
		
		uninitialize: function(){
			Tooltip.hide(this.domNode);
			// Make sure these children are destroyed
			array.forEach(this._getChildren(), function(child){
				child.destroyRecursive();
			});
			this.inherited(arguments);
		}
	
	});
});