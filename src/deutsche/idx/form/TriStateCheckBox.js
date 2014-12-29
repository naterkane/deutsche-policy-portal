(function(){

var factory = function(dojo_kernel, dojo_declare, dojo_array, dojo_window, dojo_html, dojo_keys, dijit_form_FormValueWidget, idx_util, templateString){

/**
 * @deprecated idx.form.TriStateCheckBox is deprecated for Dojo 1.7 or upper. Use dojox.form.TriStateCheckBox instead.
 * @name idx.form.TriStateCheckBox
 * @class Check box with three states.
 * @augments dijit.form._FormValueWidget
 */
return dojo_declare("idx.form.TriStateCheckBox", dijit_form_FormValueWidget,
/**@lends idx.form.TriStateCheckBox#*/
{	
	
	baseClass: "idxTriStateCheckBox",
	
	// inherited from dijit._Templated
	templateString: templateString,
	
	// inherited from dijit.form._FormWidget
	name: "",
	alt: "",
	value: "",
	type: "checkbox",
	tabIndex: "0",
	disabled: false,
	intermediateChanges: false,
	scrollOnFocus: true,
	readOnly: false,
	
	/**
	 * To be used by cssStateMixin
	 * @private
	 */
	state: "",
	
	/**
	 * Possible state values.
	 * @type Array
	 * @default ["unchecked", "checked", "mixed"]
	 * @private
	 */
	_stateValues: ["unchecked", "checked", "mixed"],
	_stateIndex: 0,

	/**
	 * Directory path to find images for high contrast mode.
	 * @type String
	 * @default ""
	 */
	imageDir: "",

	/**
	 * Initializes state and images for high contrast mode.
	 */
	buildRendering: function() {
        this.cssOptions = idx.util.getCSSOptions("idxTriStateCheckBoxOptions", this.domNode);
        if (! this.cssOptions) {
            this.cssOptions = {theme: "claro"};
        } 
        this.imageDir = dojo_kernel.moduleUrl("idx", "form/resources/" + this.cssOptions.theme);

		this.hcImages = [
				this.imageDir + "/check_unselected.png",
				this.imageDir + "/check_selected.png",
				this.imageDir + "/check_triselected.png"];
				
		this.hcImages_d = [
				this.imageDir + "/check_unselected_d.png",
				this.imageDir + "/check_selected_d.png",
				this.imageDir + "/check_triselected_d.png"];		

		if (!this.name) {
			this.name = this.id;
		}
		
        this.inherited(arguments);
        
        dojo_html.attr(this.domNode, "aria-checked", "false");
        this._setStateClass();
	},

	/**
	 * Updates image for high contrast mode.
	 */
	startup: function() {
		this.inherited(arguments);
		this._updateHcImage();
	},

	/**
	 * Changes state.
	 * @param {Object} evt
	 * @private
	 */
	_onClick: function(evt) {
		if (!this.disabled && !this.readOnly) {
			this._nextState();
		}
	},

	/**
	 * Handles SPACE and ENTER key to change state.
	 * @param {Object} evt
	 * @private
	 */
	_onKeyUp: function(evt) {
		if (evt.keyCode == dojo_keys.SPACE || evt.keyCode == dojo_keys.ENTER) {
			this._onClick();
		}
	},

	/**
	 * Moves to the next state.
	 * @private
	 */
	_nextState: function() {
		this._stateIndex = (this._stateIndex + 1) % 3;
		this.set("value", this._stateValues[this._stateIndex]);
	},

	/**
	 * Sets a new value
	 * @param {String} newValue
	 * @private
	 */
	_setValueAttr: function(newValue) {
		if (newValue === "checked" || (newValue && newValue.toString() == "true")) {
			arguments[0] = "checked";
		} else if (newValue === "mixed") {
			arguments[0] = "mixed";
		} else {
			arguments[0] = "unchecked";
		}
		this.inherited(arguments);
		
		// set aria-checked
		var checked = "";
		if (this.value === "checked") {
			checked = "true";
		} else if (this.value === "mixed") {
			checked = "mixed";
		} else {
			checked = "false";
		}
		dojo_html.attr(this.domNode, "aria-checked", checked);

		this.state = this.value;
		this._stateIndex = dojo_array.indexOf(this._stateValues, this.value);
		this._setStateClass();
		this._updateHcImage();
	},

	/**
	 * Updates image for high contrast mode based on disabled attribute.
	 * @param {Boolean} disabled
	 * @private
	 */
	_setDisabledAttr: function(disabled) {
		this.inherited(arguments);
		this._updateHcImage();
		if(disabled){
			dojo_html.removeAttr(this.domNode, "tabIndex");
		}else{
			dojo_html.attr(this.domNode, "tabIndex", this.tabIndex);
		}
	},

	/**
	 * Updates image for high contrast mode
	 * @private
	 */
	_updateHcImage: function() {
		if (dojo_html.hasClass(dojo_window.body(), "dijit_a11y")) {
			var imgs = this.hcImages;
			if (this.get("disabled")) {
				imgs = this.hcImages_d;
			}
			dojo_html.attr(this.hcImageNode, "src", imgs[this._stateIndex]);
		}
	}
});

}; // end of factory

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
	dojo.provide("idx.form.TriStateCheckBox");
	dojo.require("dijit.form._FormWidget");
	dojo.require("idx.util");
	var templateString = dojo.cache("idx", "form/templates/TriStateCheckBox.html")
	factory(dojo, dojo.declare, dojo, dojo, dojo, dojo.keys, dijit.form._FormValueWidget, idx.util, templateString);
}else{
	define([
		"../../../node_modules/intern-geezer/node_modules/dojo/_base/kernel",
		"../../../../dist/lib/dojo/_base/declare",
		"idx/oneui/form/TriStateCheckBox", // equivalent to dojox.form.TriStateCheckBox in Dojo 1.8
		"dojo/NodeList-dom" // workaround for missing prereq in dojox.form.TriStateCheckBox
	], function(dojo_kernel, dojo_declare, dojox_form_TriStateCheckBox){
		return dojo_declare("idx.form.TriStateCheckBox", dojox_form_TriStateCheckBox, {

			oneuiBaseClass: "dojoxTriStateCheckBox",

			constructor: function(){
				dojo_kernel.deprecated("idx.form.TriStateCheckBox is deprecated for Dojo 1.7 or upper.", "Use dojox.form.TriStateCheckBox instead.");
			},
			
			_setValueAttr: function(newValue) {
				if(newValue === "checked" || (newValue && newValue.toString() == "true")){
					newValue = true;
				} else if (newValue != "mixed") {
					newValue = false;
				}
				this.set("checked", newValue);
			}

		});
	});
}

})();
