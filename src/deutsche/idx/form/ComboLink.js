(function(){

var factory = function(dojo_declare, dojo_html, dojo_event, dojo_keys, idx_form_DropDownLink, templateString){

/**
 * @name idx.form.ComboLink
 * @class Link with own action and a drop-down menu.
 * @augments idx.form.DropDownLink
 */
return dojo_declare("idx.form.ComboLink", idx_form_DropDownLink,
/**@lends idx.form.ComboLink#*/
{
	baseClass: "idxComboLink",
	
	templateString: templateString,

	postCreate: function() {
		this.inherited(arguments);
		
		this.connect(this._buttonNode, "onkeypress", "_onKey");
		this.connect(this._buttonNode, "onkeyup", "_onKeyUp");
	},
	
	/**
	 * Updates tabIndex.
	 * @private
	 */
	_setStateClass: function(){
		this.inherited(arguments);

		dojo_html.attr(this._buttonNode, "tabIndex", (this.disabled ? -1 : this.tabIndex));
	},

	/**
	 * Override since Dojo 1.6 dijit._HasDropDown listens for key events
	 * on the focus node to activate the drop down instead of the _buttonNode.
	 * @private
	 * @param {Object} e
	 */
	_onKey: function(e) {
		// ignore the vent if disabled or modifier keys are pressed
		if (this.disabled || e.altKey || e.ctrlKey) {
			return;
		}
		
		// on the focus node, only the down arrow is allowed to activate
		// the drop-down -- not the space or enter key (problem in Dojo 1.6)
		if (e.target == this.focusNode && e.charOrCode != dojo_keys.DOWN_ARROW) {
			return;
		}
		this._lastFocusedNode = e.target;
		this.inherited(arguments);
	},
	
	_onKeyUp: function(e) {
		// ignore the vent if disabled or modifier keys are pressed
		if (this.disabled || e.altKey || e.ctrlKey) {
			return;
		}
		
		// on the focus node, only the down arrow is allowed to activate
		// the drop-down -- not the space or enter key (problem in Dojo 1.6)
		if (e.target == this.focusNode && e.charOrCode != dojo_keys.DOWN_ARROW) {
			return;
		}
		this.inherited(arguments);
	},

	focus: function() {
		if (this._lastFocusedNode) {
			this._lastFocusedNode.focus();
		} else {
			this.focusNode.focus();
		}
	}
});

}; // end of factory

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
	dojo.provide("idx.form.ComboLink");
	dojo.require("idx.form.DropDownLink");
	var dojo_event = {stop: dojo.stopEvent};
	var templateString = dojo.cache("idx.form", "templates/ComboLink.html");
	factory(dojo.declare, dojo, dojo_event, dojo.keys, idx.form.DropDownLink, templateString);
}else{
	define([
		"../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
		"../../../lib/dojo/_base/html",
		"dojo/_base/event",
		"dojo/keys",
		"idx/form/DropDownLink",
		"dojo/text!./templates/ComboLink.html"
	], factory);
}

})();
