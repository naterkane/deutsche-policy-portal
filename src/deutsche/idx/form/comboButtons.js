/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

(function(){
function factory(dLang,			// (dojo/_base/lang)
				 iMain,			// (idx)
				 dDomAttr,		// (dojo/dom-attr) for (dDomAttr.set)
				 dDomClass,		// (dojo/dom-class) for (dDomClass.add/remove)
				 dComboButton) 	// (dijit/form/ComboButton)
{
	var iComboButtons = dLang.getObject("form.comboButtons", true, iMain);
	
	// get the combo button prototype
    var comboProto  = dComboButton.prototype;
    
	// 
	// Get the base functions so we can call them from our overrides
	//
	var baseComboOpen  = comboProto.openDropDown;
	var baseComboClose = comboProto.closeDropDown;
	
	/**
	 * Overrides dijit.form.Button.buildRendering to respect CSS options.
	 */
	if (baseComboOpen) {
		comboProto.openDropDown = function() {
			var result = baseComboOpen.call(this, arguments);
			if (this._opened) dDomClass.add(this.domNode, "idxDropDownOpen");
			return result;
		};
	};
	
	if (baseComboClose) {
		comboProto.closeDropDown = function(focus) {
			var result = baseComboClose.call(this, arguments);
			dDomClass.remove(this.domNode, "idxDropDownOpen");
			return result;
		};
	};
	
	var afterBuildRendering = comboProto.idxAfterBuildRendering;
	comboProto.idxAfterBuildRendering = function() {
		if (afterBuildRendering) {
			afterBuildRendering.call(this);
		}
		if (this.titleNode) {
			dDomAttr.set(this.titleNode, "tabindex", ((this.tabIndex) ? (""+this.tabIndex) : "0"));
		}
		if (this._buttonNode) {
			dDomAttr.set(this._buttonNode, "tabindex", ((this.tabIndex) ? (""+this.tabIndex) : "0"));
		}		
	};
	return iComboButtons;
}

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
	
	dojo.provide("idx.form.comboButtons");
	dojo.require("dijit.form.ComboButton");
	dojo.require("idx.widgets");

	factory(dojo,							// dLang		(dojo/_base/lang)
			idx,							// idx			(idx)
			{set: dojo.attr},				// dDomAttr 	(dojo/dom-attr) for (dDomAttr.set)
			{add: dojo.addClass,			// dDomClass 	(dojo/dom-class) for (dDomClass.add/remove)
			 remove: dojo.removeClass},
			dijit.form.ComboButton);		// dComboButton (dijit/form/ComboButton)

} else {
	define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/lang","idx","../../../../node_modules/intern-geezer/node_modules/dojo/dom-attr","dojo/dom-class","dijit/form/ComboButton","../widgets"],
		   factory);
}
})();
	
