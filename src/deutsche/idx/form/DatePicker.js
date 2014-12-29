(function(){

var factory = function(dojo_declare, dojo_html, dijit_form_DateTextBox, idx_form_IconPickerMixin){

/**
 * @name idx.form.DatePicker
 * @class Date text box with an icon to pick a value.
 * @augments dijit.form.DateTextBox
 * @augments idx.form._IconPickerMixin
 */
return dojo_declare("idx.form.DatePicker",
	[dijit_form_DateTextBox, idx_form_IconPickerMixin],
/**@lends idx.form.DatePicker#*/
	{
		formatType: "dateFormat",
		iconClass: "idxCalendarIcon",
		forceWidth: false,
		
		/**
		 * Initializes properties with globalization resource.
		 */
		postMixInProperties: function() {
			this.inherited(arguments);
			this.iconAlt = this.res.idxDatePicker_iconTitle;
			this.iconTitle = this.res.idxDatePicker_iconTitle;
		},

		/**
		 * Adds a CSS class.
		 */
		buildRendering: function() {
			this.inherited(arguments);			
			dojo_html.addClass(this.domNode, "idxDatePicker");
		},

		/**
		 * Sets up constraints.
		 */
		startup: function() {
			this.inherited(arguments);
			this.constraints.formatLength = "short";
			this.constraints.fullYear = true;
		}	
	}
);

}; // end of factory

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
	dojo.provide("idx.form.DatePicker");
	dojo.require("dijit.form.DateTextBox");
	dojo.require("idx.form._IconPickerMixin");
	factory(dojo.declare, dojo, dijit.form.DateTextBox, idx.form._IconPickerMixin);
}else{
	define([
		"../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
		"../../../lib/dojo/_base/html",
		"dijit/form/DateTextBox",
		"idx/form/_IconPickerMixin"
	], factory);
}

})();
