/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

(function(){
function factory(dLang,iMain,dKernel,dTooltip,iUtil) {
	var iTooltips = dLang.getObject("tooltips", true, iMain);
	var dMasterTooltip = dTooltip._MasterTooltip;	
    var masterProto = dMasterTooltip.prototype;
    
    if ((dKernel.version.major == 1) && (dKernel.version.minor < 7)) {
		console.log("****************");
    	console.log("****** Replacing dijit._MasterTooltip.show function for pre-1.7 Dojo");
		console.log("****************");
		
		var origShow = masterProto.show;
		
    	masterProto.show = function(innerHTML, aroundNode, pos, rtl) {
			if(this.aroundNode && this.aroundNode === aroundNode){
				return;
			}
    		origShow.call(this, innerHTML, aroundNode, pos, rtl);
    		
			if (iUtil.isFF || (iUtil.isIE < 8)) {
				var s = this.domNode.style;
				var l = dKernel._isBodyLtr();
				s[l ? "right" : "left"] = "auto";
			}
    	};
    	    	
    }
    return iTooltips;
}

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){

	dojo.provide("idx.tooltips");
	dojo.require("idx.ext");
	dojo.require("dijit.Tooltip");
	dojo.require("idx.util");

	factory(dojo,idx,dojo,dijit,idx.util);
	
} else {
	define(["../../node_modules/intern-geezer/node_modules/dojo/_base/lang","idx","../../../dist/lib/dojo/_base/kernel","dijit/Tooltip","./util"],
			factory);
}

})();