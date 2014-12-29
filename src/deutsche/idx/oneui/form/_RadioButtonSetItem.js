/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	"../../../../../node_modules/intern-geezer/node_modules/dojo/_base/array",
	"dojo/dom-attr",
	"dijit/_Widget",
	"dijit/_CssStateMixin",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"idx/oneui/form/_InputListItemMixin",
	"dojo/text!./templates/_RadioButtonSetItem.html",
	"dijit/form/CheckBox"
], function(declare, array, domAttr, _Widget, _CssStateMixin, _TemplatedMixin, _WidgetsInTemplateMixin, _InputListItemMixin, template){

	return declare("idx.oneui.form._RadioButtonSetItem", 
		[_Widget, _CssStateMixin, _TemplatedMixin, _WidgetsInTemplateMixin, _InputListItemMixin], {
		// summary:
		//		The individual items for a RadioButtonSet
	
		templateString: template,
	
		baseClass: "idxRadioButtonSetItem",
		
		_changeBox: function(){
			// summary:
			//		Called to force the select to match the state of the check box
			//		(only on click of the checkbox)	 Radio-based calls _setValueAttr
			//		instead.
			if(this.get("disabled") || this.get("readOnly")){ return; }
				array.forEach(this.parent.options, function(opt){
				opt.selected = false;
			});
			this.option.selected = true;
			this.parent.set("value",  this.parent._getValueFromOpts());
			this.parent.focusChild(this);
		},
		
		_setNameAttr: function(value){
			this.inherited(arguments);
			domAttr.set(this.focusNode, "name", value);
		}
	});
});