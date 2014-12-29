/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	"../../../../../node_modules/intern-geezer/node_modules/dojo/dom-style",
	"dijit/_base/wai",
	"dijit/form/VerticalSlider",
	"../_CssStateMixin",
	"./_ValidationMixin",
	"./_CompositeMixin",
	"dojo/text!./templates/VerticalSlider.html"
], function(declare, domStyle, wai, VerticalSlider, _CssStateMixin, _ValidationMixin, _CompositeMixin, template){

	/**
	* @name idx.oneui.form.VerticalSlider
	* @class A form widget that allows one to select a value with a vertically draggable handle
	* @augments dijit.form.VerticalSlider
	* @augments idx.oneui.form._ValidationMixin
	* @augments idx.oneui.form._CompositeMixin
	* @augments idx.oneui._CssStateMixin
	*/ 
	return declare("idx.oneui.form.VerticalSlider", [VerticalSlider, _ValidationMixin, _CompositeMixin, _CssStateMixin], {
	/**@lends idx.oneui.form.VerticalSlider*/ 
		// summary:
		//		A form widget that allows one to select a value with a vertically draggable handle
	
		templateString: template,
		// instantValidate: Boolean
		//		Fire validation when widget get input by set true, 
		//		fire validation when widget get blur by set false
		instantValidate: true,
		oneuiBaseClass: "dijitSlider",
		baseClass:"idxSliderWrapV",
		cssStateNodes: {
			incrementButton: "dijitSliderIncrementButton",
			decrementButton: "dijitSliderDecrementButton",
			focusNode: "dijitSliderThumb"
		},
		/** @ignore */
		postCreate: function(){
			this.extension = {
				"input" : "_setValueAttr",
				"blur" 	: "_onBlur",
				"focus" : "_onFocus"
			}
			this.inherited(arguments);
		},
		/** @ignore */
		startup: function(){
			this.inherited(arguments);
			var height = domStyle.get(this.domNode, "height");
			domStyle.set(this.oneuiBaseNode, "height", height + "px");
			domStyle.set(this.domNode, "height", "");
		},
		_setLabelAttr: function(/*String*/ label){
			this.inherited(arguments);
			wai.setWaiState(this.focusNode, "labelledby", this.id + "_label");
		},
		_setFieldWidthAttr: null
	});
});
