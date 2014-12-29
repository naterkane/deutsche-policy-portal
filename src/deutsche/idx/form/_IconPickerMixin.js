(function(){

var factory = function(dojo_declare, dojo_lang, dojo_html, idx_form_DateTimeFormatterMixin){

/**
 * @name idx.form._IconPickerMixin
 * @class Mix-in class to add icon to pick a value.
 * @augments idx.form._DateTimeFormatterMixin
 */
return dojo_declare("idx.form._IconPickerMixin", [idx_form_DateTimeFormatterMixin],
/**@lends idx.form._IconPickerMixin#*/
{

	/**
	 * Icon class name.
	 * @type String
	 * @default ""
	 */
	iconClass: "",

	/**
	 * The text-equivalent for the icon for high-contrast mode.
	 * @type String
	 * @default "" 
	 */
	textIcon: "&#9660;",
	
	/**
	 * Tooltip text for icon.
	 * @type String
	 * @default ""
	 */
	iconTitle: "",

	/**
	 * ALT text for icon.
	 * @type String
	 * @default ""
	 */
	iconAlt: "",
	openOnClick: false,		// do not open when clicking text box

	/**
	 * Sets up icon and event handlers.
	 */
	buildRendering: function() {
		this.inherited(arguments);
		dojo_html.addClass(this.domNode, "idxIconPicker");
		
		var link = this.iconNode = dojo_html.create("div", {
			className: "dijitInline idxPickerIconLink",
			title: this.iconTitle,
			tabIndex: 0
		}, this.domNode);
		dojo_html.create("img", {
			className: "idxPickerIcon " + this.iconClass,
			alt: this.iconAlt,
			src: this._blankGif
		}, link	);
		var textIcon = dojo_html.create("div", {className: "idxPickerTextIcon"}, link);
		textIcon.innerHTML = this.textIcon;
		
		if (this._buttonNode) {
			// 1.6+
			this._buttonNode = link;
			this.connect(this._buttonNode, "onkeypress", "_onKey");
			this.connect(this._buttonNode, "onkeyup", "_onKeyUp");
		} else {
			// ~1.5
			this.connect(link, "onclick", "_onIconClick");
			this.connect(link, "onblur", "_onBlur");
		}
		
		this.formatterNode = this.textbox;
	},
	
	/**
	 * @private
	 */
	_onKey: function(e) {
		// workaround for 3676
		if (!this.readOnly) {
			this.inherited(arguments);
		}
	},

	/**
	 * Handles key event.
	 * @param {Object} e
	 * @private
	 */
	_onKeyUp: function(e) {
		if (this._opened) {
			delete this._toggleOnKeyUp;
			return;
		} else {
			this.inherited(arguments);
		}
	},
	
	// ~1.5 only 
	/**
	 * Opens the drop down when the icon is clicked.
	 * @private
	 */
	_onIconClick: function() {
		if (this.disabled) {
			return;
		}
		this.focus();
		// trick for IE
		setTimeout(dojo_lang.hitch(this, "_open"), 0);
	},

	// ~1.5 only
	/**
	 * Opens the drop down.
	 * @param {Object} evt
	 * @private
	 */
	_open: function(evt) {
		if (evt && evt.target == this.focusNode) {
			return;
		}
		this.inherited(arguments);
	},
	
	// ~1.5 only
	/**
	 * Suppress opening the drop down on focus.
	 * @private
	 */
	_onFocus: function() {
		// override, do not open
		dijit.form.TextBox.prototype._onFocus.apply(this, arguments);
	},
	
	// fix for 3678
	/**
	 * Disables tab to focus when disabled.
	 * @param {Boolean} disabled
	 * @private
	 */
	_setDisabledAttr: function(disabled) {
		this.inherited(arguments);
		dojo_html.attr(this.iconNode, "tabIndex", disabled ? -1 : 0);
		if (disabled) {
			this.iconNode.title = "";
		} else {
			this.iconNode.title = this.iconTitle;
		}
	},
	
	_setReadOnlyAttr: function(readOnly) {
		this.inherited(arguments);
		if (readOnly) {
			this.iconNode.title = "";
		} else {
			this.iconNode.title = this.iconTitle;
		}
	},
	
	// override
	/**
	 * Validates value.
	 */
	validate: function() {
		var v = this.inherited(arguments);
		if (!v) {
			this.validationFailure();
		} else {
			this.validationSuccess();
		}
		return v;
	},

	/**
	 * Callback to be called when validation has failed.
	 */
	validationFailure: function() {
		// override me
	},

	/**
	 * Callback to be called when validation has passed.
	 */
	validationSuccess: function() {
		// override me
	}
});

}; // end of factory

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
	dojo.provide("idx.form._IconPickerMixin");
	dojo.require("idx.form._DateTimeFormatterMixin");
	factory(dojo.declare, dojo, dojo, idx.form._DateTimeFormatterMixin);
}else{
	define([
		"../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
		"../../../../dist/lib/dojo/_base/lang",
		"dojo/_base/html",
		"idx/form/_DateTimeFormatterMixin"
	], factory);
}

})();
