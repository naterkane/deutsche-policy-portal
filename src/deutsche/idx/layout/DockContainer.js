(function(){

var factory = function(dojo_declare, dojo_lang, dojo_array, dojo_window, dojo_html, dojo_event, dojo_connect, dojo_keys, dijit_registry, dijit_Templated, dijit_layout_LayoutWidget, dijit_layout_ContentPane, idx_html, idx_util, idx_layout_BorderContainer, idx_layout_MoveableTabContainer, idx_layout_TitlePane){

/**
 * @name idx.layout.DockContainer
 * @class BorderContainer enabling child widgets docked and undocked.
 * @augments idx.layout.BorderContainer
 */
var DockContainer = dojo_declare("idx.layout.DockContainer", [idx_layout_BorderContainer],
/**@lends idx.layout.DockContainer#*/
{
	design: "sidebar",
	
	_topZ: 50,

	/**
	 * Dragging pixel amount before starting undocking.
	 * @type Number
	 * @default 10 
	 */
	delay: 10,

	/**
	 * Topic ID for events being published during undocking/docking operations.
	 * @type String
	 * @default ""
	 */
	topicId: "",

	/**
	 * Initialize topic ID with the widget ID when not specified.
	 */
	buildRendering: function() {
		this.inherited(arguments);
		this.topicId = this.topicId || this.id;
	},

	/**
	 * Subscribes events and sets up children (starting floating children and collapsing empty children).
	 */
	startup: function() {
		if (this._started) {return;}
		this.inherited(arguments);
		
		this.subscribe(this.topicId + "/idx/move/start", "_onChildMoveStart");
		this.subscribe(this.topicId + "/idx/move", "_onChildMove");
		this.subscribe(this.topicId + "/idx/move/end", "_onChildMoveEnd");
		
		this._startupFloatingChildren();
		
		// collapse empty children
		var children = this.getChildren();
		dojo_array.forEach(children, function(child) {
			var region = child.get("region");
			var cs = child.getChildren ? child.getChildren() : [];
			if (region && cs.length == 0 && child.get("collapseEmpty")) {
				this.collapse(region);
			}
		}, this);
	},

	/**
	 * Updates size for dock area.
	 */
	layout: function() {
		this.inherited(arguments);
		var mb = dojo_html.marginBox(this.domNode);
		this._dockWidth = mb.w;
		this._dockHeight = mb.h;
	},

	/**
	 * Returns only "docked" children, unless "all" is specified to true.
	 * @param {Boolean} all
	 */
	getChildren: function(all) {
		var children = this.inherited(arguments);
		return dojo_array.filter(children, function(child) {
			return child.region || all;
		});
	},

	/**
	 * When "dockable" child is added, make it float.
	 * @param {Object} child
	 */
	addChild: function(child) {
		this.inherited(arguments);
		
		// if a dockable is added, make it float
		if (child.dockArea) {
			child.set("dockArea", "float");
			dojo_html.style(child.domNode, "position", "absolute");
			dojo_html.style(child.domNode, "zIndex", this._topZ++);	
		}
	},

	/**
	 * Starts up floating children.
	 * @private
	 */
	_startupFloatingChildren: function() {
		var children = this.getChildren(true);
		dojo_array.forEach(children, function(child) {
			if (!child.region) {
				child.startup();
			}
		}, this);
	},

	/**
	 * Sets CSS class for the docked child.
	 * @param {Object} child
	 * @param {String} area
	 * @private
	 */
	_onChildDocked: function(child, area) {
		dojo_html.toggleClass(this.domNode, "idxDockableDocked", false);
		dojo_html.toggleClass(this.domNode, "idxDockableFloating", true);
		this.domNode.appendChild(this.domNode);
	},

	/**
	 * Tests if a child is contained by a parent.
	 * @param {Object} parent
	 * @param {Object} child
	 * @returns {Boolean}
	 * @private
	 */
	_contains: function(parent, child) {
		if (parent == child) {
			return true;
		}
		return dojo_html.isDescendant(child, parent);
	},

	/**
	 * Sets up properties for dragging dockable child.
	 * @param {Object} msg
	 * @private
	 */
	_onChildMoveStart: function(msg) {
		var child = msg.content;
		if (dojo_array.indexOf(this.domNode.childNodes, child.domNode) == -1) {
			if (child.getParent) {
				this._currentDockArea = child.getParent();	
			}
			this.domNode.appendChild(child.domNode);
			// refocus to prevent indicator to get stuck for FF10+
			child.focusNode && child.focusNode.focus();
		}
		dojo_html.style(child.domNode, "zIndex", this._topZ++);
		this._rootPos = dojo_html.position(this.domNode);
		
		var center = this._getChildPane("center");
		if (center) {
			this._centerPos = dojo_html.position(center.domNode);	
		}

		if (child.layoutAlign) {
			this._clearLayoutAlign(child);
		}
	},

	/**
	 * Retrieves a child widget for the specified region.
	 * @param {String} region
	 * @returns {Object}
	 * @private
	 */
	_getChildPane: function(region) {
		var c;
		dojo_array.some(this.getChildren(), function(child) {
			if (child.region == region) {
				c = child;
				return true;
			}
		});
		return c;
	},

	/**
	 * Removes alignment property and CSS classes from child.
	 * @param {Object} pane
	 * @private
	 */
	_clearLayoutAlign: function(pane) {
		delete pane.layoutAlign;
		dojo_html.removeClass(pane.domNode, "dijitAlignLeft");
		dojo_html.removeClass(pane.domNode, "dijitAlignRight");
		dojo_html.removeClass(pane.domNode, "dijitAlignTop");
		dojo_html.removeClass(pane.domNode, "dijitAlignBottom");
		dojo_html.removeClass(pane.domNode, "dijitAlignClient");
	},

	/**
	 * Checks collision on child being moved.
	 * @param {Object} msg
	 * @private
	 */
	_onChildMove: function(msg) {
		var evt = msg.event;
		var child = msg.content;
		this._collisionCheck({x: evt.clientX, y: evt.clientY}, child);
	},

	/**
	 * Docks a child when dragging ends.
	 * @param {Object} msg
	 * @private
	 */
	_onChildMoveEnd: function(msg) {
		if (this._currentDockArea) {
			var pos = {x: msg.event.clientX, y: msg.event.clientY};
			this._currentDockArea.dock(msg.content, pos);
		}
	},

	/**
	 * Opens dock area when a child is moving close to the area.
	 * Otherwise, reset the opened dock area. 
	 * @param {Object} pos
	 * @param {Object} child
	 * @private
	 */
	_collisionCheck: function(pos, child) {
		var root = this._rootPos;
		var center = this._centerPos;
		if (pos.x < center.x + 5) {
			this._showDockArea(pos, "left", child);
		} else if (pos.x > center.x + center.w - 5) {
			this._showDockArea(pos, "right", child);
		} else if (pos.y < center.y + 5) {
			this._showDockArea(pos, "top", child);
		} else if (pos.y > center.y + center.h - 5) {
			this._showDockArea(pos, "bottom", child);
		} else {
			this._resetDockArea();
		}
	},

	/**
	 * Resets the candidate dock area, closing it if empty.
	 * @private
	 */
	_resetDockArea: function() {
		if (this._currentDockArea) {
			this._currentDockArea.resetDockArea();
			
			var da = this._currentDockArea;

			// close dock area if no child is present
			if (da.getChildren().length == 0 && da.get("collapseEmpty")) {
				this.collapse(this._currentRegion);
			}
			
			this._currentDockArea = null;
			this._currentRegion = null;
		}
	},

	/**
	 * Opens the candidate dock area when it is collapsed.
	 * @param {Object} pos
	 * @param {String} region
	 * @param {Object} child
	 * @private
	 */
	_showDockArea: function(pos, region, child) {
		var pane = this._getChildPane(region);
		if (!pane || !pane.showDockArea) {
			return;
		}

		if (this._currentRegion != region) {
			this._resetDockArea();
			
			// open the dock area in case it was collapsed
			if (pane.get("collapseEmpty") && pane.getChildren().length == 0) {
				this.restore(region);
			}
		}
		
		pane.showDockArea(pos, child);
		this._currentRegion = region;
		this._currentDockArea = pane;
	},

	/**
	 * Determines a parent widget of the specified child widget.
	 * @param {Object} child
	 * @returns {Object}
	 * @private
	 */
	_getParentWidget: function(child) {
		var node = child.domNode;
		while (node != dojo_window.body()) {
			node = node.parentNode;
			var widget = dijit_registry.byNode(node);
			if (widget && widget.get("region")) {
				var children = widget.getChildren ? widget.getChildren() : [];
				for (var i = 0; i < children.length; i++) {
					if (children[i] == child) {
						return widget;
					}
				}
			}
		}
	}
});

/**
 * @name idx.layout._DockAreaMixin
 * @class Mix-in class for each of the four dock areas: top, left, right, bottom.
 * @augments dijit.layout._LayoutWidget
 */
var DockAreaMixin = dojo_declare("idx.layout._DockAreaMixin", [dijit_layout_LayoutWidget],
/**@lends idx.layout._DockAreaMixin#*/
{

	/**
	 * If true, this pane is collapsed when there's no children.
	 * @type Boolean
	 * @default true
	 */
	collapseEmpty: true,

	/**
	 * Determines dimension based on "region" property.
	 */
	postMixInProperties: function() {
		this.inherited(arguments);
		this._dim = (this.region == "top" || this.region == "bottom") ? "x" : "y";
	},

	/**
	 * Sets up CSS class based on dimension.
	 */
	postCreate: function() {
		this.inherited(arguments);
		dojo_html.addClass(this.domNode, "idxDockArea");
		if (this._dim == "y") {
			dojo_html.addClass(this.domNode, "idxDockAreaVertical");
		} else {
			dojo_html.addClass(this.domNode, "idxDockAreaHorizontal");
		}
	},

	/**
	 * Creates a mock content pane.
	 */
	startup: function() {
		if (this._started) {
			return;
		}
		this.inherited(arguments);
		this._mockPane = new dijit_layout_ContentPane({
			"class": "idxDockAreaMockPane"
		});
	},

	/**
	 * Destroys the mock content pane. 
	 */
	destroy: function() {
		this.inherited(arguments);
		this._mockPane.destroy();
	},

	/**
	 * Computes coordinates of each of my children, relative to my own position.
	 * This will later be used when calculating insert index.
	 * @private
	 */
	_computeBounds: function() {
		var rootPos = dojo_html.position(this.domNode);
		this._bounds = [];
		dojo_array.forEach(this.getChildren(), dojo_lang.hitch(this, function(child) {
			var pos = dojo_html.position(child.domNode);
			this._bounds.push({x: pos.x - rootPos.x + pos.w / 2, y: pos.y - rootPos.y + pos.h / 2});
		}));
	},

	/**
	 * Docks dockable widget.
	 * @param {Object} dockable
	 * @param {Object} pos
	 */
	dock: function(dockable, pos) {
		dockable.beforeDock();
		var idx = this._getInsertIndex(pos);
		dockable.set("dockArea", this.region);
		var s = {
			left: "",
			top: ""
		};
		
		dojo_html.style(dockable.domNode, s);
		this.addChild(dockable, idx);
		dockable.onDock(this.region);
		this.resetDockArea();
		this.layout();
		dockable.focusNode && dockable.focusNode.focus();
	},

	/**
	 * Opens a dock area.
	 * @param {Object} pos
	 * @param {Object} child
	 */
	showDockArea: function(pos, child) {
		var idx = this._getInsertIndex(pos);
		if (this.isDockable()) {
			this.updateDockArea(idx);
		} else {
			this._computeBounds();
			idx = this._getInsertIndex(pos);
			dojo_html.addClass(this.domNode, "idxDockAreaDockable");
			this.addChild(this._mockPane, idx);
			this._resizeMockPane(child);
			this.layout();
		}
	},

	/**
	 * Resizes the mock content page to the child widget size.
	 * @param {Object} child
	 * @private
	 */
	_resizeMockPane: function(child) {
		var mb = dojo_html.marginBox(child.domNode);
		dojo_html.style(this._mockPane.domNode, {
			height: mb.h + "px",
			width: mb.w + "px"
		});
	},

	/**
	 * Closes the dock area.
	 */
	resetDockArea: function() {
		dojo_html.removeClass(this.domNode, "idxDockAreaDockable");
		if (this._mockPane) {
			try {
				this.removeChild(this._mockPane);
			} catch(e) {
				// ignore
			}
		}
		this.layout();
	},

	/**
	 * Updates the dock page moving the mock content page.
	 * @param {Number} idx
	 */
	updateDockArea: function(idx) {
		var childIndex = this.getIndexOfChild(this._mockPane);
		if (childIndex == idx) {
			return;
		}
		this.removeChild(this._mockPane);
		this.addChild(this._mockPane, idx);
		this.layout();
	},

	/**
	 * Returns whether this dock area is dockable.
	 * @returns Boolean
	 */
	isDockable: function() {
		return dojo_html.hasClass(this.domNode, "idxDockAreaDockable");
	},

	/**
	 * Determines the index of children to insert based on the specified position.
	 * @param {Object} pos
	 * @returns {Number}
	 * @private
	 */
	_getInsertIndex: function(pos) {
		var root = dojo_html.position(this.domNode);
		var rel = {x: pos.x - root.x, y: pos.y - root.y};
		var bounds = this._bounds;
		if (!bounds) {
			return 0;
		}
		var len = bounds.length;
		for (var i = 0; i < len; i++) {
			if (rel[this._dim] < bounds[i][this._dim]) {
				return i;
			}
		}
		return len;
	}
});

/**
 * @name idx.layout.DockContentPane
 * @class Simple dock area based on ContentPane
 * @augments dijit.layout.ContentPane
 * @augments idx.layout._DockAreaMixin
 */
dojo_declare("idx.layout.DockContentPane", [dijit_layout_ContentPane, DockAreaMixin],
/**@lends idx.layout.DockContentPane#*/
{
	/**
	 * Resizes children.
	 */
	resize: function() {
		this.inherited(arguments);
		var children = this.getChildren();
		var w = dojo_html.contentBox(this.domNode).w;
		dojo_array.forEach(children, function(child) {
			if (child.resize) {
				child.resize({w: w});
			} else {
				dojo_html.marginBox(child.domNode, {w: w});
			}
		});
	},
	
	dock: function(dockable, pos) {
		this.inherited(arguments);
		this.resize();
	}
});

/**
 * @name idx.layout.DockTabContainer
 * @class Tabbed dock area based on TabContainer
 * @augments idx.layout.MoveableTabContainer
 * @augments idx.layout._DockAreaMixin
 */
dojo_declare("idx.layout.DockTabContainer", [idx_layout_MoveableTabContainer, DockAreaMixin],
/**@lends idx.layout.DockTabContainer#*/
{

	/**
	 * Tab layout is always horizontal so set collision check dimension to x
	 */
	postMixInProperties: function() {
		this.inherited(arguments);
		this._dim = "x";	// tabs are always horizontal
	},
	
	/**
	 * Sets up CSS class and event handler.
	 */
	postCreate: function() {
		this.inherited(arguments);
		dojo_html.addClass(this.domNode, "idxDockTabContainer");
		this.connect(this.tablist, "_onMove", "_onTabMove");
	},

	/**
	 * Computes coordinates of each of my children, relative to my own position.
	 * This will later be used when calculating insert index.
	 * @private
	 */
	_computeBounds: function() {
		var rootPos = dojo_html.position(this.tablist.domNode);
		this._bounds = [];
		dojo_array.forEach(this.tablist.getChildren(), dojo_lang.hitch(this, function(child) {
			var pos = dojo_html.position(child.domNode);
			this._bounds.push({x: pos.x - rootPos.x + pos.w / 2, y: pos.y - rootPos.y + pos.h / 2});
		}));
	},

	/**
	 * Detects dragging out to undock.
	 * @param {Object} msg
	 * @private
	 */
	_onTabMove: function(msg) {
		this.inherited(arguments);
		// check to see if the user dragged the tab out of myself
		if (this.tablist._dragOut) {
			this.tablist._movingTab = false;
			this._undock(msg.content, msg.event);
		}
	},

	/**
	 * Undocks a child pane.
	 * @param {Object} pane
	 * @param {Object} evt
	 * @private
	 */
	_undock: function(pane, evt) {
		this.removeChild(pane);
		this.domNode.parentNode.appendChild(pane.domNode);
		dojo_html.removeClass(pane.domNode, "dijitTabPane");
		pane.set("selected", false);
		pane._onDragMouseDown(evt);
		pane._offsetX = 30;
		pane._offsetY = 10;
		pane.position(evt.clientX, evt.clientY);
		pane._startMove(evt);
	}	
});

/**
 * @name idx.layout._Dockable
 * @class Mix-in class for dockable child widgets.
 */
var Dockable = dojo_declare("idx.layout._Dockable", null,
/**@lends idx.layout._Dockable#*/
{
	/**
	 * Docking area.
	 * One of "left", "right", "top", "bottom", and "float"
	 * @type String
	 * @default ""
	 */
	dockArea: "",

	/**
	 * Dragging pixel amount before starting undocking.
	 * @type Number
	 * @default 10 
	 */
	delay: 10,

	/**
	 * Node that users can drag
	 * @type Object
	 * @default null
	 */
	dragNode: null,

	/**
	 * Topic ID for events being published during undocking/docking operations.
	 * Specify this to differentiate if using two or more DockContainer.
	 * @type String
	 * @default ""
	 */
	topicId: "",
	
	_dragging: false,

	/**
	 * Sets up CSS class.
	 */
	buildRendering: function() {
		this.inherited(arguments);
		dojo_html.addClass(this.domNode, "idxDockable");
	},

	/**
	 * Initializes a drag node.
	 */
	postCreate: function() {
		this.inherited(arguments);
		this.dragNode = this.dragNode || this.focusNode || this.domNode;
	},

	/**
	 * Sets up event handlers.
	 */
	startup: function() {
		if (this._started) {return;}
		this.inherited(arguments);
		
		this.connect(this.dragNode, "onmousedown", "_onDragMouseDown");
		this.connect(this.dragNode, "onkeyup", "_onKey");
	},

	/**
	 * Sets up CSS classes based on dockArea attribute.
	 * @private
	 */
	_setDockAreaAttr: function(area) {
		this.dockArea = area;
		
		var docked = (area != "float");
		dojo_html.toggleClass(this.domNode, "idxDockableDocked", docked);
		dojo_html.toggleClass(this.domNode, "idxDockableFloating", !docked);
	},

	_setParentSelectable: function(selectable) {
		var parent = this.domNode.parentNode;
		if (!parent) parent = dojo_window.body();
		dojo_html.setSelectable(parent, selectable);
	},
	
	/**
	 * Handles key events for starting, moving and ending dragging.
	 * @param {Object} evt
	 * @private
	 */
	_onKey: function(evt) {
		var k = evt.keyCode;
		var dk = dojo_keys;
		
		if (k == dk.SHIFT) {
			if (this._dragging) {
				var pos = dojo_html.position(this.domNode);
				var mb = dojo_html.marginBox(this.domNode);
				var obj = {
					clientX: pos.x + mb.w / 2,
					clientY: pos.y
				}
				
				this._publish("/idx/move/end", obj);
				this._dragging = false;
				this._setParentSelectable(true);
				
				// re-set focus
				if (dojo.isIE) {
					var _this = this;
					setTimeout(function() {
						_this.focusNode.focus();
					}, 30);
				}
				return;
			}
		}
		
		if (k == dk.ENTER || k == dk.SPACE) {
			if (this.toggleable) {
				this.toggle();
			}
			dojo_event.stop(evt);
			return;
		}
		
		if (evt.shiftKey) {	// control position
			if (k == dk.UP_ARROW || k == dk.DOWN_ARROW || k == dk.LEFT_ARROW || k == dk.RIGHT_ARROW) {
				// calculate original position before undocking
				this._offsetX = this._offsetY = 0;
				var pos = dojo_html.position(this.domNode);
				if (k == dk.UP_ARROW) {
					pos.y -= 20;
				} else if (k == dk.DOWN_ARROW) {
					pos.y += 20;
				} else if (k == dk.LEFT_ARROW) {
					pos.x -= 20;
				} else if (k == dk.RIGHT_ARROW) {
					pos.x += 20;
				}
				
				if (!this._dragging) {
					this._setParentSelectable(false);
					
					//undocks if necessary
					this._startMove(evt);
					
					var _this = this;
					setTimeout(function() {
						if (_this.focusNode) {
							_this.focusNode.focus();
						} else if (_this.focus) {
							_this.focus();
						} else {
							_this.domNode.focus();
						}						
					}, 0);
				}
				
				this.position(pos.x, pos.y);
				// imitate event object just for the coordinates
				var evtObj = {
					clientX: pos.x + dojo_html.marginBox(this.domNode).w / 2, 
					clientY: pos.y
				};
				this._publish("/idx/move", evtObj);
				
				dojo_event.stop(evt);
			}
		}
	},

	/**
	 * Starts dragging.
	 * @param {Object} evt
	 * @private
	 */
	_startMove: function(evt) {
		this._dragging = true;
		this._startLoc = {x: evt.clientX, y: evt.clientY};
		var dockArea = this.get("dockArea");
		if (dockArea != "float") {
			this.onUndock(this.get("dockArea"));
		}		
		this._publish("/idx/move/start", evt);
	},

	/**
	 * Ends dragging.
	 * @param {Object} evt
	 * @private
	 */
	_endMove: function(evt) {
		this._dragging = false;
		this._publish("/idx/move/end", evt);
	},

	/**
	 * Handling mouse down event for dragging.
	 * @param {Object} evt
	 * @private
	 */
	_onDragMouseDown: function(evt) {
		this._setParentSelectable(false);
		
		this._mouseDown = true;
		this._initX = evt.clientX;
		this._initY = evt.clientY;
		var pos = dojo_html.position(this.domNode);
		this._offsetX = evt.clientX - pos.x;
		this._offsetY = evt.clientY - pos.y;

		this._globalMouseMove = this._globalMouseMove || [];
		this._globalMouseUp = this._globalMouseUp || [];
		this._globalMouseMove.push(dojo_connect.connect(dojo_window.body(), "onmousemove", this, "_onDragMouseMove"));
		this._globalMouseUp.push(dojo_connect.connect(dojo_window.body(), "onmouseup", this, "_onDragMouseUp"));
	},
	
	/**
	 * Handling mouse up event for dragging.
	 * @param {Object} evt
	 * @private
	 */
	_onDragMouseUp: function(evt) {
		this._mouseDown = false;
		dojo_array.forEach(this._globalMouseMove, dojo_connect.disconnect);
		dojo_array.forEach(this._globalMouseUp, dojo_connect.disconnect);
		if (this._dragging) {
			this._endMove(evt);
		}
		
		this._setParentSelectable(true);
	},
	
	/**
	 * Handling mouse move event for dragging.
	 * @param {Object} evt
	 * @private
	 */
	_onDragMouseMove: function(evt) {
		if (!this._mouseDown) {
			return;
		}
		if (this._dragging == false) {
			if (Math.abs(this._initX - evt.clientX) > this.delay || Math.abs(this._initY - evt.clientY) > this.delay) {
				this._startMove(evt);
			}
		} else {
			this._publish("/idx/move", evt);
			this.position(evt.clientX, evt.clientY);
		}
	},

	/**
	 * Callback to be called before docking.
	 */
	beforeDock: function() {

	},

	/**
	 * Callback to be called on docking.
	 * @param {String} region
	 */
	onDock: function(region) {
		
	},

	/**
	 * Callback to be called on undocking.
	 * @param {String} region
	 */
	onUndock: function(region) {
		this.set("dockArea", "float");
		
		// clear width and height
		dojo_html.style(this.domNode, {width: "", height: ""});
	},

	/**
	 * Positions the widget.
	 * @param {Numner} x
	 * @parem {Number} y
	 */
	position: function(x, y) {
		var parentPos = dojo_html.position(this.domNode.offsetParent);
		var parentBox = dojo_html.contentBox(this.domNode.offsetParent);
		var mb = dojo_html.marginBox(this.domNode);
		// restrain the position within dock container.
		// TODO: place pane under body and make it moveable anywhere on screen.
		var left = Math.min(Math.max(x - parentPos.x - this._offsetX, 0), parentBox.w - mb.w);
		var top = Math.min(Math.max(y - parentPos.y - this._offsetY, 0), parentBox.h - this._offsetY);
		dojo_html.marginBox(this.domNode, {l: left, t: top});
	},

	/**
	 * Publishes a dock topic.
	 * @param {String} topic
	 * @param {Object} evt
	 * @private
	 */
	_publish: function(topic, evt) {
		var msg = [{target: this, content: this, event: evt, start: this._startLoc}];
		dojo_connect.publish(this.topicId + topic, msg);	
	}	
});

/**
 * @name idx.layout.DockPane
 * @class Simple dockable widget based on TitlePane
 * @augments idx.layout.TitlePane
 * @augments idx.layout._Dockable
 */
dojo_declare("idx.layout.DockPane", [idx_layout_TitlePane, Dockable],
/**@lends idx.layout.DockPane#*/
{
	doLayout: true,
	hideIcon: true,

	/**
	 * Changes opacity with mouse scrolling
	 * @type Boolean
	 * @default false
	 */
	scrollOpacity: false,

	/**
	 * Sets "dragNode" and sets up CSS classes.
	 */
	buildRendering: function() {
		this.inherited(arguments);
		this.dragNode = this.titleBarNode;
		dojo_html.addClass(this.titleBarNode, "idxDockPaneTitle");
		dojo_html.addClass(this.hideNode, "idxDockPaneContentOuter");
		dojo_html.addClass(this.focusNode, "idxDockPaneTitleFocus");
	},

	/**
	 * Sets up event handlers.
	 */
	postCreate: function() {
		this.inherited(arguments);
		
		this.connect(this._wipeIn, "onEnd", "onOpen");
		this.connect(this._wipeOut, "onEnd", "onClose");
	},

	/**
	 * Sets up an event handler for "scrollOpacity".
	 */
	startup: function() {
		this.inherited(arguments);
		
		// TODO: support dynamically changing scrollOpacity property?
		if (this.scrollOpacity) {
			this._scrollConnect = this.connect(this.titleBarNode, idx_util.isMozilla ? "DOMMouseScroll" : "onmousewheel", dojo_lang.hitch(this, "_onWheel"));	
		}
	},

	/**
	 * Callback to be called when opened.
	 */
	onOpen: function() {
		// override me
	},

	/**
	 * Callback to be called when closed.
	 */
	onClose: function() {
		// override me
	},

	/**
	 * Updates properties and CSS styles based on docked region.
	 * @param {String} region
	 */
	onDock: function(region) {
		if (region == "top" || region == "bottom") {
			this.set("toggleable", false);
			this.set("doLayout", true);
			if (!this.open) {
				this.toggle();
			}
			this._setDockedStyle();
		}
		// remove hover styling from title bar
		dojo.removeClass(this.titleBarNode, "dijitTitlePaneTitleHover");
	},

	/**
	 * Sets up CSS styles when docked.
	 * @private
	 */
	_setDockedStyle: function() {
		var dim = dojo_html.contentBox(this.domNode.parentNode);
		var titleHeight = dojo_html.marginBox(this.titleBarNode).h;
		var contentHeight = dim.h - titleHeight - 3;	// -3 for margin and border
		dojo_html.marginBox(this.hideNode, {h: contentHeight});
		dojo_html.style(this.hideNode, "overflow", "auto");
	},

	/**
	 * Updates CSS styles when being docked.
	 */
	resize: function() {
		this.inherited(arguments);
		if (this.dockArea == "top" || this.dockArea == "bottom") {
			this._setDockedStyle();
		}
		
		// hack to fix IE7 document mode
		if (idx_util.isIE === 7) {
			dojo_html.marginBox(this.titleBarNode, {w: dojo_html.contentBox(this.domNode).w});
		}
	},

	/**
	 * Resets CSS styles for being undocked.
	 * @private
	 */
	_resetDockedStyle: function() {
		dojo_html.style(this.hideNode, "height", "auto");
	},

	/**
	 * Updates properties and CSS styles for being undocked.
	 * @param {String} region
	 */
	onUndock: function(region) {
		this.inherited(arguments);
		this._resetDockedStyle();
		this.set("toggleable", true);
		this.set("doLayout", false);
		this.set("open", true);
		dojo_html.style(this.domNode, "height", "");
	},

	/**
	 * Initializes docked state.
	 * @private
	 */
	_onShow: function() {
		this.inherited(arguments);
		this.onDock(this.dockArea);
	},
	
	// override dijit.TitlePane._onTitleClick
	_onTitleClick: function(evt) {
		// do nothing
		dojo_event.stop(evt);
	},
	
	// override idx.layout._Dockable._onMouseUp
	/**
	 * When not dragged, perform original toggling behavior of TitlePane
	 * @param {Object} evt
	 * @private
	 */
	_onDragMouseUp: function(evt) {
		if (!this._dragging && this.toggleable) {
			this.toggle();
		}
		this.inherited(arguments);
	},
	
	// override dijit.TitlePane._onTitleKey
	/**
	 * Changes opacity on key events.
	 * @param {Object} evt
	 * @private
	 */
	_onTitleKey: function(evt) {
		// do nothing, this is handled by _onKey
	},
	
	/**
	 * Handles key events
	 * @private
	 * @augments idx.layout._Dockable._onKey
	 */
	_onKey: function(evt) {
		var dk = dojo_keys;
		var k = evt.keyCode;
		if (evt.ctrlKey && this.dockArea == "float") {	// control opacity
			if (k == dk.UP_ARROW) {
				this._setOpacity(1);
				dojo_event.stop(evt);
			} else if (k == dk.DOWN_ARROW) {
				this._setOpacity(-1);
				dojo_event.stop(evt);
			}
		} else {
			this.inherited(arguments);
		}
	},
	
	/**
	 * Changes opacity on mouse scroll event.
	 * @param {Object} evt
	 * @private
	 */
	_onWheel: function(evt) {
		evt = evt || window.event;
		
		var delta = 0;
		if (evt.wheelDelta) {	// IE
			delta = evt.wheelDelta;
		} else if (evt.detail) {	// FF
			delta = evt.detail * -1;
		}
		
		this._setOpacity(delta);
		
		dojo_event.stop(evt);
		return false;
	},

	/**
	 * Changes opacity.
	 * @param {Numner} delta
	 * @private
	 */
	_setOpacity: function(delta) {

		var opa = dojo_html.style(this.domNode, "opacity");
		var d = delta > 0 ? 0.1 : -0.1;
		
		opa = Math.min(1, Math.max(0.1, opa - 0 + d));
		dojo_html.style(this.domNode, "opacity", opa);
		
	}
});

return DockContainer;

}; // end of factory

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
	dojo.provide("idx.layout.DockContainer");
	dojo.require("dijit._Templated");
	dojo.require("dijit.layout._LayoutWidget");
	dojo.require("dijit.layout.ContentPane");
	dojo.require("idx.html");
	dojo.require("idx.util");
	dojo.require("idx.layout.BorderContainer");
	dojo.require("idx.layout.MoveableTabContainer");
	dojo.require("idx.layout.TitlePane");
	var dojo_event = {stop: dojo.stopEvent};
	factory(dojo.declare, dojo, dojo, dojo, dojo, dojo_event, dojo, dojo.keys, dijit, dijit._Templated, dijit.layout._LayoutWidget, dijit.layout.ContentPane, idx, idx.util, idx.layout.BorderContainer, idx.layout.MoveableTabContainer, idx.layout.TitlePane);
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
		"dijit/registry",
		"dijit/_Templated",
		"dijit/layout/_LayoutWidget",
		"dijit/layout/ContentPane",
		"idx/html",
		"idx/util",
		"idx/layout/BorderContainer",
		"idx/layout/MoveableTabContainer",
		"idx/layout/TitlePane"
	], factory);
}

})();
