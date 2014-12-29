/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

(function() {
function factory(dLang,iMain,dDom,dTree) {
	var iTrees = dLang.getObject("trees", true, iMain);
	
	// get the combo button prototype
	var baseProto = dTree.prototype;
    
	// 
	// Get the base functions so we can call them from our overrides
	//
	var baseIsExpando  = baseProto.isExpandoNode;
	
	baseProto.isExpandoNode = function(node, widget) {
		var baseResult = baseIsExpando.call(this,node,widget);
		if (baseResult) return true;
		if (! widget.expandoNodeText) return false;
		return dDom.isDescendant(node, widget.expandoNodeText);
	};
	
	return iTrees;
}

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){

	dojo.provide("idx.trees");
	dojo.require("idx.ext");
	dojo.require("dijit.Tree");

	factory(dojo,idx,dojo,dijit.Tree);
} else {
	define(["../../node_modules/intern-geezer/node_modules/dojo/_base/lang","idx","../../../node_modules/intern-geezer/node_modules/leadfoot/node_modules/dojo/dom","dijit/Tree"], factory);
}

})();
