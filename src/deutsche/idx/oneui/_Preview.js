define([
	"../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	"../../../lib/dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dojo/text!./templates/_Preview.html"
], function(declare, _Widget, _TemplatedMixin, templateString){
return declare("idx.oneui._Preview", [_Widget, _TemplatedMixin], {
	templateString: templateString,
	
	image: "",
	/**
	 * The title of the Preview
	 * @type string
	 */
	title: "",
	content: "",
	_setContentAttr: [{node: "containerNode", type: "innerHTML"}]
});

})
