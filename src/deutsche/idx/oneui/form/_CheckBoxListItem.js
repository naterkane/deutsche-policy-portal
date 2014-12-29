/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	"../../../../lib/dijit/_Widget",
	"dijit/_CssStateMixin",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"idx/oneui/form/_InputListItemMixin",
	"dojo/text!./templates/_CheckBoxListItem.html",
	"dijit/form/CheckBox"
], function(declare, _Widget, _CssStateMixin, _TemplatedMixin, _WidgetsInTemplateMixin, _InputListItemMixin, template){

	//	module:
	//		idx/oneui/form/_CheckBoxListItem
	//	summary:
	//		An internal used list item for CheckBoxList.
	
	return declare("idx.oneui.form._CheckBoxListItem", [_Widget, _CssStateMixin, _TemplatedMixin, _WidgetsInTemplateMixin, _InputListItemMixin], {
		//	summary:
		//		An internal used list item for CheckBoxList.
	
		widgetsInTemplate: true,
		
		templateString: template,
	
		baseClass: "idxCheckBoxListItem",
		
		_changeBox: function(){
			// summary:
			//		Called to force the select to match the state of the check box
			//		(only on click of the checkbox)	 Radio-based calls _setValueAttr
			//		instead.
			if(this.get("disabled") || this.get("readOnly")){ return; }
			this.option.selected = !!this.focusNode.get("checked");
			this.parent.set("value",  this.parent._getValueFromOpts());
			this.parent.focusChild(this);
		}
	});
});