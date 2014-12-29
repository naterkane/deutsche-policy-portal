(function(){

var factory = function(dDeclare,
					   dWidget,
					   dTemplated,
					   dDomAttr,
					   iString){

/**
 * @name idx.widget.DeferredIFrame
 * @class An widget that creates an iFrame that initially points at "blank.html" page, but 
 *        updates to specified "src" parameter upon startup.  This is used to avoid having
 *        the browser (Internet Explorer) process the JavaScript in the loadded source prior
 *        to the iframe being placed at its proper position in the document.
 * @augments dijit._Widget
 * @augments dijit._Templated
 */
return dDeclare("idx.widget.DeferredIFrame", [ dWidget, dTemplated ],
/** @lends idx.widget.DeferredIFrame# */
{
	templateString: "<iframe></iframe>",

	href: "",
	
	startup: function() {
		if (iString.nullTrim(this.href)) dDomAttr.set(this.domNode, "src", this.href);
		else domAttr.remove(this.domNode, "src");
		this.inherited("startup", arguments);
		this._started = true;
	},
	
	_setHrefAttr: function(value) {
		this.href = value;
		if (this._started) {
			if (iString.nullTrim(this.href)) dDomAttr.set(this.domNode, "src", this.href);
			else domAttr.remove(this.domNode, "src");			
		}
	}
});

}; // end of factory

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
	dojo.provide("idx.widget.DeferredIFrame");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.require("idx.string");
	factory(dojo.declare, dijit._Widget, dijit._Templated,
			{set: dojo.attr, remove: dojo.removeAttr}, idx.string);
}else{
	define([
		"../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
		"../../../lib/dijit/_Widget",
		"dijit/_Templated",
		"dojo/dom-attr",
		"../string"
	], factory);
}

})();
