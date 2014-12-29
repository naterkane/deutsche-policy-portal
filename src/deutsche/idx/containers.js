/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */
(function() {
function factory(dLang,iMain,dContainer) {
	var iContainers = dLang.getObject("containers", true, iMain);
	
	// get the combo button prototype
	var baseProto  = dContainer.prototype;
    
	// 
	// Get the base functions so we can call them from our overrides
	//
	var baseAddChild  = baseProto.addChild;
	var baseRemoveChild = baseProto.removeChild;
	
    baseProto.addChild = function(child,index) {
    	if (baseAddChild) baseAddChild.call(this, child, index);
    	if (this._started) {
    		this._idxStyleChildren();
    	}
    };
    
    baseProto.removeChild = function(child) {
    	if (baseRemoveChild) baseRemoveChild.call(this, child);
    	if (typeof child == "number") {
    		child = this.getChildren()[child];
    	}
    	if (this._started) {
    		this._idxStyleChildren();
    	}
    };    
    
    return iContainers;
}

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){

	dojo.provide("idx.containers"); 
	dojo.require("dijit._Container"); 
	dojo.require("dijit._WidgetBase"); 
	dojo.require("idx.widgets"); 

	factory(dojo,idx,dijit._Container);
	
} else {
	define(["../../node_modules/intern-geezer/node_modules/dojo/_base/lang","idx","../../../dist/lib/dijit/_Container","dijit/_WidgetBase","idx/widgets"],factory);
}

})();
