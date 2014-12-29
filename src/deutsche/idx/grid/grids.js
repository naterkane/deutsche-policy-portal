/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

(function() {
function factory(dLang,iMain,dKernel,dViewManager,iUtil) {
	var iGrids = dLang.getObject("grid.grids", true, iMain);
	
    var viewMgrProto = dViewManager.prototype;
    
    if ((dKernel.version.major == 1) && (dKernel.version.minor < 7)) {
		console.log("****************");
    	console.log("****** Replacing dojox.grid._ViewManager.arrange function for pre-1.7 Dojo");
		console.log("****************");
		
    	viewMgrProto.arrange = function(l,w) {    		
    		var i, v, vw, len = this.views.length;
    		// find the client
    		var c = (w <= 0 ? len : this.findClient());
    		// layout views
    		var setPosition = function(v, l){
    			var ds = v.domNode.style;
    			var hs = v.headerNode.style;

    			if(!dKernel._isBodyLtr()){
    				ds.right = l + 'px';
    				// fixed rtl, the scrollbar is on the right side in FF
    				if ((iUtil.isFF < 4) || (iUtil.isWebKit)) {
    					hs.right = l + v.getScrollbarWidth() + 'px';
    					hs.width = parseInt(hs.width, 10) - v.getScrollbarWidth() + 'px';
    				}else{
    					hs.right = l + 'px';
    				}
    			}else{
    				ds.left = l + 'px';
    				hs.left = l + 'px';
    			}
    			ds.top = 0 + 'px';
    			hs.top = 0;
    		};
    		// for views left of the client
    		//BiDi TODO: The left and right should not appear in BIDI environment. Should be replaced with
    		//leading and tailing concept.
    		for(i=0; (v=this.views[i])&&(i<c); i++){
    			// get width
    			vw = this.getViewWidth(i);
    			// process boxes
    			v.setSize(vw, 0);
    			setPosition(v, l);
    			if(v.headerContentNode && v.headerContentNode.firstChild){
    				vw = v.getColumnsWidth()+v.getScrollbarWidth();
    			}else{
    				vw = v.domNode.offsetWidth;
    			}
    			// update position
    			l += vw;
    		}
    		// next view (is the client, i++ == c)
    		i++;
    		// start from the right edge
    		var r = w;
    		// for views right of the client (iterated from the right)
    		for(var j=len-1; (v=this.views[j])&&(i<=j); j--){
    			// get width
    			vw = this.getViewWidth(j);
    			// set size
    			v.setSize(vw, 0);
    			// measure in pixels
    			vw = v.domNode.offsetWidth;
    			// update position
    			r -= vw;
    			// set position
    			setPosition(v, r);
    		}
    		if(c<len){
    			v = this.views[c];
    			// position the client box between left and right boxes
    			vw = Math.max(1, r-l);
    			// set size
    			v.setSize(vw + 'px', 0);
    			setPosition(v, l);
    		}
    		return l;
    	};
    	    	
    }
    
    return iGrids;
}

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){

	dojo.provide("idx.grid.grids");
	dojo.require("dojox.grid.DataGrid");
	dojo.require("dojox.grid._ViewManager");
	dojo.require("idx.util");

	factory(dojo,idx,dojo,dojox.grid._ViewManager,idx.util);
} else {
	define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/lang","idx","../../../../dist/lib/dojo/_base/kernel","dojox/grid/_ViewManager","idx/util"], factory);
}

})();

