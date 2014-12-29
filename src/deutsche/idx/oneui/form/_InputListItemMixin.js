/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	"../../../../../dist/lib/dojo/_base/lang"
], function(declare, lang){
	
	//	module:
	//		idx/oneui/form/InputListItemMixin
	//	summary:
	//		An internal mix in class for CheckBoxList and RadioButtonSet

	return declare("idx.oneui.form._InputListItemMixin",
		null,
		{
		// summary:
		//		The individual items for a InputList
		
		widgetsInTemplate: true,
		
		// option: dojox.form.__SelectOption
		//		The option that is associated with this item
		option: null,
		parent: null,
		
		// disabled: boolean
		//		Whether or not this widget is disabled
		disabled: false,
	
		// readOnly: boolean
		//		Whether or not this widget is readOnly
		readOnly: false,
	
		postCreate: function(){
			this.inherited(arguments);
			this.focusNode.onClick = lang.hitch(this, "_changeBox");
			this.labelNode.innerHTML = this.option.label;
			this._updateBox();
		},
		
		_updateBox: function(){
			// summary:
			//		Called to force the box to match the state of the select
			this.focusNode.set("checked", !!this.option.selected);
		},
		
		_setDisabledAttr: function(value){
			// summary:
			//		Disables (or enables) all the children as well
			this.disabled = value;
			this.focusNode.set("disabled", this.disabled);
		},
		
		_setReadOnlyAttr: function(value){
			// summary:
			//		Sets read only (or unsets) all the children as well
			this.readOnly = value;
			this.focusNode.set("readOnly", value);
		},
		
		focus: function(){
			this.focusNode.focus();
		}
	});
});