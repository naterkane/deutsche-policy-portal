/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	"../../../../../node_modules/intern-geezer/node_modules/dojo/_base/array",
	"dojo/_base/sniff",
	"dojo/dom-attr",
	"dojo/dom-class",
	"dojo/dom-style",
	"dijit/form/_FormSelectWidget",
	"dijit/_Container",
	"../_CssStateMixin",
	"./_CompositeMixin",
	"./_ValidationMixin",
	"./_InputListMixin",
	"./_CheckBoxListItem",
	"idx/oneui/HoverHelpTooltip",
	"dojo/text!./templates/CheckBoxList.html"
], function(declare, array, has, domAttr, domClass, domStyle, _FormSelectWidget, _Container, _CssStateMixin, _CompositeMixin, _ValidationMixin, _InputListMixin, _CheckBoxListItem, HoverHelpTooltip, template){
	/**
	 * @name idx.oneui.form.CheckBoxList
	 * @class List of checkboxes
	 * @augments dijit.form._FormSelectWidget
	 * @augments dijit._Container
	 * @augments idx.oneui._CssStateMixin
	 * @augments idx.oneui.form._CompositeMixin
	 * @augments idx.oneui.form._ValidationMixin
	 * @augments idx.oneui.form._InputListMixin
	 */
	return declare("idx.oneui.form.CheckBoxList", [_FormSelectWidget, _Container, _CssStateMixin, _CompositeMixin, _ValidationMixin, _InputListMixin],
	/**@lends idx.oneui.form.CheckBoxList.prototype*/
	{
		
		templateString: template,
		
		instantValidate: true,
		
		baseClass: "idxCheckBoxListWrap",
		
		oneuiBaseClass: "idxCheckBoxList",
		
		multiple: true,
		
		_addOptionItem: function(/* dojox.form.__SelectOption */ option){
			var item = new _CheckBoxListItem({
				_inputId: this.id + "_CheckItem" + array.indexOf(this.options, option),
				option: option,
				disabled: option.disabled || this.disabled || false,
				parent: this
			});
			domClass.toggle(item.domNode, "dijitInline", !(this.groupAlignment == "vertical"));
			this.addChild(item);
			// IE8 standard document mode has a bug that we have to re-layout the dom
			// to make it occupy the space correctly.
			if(has("ie") > 7 && !has("quirks")) this._relayout(this.domNode);
			this.onAfterAddOptionItem(item, option);
		},
		
		_setNameAttr: function(value){
			this._set("name", value);
			domAttr.set(this.valueNode, "name", value);
		},
		
		_onBlur: function(evt){
			this.mouseFocus = false;
			this.inherited(arguments);
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