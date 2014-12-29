/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	"../../../../../dist/lib/dojo/_base/kernel",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/_base/event",
	"dojo/_base/window",
	"dojo/query",
	"dojo/keys",
	"dojo/dom-attr",
	"dojo/dom-class",
	"dojo/dom-style",
	"dojo/i18n",
	"dijit/form/_FormSelectWidget",
	"dijit/_HasDropDown",
	"dijit/MenuSeparator",
	"dijit/Tooltip",
	"../common",
	"../_CssStateMixin",
	"./_CheckBoxSelectMenu",
	"./_CheckBoxSelectMenuItem",
	"./_CompositeMixin",
	"./_ValidationMixin",
	"dojo/text!./templates/CheckBoxSelect.html",
	"dojo/i18n!./nls/CheckBoxSelect"
], function(declare, kernel, lang, array, event, win, query, keys, domAttr, domClass, domStyle,
			i18n, _FormSelectWidget, _HasDropDown, MenuSeparator, Tooltip, common, _CssStateMixin, _CheckBoxSelectMenu,
			_CheckBoxSelectMenuItem, _CompositeMixin, _ValidationMixin, template){
	/**
	 * @name idx.oneui.form.CheckBoxSelect
	 * @class A multi select control with check boxes.
	 * @augments dijit._HasDropDown
	 * @augments idx.oneui._CssStateMixin
	 * @augments idx.oneui.form._CompositeMixin
	 * @augments idx.oneui.form._ValidationMixin
	 */
	return declare("idx.oneui.form.CheckBoxSelect", [_FormSelectWidget, _HasDropDown, _CssStateMixin, _CompositeMixin, _ValidationMixin],
	/**@lends idx.oneui.form.CheckBoxSelect.prototype*/
	{
		// summary:
		//		A multi select control with check boxes.
		
		baseClass: "idxCheckBoxSelectWrap",
		
		oneuiBaseClass: "idxCheckBoxSelect dijitSelect",
		
		multiple: true,
		
		instantValidate: true,
		
		cssStateNodes: {
			"titleNode": "dijitDownArrowButton"
		},
		
		templateString: template,
		
		// attributeMap: Object
		//		Add in our style to be applied to the focus node
		attributeMap: lang.mixin(lang.clone(_FormSelectWidget.prototype.attributeMap),{style:"tableNode"}),
	
		// required: Boolean
		//		Can be true or false, default is false.
		required: false,
	
		// state: String
		//		Shows current state (ie, validation result) of input (Normal, Warning, or Error)
		state: "",
	
		// message: String
		//		Currently displayed error/prompt message
		message: "",
	
		//	tooltipPosition: String[]
		//		See description of dijit.Tooltip.defaultPosition for details on this parameter.
		tooltipPosition: [],
	
		// emptyLabel: string
		//		What to display in an "empty" dropdown
		emptyLabel: "&nbsp;",
	
		// _isLoaded: Boolean
		//		Whether or not we have been loaded
		_isLoaded: false,
	
		// _childrenLoaded: Boolean
		//		Whether or not our children have been loaded
		_childrenLoaded: false,
		
		_missingMsg: "$_unset_$",
		
		postMixInProperties: function(){
			this.inherited(arguments);
			this._nlsResources = i18n.getLocalization("idx.oneui.form", "CheckBoxSelect", this.lang);
			if(this._missingMsg == "$_unset_$"){ this._missingMsg = this._nlsResources.missingMessage; }
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
			
			// Create the dropDown widget
			this.dropDown = new _CheckBoxSelectMenu({id: this.id + "_menu"});
		},
		
		_getValueFromOpts: function(){
			// summary:
			//		Returns the value of the widget by reading the options for
			//		the selected flag
			var opts = this.getOptions() || [];
			// Set value to be the sum of all selected
			return array.map(array.filter(opts, function(i){
				return i.selected && i.selected !== "false";
			}), function(i){
				return i.value;
			}) || [];
		},
		
		postCreate: function(){
			// summary:
			//		stop mousemove from selecting text on IE to be consistent with other browsers
			
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
			this.connect(this.domNode, "onmousemove", event.stop);
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
		
		_getMenuItemForOption: function(/*dijit.form.__SelectOption*/ option){
			// summary:
			//		For the given option, return the menu item that should be
			//		used to display it.  This can be overridden as needed
			if(!option.value && !option.label){
				// We are a separator (no label set for it)
				return new MenuSeparator();
			}else{
				// Just a regular menu option
				var click = lang.hitch(this, "_updateValue");
				var item = new _CheckBoxSelectMenuItem({
					parent: this,
					option: option,
					label: option.label || this.emptyLabel,
					onClick: click,
					checked: option.selected || false,
					readOnly: this.readOnly || false,
					disabled: this.disabled || false
				});
				domAttr.set(item.focusNode, "role", "option");
				return item;
			}
		},
		
		_addOptionItem: function(/*dijit.form.__SelectOption*/ option){
			// summary:
			//		For the given option, add an option to our dropdown.
			//		If the option doesn't have a value, then a separator is added
			//		in that place.
			if(this.dropDown){
				this.dropDown.addChild(this._getMenuItemForOption(option));
			}
		},
		
		_getChildren: function(){
			if(!this.dropDown){
				return [];
			}
			return this.dropDown.getChildren();
		},
		
		_loadChildren: function(/*Boolean*/ loadMenuItems){
			// summary:
			//		Resets the menu and the length attribute of the button - and
			//		ensures that the label is appropriately set.
			//	loadMenuItems: Boolean
			//		actually loads the child menu items - we only do this when we are
			//		populating for showing the dropdown.
			
			if(loadMenuItems === true){
				// this.inherited destroys this.dropDown's child widgets (MenuItems).
				// Avoid this.dropDown (Menu widget) having a pointer to a destroyed widget (which will cause
				// issues later in _setSelected). (see #10296)
				if(this.dropDown){
					delete this.dropDown.focusedChild;
				}
				if(this.options.length){
					this.inherited(arguments);
				}else{
					// Drop down menu is blank but add one blank entry just so something appears on the screen
					// to let users know that they are no choices (mimicing native select behavior)
					array.forEach(this._getChildren(), function(child){ child.destroyRecursive(); });
				}
			}else{
				this._updateSelection();
			}
			
			this._isLoaded = false;
			this._childrenLoaded = true;
			
			if(!this._loadingStore){
				// Don't call this if we are loading - since we will handle it later
				this._setValueAttr(this.value);
			}
		},
		
		_updateValue: function(){
			this.set("value", this._getValueFromOpts());
		},
		
		_setValueAttr: function(value){
			this.inherited(arguments);
			domAttr.set(this.valueNode, "value", this.value);
		},
		
		onChange: function(newValue){
			// summary:
			//		Hook function
		},
		
		reset: function(){
			// summary:
			//		Overridden so that the state will be cleared.
			this.inherited(arguments);
			Tooltip.hide(this.domNode);
			this._set("state", "");
			this._set("message", "")
		},
		
		_setDisplay: function(/*String*/ newDisplay){
			// summary:
			//		sets the display for the given value (or values)
			var length = 0;
			if(lang.isArray(newDisplay)){
				length = newDisplay.length;
			}else{
				length = newDisplay ? 1 : 0;
			}
			var label = lang.replace(this._nlsResources.labelText, {num: length});
			this.containerNode.innerHTML = '<span class="dijitReset dijitInline ' + this.baseClass + 'Label">' + label + '</span>';
			this.focusNode.setAttribute("aria-label", label);
		},
		
		_setStyleAttr: function(/*String||Object*/ value){
			this.inherited(arguments);
			domClass.toggle(this.domNode, this.baseClass + "FixedWidth", !!this.tableNode.style.width);
		},
	
		isLoaded: function(){
			return this._isLoaded;
		},
		
		loadDropDown: function(/*Function*/ loadCallback){
			// summary:
			//		populates the menu
			this._loadChildren(true);
			this._isLoaded = true;
			loadCallback();
		},
	
		closeDropDown: function(){
			// overriding _HasDropDown.closeDropDown()
			this.inherited(arguments);
			
			if(this.dropDown && this.dropDown.menuTableNode){
				// Erase possible width: 100% setting from _SelectMenu.resize().
				// Leaving it would interfere with the next openDropDown() call, which
				// queries the natural size of the drop down.
				this.dropDown.menuTableNode.style.width = "";
			}
		},
		
		invertSelection: function(onChange){
			// summary: Invert the selection
			// onChange: Boolean
			//		If null, onChange is not fired.
			array.forEach(this.options, function(i){
				i.selected = !i.selected;
			});
			this._updateSelection();
			this._updateValue();
		},
		
		_updateSelection: function(){
			this.inherited(arguments);
			this._handleOnChange(this.value);
			array.forEach(this._getChildren(), function(item){ 
				item._updateBox(); 
			});
		},
		
		_setDisabledAttr: function(value){
			// summary:
			//		Disable (or enable) all the children as well
			this.inherited(arguments);
			array.forEach(this._getChildren(), function(node){
				if(node && node.set){
					node.set("disabled", value);
				}
			});
		},
		
		_setReadOnlyAttr: function(value){
			// summary:
			//		Sets read only (or unsets) all the children as well
			this.inherited(arguments);
			array.forEach(this._getChildren(), function(node){
				if(node && node.set){
					node.set("readOnly", value);
				}
			});
		},
		
		_isEmpty: function(){
			// summary:
			// 		Checks for whitespace. Should be overridden.
			return !array.some(this.getOptions(), function(opt){
				return opt.selected && opt.value != null && opt.value.toString().length != 0;
			});
		},
		
		_setFieldWidthAttr: function(/*String*/width){
			domClass.toggle(this.oneuiBaseNode, "dijitSelectFixedWidth", !!width);
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
		
		_setLabelAttr: function(/*String*/ label){
			this.inherited(arguments);
			this.focusNode.setAttribute("aria-lablledby", this.id + "_label");
		},
		
		_onDropDownMouseDown: function(/*Event*/ e){
			// summary:
			//		Overwrite dijit._HasDropDown._onDropDownMouseDown
			//		Open the drop down menu when readOnly is true.
	
			if(this.disabled){ return; }
	
			event.stop(e);
	
			this._docHandler = this.connect(win.doc, "onmouseup", "_onDropDownMouseUp");
	
			this.toggleDropDown();
		},
		
		toggleDropDown: function(){
			// summary:
			//		Overwrite dijit._HasDropDown.toggleDropDown
			//		Open the drop down menu when readOnly is true.
	
			if(this.disabled){ return; }
			if(!this._opened){
				// If we aren't loaded, load it first so there isn't a flicker
				if(!this.isLoaded()){
					this.loadDropDown(lang.hitch(this, "openDropDown"));
					return;
				}else{
					this.openDropDown();
				}
			}else{
				this.closeDropDown();
			}
		},
		
		_onKey: function(/*Event*/ e){
			// summary:
			//		Overwrite dijit._HasDropDown._onKey
			//		Open the drop down menu when readOnly is true.
	
			if(this.disabled){ return; }
	
			var d = this.dropDown, target = e.target;
			if(d && this._opened && d.handleKey){
				if(d.handleKey(e) === false){
					/* false return code means that the drop down handled the key */
					event.stop(e);
					return;
				}
			}
			if(d && this._opened && e.charOrCode == keys.ESCAPE){
				this.closeDropDown();
				event.stop(e);
			}else if(!this._opened &&
					(e.charOrCode == keys.DOWN_ARROW ||
						( (e.charOrCode == keys.ENTER || e.charOrCode == " ") &&
						  //ignore enter and space if the event is for a text input
						  ((target.tagName || "").toLowerCase() !== 'input' ||
						     (target.type && target.type.toLowerCase() !== 'text'))))){
				// Toggle the drop down, but wait until keyup so that the drop down doesn't
				// get a stray keyup event, or in the case of key-repeat (because user held
				// down key for too long), stray keydown events
				this._toggleOnKeyUp = true;
				event.stop(e);
			}
		},
		
		uninitialize: function(preserveDom){
			if(this.dropDown && !this.dropDown._destroyed){
				this.dropDown.destroyRecursive(preserveDom);
				delete this.dropDown;
			}
			this.inherited(arguments);
		}
	});
});