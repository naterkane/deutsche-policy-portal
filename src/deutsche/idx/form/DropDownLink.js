(function(){

var factory = function(dojo_declare, dojo_lang, dojo_query, dijit_registry, dijit_popup, dijit_HasDropDown, dijit_Container, idx_form_Link, templateString){

/**
 * @name idx.form.DropDownLink
 * @class Link with a drop-down menu.
 * @augments idx.form.Link
 * @augments dijit._Container
 * @augments dijit._HasDropDown
 */
return dojo_declare("idx.form.DropDownLink", [idx.form.Link, dijit_Container, dijit_HasDropDown],
		/**@lends idx.form.DropDownLink#*/
		{
			baseClass: "idxDropDownLink",
			
			templateString: templateString,
			
			dropDown: null,

			/**
			 * save pointer to original DOM to get dropdown later
			 */
			_fillContent: function(src) {
				// do not fill any content.  my only child is the dropdown
				// filling content causes layout issue in webkit
				this._ddContainer = src;
			},
			
			/**
			 * Sets up the drop down menu.
			 */
			startup: function() {
				if (this._started) return;
				this.dropDown = this.dropDown || this._getDropDown();
				if (this.dropDown) {
					if (dijit_popup.hide) {
						// for 1.6+
						dijit_popup.hide(this.dropDown);
					} else {
						// for ~1.5
						dijit_popup.moveOffScreen(this.dropDown.domNode);	
					}
				}
				this.inherited(arguments);
			},
			
			/**
			 * get drop down widget from saved pointer to original DOM
			 */
			_getDropDown: function() {
				// find drop down widget node
				var ddNode = dojo_query("[widgetId]", this._ddContainer)[0];
				return (ddNode ? dijit_registry.byNode(ddNode) : null);
			},

			/**
			 * Handle focus.
			 */
			focus: function() {
				this.focusNode.focus();
			}			
		});

}; // end of factory

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
	dojo.provide("idx.form.DropDownLink");
	dojo.require("dijit._HasDropDown");
	dojo.require("dijit._Container");
	dojo.require("idx.form.Link");
	var templateString = dojo.cache("idx.form", "templates/DropDownLink.html");
	factory(dojo.declare, dojo, dojo.query, dijit, dijit.popup, dijit._HasDropDown, dijit._Container, idx.form.Link, templateString);
}else{
	define([
		"../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
		"../../../../dist/lib/dojo/_base/lang",
		"dojo/query",
		"dijit/registry",
		"dijit/popup",
		"dijit/_HasDropDown",
		"dijit/_Container",
		"idx/form/Link",
		"dojo/text!./templates/DropDownLink.html"
	], factory);
}

})();
