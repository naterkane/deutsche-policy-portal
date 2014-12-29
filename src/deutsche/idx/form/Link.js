
(function() {

function factory(dDeclare,			// (dojo/_base/declare)
				 dWidget,			// (dijit/_Widget)
				 dTemplated,		// (dijit/_Templated)
				 dCssStateMixin,	// (dijit/_CssStateMixin)
				 dLang,				// (dojo/_base/lang)
				 dDomAttr,			// (dojo/dom-attr) for (dDomAttr.set)
				 dDomClass,			// (dojo/dom-class) for (dDomClass.add)
				 dKeys,				// (dojo/keys)
				 dEvent,			// (dojo/_base/event) for (dEvent.stop)
				 templateText) 		// (dojo/text!./templates/Link.html)
{
	/**
	 * @name idx.form.Link
	 * @class Simple link.
	 * @augments dijit._Widget
	 * @augments dijit._Templated
	 */
return dDeclare("idx.form.Link", [dWidget,dTemplated,dCssStateMixin],
		/**@lends idx.form.Link#*/
{
	templateString: templateText,

	/**
	 * ,
	 */
	alt: "",
	
	/**
	 * 
	 */
	baseClass: "idxLink",
	
	/**
	 * 
	 */
	idxBaseClass: "idxLinkDerived",
	
	/**
	 * 
	 */
	disabled: false,
	
	/**
	 * Label string.
	 * @type String
	 * @default ""
	 */
	label: "",

	/**
	 * URL for the link.
	 * @type String
	 * @default ""
	 */
	href: "",

	/**
	 * Target for the link.
	 * @type String
	 * @default ""
	 */
	target: "",

	/**
	 * Indicate the selected state.
	 * @type Boolean
	 * @default false
	 */
	selected: false,

	/**
	 * 
	 */
	tabIndex: 0,
	
	/**
	 * Stop the click event propagation.
	 * In cases where a click listener is added to a parent and not to the Link
	 * directly you need the event to bubble. For instance, a Link rendered for each
	 * row in a grid, you may want to avoid listeners on each and every link and just
	 * have a single listener on the grid.
	 * @type Boolean
	 * @default false, for backwards compatibility
	 */
	bubbleClickEvent: false,
	
	/**
	 * 
	 */
	attributeMap: dLang.delegate(dWidget.prototype.attributeMap, {
		label: {node: "linkNode", type: "innerHTML"},
		title: {node: "linkNode", type: "attribute", attribute: "title"}
	}),

	/**
	 * Sets up attributes for the link.
	 */
	postCreate: function(){
		this.inherited(arguments);

		if(this.href && this.href != "javascript:;"){
			dDomAttr.set(this.linkNode, "href", this.href);
		}else if(!this.selected){
			dDomAttr.set(this.linkNode, "href", "javascript:;");
			this.connect(this.linkNode, "onkeypress", this._onKeyPress);
			this.connect(this.linkNode, "onclick", this._onClick);
		}
		if(this.selected){
			dDomClass.add(this.linkNode, "idxLinkSelected");
		}
		if(this.target){
			dDomAttr.set(this.linkNode, "target", this.target);
		}
	},

	/**
	 * Handles focus.
	 */
	focus: function() {
		this.focusNode.focus();
	},

	/**
	 * Updates tabIndex.
	 * @private
	 */
	_setStateClass: function(){
		this.inherited(arguments);

		dDomAttr.set(this.focusNode, "tabIndex", (this.disabled ? -1 : this.tabIndex));
	},

	/**
	 * Handles key press event.
	 * @private 
	 * @param {Object} event
	 */
	_onKeyPress: function(/*Event*/ e) {
		if (this.disabled || e.altKey || e.ctrlKey) {
			return;
		}
		switch (e.charOrCode) {
		case dKeys.ENTER:
		case dKeys.SPACE:
		case " ":
			this.onClick(e);
			if (e && !this.bubbleClickEvent) {
				dEvent.stop(e);
			}
			break;
		default:
				// do nothing
		} 
	},
	
	/**
	 * Handles click event.
	 * @private 
	 * @param {Object} event
	 */
	_onClick: function(/*Event*/ event) {
		if (event && !this.bubbleClickEvent) dEvent.stop(event);
		if (this.disabled) return;
		this.onClick(event);
	},
	
	/**
	 * Callback to be called when the link is clicked.
	 * @param {Object} event
	 */
	onClick: function(/*Event*/event){
		if (!this.bubbleClickEvent) {
			dEvent.stop(event);			
		}
	}
});
}

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){

	dojo.provide("idx.form.Link");

	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.require("dijit._CssStateMixin");

	var templateTxt = dojo.cache("idx.form", "templates/Link.html");

	factory(dojo.declare,			// dDeclare			(dojo/_base/declare) 
			dijit._Widget, 			// dWidget			(dijit/_Widget)
			dijit._Templated, 		// dTemplated		(dijit/_Templated)
			dijit._CssStateMixin,	// dCssStateMixin	(dijit/_CssStateMixin)
			dojo,					// dLang			(dojo/_base/lang)
			{set: dojo.attr},		// dDomAttr			(dojo/dom-attr) for (dDomAttr.set)
			{add: dojo.addClass},	// dDomClass		(dojo/dom-class) for (dDomClass.add)
			dojo.keys,				// dKeys			(dojo/keys)
			{stop: dojo.stopEvent},	// dEvent 			(dojo/_base/event) for (dEvent.stop)
			templateTxt);			// templateText		(dojo/text!./templates/Link.html)

} else {
	define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	        "../../../lib/dijit/_Widget",
	        "dijit/_Templated",
	        "dijit/_CssStateMixin",
	        "dojo/_base/lang",
	        "dojo/dom-attr",
	        "dojo/dom-class",
	        "dojo/keys",
	        "dojo/_base/event",
	        "dojo/text!./templates/Link.html"],
	        factory);
}

})();

