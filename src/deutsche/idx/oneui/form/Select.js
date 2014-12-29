/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	"../../../../../node_modules/intern-geezer/node_modules/dojo/_base/array",
	"dojo/_base/event",
	"dojo/_base/window",
	"dojo/_base/lang",
	"dojo/dom-geometry",
	"dojo/dom-class",
	"dojo/dom-style",
	"dojo/dom-attr",
	"dojo/keys",
	"dijit/registry",
	"../HoverHelpTooltip",
	"dijit/form/Select",
	"dijit/form/_FormSelectWidget",
	"../common",
	"./_CompositeMixin",
	"./_ValidationMixin",
	"../_CssStateMixin",
	"dojo/text!./templates/Select.html"
], function(declare, array, event, win, lang, domGeometry, domClass, domStyle, domAttr, keys, registry,
			HoverHelpTooltip, Select, _FormSelectWidget, common, _CompositeMixin, _ValidationMixin, _CssStateMixin, template){
	/**
	 * @name idx.oneui.form.Select
	 * @class One UI version Select control
	 * @augments dijit.form.Select
	 * @augments idx.oneui._CssStateMixin
	 * @augments idx.oneui.form._CompositeMixin
	 * @augments idx.oneui.form._ValidationMixin
	 */
	return declare("idx.oneui.form.Select", [Select, _CompositeMixin, _CssStateMixin, _ValidationMixin],
	/**@lends idx.oneui.form.Select.prototype*/
	{
		// summary:
		//		One UI version Select control
		
		instantValidate: true,
		
		templateString: template,
		
		baseClass: "idxSelectWrap",
		
		oneuiBaseClass: "dijitSelect",
		
		cssStateNodes: {
			"titleNode": "dijitDownArrowButton"
		},
			
		postCreate: function(){
			this.extension = {
				"input" : "onChange",
				"blur" 	: "_onBlur",
				"focus" : "_onFocus"
			}
			if (this.instantValidate) {
				this.connect(this, "_onFocus", function(){
					if(this.message == ""){return;}
					this.displayMessage(this.message);
				});
			}
			this.inherited(arguments);
		},
		
		_isEmpty: function(){
			return this.value === 0 || (/^\s*$/.test(this.value || ""));
		},
		
		validate: function(/*Boolean*/ isFocused){
			// summary:
			//		Called by oninit, onblur, and onkeypress.
			// description:
			//		Show missing or invalid messages if appropriate, and highlight textbox field.
			//		Used when a select is initially set to no value and the user is required to
			//		set the value.
	
			var isValid = this.isValid(isFocused);
			this._set("state", isValid ? "" : "Error");
			this.focusNode.setAttribute("aria-invalid", isValid ? "false" : "true");
			var message = isValid ? "" : this.getErrorMessage();
			if(this.message !== message){
				this._set("message", message);
				this.displayMessage(this.message);
			}
			return isValid;
		},
		
		getErrorMessage: function(/*Boolean*/ isFocused){
			return (this.required && this._isEmpty()) ? this._missingMsg : this.invalidMessage;
		},
		
		displayMessage: function(/*String*/ message, /*Boolean*/ force){
			// summary:
			//		Overridable method to display validation errors/hints.
			//		By default uses a tooltip.
			// tags:
			//		extension
			HoverHelpTooltip.hide(this.domNode);
			HoverHelpTooltip.hide(this.iconNode);
			if(message && this.focused || force){
				var node = domStyle.get(this.iconNode, "visibility") == "hidden" ? this.oneuiBaseNode : this.iconNode;
				HoverHelpTooltip.show(message, node, this.tooltipPosition, !this.isLeftToRight());
			}
		},
		_setValueAttr: function(){
			_FormSelectWidget.prototype._setValueAttr.apply(this, arguments);
			domAttr.set(this.valueNode, "value", this.get("value"));
		},
		_onBlur: function(){
			this.inherited(arguments);
			this.displayMessage('');
		},
		
		_onFocus: function(){
			_FormSelectWidget.prototype._onFocus.apply(this, arguments);
		},
		
		_onDropDownMouseUp: function(/*Event?*/ e){
			// summary:
			//		Overwrite dijit._HasDropDown._onDropDownMouseUp
			//		Focus the selected items once open the drop down menu.
				
			if(e && this._docHandler){
				this.disconnect(this._docHandler);
			}
			var dropDown = this.dropDown, overMenu = false;
	
			if(e && this._opened){
				// This code deals with the corner-case when the drop down covers the original widget,
				// because it's so large.  In that case mouse-up shouldn't select a value from the menu.
				// Find out if our target is somewhere in our dropdown widget,
				// but not over our _buttonNode (the clickable node)
				var c = domGeometry.position(this._buttonNode, true);
				if(!(e.pageX >= c.x && e.pageX <= c.x + c.w) ||
					!(e.pageY >= c.y && e.pageY <= c.y + c.h)){
					var t = e.target;
					while(t && !overMenu){
						if(domClass.contains(t, "dijitPopup")){
							overMenu = true;
						}else{
							t = t.parentNode;
						}
					}
					if(overMenu){
						t = e.target;
						if(dropDown.onItemClick){
							var menuItem;
							while(t && !(menuItem = registry.byNode(t))){
								t = t.parentNode;
							}
							if(menuItem && menuItem.onClick && menuItem.getParent){
								menuItem.getParent().onItemClick(menuItem, e);
							}
						}
						return;
					}
				}
			}
			if(this._opened && dropDown.focus && dropDown.autoFocus !== false){
				// Focus the dropdown widget - do it on a delay so that we
				// don't steal our own focus.
				this.focusSelectedItem();
			}
		},
		
		_onKeyUp: function(){
			// summary:
			//		Overwrite dijit._HasDropDown._onKeyUp
			//		Focus the selected items once open the drop down menu.
			
			if(this._toggleOnKeyUp){
				delete this._toggleOnKeyUp;
				this.toggleDropDown();
				var d = this.dropDown;	// drop down may not exist until toggleDropDown() call
				if(d && d.focus){
					setTimeout(lang.hitch(this, "focusSelectedItem"), 1);
				}
			}
		},
		
		_setReadOnlyAttr: function(value){
			this.inherited(arguments);
			if(this.dropDown){
				this.dropDown.set("readOnly", value);
			}
		},
		
		_setFieldWidthAttr: function(/*String*/width){
			domClass.toggle(this.oneuiBaseNode, this.oneuiBaseClass + "FixedWidth", !!width);
			if(!width){ return; }
			var widthInPx = common.normalizedLength(width);
			if(dojo.isFF){
				var borderWidthInPx = common.normalizedLength(domStyle.get(this.oneuiBaseNode,"border-left-width")) +
				common.normalizedLength(domStyle.get(this.oneuiBaseNode,"border-right-width"));
				widthInPx += borderWidthInPx;
			}else if(dojo.isIE){
				widthInPx += 2;
			}
			domStyle.set(this.oneuiBaseNode, "width", widthInPx + "px");
		},
		
		focusSelectedItem: function(){
			// summary:
			//		Focus the item according to the value of the widget.
			
			var val = this.value;
			if(!lang.isArray(val)){
				val = [val];
			}
			if(val && val[0]){
				var isFocused = array.some(this._getChildren(), function(child){
					var isSelected = val[0] === child.option.value;
					if(isSelected){
						this.dropDown.focusChild(child);
					}
					return isSelected;
				}, this);
				if(!isFocused){
					this.dropDown.focusFirstChild();
				}
			}else{
				console.warn("Empty value!");
			}
		}
	});
});
