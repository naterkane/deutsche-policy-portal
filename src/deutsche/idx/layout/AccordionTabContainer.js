(function(){

var factory = function(dojo_kernel, dojo_declare, dojo_lang, dojo_array, dojo_html, dijit_Toolbar, dijit_Widget, dijit_WidgetsInTemplateMixin, idx_layout_CollapsibleTabContainer, templateString){

/**
 * @deprecated idx.layout.AccordionTabContainer is deprecated.
 * @name idx.layout.AccordionTabContainer
 * @class TabContainer with accordion behavior to collapse and expand pages.
 * @augments idx.layout.CollapsibleTabContainer
 */
var AccordionTabContainer = dojo_declare(
	"idx.layout.AccordionTabContainer",
	idx_layout_CollapsibleTabContainer,
/**@lends idx.layout.AccordionTabContainer#*/
	{
		
		tabPosition: "top",
		
		controllerWidget: "idx.layout.AccordionTabController",
		
		_headerWidget: null,

		constructor: function(){
			dojo_kernel.deprecated("idx.layout.AccordionTabContainer is deprecated.");
		},

		/**
		 * Reparent special children and layout.
		 */
		startup: function() {
			this.inherited(arguments);
			
			var children = this.getChildren();
			dojo_array.forEach(children, dojo_lang.hitch(this, function(child) {
				this._reParent(child);
			}));

			dojo_html.addClass(this.domNode, "idxAccordionTabContainer");
			this.layout();
		},

		/**
		 * Reparent child being added.
		 * @param {Object} widget
		 */
		addChild: function(widget) {
			this.inherited(arguments);
			this._reParent(widget);
		},

		/**
		 * Reparent child widget.
		 * "header" type children are placed within the tab list.
		 * "button" type children are placed on the toolbar.
		 * @param {Object} widget
		 */
		_reParent: function(widget) {
			var type = widget.get("accordionType");
			if (type == "header") {
				this._headerWidget = widget;
				dojo_html.removeClass(widget.domNode, "dijitHidden");
				this.removeChild(widget);
				this.tablist.headerNode.appendChild(widget.domNode);
			} else if (type == "button") {
				dojo_html.removeClass(widget.domNode, "dijitHidden");
				this.removeChild(widget);
				this.tablist.toolbar.addChild(widget);
			}
		},

		/**
		 * Layout header widget.
		 */
		layout: function() {
			this.inherited(arguments);
			
			if (!this.started) return;
			if (this._headerWidget.resize) {
				this._headerWidget.resize();
			}
		}

	}
);

var AccordionTabControllerBase = [idx.layout._CollapsibleTabController]; // FIXME: how to get idx.layout._CollapsibleTabController?
if(dijit_WidgetsInTemplateMixin){
	AccordionTabControllerBase.push(dijit_WidgetsInTemplateMixin);
}
dojo_declare("idx.layout.AccordionTabController", AccordionTabControllerBase, {
	widgetsInTemplate: true,
	templateString: templateString
});

dojo_lang.extend(dijit_Widget, {
	// "header", "tab", "button"
	accordionType: "tab"
});

return AccordionTabContainer;

}; // end of factory

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
	dojo.provide("idx.layout.AccordionTabContainer");
	dojo.require("dijit.Toolbar");
	dojo.require("idx.layout.CollapsibleTabContainer");
	var dijit_WidgetsInTemplateMixin = null; /* no _WidgetsInTemplateMixin in 1.6 */
	var templateString = dojo.cache("idx", "layout/templates/AccordionTabController.html");
	factory(dojo, dojo.declare, dojo, dojo, dojo, dijit.Toolbar, dijit._Widget, dijit_WidgetsInTemplateMixin, idx.layout.CollapsibleTabContainer, templateString);
}else{
	define([
		"../../../node_modules/intern-geezer/node_modules/dojo/_base/kernel",
		"../../../../dist/lib/dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/_base/array",
		"dojo/_base/html",
		"dijit/Toolbar",
		"dijit/_Widget",
		"dijit/_WidgetsInTemplateMixin",
		"idx/layout/CollapsibleTabContainer",
		"dojo/text!./templates/AccordionTabController.html"
	], factory);
}

})();
