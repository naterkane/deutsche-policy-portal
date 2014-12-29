/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

(function() {

function factory(dLang,			// (dojo/_base/lang)
				 iMain,			// (idx)
				 dDomAttr,		// (dojo/dom-attr) for (dDomAttr.set)
				 dFormWidget,	// (dijit/form/_FormWidget)
				 iString) 		// (../string)
{
	var iFormWidgets = dLang.getObject("form.formWidgets", iMain);
	
dojo.extend(dFormWidget, {	
	/**
	 * The desired access key for this form widget. 
	 */
	accessKey: "",
	
	/**
	 * If the focus node is the INPUT node, then set its access key.
	 */
	_setAccessKeyAttr: function(accessKey) {
		this.accessKey = accessKey;
		if (iString.nullTrim(accessKey)) {
			if ((this.focusNode) && (this.focusNode.tagName == "INPUT")) {
				dDomAttr.set(this.focusNode, "accessKey", accessKey);
			}
		}
	}
});

	return iFormWidgets;
}

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){

	dojo.provide("idx.form.formWidgets");
	dojo.require("idx.ext");
	dojo.require("idx.string");
	dojo.require("dijit.form._FormWidget");

	factory(dojo,						// (dojo/_base/lang)
			idx,						// (idx)
			{set: dojo.attr},			// (dojo/dom-attr) for (dDomAttr.set)
			dijit.form._FormWidget,		// (dijit/form/_FormWidget)
			idx.string);				// (idx/string)
} else {
	define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/lang","idx","../../../../node_modules/intern-geezer/node_modules/dojo/dom-attr","dijit/form/_FormWidget","../string"],
		   factory);
}

})();

