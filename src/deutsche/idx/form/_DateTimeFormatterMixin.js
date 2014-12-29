(function(){

var factory = function(dojo_declare, dojo_i18n, idx_form_nls_DateTimeFormatterMixin){

/**
 * @name idx.form._DateTimeFormatterMixin
 * @class Mix-in class to add date formatting feature.
 */
return dojo_declare("idx.form._DateTimeFormatterMixin", [],
/**@lends idx.form._DateTimeFormatterMixin#*/
{
	/**
	 * Specifies whether to show format pattern.
	 * @type Boolean
	 * @default false
	 */
	showFormatPattern: false,	// if true, show date/time pattern

	/**
	 * Formatting type, either "dateFormat" or "timeFormat".
	 * @type String
	 * @default "dateFormat"
	 */
	formatType: "dateFormat",	// "dateFormat" or "timeFormat"

	/**
	 * Initializes globalization resource and format pattern string.
	 */
	postMixInProperties: function() {
		this.inherited(arguments);
		if(!idx_form_nls_DateTimeFormatterMixin){
			idx_form_nls_DateTimeFormatterMixin = dojo_i18n.getLocalization("idx.form", "_DateTimeFormatterMixin");
		}
		this.res = idx_form_nls_DateTimeFormatterMixin;
		if(this.showFormatPattern) {
			this.placeHolder = this.getFormatPattern();
		}
	},

	/**
	 * Returns a format pattern for formatting type.
	 * @returns {String}
	 */
	getFormatPattern : function(){
		return this.res[this.formatType];
	}	
});

}; // end of factory

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
	dojo.provide("idx.form._DateTimeFormatterMixin");
	dojo.require("dojo.i18n");
	dojo.requireLocalization("idx.form", "_DateTimeFormatterMixin");
	factory(dojo.declare, dojo.i18n);
}else{
	define([
		"../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
		"../../../lib/dojo/i18n",
		"dojo/i18n!./nls/_DateTimeFormatterMixin"
	], factory);
}

})();
