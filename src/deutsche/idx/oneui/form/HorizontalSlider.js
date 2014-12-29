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
	"dijit/form/HorizontalSlider",
	"../_CssStateMixin",
	"./_ValidationMixin",
	"./_CompositeMixin",
	"dojo/text!./templates/HorizontalSlider.html"
], function(declare, domStyle, wai, HorizontalSlider, _CssStateMixin, _ValidationMixin, _CompositeMixin, template){

	/**
	* @name idx.oneui.form.HorizontalSlider
	* @class A form widget that allows one to select a value with a horizontally draggable handle
	* @augments dijit.form.HorizontalSlider
	* @augments idx.oneui.form._ValidationMixin
	* @augments idx.oneui.form._CompositeMixin
	* @augments idx.oneui._CssStateMixin
	*/ 
	return declare("idx.oneui.form.HorizontalSlider", [HorizontalSlider, _ValidationMixin, _CompositeMixin, _CssStateMixin], {
	/**@lends idx.oneui.form.HorizontalSlider*/ 
		// summary:
		//		A form widget that allows one to select a value with a horizontally draggable handle
	
		templateString: template,
		
		// instantValidate: Boolean
		//		Fire validation when widget get input by set true, 
		//		fire validation when widget get blur by set false
		instantValidate: true,
		oneuiBaseClass: "dijitSlider",
		baseClass:"idxSliderWrapH",
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
			var width = domStyle.get(this.domNode, "width");
			domStyle.set(this.oneuiBaseNode, "width", width + "px");
			domStyle.set(this.domNode, "width", "");
		},
		_setLabelAttr: function(/*String*/ label){
			this.inherited(arguments);
			wai.setWaiState(this.focusNode, "labelledby", this.id + "_label");
		}
	});
});
