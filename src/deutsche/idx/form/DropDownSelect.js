(function(){

var factory = function(dojo_declare, dojo_lang, dojo_array, dijit_popup, dijit_HasDropDown, dijit_Container, dijit_Widget, dijit_Templated, dijit_MenuItem, idx_ext, templateString){

/**
 * @name idx.form.DropDownSelect
 * @class Selection text with a drop down menu.
 * @augments dijit._Widget
 * @augments dijit._Templated
 * @augments dijit._Container
 * @augments dijit._HasDropDown
 */
var DropDownSelect = dojo_declare("idx.form.DropDownSelect",
	[dijit_Widget, dijit_Templated, dijit_Container, dijit_HasDropDown],
/**@lends idx.form.DropDownSelect#*/
{
	
	templateString: templateString,

	/**
	 * Initial label string.
	 * @type String
	 * @default ""
	 */
	label: "",

	/**
	 * Tooltip text.
	 * @type String
	 * @default ""
	 */
	title: "",
	
	dropDown: null,
	
	attributeMap: dojo_lang.delegate(dijit_Widget.prototype.attributeMap, {
		label: {node: "labelNode", type: "innerHTML"},
		title: {node: "labelNode", type: "attribute", attribute: "title"}
	}),

	/**
	 * Sets up the drop down menu.
	 */
	startup: function() {
		if (this._started) return;

		this.inherited(arguments);
		
		this.dropDown = this.dropDown || this.getChildren()[0];
		if (this.dropDown) {
			dijit_popup.moveOffScreen(this.dropDown.domNode);
			var findMenu = dojo_lang.hitch(this, function(item) {
				if (item.onItemClick) {
					this.connect(item, "onItemClick", "_onItemClick");
				}
				if (item.popup) {
					findMenu(item.popup);
				}
				if (item.getChildren) {
					var children = item.getChildren();
					dojo_array.forEach(children, function(child) {
						findMenu(child);
					}, this);
				}
			});
			findMenu(this.dropDown);
		}
	},

	/**
	 * Handles focs.
	 */
	focus: function() {
		this.focusNode.focus();
	},

	/**
	 * Callback to be called on selection change.
	 */
	onSelect: function(item) {

	},

	/**
	 * Updates label and invoke a callback on a menu item clicked.
	 * @param {Object} item
	 * @param {Object} evt
	 * @private
	 */
	_onItemClick: function(/* MenuItem */ item, evt) {
		if (item.popup) {
			// this item has children - don't do anything
			return;
		}
		
		var selectedLabel = item.get("selectedLabel");
		if (selectedLabel && selectedLabel != "") {
			this.set("label", selectedLabel);
		}
		
		this.onSelect(item);
	}
});

dojo_lang.extend(dijit_MenuItem, {
	selectedLabel: "",
	
	_getSelectedLabelAttr: function() {
		var l = this.selectedLabel != "" ? this.selectedLabel : this.label;
		return l;
	}
});

return DropDownSelect;

}; // end of factory

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
	dojo.provide("idx.form.DropDownSelect");
	dojo.require("dijit._HasDropDown");
	dojo.require("dijit._Container");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.require("dijit.MenuItem");
	dojo.require("idx.ext");
	var templateString = dojo.cache("idx", "form/templates/DropDownSelect.html");
	factory(dojo.declare, dojo, dojo, dijit.popup, dijit._HasDropDown, dijit._Container, dijit._Widget, dijit._Templated, dijit.MenuItem, idx.ext, templateString);
}else{
	define([
		"../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
		"../../../../dist/lib/dojo/_base/lang",
		"dojo/_base/array",
		"dijit/popup",
		"dijit/_HasDropDown",
		"dijit/_Container",
		"dijit/_Widget",
		"dijit/_Templated",
		"dijit/MenuItem",
		"idx/ext",
		"dojo/text!./templates/DropDownSelect.html"
	], factory);
}

})();
