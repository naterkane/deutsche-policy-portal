/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	"../../../../../node_modules/intern-geezer/node_modules/dojo/_base/array",
	"dojo/_base/sniff",
	"dojo/_base/lang",
	"dojo/_base/event",
	"dojo/dom-style",
	"dijit/form/Textarea",
	"../common",
	"../_CssStateMixin",
	"./_ValidationMixin",
	"./_CompositeMixin",
	"dojo/text!./templates/Textarea.html"
], function(declare, array, has, lang, event, domStyle, Textarea, common, _CssStateMixin, _ValidationMixin, _CompositeMixin, template){
/**
	 * @name idx.oneui.form.Textarea
	 * @class One UI version.
	 * @augments dijit.form.Textarea
	 */
	return declare("idx.oneui.form.Textarea", [Textarea, _CssStateMixin, _CompositeMixin, _ValidationMixin], {
		/**@lends idx.oneui.form.Textarea*/

		// instantValidate: Boolean
		//		Fire validation when widget get input by set true, 
		//		fire validation when widget get blur by set false
		instantValidate: false,
		templateString: template,
		baseClass: "idxTextareaWrap",
		oneuiBaseClass: "dijitTextBox dijitTextArea dijitExpandingTextArea",
		
		postCreate: function(){
			this.extension = {
				"input" : "_onInput",
				"blur" 	: "_onBlur",
				"focus" : "_onFocus"
			}
			this.inherited(arguments);
			array.forEach(array.filter(this._connects, function(conn){ 
				return conn && conn[0] && conn[0][1] == "onfocus"; 
			}), this.disconnect, this);
		},
		_isEmpty: function(){
			// summary:
			//		Checks for whitespace
			return (this.trim ? /^\s*$/ : /^$/).test(this.get("value")); // Boolean
		},
		_setFieldWidthAttr: function(){
			this.inherited(arguments);
			var width = parseInt(this.oneuiBaseNode.style.width);
			var widthInPx = common.normalizedLength(width);
			if(has("ie") <= 7){
				domStyle.set(this.oneuiBaseNode, "width", widthInPx - 3 + "px");
			}else{
				domStyle.set(this.oneuiBaseNode, "width", widthInPx + 2 + "px");
			}
			this.resize();
		},
		_isValidFocusNode: function(mousedownNode){
			return (this.hintPosition == "inside" && mousedownNode == this._phspan || 
				mousedownNode == this.oneuiBaseNode.parentNode) || this.inherited(arguments);
		}
	});
});
