/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["exports", "../../../node_modules/intern-geezer/node_modules/dojo/_base/sniff", "../../../lib/dojo/_base/window", "dojo/dom-construct"], function(exports, has, win, domConstruct){
	
	function _getFontMeasurements(){
		var heights = {
			'1em': 0, '1ex': 0, '100%': 0, '12pt': 0, '16px': 0, 'xx-small': 0,
			'x-small': 0, 'small': 0, 'medium': 0, 'large': 0, 'x-large': 0,
			'xx-large': 0
		};
		var p;
		if(has("ie")){
			win.doc.documentElement.style.fontSize="100%";
		}
		var div = domConstruct.create("div", {style: {
				position: "absolute",
				left: "0",
				top: "-100px",
				width: "30px",
				height: "1000em",
				borderWidth: "0",
				margin: "0",
				padding: "0",
				outline: "none",
				lineHeight: "1",
				overflow: "hidden"
			}}, win.body());
		for(p in heights){
			div.style.fontSize = p;
			heights[p] = Math.round(div.offsetHeight * 12/16) * 16/12 / 1000;
		}

		win.body().removeChild(div);
		return heights; //object
	};
	var fontMeasurements = null;
	function _getCachedFontMeasurements(recalculate){
		if(recalculate || !fontMeasurements){
			fontMeasurements = _getFontMeasurements();
		}
		return fontMeasurements;
	};
	
	
	
	exports.normalizedLength = function(len) {
		if(len.length === 0){ return 0; }
		if(len.length > 2){
			var px_in_pt = _getCachedFontMeasurements()["12pt"] / 12;
			var val = parseFloat(len);
			switch(len.slice(-2)){
				case "px": return val;
				case "pt": return val * px_in_pt;
				case "in": return val * 72 * px_in_pt;
				case "pc": return val * 12 * px_in_pt;
				case "mm": return val * g.mm_in_pt * px_in_pt;
				case "cm": return val * g.cm_in_pt * px_in_pt;
			}
		}
		return parseFloat(len);	// Number
	}
	
});