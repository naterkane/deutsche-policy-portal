/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	"../../../../lib/dojo/dom-class",
	"dijit/CheckedMenuItem"
],function(declare, domClass, CheckedMenuItem){
	
	//	module:
	//		idx/oneui/form/_CheckBoxSelectMenuItem
	//	summary:
	//		A checkbox-like menu item for toggling on and off
	
	return declare("idx.oneui.form._CheckBoxSelectMenuItem", CheckedMenuItem, {
		// summary:
		//		A checkbox-like menu item for toggling on and off
		
		option: null,
		
		// reference of dojox.form._CheckedMultiSelectMenu
		parent: null,
		
		_updateBox: function(){
			// summary:
			//		Called to force the box to match the state of the select
			this.option.selected = !!this.option.selected; 
			this.set("checked", this.option.selected);
		},

		_onClick: function(/*Event*/ e){
			// summary:
			//		Clicking this item just toggles its state
			// tags:
			//		private
			if(e.keyCode != 13 && !this.disabled && !this.readOnly){
				this.option.selected = !this.option.selected;
				this.inherited(arguments);
			}
		},
		
		_setCheckedAttr: function(/*Boolean*/ checked){
			// summary:
			//		Hook so attr('checked', bool) works.
			//		Sets the class and state for the check box.
			domClass.toggle(this.domNode, "dijitCheckedMenuItemChecked", checked);
			this._set("checked", checked);
		}
	});
});

