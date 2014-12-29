/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	"../../../../../dist/lib/dojo/_base/lang",
	"dojo/_base/array",
	"dojo/_base/sniff",
	"dojo/dom-attr",
	"dojo/dom-class",
	"dojo/dom-style",
	"dojo/keys",
	"dijit/form/_FormSelectWidget",
	"dijit/_Container",
	"../_CssStateMixin",
	"./_CompositeMixin",
	"./_ValidationMixin",
	"./_InputListMixin",
	"./_RadioButtonSetItem",
	"../HoverHelpTooltip",
	"dojo/text!./templates/RadioButtonSet.html"
], function(declare, lang, array, has, domAttr, domClass, domStyle, keys, _FormSelectWidget, _Container, _CssStateMixin, _CompositeMixin, _ValidationMixin, _InputListMixin, _RadioButtonSetItem, HoverHelpTooltip, template){
	/**
	 * @name idx.oneui.form.RadioButtonSet
	 * @class One UI version Radio Button Set
	 * @augments dijit.form._FormSelectWidget
	 * @augments dijit._Container
	 * @augments idx.oneui._CssStateMixin
	 * @augments idx.oneui.form._CompositeMixin
	 * @augments idx.oneui.form._ValidationMixin
	 * @augments idx.oneui.form._InputListMixin
	 * @example Programmatic:
	 *	new idx.oneui.form.RadioButtonSet({
	 *	options: [
	 *			{ label: 'foo', value: 'foo', selected: true },
	 *			{ label: 'bar', value: 'bar' }
	 *		]
	 *	});
	 *	
	 *	Declarative:
	 *	<select jsId="rbs1" data-dojo-type="oneui.form.RadioButtonSet" data-dojo-props='
	 *		name="rbs1", label="label1", value="foo"'>
	 *		<option value="foo">foo</option>
	 *		<option value="bar">bar</option>
	 *	</select>
	 *	
	 *	Store Based:
	 *	var data = {
	 *		identifier: "value",
	 *		label: "label",
	 *		items: [
	 *			{value: "AL", label: "Alabama"},
	 *			{value: "AK", label: "Alaska"}
	 *		]
	 *	};
	 *	var readStore = new dojo.data.ItemFileReadStore({data: data});
	 *	var rbs1 = new idx.oneui.form.RadioButtonSet({
	 *		store: readStore
	 *	});
	 */
	return declare("idx.oneui.form.RadioButtonSet", [_FormSelectWidget, _Container, _CssStateMixin, _CompositeMixin, _ValidationMixin, _InputListMixin],
	/**@lends idx.oneui.form.RadioButtonSet.prototype*/
	{
		templateString: template,
		
		baseClass: "idxRadioButtonSetWrap",
		
		oneuiBaseClass: "idxRadioButtonSet",
		
		multiple: false,
		
		buildRendering: function(){
			// Radio button set must have a name, otherwise all unnamed radio buttons will
			// be considered as one group.
			this.name = this.name || this.id;
			this.inherited(arguments);
		},
		
		_setNameAttr: function(value){
			this._set("name", value);
			array.forEach(this.getChildren(), function(item){ 
				item.set("name", value);
			});
		},
		
		_setValueAttr: function(/*anything*/ newValue, /*Boolean?*/ priorityChange){
			// summary:
			//		set the value of the widget.
			//		If a string is passed, then we set our value from looking it up.
			if(this._loadingStore){
				// Our store is loading - so save our value, and we'll set it when
				// we're done
				this._pendingValue = newValue;
				return;
			}
			var opts = this.getOptions() || [];
			if(!lang.isArray(newValue)){
				newValue = [newValue];
			}
			array.forEach(newValue, function(i, idx){
				if(!lang.isObject(i)){
					i = i + "";
				}
				if(typeof i === "string"){
					newValue[idx] = array.filter(opts, function(node){
						return node.value === i;
					})[0] || {value: "", label: ""};
				}
			}, this);
	
			// Make sure some sane default is set
			newValue = array.filter(newValue, function(i){ return i && i.value; });
			if(!this.multiple && (!newValue[0] || !newValue[0].value) && opts.length){
				newValue[0] = "";
			}
			
			// Set lastFocusedChild according to the new value
			this.lastFocusedChild = null;
			array.forEach(opts, function(i, index){
				i.selected = array.some(newValue, function(v){ return v.value === i.value; });
				if(i.selected && this.getChildren()[index]){
					this.lastFocusedChild = this.getChildren()[index]
					this.focusChild(this.lastFocusedChild);
				}
			}, this);
			var val = array.map(newValue, function(i){ return i.value; }),
				disp = array.map(newValue, function(i){ return i.label; });
	
			this._set("value", this.multiple ? val : val[0]);
			this._setDisplay(this.multiple ? disp : disp[0]);
			this._updateSelection();
			this._handleOnChange(this.value, priorityChange);
		},
		
		_addOptionItem: function(/* dojox.form.__SelectOption */ option){
			var item = new _RadioButtonSetItem({
				_inputId: this.id + "_RadioItem" + array.indexOf(this.options, option),
				option: option,
				name: this.name,
				disabled: option.disabled || this.disabled || false,
				parent: this
			});
			
			domClass.toggle(item.domNode, "dijitInline", !(this.groupAlignment == "vertical"));
			this.addChild(item);
			if(option.selected){
				this.lastFocusedChild = item;
			}
			// IE8 standard document mode has a bug that we have to re-layout the dom
			// to make it occupy the space correctly.
			if(has("ie") > 7 && !has("quirks")) this._relayout(this.domNode);
			this.onAfterAddOptionItem(item, option);
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
		}
	});
});
