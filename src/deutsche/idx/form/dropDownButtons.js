/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

(function() {

function factory(dLang,				// (dojo/_base/lang)
		         iMain,				// (idx)
		         dDomClass,			// (dojo/dom-class) for (dDomclass.add/remove)
		         dDropDownButton) 	// (dijit/form/DropDownButton)
{
	var iDropDownButtons = dLang.getObject("form.dropDownButtons", true, iMain);
	
	// get the dropDown button prototype
    var dropDownProto  = dDropDownButton.prototype;
    
	// 
	// Get the base functions so we can call them from our overrides
	//
	var baseDropDownOpen  = dropDownProto.openDropDown;
	var baseDropDownClose = dropDownProto.closeDropDown;
	
	/**
	 * Overrides dijit.form.Button.buildRendering to respect CSS options.
	 */
	if (baseDropDownOpen) {
		dropDownProto.openDropDown = function() {
			var result = baseDropDownOpen.call(this, arguments);
			if (this._opened) dDomClass.add(this.domNode, "idxDropDownOpen");
			return result;
		};
	};
	
	if (baseDropDownClose) {
		dropDownProto.closeDropDown = function(focus) {
			var result = baseDropDownClose.call(this, arguments);
			dDomClass.remove(this.domNode, "idxDropDownOpen");
			return result;
		};
	}	
	
	return iDropDownButtons;
}

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){

	dojo.provide("idx.form.dropDownButtons");
	dojo.require("dijit.form.DropDownButton");

	factory(dojo,						// (dojo/_base/lang)
			idx,						// (idx)
			{add: dojo.addClass,		// (dojo/dom-class) for (dDomClass.add/remove)
			 remove: dojo.removeClass},	
			dijit.form.DropDownButton);	// (dijit/form/DropDownButton)
} else {
	define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/lang","idx","../../../lib/dojo/dom-class","dijit/form/DropDownButton"],
		   factory);
}

})();
