
(function() {
function factory(dDeclare,			// (dojo/_base/declare)
		         dLang,				// (dojo/_base/lang)
		         dDomConstruct,		// (dojo/dom-construct)
		         dDomStyle,			// (dojo/dom-style) for (dDomStyle.get/set)
		         dDomAttr,			// (dojo/dom-attr) for (dDomAttr.get/set)
		         dFX,				// (dojo/_base/fx)
		         dFocus,			// (dijit/focus)
		         dBaseFocus,		// (dijit/_base/focus)
		         iUtil)				// (../util)
{
	/**
	 * @name idx.widget._MaximizeMixin
	 * @class Mix-in class to provide methods to maximize and restore widget.
	 */
return dDeclare("idx.widget._MaximizeMixin",null,
		/**@lends idx.widget._MaximizeMixin#*/
{	
		/**
		 * Specifies whether to use animation for transition.
		 * @type Boolean
		 * @default false
		 */
		useAnimation: false,

		/**
		 * Duration of transition.
		 * @type Number
		 * @default 500
		 */
		duration: 500,

		/**
		 * Specifies whether to maximize in place for already absolute positioned nodes.
		 * @type Boolean
		 * @default false
		 */
		inPlace: false,

		_placeHolder: null,
		_maximizedItem: null,
		_anchor: null,

		/**
		 * Maximizes a node to fit the target node
		 * @param {Object} node
		 * @param {Object} target
		 */
		maximize: function(node, target) {
			if(node == this._maximizedItem) {
				return;
			} else if(this._maximizedItem) {
				this.restore();
			}
			
			var focus = dBaseFocus.getFocus(); // keep focus
			if(!this.inPlace){
				if(!this._placeHolder) {
					this._placeHolder = dDomConstruct.create("DIV");
				}
				if(!this._anchor) {
					this._anchor = dDomConstruct.create("DIV");
					dDomStyle.set(this._anchor, "position", "relative");
					dDomStyle.set(this._anchor, "zIndex", 99999);
				}
				dDomConstruct.place(this._placeHolder, node, "before");
				dDomConstruct.place(this._anchor, target.firstChild, "before");
				dDomConstruct.place(node, this._anchor, "last");
			}
			
			//this._cachedOriginalStyle = node.getAttribute("style");
			this._useCSSText = false;
			var cachedStyle = dDomAttr.get(node, "style");
			if ((cachedStyle) && (typeof(cachedStyle) == "object")) {
				// NOTE: we must cache this as text and not as an object
				// since the object is a reference to the node's style and
				// will change.  we need to cache the actual text
				this._useCSSText = true;
				cachedStyle = cachedStyle.cssText;
			}
			this._cachedOriginalStyle = cachedStyle;
			
			dDomStyle.set(node, "position", "absolute");
			if(this.inPlace){
				dDomStyle.set(node, "zIndex", 99999);
			}
			var _w = dDomStyle.get(target, "width");
			var _h = dDomStyle.get(target, "height");
			if(this.useAnimation) {
				var t = dDomStyle.get(node, "top");
				var l = dDomStyle.get(node, "left");
				var w = dDomStyle.get(node, "width");
				var h = dDomStyle.get(node, "height");
				this._restoreBox = {t: t, l: l, w: w, h: h};
				dFX.animateProperty({
					node: node,
					duration: this.duration,
					properties: {
						top: {
							start: t, end: 0, unit: "px"
						},left: {
							start: l, end: 0, unit: "px"
						}, width: {
							start: w, end: _w, unit: "px"
						}, height: {
							start: h, end: _h, unit: "px"
						}
					}
				}).play();
			} else {
				dDomStyle.set(node, "top", 0);
				dDomStyle.set(node, "left", 0);
				dDomStyle.set(node, "width", _w+"px");
				dDomStyle.set(node, "height", _h+"px");
			}
			
			this._maximizedItem = node;
			dFocus.focus(focus); // restore focus
		},

		/**
		 * Restores the maximized node.
		 */
		restore: function() {
			if(this._maximizedItem){
				if(this.useAnimation && this._restoreBox){
					var node = this._maximizedItem;
					var t = dDomStyle.get(node, "top");
					var l = dDomStyle.get(node, "left");
					var w = dDomStyle.get(node, "width");
					var h = dDomStyle.get(node, "height");
					var restoreBox = this._restoreBox;
					dFX.animateProperty({
						node: node,
						duration: this.duration,
						properties: {
							top: {
								start: t, end: restoreBox.t, unit: "px"
							},left: {
								start: l, end: restoreBox.l, unit: "px"
							}, width: {
								start: w, end: restoreBox.w, unit: "px"
							}, height: {
								start: h, end: restoreBox.h, unit: "px"
							}
						},
						onEnd: dLang.hitch(this, this._restore)
					}).play();
				}else{
					this._restore();
				}
			}
		},

		_restore: function(){
			if(this._maximizedItem){
				var focus = dBaseFocus.getFocus(); // keep focus
				if(!this.inPlace){
					dDomConstruct.place(this._maximizedItem, this._placeHolder, "before");
				}
				if(iUtil.isWebKit){ // removing style attribute seems not working on WebKit
					var node = this._maximizedItem;
					dDomStyle.set(node, "position", "");
					dDomStyle.set(node, "top", "");
					dDomStyle.set(node, "left", "");
					dDomStyle.set(node, "width", "");
					dDomStyle.set(node, "height", "");
				}else{
					this._maximizedItem.removeAttribute("style");
				}
				if(this._cachedOriginalStyle) {
					if (this._useCSSText) {
						this._maximizedItem.style.cssText = this._cachedOriginalStyle;
					} else {
						dDomAttr.set(this._maximizedItem, "style", this._cachedOriginalStyle);
					}
				}
				if(!this.inPlace){
					this._maximizedItem.parentNode.removeChild(this._placeHolder);
					this._anchor.parentNode.removeChild(this._anchor);
				}
				this._maximizedItem = null;
				dFocus.focus(focus); // restore focus
			}
		}
});
}

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){

	dojo.provide("idx.widget._MaximizeMixin");
	dojo.require("idx.util");
	factory(dojo.declare,		// dDeclare			(dojo/_base/declare)
			dojo,				// dLang			(dojo/_base/lang)
			dojo,				// dDomConstruct	(dojo/dom-construct)
			{get: dojo.style,	// dDomStyle		(dojo/dom-style.get)
			 set: dojo.style},	
			 {get: dojo.attr,	// dDomAttr			(dojo/dom-attr.get)
			 set: dojo.attr},
			dojo,				// dFX				(dojo/_base/fx)
			dijit,				// dFocus			(dijit/focus)
			dijit,				// dBaseFocus		(dijit/_base/focus)
			idx.util);			// iUtil			(../util)

} else {
	define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	        "../../../../dist/lib/dojo/_base/lang",
	        "dojo/dom-construct",
	        "dojo/dom-style",
	        "dojo/dom-attr",
	        "dojo/_base/fx",
	        "dijit/focus",
	        "dijit/_base/focus",
	        "../util"],
	        factory);
}

})();