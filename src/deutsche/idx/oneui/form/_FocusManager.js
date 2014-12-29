define([
	"../../../lib/dijit/focus",
	"../../../../lib/dojo/_base/window",
	"dojo/window",
	"dojo/dom", // dom.isDescendant
	"dojo/dom-attr",
	"dojo/dom-class",
	"dojo/_base/declare", // declare
	"dojo/_base/lang", // lang.extend	
	"dijit/registry"
], function(focus, win, winUtils, dom, domAttr, domClass, declare, lang, registry){
	focus._onTouchNode = function(/*DomNode*/ node, /*String*/ by){
		var srcNode = node;
		if(this._clearActiveWidgetsTimer){
			clearTimeout(this._clearActiveWidgetsTimer);
			delete this._clearActiveWidgetsTimer;
		}
		var newStack=[];
		try{
			while(node){
				var popupParent = domAttr.get(node, "dijitPopupParent");
				if(popupParent){
					node=registry.byId(popupParent).domNode;
				}else if(node.tagName && node.tagName.toLowerCase() == "body"){
					if(node === win.body()){
						break;
					}
					node=winUtils.get(node.ownerDocument).frameElement;
				}else{
					var id = node.getAttribute && node.getAttribute("widgetId"),
						widget = id && registry.byId(id);
					if(widget && !(by == "mouse" && widget.get("disabled"))){
						if(!widget._isValidFocusNode || widget._isValidFocusNode(srcNode)){
							newStack.unshift(id);
						}
					}
					node=node.parentNode;
				}
			}
		}catch(e){}
		this._setStack(newStack, by);
	}
	return focus;
});
