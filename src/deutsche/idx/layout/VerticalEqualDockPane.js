/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */
(function(){

var factory = function(dojo_declare, dojo_array, dojo_html, dojo_connect, dojo_base_fx, dojo_fx, dijit_wai, dijit_layout_LayoutWidget, dijit_TitlePane, idx_layout_DockContainer){  

/**
 * @name idx.layout.VerticalEqualDockPane
 * @class DockArea that layout children(DockPane) in vertically equal height.
 * @augments dijit.layout._LayoutWidget
 * @augments idx.layout._DockAreaMixin
 */
return dojo_declare("idx.layout.VerticalEqualDockPane", [ dijit_layout_LayoutWidget, idx.layout._DockAreaMixin ], // FIXME: how to get idx.layout._DockAreaMixin?
/**@lends idx.layout.VerticalEqualDockPane#*/		
{

	/**
   	 * Open/Close animation duration.
   	 * @public
   	 * @type number
   	 * @default 500
   	 */
	duration: 500,

	/**
   	 * Set overflow auto to DockPane inner container
   	 * @public
   	 * @type boolean
   	 * @default true
   	 */
	scrollable: true,
	
	/**
   	 * Initial Expand/Collapse state of this DockArea
   	 * @public
   	 * @type boolean
   	 * @default true
   	 */
	open: true,

	/**
   	 * sum of padding/border/margin width of DockPane
   	 * @private
   	 * @type number
   	 * @default 0
   	 */
	_hSpace: 0,
	
	/**
   	 * sum of padding/border/margin height of DockPane
   	 * @private
   	 * @type number
   	 * @default 0
   	 */
	_vSpace: 0,

	/**
	 * Overridden to setup children
	 * @see dijit._Widget
	 */
	startup: function() {
		this.inherited(arguments);
		this.setupChildren();
	},

	/**
	 * Overridden children's method to hook the toggle behavior.
	 * You need to call manually when you add children by dynamic instantiation.
	 */
	setupChildren: function() {
		var children = this.getChildren();
		if (children == null)
			return;

		for ( var i = 0; i < children.length; i++) {
			var pane = children[i];

			if (i == 0) {
				// calculate border/margin/padding size
				var m = dojo_html.marginBox(pane.domNode);
				var c = dojo_html.contentBox(pane.domNode);
				this._hSpace = m.w - c.w;
				this._vSpace = m.h - c.h;
			}

			if (this.scrollable) {
				dojo_html.style(pane.containerNode, "height", "100%");
				dojo_html.style(pane.containerNode, "overflow", "auto");
			}

			// override toggle function			
			var org_setOpenAttr = pane._setOpenAttr;
			var new_setOpenAttr = function(open, animate) {
				if (!this._dragging/* && this.docArea != "float"*/) {
					var parent = this.getParent();
					this._set("open", open);
					if (open) {
						parent._openPane(this);
					} else {
						parent._closePane(this);
					}
				}
			};
			
			pane._setOpenAttr = new_setOpenAttr;

			pane.connect(pane, "onUndock", function() {
				dojo_html.style(this.wipeNode, "height", "auto");
				this._setOpenAttr = org_setOpenAttr;
			});
			pane.connect(pane, "onDock", function() {
				var parent = this.getParent();
				if (parent != null && parent.declaredClass == "idx.layout.VerticalEqualDockPane") {
					// reparent the layout target
					this._setOpenAttr = new_setOpenAttr;
				}
			});
		}
	},

	/**
	 * Overridden the layout function to skip the zero width issue
	 * @see dijit.layout._LayoutWidget
	 */
	layout: function() {
		if (dojo_html.marginBox(this.domNode).w == 0)
			return;
		this.layoutVertical();
	},

	/**
	 * Layout children in vertically equal height
	 */
	layoutVertical: function() {
		var info = this._setupVerticalLayoutInfo();
		if (info == null)
			return;

		var availableHeight = dojo_html.contentBox(this.domNode).h;
		var self = this;
		for ( var i = 0; i < info.closePanes.length; i++) {
			var pane = info.closePanes[i];
			if (!dojo_html.hasClass(pane.domNode, "idxDockAreaMockPane")) {
				dojo_html.style(pane.hideNode, "display", "none");
				dojo_html.style(pane.wipeNode, "display", "none");
				dojo_html.marginBox(pane.wipeNode, {
					h: 0
				});
			}
			pane.resize({
				w: info.wipeWidth
			});
			availableHeight -= dojo_html.marginBox(pane.domNode).h;
		}
		for ( var i = 0; i < info.openPanes.length; i++) {
			var pane = info.openPanes[i];
			if (!dojo_html.hasClass(pane.domNode, "idxDockAreaMockPane")) {
				dojo_html.style(pane.hideNode, "display", "");
				dojo_html.style(pane.wipeNode, "display", "");
				dojo_html.marginBox(pane.wipeNode, {
					h: info.wipeHeight
				});
				availableHeight -= dojo_html.marginBox(pane.domNode).h;
				if (availableHeight > 0 && (i == info.openPanes.length - 1)) {
					dojo_html.marginBox(pane.wipeNode, {
						h: info.wipeHeight + availableHeight
					});
				}
			}
			pane.resize({
				w: info.wipeWidth
			});
		}
	},

	/**
	 * Calculate size related stuff used in vertically equal height layout
	 * @private
	 */
	_setupVerticalLayoutInfo: function() {
		var openPanes = [];
		var closePanes = [];
		var children = this.getChildren();

		if (children == null || children.length == 0)
			return null;

		var titleHeightSum = 0;
		for ( var i = 0; i < children.length; i++) {
			var pane = children[i];
			if (dojo_html.hasClass(pane.domNode, "idxDockAreaMockPane")) {
				titleHeightSum += dojo_html.marginBox(pane).h;
			} else {
				pane.toggleable = true;
				pane.open ? openPanes.push(pane) : closePanes.push(pane);
				titleHeightSum += dojo_html.marginBox(pane.titleBarNode).h + this._vSpace;
			}
		}

		var size = dojo_html.contentBox(this.domNode);
		var wipeWidth = size.w;
		var h = size.h - titleHeightSum;

		var wipeHeight = 0;
		if (openPanes.length > 1) {
			wipeHeight = Math.floor(h / openPanes.length);
		} else {
			wipeHeight = h;
		}

		return {
			openPanes: openPanes,
			closePanes: closePanes,
			wipeWidth: wipeWidth,
			wipeHeight: wipeHeight
		};
	},

	/**
	 * Open a pane and run the resize animation of each pane
	 * @private
	 */
	_openPane: function(pane) {
		if (this._animation && this._animation.status() == "playing") {
			this._animation.stop();
			this._animation = null;
		}

		var self = this;
		var anims = [];
		var info = this._setupVerticalLayoutInfo();
		dojo_array.forEach(info.openPanes, function(pane) {
			if (!dojo_html.hasClass(pane.domNode, "idxDockAreaMockPane")) {
				anims.push(self._buildOpenAnimation(pane, info));
			}
		});
		var anim = this._animation = dojo_fx.combine(anims);
		var con = dojo_connect.connect(anim, "onEnd", this, function() {
			this.layout();
			this._onPaneToggled(pane, true);
			dojo_connect.disconnect(con);
		});
		anim.play();
	},

	/**
	 * Close a pane and run the resize animation of each pane
	 * @private
	 */
	_closePane: function(pane) {
		if (this._animation && this._animation.status() == "playing") {
			this._animation.stop();
			this._animation = null;
		}

		var self = this;
		var anims = [];
		var info = this._setupVerticalLayoutInfo();
		dojo_array.forEach(info.openPanes, function(pane) {
			anims.push(self._buildOpenAnimation(pane, info));
		});
		anims.push(self._buildCloseAnimation(pane));
		var anim = this._animation = dojo_fx.combine(anims);
		var con = dojo_connect.connect(anim, "onEnd", this, function() {
			this.layout();
			this._onPaneToggled(pane, false);
			dojo_connect.disconnect(con);
		});
		anim.play();
	},

	/**
	 * Called when DockPane is to be opened/closed and run the resize animation
	 * @private
	 */
	_onPaneToggled: function(pane, open) {
		if (dojo_html.hasClass(pane.domNode, "idxDockAreaMockPane"))
			return;

		if (pane._started) {
			if (open) {
				pane._onShow();
			} else {
				pane.onHide();
			}
		}
		pane.arrowNodeInner.innerHTML = open ? "-" : "+";
		dijit_wai.setWaiState(pane.containerNode, "hidden", open ? "false" : "true");
		dijit_wai.setWaiState(pane.focusNode, "pressed", open ? "true" : "false");
		pane._set("open", open);
		pane._setCss();

		if (open) {
			this.onPaneOpen(pane);
		} else {
			this.onPaneClose(pane);
		}
	},

	/**
	 * Place folder for user to connect the open pane event
	 */
	onPaneOpen: function(pane) {
		// connect point
	},

	/**
	 * Place folder for user to connect the close pane event
	 */
	onPaneClose: function(pane) {
		// connect point		
	},

	/**
	 * Build open animatteProperty object
	 * @private
	 */
	_buildOpenAnimation: function(pane, info) {
		var self = this;
		var animation = dojo_base_fx.animateProperty({
			node: pane.wipeNode,
			duration: self.duration,
			properties: {
				height: {
					start: pane.wipeNode.clientHeight,
					end: info.wipeHeight
				}
			},
			onBegin: function(n) {
				dojo_html.style(pane.hideNode, "display", "");
				dojo_html.style(pane.wipeNode, "display", "");
			}
		});
		return animation;
	},

	/**
	 * Build close animatteProperty object
	 * @private
	 */
	_buildCloseAnimation: function(pane) {
		var self = this;
		var animation = dojo_base_fx.animateProperty({
			node: pane.wipeNode,
			duration: self.duration,
			properties: {
				height: {
					start: pane.wipeNode.clientHeight,
					end: 0
				}
			},
			onEnd: function(n) {
				dojo_html.style(pane.hideNode, "display", "none");
				dojo_html.style(pane.wipeNode, "display", "none");
			}
		});
		return animation;
	}

});

}; // end of factory

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
	dojo.provide("idx.layout.VerticalEqualDockPane");
	dojo.require("dijit.layout._LayoutWidget");
	dojo.require("dijit.TitlePane");
	dojo.require("idx.layout.DockContainer");
	factory(dojo.declare, dojo, dojo, dojo, dojo, dojo.fx, dijit, dijit.layout._LayoutWidget, dijit.TitlePane, idx.layout.DockContainer); 
}else{
	define([
		"../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
		"../../../../node_modules/intern-geezer/node_modules/dojo/_base/array",
		"dojo/_base/html",
		"dojo/_base/connect",
		"dojo/_base/fx",
		"dojo/fx",
		"dijit/_base/wai",
		"dijit/layout/_LayoutWidget",
		"dijit/TitlePane",
		"idx/layout/DockContainer"
	], factory);
}

})();
