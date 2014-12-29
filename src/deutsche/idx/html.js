(function() {
function factory(iMain,
				  dLang,
				  dWindow,
				  dDomConstruct,
				  dDomGeo) {
	
	var iHTML = dLang.getObject("html", true, iMain);

	iMain.getOffsetPosition = iHTML.getOffsetPosition = function(node, root) {
		root = root || dWindow.body();
		var n = node;
		
		var l = 0;
		var t = 0;
		
		while (n != root) {
			l += n.offsetLeft;
			t += n.offsetTop;
			n = n.offsetParent;
		}
		return {l: l, t: t};
	};
	
	iMain.containsNode = iHTML.containsNode = function(parent, node) {
		var n = node;
		while (n && n != dWindow.body()) {
			if (n == parent) {
				return true;
			}
			if (n.parentNode) {
				n = n.parentNode;	
			} else {
				break;
			}
		}
		return false;
	};
	
	iMain.containsCursor = iHTML.containsCursor = function(node, evt) {
		var pos = dDomGeo.position(node);
		var l = pos.x;
		var t = pos.y;
		var r = l + pos.w;
		var b = t + pos.h;
		var cx = evt.clientX;
		var cy = evt.clientY;
		
		var contained = cx > l && cx < r && cy > t && cy < b;
		return contained;
	};
	
	iMain.setTextNode = iHTML.setTextNode = function(/*node*/ node, /*string*/ text){
		if(!node){
			return;
		}
		dDomConstruct.place(dWindow.doc.createTextNode(text), node, "only");
	};
	
	iMain.escapeHTML = iHTML.escapeHTML = function(/*string*/ s){
		if(!dLang.isString(s)){
			return s;
		}
		return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
	};
	
	iMain.unescapeHTML = iHTML.unescapeHTML = function(/*string*/s){
		if(!dLang.isString(s)){
			return s;
		}
		return s.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,"\"").replace(/&amp;/g,"&");
	};

	return iHTML;
}

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){

	dojo.provide("idx.html");
	dojo.require("idx.main");
	factory(idx, 	// iMain
			dojo,	// dLang
			dojo,	// dWindow
			dojo,	// dDomConstruct
			dojo);	// dDomGeo
} else {
	define(["idx", "../../node_modules/intern-geezer/node_modules/dojo/_base/lang","../../lib/dojo/_base/window","dojo/dom-construct","dojo/dom-geometry"], factory);
}

})();