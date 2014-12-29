(function(){

var factory = function(dojo_kernel, dojo_declare, dojo_html, dojo_fx, dojo_keys, dijit_wai, dijit_registry, dijit_layout_TabContainer, dijit_layout_TabController){

/**
 * @deprecated idx.layout.CollapsibleTabContainer is deprecated.
 * @name idx.layout.CollapsibleTabContainer
 * @class TabContainer with toggle behavior to collapse and expand pages.
 * @augments dijit.layout.TabContainer
 */
var CollapsibleTabContainer = dojo_declare("idx.layout.CollapsibleTabContainer", dijit_layout_TabContainer,
/**@lends idx.layout.CollapsibleTabContainer#*/
{

	/**
	 * Indicates whether pages are expanded.
	 * @type Boolean
	 * @default true
	 */
	open: true,

	/**
	 * Duration for animation to collapse/expand.
	 * @type Number
	 * @default 300
	 */
	duration: 300,

	/**
	 * Animation for expanding.
	 * @type Object
	 * @default null
	 */
	openAnim: null,

	/**
	 * Animation for collapsing.
	 * @type Object
	 * @default null
	 */
	closeAnim: null,

	/**
	 * The controller widget.
	 * @private
	 */
	controllerWidget: "idx.layout._CollapsibleTabController",
	
	_sizeProp: "height",
	_endSize: 300,

	constructor: function(){
		dojo_kernel.deprecated("idx.layout.CollapsibleTabContainer is deprecated.");
	},

	/**
	 * Sets up animations.
	 */
	postCreate: function() {
		this.inherited(arguments);
		this._setupAnimation();
	},

	/**
	 * Handles initial collapsed state and layouts.
	 */
	startup: function() {
		this.inherited(arguments);
		
		if (!this.open) {
			dojo_html.style(this.domNode, "height", dojo_html.marginBox(this.tablist.domNode)[this._sizeProp.charAt(0)] + "px");
		}
		this.layout();
	},

	/**
	 * Sets up animations.
	 * @private
	 */
	_setupAnimation: function() {
		// create animation skeletons
		this.closeAnim = dojo_fx.animateProperty({
	        node: this.domNode,
	        duration: this.duration,
	        properties: {}
	    });
		this.openAnim = dojo_fx.animateProperty({
			node: this.domNode,
            duration: this.duration,
            properties: {}
        });
		
		if (this.tabPosition.indexOf("-h") > -1) {
			this._sizeProp = "width";
		} else {
			this._sizeProp = "height";
		}
		
		this.closeAnim.properties[this._sizeProp] = {end: 0, unit: "px"};
		this.openAnim.properties[this._sizeProp] = {end: 0, unit: "px"};
	},

	/**
	 * Toggles state when the current page is re-selected.
	 * Adjusts animation properties for the select child.
	 * @param {Object} page
	 */
	selectChild: function(page) {
		// do not interrupt animation
		if (this.openAnim.status() == "playing" || this.closeAnim.status() == "playing") {
			return;
		}
		
		var page = dijit_registry.byId(page);
		
		if (this.open) {
			this._endSize = dojo_html.style(this.domNode, this._sizeProp);
		}
	
		var tabSize = dojo_html.marginBox(this.tablist.domNode)[this._sizeProp.charAt(0)];
		
		this.openAnim.properties[this._sizeProp].end = this._endSize;
		this.closeAnim.properties[this._sizeProp].end = tabSize;
		
		var selWidget = this.selectedChildWidget;
		this.openAnim.onEnd = function() {
			if (selWidget.resize) {
				selWidget.resize();
			} else if (selWidget.layout) {
				selWidget.layout();
			}
		};
		
		if (this.selectedChildWidget == page) {
			if (this.open) {
				this.closeAnim.play();
			} else {
				this.openAnim.play();
			}
			this.open = !this.open;
		} else {
			if (!this.open) {
				this.openAnim.play();
				this.open = true;
			}
			this.inherited(arguments);
		}
		if(page){
			var button = this.tablist.pane2button[page.id];
			if(button){
				dijit_wai.setWaiState(button.focusNode, "expanded", this.open);
			}
		}
	}
});

dojo_declare("idx.layout._CollapsibleTabController", dijit_layout_TabController, {
	onAddChild: function(page, animate) {
		this.inherited(arguments);
		
		// add space/enter key handler for keyboard accessibility
		var button = this.pane2button[page.id];
		var _this = this;
		button.connect(button.domNode, "onkeyup", function(evt) {
			var key = evt.keyCode;
			var dk = dojo_keys;
			if (key == dk.SPACE || key == dk.ENTER) {
				_this.onButtonClick(page);
			}
		});
		dijit_wai.setWaiState(button.focusNode, "expanded", true);
	}
});

return CollapsibleTabContainer;

}; // end of factory

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
	dojo.provide("idx.layout.CollapsibleTabContainer");
	dojo.require("dijit.layout.TabContainer");
	dojo.require("dijit.layout.TabController");
	factory(dojo, dojo.declare, dojo, dojo, dojo.keys, dijit, dijit, dijit.layout.TabContainer, dijit.layout.TabController);
}else{
	define([
		"../../../node_modules/intern-geezer/node_modules/dojo/_base/kernel",
		"../../../../dist/lib/dojo/_base/declare",
		"dojo/_base/html",
		"dojo/_base/fx",
		"dojo/keys",
		"dijit/_base/wai",
		"dijit/registry",
		"dijit/layout/TabContainer",
		"dijit/layout/TabController"
	], factory);
}

})();
