(function(){

var factory = function(dojo_declare, dojo_html, dijit_form_TimeTextBox, idx_form_IconPickerMixin){

/**
 * @name idx.form.TimePicker
 * @class Time text box with an icon to pick a value.
 * @augments dijit.form.TimeTextBox
 * @augments idx.form._IconPickerMixin
 */
return dojo_declare("idx.form.TimePicker", [dijit_form_TimeTextBox, idx_form_IconPickerMixin],
/**@lends idx.form.TimePicker#*/
{
	
	formatType: "timeFormat",
	iconClass: "idxTimeIcon",
	textIcon: "&#8986;",
	
	/**
	 * Initializes properties with globalization resource.
	 */
	postMixInProperties: function() {
		this.inherited(arguments);
		this.iconAlt = this.res.idxTimePicker_iconTitle;
		this.iconTitle = this.res.idxTimePicker_iconTitle;
	},
	
	/**
	 * Adds a CSS class.
	 */
	buildRendering: function() {
		this.inherited(arguments);
		dojo_html.addClass(this.domNode, "idxTimePicker");
	},
	
	/**
	 * Sets up constraints.
	 * @private
	 */
	_setConstraintsAttr: function(constraints) {
		this.inherited(arguments);
		this.constraints.formatLength = "short";
	}
});

}; // end of factory

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
	dojo.provide("idx.form.TimePicker");
	dojo.require("dijit.form.TimeTextBox");
	dojo.require("idx.form._IconPickerMixin");
	factory(dojo.declare, dojo, dijit.form.TimeTextBox, idx.form._IconPickerMixin);
}else{
	define([
		"../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
		"../../../lib/dojo/_base/html",
		"dijit/form/TimeTextBox",
		"idx/form/_IconPickerMixin"
	], factory);
}

})();
