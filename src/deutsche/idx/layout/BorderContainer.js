(function(){

var factory = function(dojo_declare, dojo_lang, dojo_array, dojo_html, dojo_event, dojo_keys, dijit_wai, dijit_layout_BorderContainer, dijit_CssStateMixin, dijit_Widget, idx_resources, idx_util, templateString){

/**
 * @name idx.layout.BorderContainer
 * @class BorderContainer with toggling behavior to collapse and restore panes.
 * @augments dijit.layout.BorderContainer
 */
var BorderContainer = dojo_declare("idx.layout.BorderContainer", [dijit_layout_BorderContainer],
/**@lends idx.layout.BorderContainer#*/
{
	
	_splitterClass: "idx.layout._Splitter",
	_toggleSplitterClass: "idx.layout._ToggleSplitter",
	
	_locked: false,
	liveSplitters: false,	// default to false to improve performance

	/**
	 * Specifies toggling behavior.
	 * @type Boolean
	 * @default true
	 */
	toggleable: true,
	_setToggleableAttr: function(value) {
		this.toggleable = value;
		if (this.toggleable) {
			dojo_html.addClass(this.domNode, this.idxBaseClass + "Toggle");
		} else {
			dojo_html.removeClass(this.domNode, this.idxBaseClass + "Toggle");
		}
	},
	
	/**
	 * Tooltip texts for "expand", "collapse" and "restore".
	 * Default texts are used when not specified.
	 * @type Object
	 * @default null
	 */
	toggleTitles: null,
	
	_resizeHandle: null,
	/**
	 * If true, successive resize calls will be ignored and only the last resize will take effect.
	 * Will not work with IE8 and prior versions.
	 * @type Boolean
	 * @default true
	 */
	delayResize: true,	// if true, successive resize calls will be ignored; only the last resize will take effect

	/**
	 * 
	 */
	idxBaseClass: "idxBorderContainer",
	
	/**
	 * Sets up CSS class for splitters and default tooltip texts.
	 */
	postMixInProperties: function() {
		if (this.toggleable) {
			this._splitterClass = this._toggleSplitterClass;
		}
	    var res = idx_resources.getResources("idx/layout/BorderContainer", this.lang);

		this.toggleTitles = {
			expand: res.toggleTitleExpand,
			collapse: res.toggleTitleCollapse,
			restore: res.toggleTitleRestore
		}
		
		this.inherited(arguments);
	},

	/**
	 * Sets up CSS classes.
	 */
	buildRendering: function() {
		this.inherited(arguments);
		this._supportingWidgets = []; // to be destroyed as children
	},

	/**
	 * Handles optimization of resizing with "delayResize" property set.
	 * @param {Object} newSize
	 * @param {Object} currentSize
	 */
	resize: function(newSize, currentSize){
		var ieVer = idx_util.isIE;
		if (this.delayResize && !(ieVer && ieVer <= 8)) {
			// cancel old resize calls when a new one is called within 100ms
			clearTimeout(this._resizeHandle);
			this._resizeHandle = setTimeout(dojo_lang.hitch(this, function() {
				this._asynchResize(newSize, currentSize);
			}), 100);
		} else {
			this._asynchResize(newSize, currentSize);
		}
	},

	/**
	 * Calls out superclass's resize method.
	 * @param {Object} newSize
	 * @param {Object} currentSize
	 */
	_asynchResize: function(newSize, currentSize) {
		// since this is called asynchronously, domNode may have been destroyed already
		if (this.domNode) {
			dijit_layout_BorderContainer.prototype.resize.apply(this, arguments);	
		}
		// workaround for removing extra space between "top" and "center" for the first layout on FF
		// comment this out for now, as it can be workaround by application, instead of paying cost for all instances
		/*
		if(idx_util.isFF){
			this.layout();
		}
		*/
	},

	/**
	 * Sets up initial collapsed state.
	 * @param {Object} child
	 */
	_setupChild: function(child) {
		this.inherited(arguments);
		
		if (child.get("splitter") && !child.get("open")) {
			this.collapse(child.get("region"));
		}
	},

	/**
	 * Collapse a child widget.
	 * @param {String} region
	 */
	collapse: function(region) {
		if (!this.toggleable || !region || !this.getSplitter(region)) {
			return;
		}
		
		var splitter = this.getSplitter(region);
		if (splitter && splitter._collapse) {
			splitter._collapse();
		}
	},

	/**
	 * Expand a child widget.
	 * @param {String} region
	 */
	expand: function(region) {
		if (!this.toggleable) {
			return;
		}
		if (!region || region == "") {
			region = "center";
		}
		
		var childWidgets = this.getChildren();
		dojo_array.forEach(childWidgets, function(c) {
			var r = c.get("region");
			var splitter = this.getSplitter(r);
			if (r != region) {
				if (splitter && splitter._collapse) {
					splitter._collapse();
				}
			}
		}, this);
		if (region != "center") {
			var splitter = this.getSplitter(region);
			if (splitter && splitter._expand) {
				splitter._expand();
			}
		}
	},
	
	/**
	 * Restore a child widget.
	 * @param {String} region
	 */
	restore: function() {
		if (!this.toggleable) {
			return;
		}
		var childWidgets = this.getChildren();
		dojo_array.forEach(childWidgets, function(c) {
			var r = c.get("region");
			var splitter = this.getSplitter(r);
			if (splitter && splitter._restore) {
				splitter._restore();
			}
		}, this);
	},

	/**
	 * Callback to be called when dragging has started on a splitter.
	 * @param {String} region
	 */
	onDragStart: function(region) {
		// custom overridable function
	},
	
	/**
	 * Callback to be called when dragging has ended on a splitter.
	 * @param {String} region
	 */
	onDragEnd: function(region) {
		// custom overridable function
	},
	
	/**
	 * Callback to be called when a child widget gets restored or expanded from collapsed state.
	 * @param {String} region
	 */
	onPanelOpen: function(region) {
		
	},
	
	/**
	 * Callback to be called when a child widget gets collapsed.
	 * @param {String} region
	 */
	onPanelClose: function(region) {
		
	},

	/**
	 * Lock toggling behavior.
	 */
	lock: function() {
		if (!this.toggleable) {
			return;
		}
		this._locked = true;
		dojo_html.addClass(this.domNode, "idxBorderContainerLocked");
	},

	/**
	 * Unlock toggling behavior.
	 */
	unlock: function() {
		if (!this.toggleable) {
			return;
		}
		this._locked = false;
		dojo_html.removeClass(this.domNode, "idxBorderContainerLocked");
	}

});

/**
 * @name idx.layout._Splitter
 * @class BorderContainer with locked behavior to collapse and restore panes.
 * @augments dijit.layout._Splitter
 * @augments dijit._CssStateMixin
 */
var Splitter = dojo_declare("idx.layout._Splitter", [dijit.layout._Splitter, dijit_CssStateMixin], // FIXME: how to get dijit.layout._Splitter?
/**@lends idx.layout._Splitter#*/
{
	_onKeyPress: function(/*Event*/ e){
		var horizontal = this.horizontal;
		var dk = dojo_keys;
		switch(e.charOrCode){
			case horizontal ? dk.UP_ARROW : dk.LEFT_ARROW:
				if (this.container._locked) {
					dojo_event.stop(e);
					return;
				}
				break;
			case horizontal ? dk.DOWN_ARROW : dk.RIGHT_ARROW:
				if (this.container._locked) {
					dojo_event.stop(e);
					return;
				}
				break;
			default:
				// fall through
		}
		this.inherited(arguments);
	}
});

/**
 * @name idx.layout._ToggleSplitter
 * @class BorderContainer with toggling behavior to collapse and restore panes.
 * @augments idx.layout._Splitter
 * @augments dijit._CssStateMixin
 */
dojo_declare("idx.layout._ToggleSplitter", [Splitter, dijit_CssStateMixin],
/**@lends idx.layout._ToggleSplitter#*/
{
	
	templateString: templateString,

	/**
	 * Toggling state.
	 * @type String
	 * @default ""
	 */
	state: "",		// to be tracked with cssStateMixin

	/**
	 * Region to handle.
	 * @type String
	 * @default ""
	 */
	position: "",
	
	_paneSize: 0,
	_styleAttr: "",
	_resizable: true,
	_snap: false,
	_snapSize: 40,

	/**
	 * Tooltip text for expanding thumb.
	 * @type String
	 * @default ""
	 */
	expandThumbMsg: "",

	/**
	 * Tooltip text for collapsing thumb.
	 * @type String
	 * @default ""
	 */
	collapseThumbMsg: "",
	
	baseClass: "idxSplitter",
	
	cssStateNodes: {
		"thumb": "idxSplitterThumbCollapse",
		"thumb2": "idxSplitterThumbExpand"
	},
	
	attributeMap: dojo_lang.delegate(dijit_Widget.prototype.attributeMap, {
		expandThumbMsg: {node: "thumb2", type: "attribute", attribute: "title"},
		collapseThumbMsg: {node: "thumb", type: "attribute", attribute: "title"}
	}),

	/**
	 * Sets up CSS classes, properties and event handlers.
	 */
	postCreate: function() {		
		this.inherited(arguments);
		
		dojo_html.addClass(this.domNode, "idxSplitter" + (this.horizontal ? "H" : "V"));
		if (this.child.get("bidiToggle") === true) {
			dojo_html.addClass(this.domNode, "idxSplitterBidiToggle");
			dojo_html.addClass(this.domNode, "idxSplitterBidiToggle" + (this.horizontal ? "H" : "V"));
		}
		
		this._styleAttr = this.horizontal ? "height" : "width";
		this.connect(this.thumb, "onclick", "_toggle");
		this.connect(this.thumb, "onkeyup", "_onThumbKey");
		this.connect(this.thumb2, "onclick", "_toggleExpand");
		this.connect(this.thumb2, "onkeyup", "_onThumbExpandKey");
		this.connect(this.container, "layout", "_positionThumb");

		// setup "fixed" attribute
		var fixedAttr = this.child.get("fixed");
		if (fixedAttr === "true") {
			this._resizable = false;
			dojo_html.addClass(this.domNode, "idxSplitterNoResize");
		}
		
		// setup "snap" attribute
		var snapAttr = this.child.get("snap");
		if (snapAttr === "true") {
			this._snap = true;
		}
		
		// set my initial state
		var normalize = function(scope, str) {
			if (!str || str.length == 0) {
				return str;
			}
			
			var newStr = str.toLowerCase();

			if (newStr == "leading") {
				newStr = !scope.isLeftToRight() ? "right" : "left";
			} else if (newStr == "trailing") {
				newStr = !scope.isLeftToRight() ? "left" : "right";
			}					
			
			newStr = newStr.charAt(0).toUpperCase() + newStr.substring(1);
			return newStr;
		};
		this.position = normalize(this, this.child.get("region"));
		this.set("state", "Normal");
		
		// set titles
		this.thumbTitles = this.container.toggleTitles;
		this._updateThumbTitles();
	},

	/**
	 * Sets a new state.
	 * @param {String} value
	 * @private
	 */
	_setStateAttr: function(value) {
		this.state = this.position + value;
		
		// the "state" property is not watched by cssStateMixin; manually call _setStateClass()
		this._setStateClass();
		dijit_wai.setWaiState(this.thumb, "pressed", (value == "Collapsed"));
		dijit_wai.setWaiState(this.thumb2, "pressed", (value == "Expanded"));
	},

	/**
	 * Retrieves the current state.
	 * @returns {String}
	 * @private
	 */
	_getStateAttr: function() {
		return this.state.substring(this.position.length);
	},

	/**
	 * Positions thumbs.
	 * @private
	 */
	_positionThumb: function() {
		var attr = this.horizontal ? "width" : "height";
		
		var size = dojo_html.style(this.domNode, attr);
		var pos = size / 2 - dojo_html.style(this.thumbContainer, attr) / 2;
		pos = pos + "px";
		var horiz = this.isLeftToRight() ? "left" : "right"; 
		dojo_html.style(this.thumbContainer, this.horizontal ? horiz : "top", pos);
	},

	/**
	 * Handles SPACE and ENTER keys to toggle.
	 * @param {Object} e
	 * @private
	 */
	_onThumbKey: function(e) {
		var key = e.keyCode;
		if (key == dojo_keys.SPACE || key == dojo_keys.ENTER) {
			this._toggle();
		}
	},

	/**
	 * Toggles state.
	 * @private
	 */
	_toggle: function() {
		if (this.container._locked) {
			// disable toggling if locked
			return;
		}
		var state = this.get("state");
		if (state == "Collapsed") {
			this._restore();
		} else {
			this._collapse();
		}
	},

	/**
	 * Toggles state for expanding.
	 * @private
	 */
	_toggleExpand: function() {
		if (this.container._locked) {
			return;
		}
		var state = this.get("state");
		if (state == "Expanded") {
			this._restore();
		} else {
			this._expand();
		}
	},

	/**
	 * Handles SPACE and ENTER keys to toggle for expanding.
	 * @param {Object} e
	 * @private
	 */
	_onThumbExpandKey: function(e) {
		var key = e.keyCode;
		if (key == dojo_keys.SPACE || key == dojo_keys.ENTER) {
			this._toggleExpand();
		}
	},

	/**
	 * Restores the region.
	 * 
	 * @private
	 */
	_restore: function() {
		if (this.get("state") == "Normal") {
			return;
		}

		if (this.child) {
			this.child.set("open", true);
		}

		dojo_html.style(this.child.domNode, this._styleAttr, this._paneSize + "px");
		this.container.layout();

		this.set("state", "Normal");

		dojo_html.style(this.domNode, "cursor", "");

		this.container.onPanelOpen(this.region);

		this._updateThumbTitles();
	},

	/**
	 * Collapse the region.
	 * @param {Object} startSize
	 * @private
	 */
	_collapse: function(startSize) {
		var state = this.get("state");
		
		if (state == "Collapsed") {
			return;
		}
		
		if (startSize) {
			this._paneSize = startSize;
		} else if (state == "Normal") {
			this._paneSize = dojo_html.style(this.child.domNode, this._styleAttr);
		}
		
		dojo_html.style(this.child.domNode, this._styleAttr, "0px");
		this.container.layout();
		
		this.set("state", "Collapsed");
		dojo_html.style(this.domNode, "cursor", "default");
		
		this.container.onPanelClose(this.region);
		this._updateThumbTitles();
	},

	/**
	 * Expands the region.
	 * 
	 * @private
	 */
	_expand: function() {
		var state = this.get("state");
		if (state == "Expanded") {
			return;
		}

		if (this.child) {
			this.child.set("open", true);
		}

		if (state == "Normal") {
			this._paneSize = dojo_html.style(this.child.domNode, this._styleAttr);
		}

		var newVal = this._computeMaxSize();
		dojo_html.style(this.child.domNode, this._styleAttr, newVal + "px");

		this.set("state", "Expanded");
		this.container.layout();

		if (state == "Collapsed") { // check old state
			this.container.onPanelOpen(this.region);
		}
		this._updateThumbTitles();
	},
	
	/**
	 * Updates tooltip text of thumbs
	 * @private
	 */
	_updateThumbTitles: function() {
		var state = this.get("state");
		var t = this.thumbTitles;
		if (state == "Normal") {
			this.set("expandThumbMsg", t.expand);
			this.set("collapseThumbMsg", t.collapse);
		} else if (state == "Expanded") {
			this.set("expandThumbMsg", t.restore);
			this.set("collapseThumbMsg", t.collapse);
		} else if (state == "Collapsed") {
			this.set("expandThumbMsg", t.expand);
			this.set("collapseThumbMsg", t.restore);
		}
	},
	
	// extend
	/**
	 * Starts dragging to expand
	 * @param {Object} e
	 * @private
	 */
	_startDrag: function(e) {
		var node = e.target;
		if (node == this.thumb || node == this.thumb2) {
			// don't start dragging if user clicked a toggle button
			return;
		}
		
		var state = this.get("state");
		if (state != "Normal" || this.container._locked || !this._resizable) {
			// disable dragging if the pane is closed, locked, or not resizable
			return;
		}
		
		this._startSize = dojo_html.style(this.child.domNode, this._styleAttr);
		
		this.inherited(arguments);
		this.container.onDragStart(this.region);
	},
	
	// extend
	/**
	 * Ends dragging to expand
	 * @private
	 */
	_stopDrag: function() {
		this.inherited(arguments);
		var s = dojo_html.style(this.child.domNode, this._styleAttr);
		if (s <= this._snapSize) {
			this._collapse(this._startSize);
		} else {
			this.container.layout();
		}
		delete this._startSize;
		this.container.onDragEnd(this.region);
	},
	
	_doSnap: function() {
		
	}

});

dojo_lang.extend(dijit_Widget, {
	fixed: false,
	bidiToggle: false,
	snap: false,
	open: true
});

return BorderContainer;

}; // end of factory

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
	dojo.provide("idx.layout.BorderContainer");
	dojo.require("dijit.layout.BorderContainer");
	dojo.require("dijit._CssStateMixin");
	dojo.require("dijit._Widget");
	dojo.require("idx.resources");
	dojo.require("idx.util");
	dojo.requireLocalization("idx","base");
	dojo.requireLocalization("idx.layout","base");
	dojo.requireLocalization("idx.layout","BorderContainer");
	var dojo_event = {stop: dojo.stopEvent};
	var templateString = dojo.cache("idx.layout", "templates/_ToggleSplitter.html");
	factory(dojo.declare, dojo, dojo, dojo, dojo_event, dojo.keys, dijit, dijit.layout.BorderContainer, dijit._CssStateMixin, dijit._Widget, idx.resources, idx.util, templateString);
}else{
	define([
		"../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
		"../../../../dist/lib/dojo/_base/lang",
		"dojo/_base/array",
		"dojo/_base/html",
		"dojo/_base/event",
		"dojo/keys",
		"dijit/_base/wai",
		"dijit/layout/BorderContainer",
		"dijit/_CssStateMixin",
		"dijit/_Widget",
		"idx/resources",
		"idx/util",
		"dojo/text!./templates/_ToggleSplitter.html",
		"dojo/i18n!../nls/base",
		"dojo/i18n!./nls/base",
		"dojo/i18n!./nls/BorderContainer"
	], factory);
}

})();
