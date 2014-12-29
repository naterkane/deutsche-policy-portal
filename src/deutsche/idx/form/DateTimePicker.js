(function(){

var factory = function(dojo_declare, dijit_Templated, dijit_form_FormValueWidget, idx_form_DatePicker, idx_form_TimePicker, templateString){

/**
 * @name idx.form.DateTimePicker
 * @class Combined date and time text boxes.
 * @augments dijit.form._FormValueWidget
 * @augments dijit._Templated
 */
return dojo_declare("idx.form.DateTimePicker", [dijit_form_FormValueWidget, dijit_Templated],
/**@lends idx.form.DateTimePicker#*/
{
	
	widgetsInTemplate: true,
	templateString: templateString,

	/**
	 * Specifies whether to show format pattern in date text box.
	 * @type Boolean
	 * @default false
	 */
	showDateFormatPattern: false,

	/**
	 * Specifies whether to show format pattern in time text box.
	 * @type Boolean
	 * @default false
	 */
	showTimeFormatPattern: false,

	/**
	 * Specifies if the value is required.
	 */
	required: false,
	readOnly: false,
	
	value: null,

	/**
	 * Sets up event handlers.
	 */
	postCreate: function() {
		this.inherited(arguments);
		
		this.connect(this.datePicker, "_setValueAttr", "_updateValueAttr");
		this.connect(this.timePicker, "_setValueAttr", "_updateValueAttr");
	},

	/**
	 * Validates both date and time values.
	 * @param {Boolean} f
	 * @returns {Boolean}
	 */
	validate: function(f) {
		//A containing form will first set "_hasBeenBlurred" on this
		//widget before validating; we must pass this on to our children
		if(typeof(this._hasBeenBlurred)!== "undefined"){
			this.datePicker._hasBeenBlurred = (this._hasBeenBlurred || this.datePicker._hasBeenBlurred);
			this.timePicker._hasBeenBlurred = (this._hasBeenBlurred || this.timePicker._hasBeenBlurred);
		}
		
		//Call separately to ensure both get called - no short-circuiting
		//This is important to trigger the validation icons if needed
		var dateValid = this.datePicker.validate(f);
		var timeValid = this.timePicker.validate(f);
		
		//Return true if, and only if, both are valid
		return (dateValid && timeValid);
	},

	/**
	 * Returns if both date and time are valid.
	 * @param {Boolean} f
	 * @returns {Boolean}
	 */
	isValid: function(f) {
		return this.datePicker.isValid(f) && this.timePicker.isValid(f);
	},

	/**
	 * Retrieves the current date value.
	 * @returns {Date}
	 * @private
	 */
	_getDateAttr: function() {
		return this.datePicker.get("value");
	},

	/**
	 * Retrieves the current time value.
	 * @returns {Date}
	 * @private
	 */
	_getTimeAttr: function() {
		return this.timePicker.get("value");
	},

	/**
	 * Sets a new date value.
	 * @param {Date} value
	 * @private
	 */
	_setDateAttr: function(value) {
		this.datePicker.set("value", value);
	},

	/**
	 * Sets a new time value.
	 * @param {Date} value
	 * @private
	 */
	_setTimeAttr: function(value) {
		this.timePicker.set("value", value);
	},

	/**
	 * Retrieves a combined date and time value.
	 * @returns {Date}
	 * @private
	 */
	_getValueAttr: function() {
		return this._getCombinedValue();
	},

	/**
	 * Sets a new combined date and time value.
	 * @param {Date} date
	 * @private
	 */
	_setValueAttr: function(date) {
		this.value = date;
		this.datePicker.set("value", date);
		this.timePicker.set("value", date);
	},

	/**
	 * Specifies "disabled" attributes for date and time text boxes.
	 * @param {Boolean} disabled
	 * @private
	 */
	_setDisabledAttr: function(disabled) {
		this.inherited(arguments);	// dijit.form._FormWidget
		this.datePicker.set("disabled", disabled);
		this.timePicker.set("disabled", disabled);
	},

	/**
	 * Specifies "required" attributes for date and time text boxes.
	 * @param {Boolean} required
	 * @private
	 */
	_setRequiredAttr: function(required) {
		this.required = required;
		this.datePicker.set("required", required);
		this.timePicker.set("required", required);
	},
	
	/**
	 * Specifies "readOnly" attributes for date and time text boxes.
	 * @param {Boolean} readOnly
	 * @private
	 */
	_setReadOnlyAttr: function(readOnly) {
		this.readOnly = readOnly;
		this.datePicker.set("readOnly", readOnly);
		this.timePicker.set("readOnly", readOnly);
	},

	/**
	 * Updates the current value with a combined data and time value.
	 * @param {Date} value
	 * @private
	 */
	_updateValueAttr: function(value) {
		this.value = this._getCombinedValue();
	},

	/**
	 * Generates a combined data and time value.
	 * @returns {Date}
	 * @private
	 */
	_getCombinedValue: function() {
		var d = this.datePicker.get("value");
		var t = this.timePicker.get("value");
		if (!d && !t) {
			// both pickers have no value, return null
			return null;
		}
		d = d || new Date(0);
		t = t || new Date(0);
		var dt = new Date(d.getTime() + t.getTime());
		return dt;
	},

	/**
	 * Resets date and time text boxes.
	 */
	reset: function(){
		this.inherited(arguments);
		this.datePicker.reset();
		this.timePicker.reset();
	},
	
	_onMouseDown: function(e) {
		// Override FormWidget#_onMouseDown
	}
});

}; // end of factory

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
	dojo.provide("idx.form.DateTimePicker");
	dojo.require("dijit._Templated");
	dojo.require("dijit.form._FormWidget");
	dojo.require("idx.form.DatePicker");
	dojo.require("idx.form.TimePicker");
	var templateString = dojo.cache("idx.form", "templates/DateTimePicker.html");
	factory(dojo.declare, dijit._Templated, dijit.form._FormValueWidget, idx.form.DatePicker, idx.form.TimePicker, templateString);
}else{
	define([
		"../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
		"../../../../dist/lib/dijit/_Templated",
		"dijit/form/_FormValueWidget",
		"idx/form/DatePicker",
		"idx/form/TimePicker",
		"dojo/text!./templates/DateTimePicker.html"
	], factory);
}

})();
