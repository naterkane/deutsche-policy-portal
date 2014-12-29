(function(){

var factory = function(dojo_declare, dojo_lang, dojo_array, dojo_html, dojo_event, dojo_keys, dijit_wai, dijit_registry, dijit_form_FilteringSelect, dijit_form_CheckBox, dijit_form_ComboBoxMenu, idx_html){

var _MultiSelectMenu;

/**
 * @name idx.form.DropDownMultiSelect
 * @class Selection box with multiple values to select
 * @augments dijit.form.FilteringSelect
 */
var DropDownMultiSelect = dojo_declare("idx.form.DropDownMultiSelect", [dijit_form_FilteringSelect],
/**@lends idx.form.DropDownMultiSelect#*/
{
	autocomplete: false,
	value: null,
	
	/**
	 * Attribute name for the underlying value.
	 * If not set, and if a store with Identity feature is used, the identifier is used.
	 * If store is not used or does not have Identity feature, searchAttr is used.
	 * @type String
	 * @default ""
	 */
	valueAttr: "",		

	/**
	 * Returns if the current value is valid.
	 * @returns Boolean
	 */
	isValid: function() {
		var valid = (!this.required || this.get("value").length > 0);
		return valid;
	},

	/**
	 * Sets up styles, properties and event handlers.
	 */
	buildRendering: function() {
		this.inherited(arguments);
		dojo_html.addClass(this.domNode, "idxDropDownMultiSelect");
		
		dojo_html.style(this.textbox, "display", "none");
		
		var displayNode = this.displayNode = document.createElement("div");
		
		dojo_html.addClass(displayNode, "dijitReset dijitInline idxDropDownMultiSelectDisplayNode");
		this.textbox.parentNode.insertBefore(displayNode, this.textbox);
		if (this._onArrowMouseDown) { // dojo 1.5 support
			this.connect(displayNode.parentNode, "onclick", "_onArrowMouseDown");
			this.connect(this, "_onArrowMouseDown", function() {
				this.displayNode.parentNode.focus();
			});
		} else if (this.toggleDropDown) { // dojo 1.6 support
			this.connect(displayNode.parentNode, "onclick", "toggleDropDown");
			this.connect(this, "toggleDropDown", function() {
				this.displayNode.parentNode.focus();
			});
		} else {
			throw new Error("idx.form.DropDownMultiSelect unable to find drop-down mouse-down event "
						    + "function in base class.")			
		}
		
		//this.connect(displayNode.parentNode, "onkeypress", "_onKeyEvent");
		dojo_html.attr(displayNode.parentNode, "tabIndex", "0");
		this.focusNode = displayNode.parentNode;
		dojo_html.attr(displayNode.parentNode, "aria-haspopup", "true");
		dojo_html.attr(displayNode, "tabIndex", "-1");
		
		this.searchAttr = this.store.label || this.searchAttr;
		this.valueAttr = this.valueAttr || this.store.identifier || this.searchAttr;
	},

	/**
	 * Renders the value.
	 */
	startup: function() {
		if (this._started) {return;}
		this.inherited(arguments);

		this._render();
	},
	
	/**
	 * Handles special keys, such as SPACE, ENTER and TAB.
	 * By default selecting an option closes the pop-up, so prevent it here
	 * @param {Object} evt
	 * @private
	 */
	_onKey: function(evt) {
		if (this.disabled || this.readOnly) {
			return;
		}
		
		var dk = dojo_keys;
		var k = evt.charOrCode;
		var node = this._currentOption;
		if (evt.keyCode == dk.SPACE || evt.charOrCode == " " || k == dk.ENTER) {
			if (!node || (!this._isShowingNow && !this._opened)) {
				dojo_event.stop(evt);
				this._startSearch("");
				return;
			}
			if (node != this.dropDown.nextButton && node != this.dropDown.previousButton) {
				var cb = dijit_registry.findWidgets(node)[0];
				if(cb){
					var v = cb.get("value");
					cb.set("value", !v);
					this.dropDown.optionClicked(cb.name);
					dojo_event.stop(evt);
				}
			} else {
					this.inherited(arguments);
			}
		} else {
			this.inherited(arguments);
		}
	},
	
	_onDropDownMouseUp: function() {
		// do nothing
	},

	_startSearchFromInput: function() {
		// override, do nothing
	},

	/**
	 * Sets the current option.
	 * @param {Object} node
	 * @private
	 */
	_announceOption: function(node) {
		// override, called when key navigating
		this._currentOption = node;
		dijit_wai.setWaiState(this.textbox.parentNode, "activedescendant", dojo_html.attr(node, "id"));
	},

	_autoCompleteText: function(text) {
		// override, do nothing
		return;
	},

	/**
	 * Sets up a drop down menu.
	 * @private
	 */
	_createDropDown: function() {
		if (!this.dropDown) {
			var popupId = this.id + "_popup";
			this.dropDown = this._popupWidget = new _MultiSelectMenu({
				id: popupId,
				dir: this.dir,
				valueAttr: this.valueAttr
			});
			this.connect(this.dropDown, "onClose", "_onPopupClose");
			
			dijit_wai.removeWaiState(this.textbox.parentNode, "activedescendant");
			dijit_wai.setWaiState(this.textbox.parentNode, "owns", popupId);
		}
		var value = this.get("value");
		// cache the current string value for comparing with a new value in _onPopupClose() to fire onChange() 
		this._valueString = (value ? value.toString() : "");
		this.dropDown.set("selectedValues", value);		
	},

	/**
	 * Sets up a drop down menu.
	 * @private
	 */
	_startSearch: function() {
		this._createDropDown();
		this.inherited(arguments);
	},

	/**
	 * Retrieves the current value.
	 * @returns {Array}
	 * @private
	 */
	_getValueAttr: function() {
		return (this.value || []);
	},

	/**
	 * Sets a new value and renders it.
	 * @param {Array} value
	 * @private
	 */
	_setValueAttr: function(value) {
		this.value = value || [];
		if (this._started) {
			this._render(); 
		}
	},

	/**
	 * Sets value to display.
	 * @param {String} value
	 * @private
	 */
	_setDisplayedValueAttr: function(value) {
		this.displayedValue = value;
		this.textbox.value = value;
		this.focusNode.value = value;
		idx_html.setTextNode(this.displayNode, value);
		dojo_html.attr(this.displayNode.parentNode, "title", value);
	},

	/**
	 * Sets "tabIndex" attribute.
	 * @param {Boolean} value
	 * @private
	 */
	_setDisabledAttr: function(value){
		this.inherited(arguments);

		dojo_html.attr(this.textbox.parentNode, "tabIndex", (value ? -1 : 0));
	},

	/**
	 * Renders the current value.
	 * @private
	 */
	_render: function() {
		var labels = [];

		if (this.value && !dojo_lang.isArray(this.value)) {
			this.value = [this.value];
		}

		var callback = dojo_lang.hitch(this, function(items, args) {
			for (var i = 0; i < items.length; i++)  {
				var item = items[i];
				var value = this.store.isItem ? this.store.getValue(item, this.valueAttr) : item.value;
				var label = this.labelFunc(item, this.store);
				if (dojo_array.indexOf(this.value, value) > -1) {
					labels.push(label);
				}
			}
			this.set("displayedValue", labels.join(", "));
			this.validate();
		});
		
		var query = {};
		query[this.valueAttr] = "*";
		
		this.store.fetch({
			query: query,
			onComplete: callback
		});
	},

	/**
	 * Updates the value when the drop down closed.
	 * @private
	 */
	_onPopupClose: function() {
		var values = this.dropDown.get("value");
		var newValues = [];
		// values may not be sorted correctly - fetch to sort it out
		var _t = this;
		var query = {};
		query[this.valueAttr] = "*";
		
		this.store.fetch({
			query: query,
			onComplete: function(items) {
				dojo_array.forEach(items, function(item) {
					var val = _t.store.isItem ? _t.store.getValue(item, _t.valueAttr) : item.value;
					if (dojo_array.indexOf(values, val) > -1) {
						newValues.push(val);
					}
				});
			}
		});
		this.set("value", newValues);

		// fire onChange() if value changed
		if(this.onChange && newValues.toString() != this._valueString){
			var scope = this;
			setTimeout(function(){
				scope.onChange(scope.value);
			}, 0);
		}
	}
});

/**
 * @name idx.form._MultiSelectMenu
 * @class Selection box with multiple values to select
 * @augments dijit.form._ComboBoxMenu
 */
_MultiSelectMenu = dojo_declare("idx.form._MultiSelectMenu", [dijit_form_ComboBoxMenu],
/**@lends idx.form._MultiSelectMenu#*/
{
	/**
	 * Selected values
	 * @type Array
	 * @default null
	 */
	selectedValues: null,

	/**
	 * Initializes selected values
	 */
	constructor: function() {
		this.selectedValues = [];
	},

	/**
	 * Sets up a container node.
	 */
	buildRendering: function() {
		this.inherited(arguments);
		this.containerNode = this.domNode;
		
		dojo_html.attr(this.domNode, "role", "listbox");
		dijit_wai.setWaiState(this.domNode, "multiselectable", "true");
	},

	/**
	 * Sets new selected values.
	 * @param {Array} values
	 * @private
	 */
	_setSelectedValuesAttr: function(values) {
		this.selectedValues = values;
	},

	/**
	 * Creates elements for an option from the specified data store item.
	 * @returns {Object}
	 * @private
	 */
	_createOption: function(item, labelFunc) {
		var labelObj = labelFunc(item);
		var menuItem = dojo_html.create("li", {
			role: "option"
		});
		var value = item._S ? item._S.getValue(item, this.valueAttr) : item.value;

		var labelNode = dojo_html.create("label", {
			id: this.id + value + "_label"
		});
		
		dojo_html.addClass(labelNode, "idxDropDownMultiSelectMenuItemLabel");
		
		if(labelObj.html){
			labelNode.innerHTML = labelObj.label;
		}else{
			idx_html.setTextNode(labelNode, labelObj.label)
		}
		
		var checked = dojo_array.indexOf(this.selectedValues, value) > -1;
		var cb = new dijit_form_CheckBox({
			checked: checked,
			name: value,
			id: this.id + value,
			onChange: dojo_lang.hitch(this, function(checked) {
				dijit_wai.setWaiState(menuItem, "checked", checked);
			}),
			onClick: dojo_lang.hitch(this, "optionClicked", value)
		});
		
		dojo_html.attr(labelNode, "for", this.id + value);
		
		menuItem.appendChild(cb.domNode);
		menuItem.appendChild(labelNode);
		
		dijit_wai.setWaiState(menuItem, "labelledby", labelNode.id);
		dijit_wai.setWaiState(menuItem, "checked", checked);
		dijit_wai.setWaiState(menuItem, "selected", true);
		
		menuItem.item = item;

		return menuItem;
	},

	/**
	 * Toggles selected values.
	 * @param {String} value
	 */
	optionClicked: function(value) {
		var idx = dojo_array.indexOf(this.selectedValues, value);
		if (idx > -1) {
			this.selectedValues.splice(idx, 1);
		} else {
			this.selectedValues.push(value);
		}
	},

	/**
	 * Retrieves the current value.
	 * @returns {Array}
	 * @private
	 */
	_getValueAttr: function() {
		return this.selectedValues;
	},

	/**
	 * Destroys child widgets.
	 */
	clearResultList: function() {
		var cbs = dijit_registry.findWidgets(this.domNode);
		for (var i in cbs) {
			cbs[i].destroy();
		}
		this.inherited(arguments);
	},

	/**
	 * Handles paging.
	 * @param {Object} evt
	 * @private
	 */
	_onMouseUp: function(evt){
		// override _ComboBoxMenu
		if(evt.target === this.domNode || (this._blurOptionNode /* 1.6 only */ && !this._highlighted_option)){
			return;
		} else if(evt.target == this.previousButton){
			this.onPage(-1);
		} else if(evt.target == this.nextButton){
			this.onPage(1);
		}
	}
});

return DropDownMultiSelect;

}; // end of factory

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
	dojo.provide("idx.form.DropDownMultiSelect");
	dojo.require("dijit.form.FilteringSelect");
	dojo.require("dijit.form.CheckBox");
	dojo.require("idx.html");
	var dojo_event = {stop: dojo.stopEvent};
	factory(dojo.declare, dojo, dojo, dojo, dojo_event, dojo.keys, dijit, dijit, dijit.form.FilteringSelect, dijit.form.CheckBox, dijit.form._ComboBoxMenu, idx);
}else{
	define([
		"../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
		"../../../../dist/lib/dojo/_base/lang",
		"dojo/_base/array",
		"dojo/_base/html",
		"dojo/_base/event",
		"dojo/keys",
		"dijit/_base/wai",
		"dijit/registry",
		"dijit/form/FilteringSelect",
		"dijit/form/CheckBox",
		"dijit/form/_ComboBoxMenu",
		"idx/html"
	], factory);
}

})();
