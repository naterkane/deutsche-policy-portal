(function(){

var factory = function(dojo_declare, dojo_lang, dojo_html, dojo_i18n, dojo_parser, dijit_Templated, dijit_Dialog, dijit_form_Button, templateString, dijit_nls_common){

/**
 * @name idx.widget.SimpleIconDialog
 * @class Dialog with icon and text message.
 * @augments dijit.Dialog
 */
return dojo_declare("idx.widget.SimpleIconDialog", [dijit_Dialog],
/**@lends idx.widget.SimpleIconDialog#*/
{

	contentString: templateString,
	widgetsInTemplate: true,

	/**
	 * Text message.
	 * @type String
	 * @default ""
	 */
	text: "",

	/**
	 * CSS class for icon.
	 * @type String
	 * @default ""
	 */
	iconClass: "",

	/**
	 * Specifies whether to show an action bar with buttons.
	 * @type Boolean
	 * @default true
	 */
	showActionBar: true,

	/**
	 * Specifies whether to show an icon.
	 * @type Boolean
	 * @default true
	 */
	showIcon: true,

	/**
	 * Specifies whether to show a cancel button.
	 * @type Boolean
	 * @default false
	 */
	showCancel: false,

	/**
	 * Initializes globalization resource.
	 */
	postMixInProperties: function(){
		this.inherited(arguments);
		if(!dijit_nls_common){
			dijit_nls_common = dojo.i18n.getLocalization("dijit", "common");
		}
		this.res = dijit_nls_common;
	},
	
	attributeMap: dojo_lang.delegate(dijit_Dialog.prototype.attributeMap, {
		iconClass: {node: "iconNode", type: "class"},
		text: {node: "textNode", type: "innerHTML"}
	}),

	/**
	 * Sets properties.
	 */
	buildRendering: function(){
		this.inherited(arguments);

		dojo_html.addClass(this.domNode, "idxSimpleIconDialog");

		//appending contentString to Dialog's containerNode
		var node = dojo_html.create("div");
		node.innerHTML = this._stringRepl(this.contentString);
		dojo_html.place(node, this.containerNode);
		this._attachTemplateNodes(node, function(n,p) { return n.getAttribute(p);});
		// attach for child widgets (buttons)
		this._attachTemplateNodes(dojo_parser.parse(node), function(n,p){return n[p];});
		this.set("text", this.text);
		this.set("iconClass", this.iconClass);
		this.showActionBarNode(this.showActionBar);
		this.showIconNode(this.showIcon);
		this.showCancelNode(this.showCancel);
	},

	/**
	 * Shows an action bar.
	 * @param {Boolean} yes
	 */
	showActionBarNode: function(yes){
		dojo_html.style(this.actionBar, "display", yes? "": "none");
	},

	/**
	 * Shows an icon.
	 * @param {Boolean} yes
	 */
	showIconNode: function(yes){
		dojo_html.style(this.iconNode, "display", yes? "": "none");
	},

	/**
	 * Shows a celcel button
	 * @param {Boolean} yes
	 */
	showCancelNode: function(yes){
		dojo_html.style(this.cancelButton.domNode, "display", yes? "": "none");
	},

	/**
	 * Sets a label string for OK button.
	 * @param {String} s
	 * @private
	 */
	_setLabelOkAttr: function(s){
		this.okButton.set("label", s || this.res.buttonOk);
	},

	/**
	 * Sets a label string for the cancel button.
	 * @param {String} s
	 * @private
	 */
	_setLabelCancelAttr: function(s){
		this.cancelButton.set("label", s || this.res.buttonCancel);
	}
	
});

}; // end of factory

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
	dojo.provide("idx.widget.SimpleIconDialog");
	dojo.require("dojo.i18n");
	dojo.require("dojo.parser");
	dojo.require("dijit._Templated");
	dojo.require("dijit.Dialog");
	dojo.require("dijit.form.Button");
	var templateString = dojo.cache("idx.widget", "templates/SimpleIconDialog.html");
	dojo.requireLocalization("dijit", "common");
	factory(dojo.declare, dojo, dojo, dojo.i18n, dojo.parser, dijit._Templated, dijit.Dialog, dijit.form.Button, templateString);
}else{
	define([
		"../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
		"../../../../dist/lib/dojo/_base/lang",
		"dojo/_base/html",
		"dojo/i18n",
		"dojo/parser",
		"dijit/_Templated",
		"dijit/Dialog",
		"dijit/form/Button",
		"dojo/text!./templates/SimpleIconDialog.html",
		"dojo/i18n!dijit/nls/common"
	], factory);
}

})();
