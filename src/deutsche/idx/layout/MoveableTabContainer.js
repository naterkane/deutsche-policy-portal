(function(){

var factory = function(dojo_declare, dojo_lang, dojo_array, dojo_window, dojo_html, dojo_event, dojo_connect, dojo_keys, dojo_dnd_Moveable, dijit_registry, dijit_layout_TabContainer, dijit_layout_ScrollingTabController, dijit_layout_ContentPane){

/**
 * @name idx.layout.MoveableTabContainer
 * @class TabContainer enabling to re-order tabs by dragging.
 * @augments dijit.layout.TabContainer
 */
var MoveableTabContainer = dojo_declare("idx.layout.MoveableTabContainer", [dijit_layout_TabContainer],
/**@lends idx.layout.MoveableTabContainer#*/
{
	controllerWidget: "idx.layout.MoveableTabController"
});

/**
 * @name idx.layout.MoveableTabController
 * @class TabController enabling to re-order tabs by dragging.
 * @augments dijit.layout.ScrollingTabController
 */
dojo_declare("idx.layout.MoveableTabController", [dijit_layout_ScrollingTabController],
/**@lends idx.layout.MoveableTabController#*/
{
	buttonWidget: "idx.layout.MoveableTabButton",
	
	_movingTab: false,

	_mock: null,

	/**
	 * Sets up event handlers and creates the insert location indicator.
	 */
	startup: function() {
		this.inherited(arguments);
		
		this.subscribe(this.id + "/idx/tab/move/start", "_onMoveStart");
		this.subscribe(this.id + "/idx/tab/move/end", "_onMoveEnd");
		this.subscribe(this.id + "/idx/tab/move", "_onMove");
		this.connect(this._rightBtn.domNode, "onmouseover", "_onRightButtonMouseOver");
		this.connect(this._leftBtn.domNode, "onmouseover", "_onLeftButtonMouseOver");
		this.connect(this._rightBtn.domNode, "onmouseout", "_onScrollMouseOut");
		this.connect(this._leftBtn.domNode, "onmouseout", "_onScrollMouseOut");
		this._indicator = dojo_html.create("div", {
			"class": "idxMoveableTabIndicator"
		}, this.containerNode);
	},

	/**
	 * Associates the content widget to the button.
	 * @param {Object} page
	 * @param {Number} insertIndex
	 */
	onAddChild: function(page, insertIndex) {
		this.inherited(arguments);
		
		// add reference to content widget
		var button = this.pane2button[page.id];
		if (button) {
			button.page = page;
			button.tabTopicId = this.id;
		}
	},

	/**
	 * Hides the insert location indicator on removing child
	 * @param {Object} page
	 */
	onRemoveChild: function(page) {
		this.inherited(arguments);
		this._hideIndicator();
	},

	/**
	 * Sets up properties for dragging a tab
	 * @param {Object} msg
	 * @private
	 */
	_onMoveStart: function(msg) {
		var container = dijit_registry.byId(this.containerId);
		container.selectChild(msg.content);
		this._computeBounds();
		var loc = {x:msg.event.clientX, y:msg.event.clientY};
		var children = this.getChildren();
		this._movingTab = true;
		this._tabIndex = dojo_array.indexOf(children, msg.target);
	},
	
	/**
	 * Called when moving tab via keyboard (ctrl + left/right) or (meta + left/right)
	 * @param {Object} msg - {dir: "left/right"}
	 * @extends dijit.layout.StackController.onkeypress
	 * @private
	 */
	onkeypress: function(evt) {
		var modKey = evt.ctrlKey || evt.metaKey;
		var key = evt.keyCode;
		
		if (modKey) {
			var container = dijit_registry.byId(this.containerId);
			var page = container.selectedChildWidget;
			var children = container.getChildren();
			var index = dojo_array.indexOf(children, page);
			var dir = 0;
			if (key === dojo_keys.RIGHT_ARROW) {
				dir = (this.isLeftToRight() ? 1 : -1);
			} else if (key === dojo_keys.LEFT_ARROW) {
				dir = (this.isLeftToRight() ? -1 : 1);
			} else {
				this.inherited(arguments);
			}
			if(dir > 0){
				if (index < children.length - 1) {
					dojo_event.stop(evt);
					container.removeChild(page);
					container.addChild(page, index + 1);
					container.selectChild(page);
					this.pane2button[page.id].focus()		
				}
			}else if(dir < 0){
				if (index > 0) {
					dojo_event.stop(evt);
					container.removeChild(page);
					container.addChild(page, index - 1);
					container.selectChild(page);
					this.pane2button[page.id].focus()		
				}
			}
		} else {
			this.inherited(arguments);
		}
	},

	/**
	 * Checks inserting location.
	 * @param {Object} msg
	 * @private
	 */
	_onMove: function(msg) {
		var pos = dojo_html.position(this.containerNode);
		var loc = {x:msg.event.clientX - pos.x, y:msg.event.clientY - pos.y};
		
		var val = (this.tabPosition.indexOf("h") > -1 ? loc.y : loc.x);
		this._dragOut = !this._locationCheck(val, msg.event);
	},
	
	/**
	 * Moves the tab to the new position.
	 * @param {Object} msg
	 * @private
	 */
	_onMoveEnd: function(msg) {
		this._movingTab = false;
		this._repositionTab(this._insertLoc, msg.target);
		this._hideIndicator();
	},

	/**
	 * Slides tabs when dragging over the right scroll button.
	 * @private
	 */
	_onRightButtonMouseOver: function() {
		if (this._movingTab) {
			this._rightHover = true;
			this._slide(1, 1);
		}
	},

	/**
	 * Slides tabs when dragging over the left scroll button.
	 * @private
	 */
	_onLeftButtonMouseOver: function() {
		if (this._movingTab) {
			this._leftHover = true;
			this._slide(-1, 1);
		}
	},

	/**
	 * Stops sliding tabs.
	 * @private
	 */
	_onScrollMouseOut: function() {
		this._leftHover = false;
		this._rightHover = false;
	},

	/**
	 * Slides (scroll) tabs.
	 * @param {Number) dir
	 * @param {Number) num
	 * @private
	 */
	_slide: function(dir, num) {
		var w = dojo_html.marginBox(this.getChildren()[0].domNode).w
		var d = w * num * dir;
		
		var amt = this._getScroll() + d;

		this._setButtonClass(amt);
		var anim = this.createSmoothScroll(amt);
		anim.onEnd = dojo_lang.hitch(this, "_keepScrolling");
		anim.play();
	},

	/**
	 * Repeats sliding tabs.
	 * @private
	 */
	_keepScrolling: function() {
		var func = dojo_lang.hitch(this, function() {
			if (this._rightHover) {
				this._slide(1, 1);
			} else if (this._leftHover) {
				this._slide(-1, 1);
			}	
		});
		
		setTimeout(func, 0);		
	},

	/**
	 * Moves the tab to the new location.
	 * @param {Number} loc
	 * @param {Object} tab
	 * @private
	 */
	_repositionTab: function(loc, tab) {
		if(!tab || !tab.page){
			return;
		}
		if (this._tabIndex < loc) {
			loc--;
		}
		var container = dijit_registry.byId(this.containerId);
		try {
			container.removeChild(tab.page);
			if(this._mock){
				container.removeChild(this._mock);
			}
		} catch (e) {
			// ignore
		}
		container.addChild(tab.page, loc);
		container.selectChild(tab.page);
	},

	/**
	 * Test if this widget contains the mouse position in the event.
	 * @param {Object} evt
	 * @private
	 */
	_containsCursor: function(evt) {
		var pos = dojo_html.position(this.domNode);
		var l = pos.x, t = pos.y, r = l + pos.w, b = t + pos.h;
		var x = evt.clientX;
		var y = evt.clientY;
		if (x > l - 20 && x < r + 20 && y > t - 20 && y < b + 20) {
			return true;
		} else {
			return false;
		}
	},

	/**
	 * Checks the insertion location and shows the indicator.
	 * @param {Number} val
	 * @param {Object} evt
	 * @private
	 */
	_locationCheck: function(val, evt) {
		if (evt && !this._containsCursor(evt)) {
			return false;
		}
		var ltr = this.isLeftToRight();
		var i = 0;
		for (i = 0; i < this._bounds.length; i++) {
			var bound = this._bounds[i];
			if(ltr){
				if (val < bound) {
					break;
				}
			}else{ // rtl
				if(val > bound){
					break;
				}
			}
		}
		this._showIndicatorAt(i);
		return true;
	},

	/**
	 * Shows the insert location indicator.
	 * @param {Number} idx
	 * @private
	 */
	_showIndicatorAt: function(idx) {
		var btns = this.getChildren();
		var btn = null;
		if (btns.length <= idx) {
			btn = btns[idx-1];
		} else {
			btn = btns[idx];
		}
		
		var loc = null;
		if (btn) {
			loc = this._getOffsetPosition(btn.domNode, this.tablistWrapper);

			loc.t -= 6;
			loc.l -= 8;
			if(this.isLeftToRight()){
				if (btns.length <= idx) {
					loc.l += dojo_html.marginBox(btn.domNode).w;
				}
			}else{
				if(btns.length > idx){
					loc.l += dojo_html.marginBox(btn.domNode).w;
				}
				var r = dojo_html.marginBox(this.tablistWrapper).w - loc.l - 16;
				dojo_html.style(this._indicator, "right", r + "px");
			}
			dojo_html.marginBox(this._indicator, loc);
			dojo_html.style(this._indicator, "display", "block");
		} else {
			// there's no button: the container is empty
			// create a mock container
			this._mock = this._mock || new dijit_layout_ContentPane();
			var container = dijit_registry.byId(this.containerId);
			container.addChild(this._mock);
		}
		
		this._insertLoc = idx;
	},

	/**
	 * Hides the insert location indicator.
	 */
	_hideIndicator: function() {
		dojo_html.style(this._indicator, "display", "none");
	},

	/**
	 * Computes coordinates of each of my children, relative to my own position.
	 * This will later be used when calculating insert index.
	 * @private
	 */
	_computeBounds: function() {
		this._bounds = [];
		var tabs = this.getChildren();
		
		var c = 0;
		for (var i = 0; i < tabs.length; i++) {
			var tab = tabs[i];
			var left = tab.domNode.offsetLeft + dojo_html.marginBox(tab.domNode).w / 2;
			this._bounds.push(left);
		}
	},

	/**
	 * Calculates offset position of the node from the parent node.
	 * @param {Object} node
	 * @param {Object} parent
	 * @private
	 */
	_getOffsetPosition: function(node, parent) {
		var x = 0;
		var y = 0;
		var n = node;
		while (n != parent) {
			x += n.offsetLeft;
			y += n.offsetTop;
			n = n.offsetParent;
		}
		return {l:x, t:y};
	}
});

/**
 * @name idx.layout.MoveableTabButton
 * @class TabButton enabling to re-order tabs by dragging.
 * @augments dijit.layout._TabButton
 */
dojo_declare("idx.layout.MoveableTabButton", [dijit.layout._TabButton], // FIXME: how to get dijit.layout._TabButton?
/**@lends idx.layout.MoveableTabButton#*/
{

	/**
	 * Dragging pixel amount before starting undocking.
	 * @type Number
	 * @default 10 
	 */
	delay: 10,

	/**
	 * Associated content widget.
	 * @type Object
	 * @default null
	 */
	page: null,

	_moving: false,

	/**
	 * Topic ID for events being published during re-ordering operations.
	 * @type String
	 * @default ""
	 */
	tabTopicId: "",

	/**
	 * Sets up an event handler.
	 */
	postCreate: function() {
		this.inherited(arguments);
		
		this.connect(this.focusNode, "onmousedown", "_onTabMouseDown");
	},

	/**
	 * Obtains the tab container widget.
	 */
	startup: function() {
		this.inherited(arguments);
		this._controller = dijit_registry.getEnclosingWidget(this.domNode.parentNode);
	},

	/**
	 * Sets up event handlers for dragging.
	 * @param {Object} evt
	 * @private
	 */
	_onTabMouseDown: function(evt) {
		this._makeSelectable(false);
		this._startLoc = {x: evt.clientX, y: evt.clientY};
		this._moveConnects = [
             this.connect(dojo_window.body(), "onmousemove", "_onTabMouseMove"),
             this.connect(dojo_window.body(), "onmouseup", "_onTabMouseUp")
        ];
	},

	/**
	 * Removes event handlers and publishes topic to end dragging.
	 * @param {Object} evt
	 * @private
	 */
	_onTabMouseUp: function(evt) {
		dojo_array.forEach(this._moveConnects, function(c) {
			this.disconnect(c);	
		}, this);
		
		if (this._moving) {
			this._moving = false;
			var msg = [{target: this, content: this.page, event: evt, start: this._startLoc}];
			dojo_connect.publish(this.tabTopicId + "/idx/tab/move/end", msg);
			this._startLoc = null;
		}
		this._makeSelectable(true);
	},

	/**
	 * disable/enable selection, compatible with IE9
	 * dojo.setSelectable() does not work with IE9, and for IE8- it's slow.
	 * @param {Boolean} selectable
	 * @private
	 */
	_makeSelectable: function(selectable) {
		if (dojo.isIE) {
			if (selectable) {
				dojo_window.body().onselectstart = this._selectHandle;
			} else {
				this._selectHandle = dojo_window.body().onselectstart;
				dojo_window.body().onselectstart = function() {return false;};	
			}
		} else {
			dojo_html.setSelectable(dojo_window.body(), selectable);
		}
	},
	
	/**
	 * Published topic during dragging. 
	 * @param {Object} evt
	 * @private
	 */
	_onTabMouseMove: function(evt) {
		if (!this._startLoc) {return;}
		var curLoc = {x: evt.clientX, y: evt.clientY};
		if (this._distanceBetween(this._startLoc, curLoc) > this.delay) {
			var msg = [{target: this, content: this.page, event: evt, start: this._startLoc}];
			var topicType = "/idx/tab/move";
			if (!this._moving) {
				dojo_connect.publish(this.tabTopicId + "/idx/tab/move/start", msg);
				this._moving = true;
			} else {
				dojo_connect.publish(this.tabTopicId + topicType, msg);
			}
		}
	},

	/**
	 * Calculate distance between points.
	 * @param {Object} a
	 * @param {Object} b
	 * @private
	 */
	_distanceBetween: function(a, b) {
		var diffx = a.x - b.x;
		var diffy = a.y - b.y;
		var dist = Math.sqrt(diffx * diffx + diffy * diffy);
		return dist;
	},

	/**
	 * Suppresses state class when dragging.
	 * @private
	 */
	_setStateClass: function() {
		if (this._controller && this._controller._movingTab) {
			return;
		}
		this.inherited(arguments);
	}
});

return MoveableTabContainer;

}; // end of factory

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
	dojo.provide("idx.layout.MoveableTabContainer");
	dojo.require("dojo.dnd.Moveable");
	dojo.require("dijit.layout.TabContainer");
	dojo.require("dijit.layout.ScrollingTabController");
	dojo.require("dijit.layout.TabContainer");
	var dojo_event = {stop: dojo.stopEvent};
	factory(dojo.declare, dojo, dojo, dojo, dojo, dojo_event, dojo, dojo.keys, dojo.dnd.Moveable, dijit, dijit.layout.TabContainer, dijit.layout.ScrollingTabController, dijit.layout.ContentPane);
}else{
	define([
		"../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
		"../../../../dist/lib/dojo/_base/lang",
		"dojo/_base/array",
		"dojo/_base/window",
		"dojo/_base/html",
		"dojo/_base/event",
		"dojo/_base/connect",
		"dojo/keys",
		"dojo/dnd/Moveable",
		"dijit/registry",
		"dijit/layout/TabContainer",
		"dijit/layout/ScrollingTabController",
		"dijit/layout/ContentPane"
	], factory);
}

})();
