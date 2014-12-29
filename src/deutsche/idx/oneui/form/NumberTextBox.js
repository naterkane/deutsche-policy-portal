/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	"../../../../../node_modules/intern-geezer/node_modules/dojo/dom-style",
	"dijit/form/NumberTextBox",
	"idx/oneui/HoverHelpTooltip",
	"../_CssStateMixin",
	"./_CompositeMixin",
	"./TextBox",
	"dojo/text!./templates/TextBox.html"
], function(declare, domStyle, NumberTextBox, HoverHelpTooltip, _CssStateMixin, _CompositeMixin, TextBox, template) {
/**
	 * @name idx.oneui.form.NumberTextBox
	 * @class One UI version.
	 * @augments dijit.form.NumberTextBox
	 */


/*=====
dojo.declare(
	"oenui.form.NumberTextBox.__Constraints",
	[oneui.form.RangeBoundTextBox.__Constraints, dojo.number.__FormatOptions, dojo.number.__ParseOptions], {
	// summary:
	//		Specifies both the rules on valid/invalid values (minimum, maximum,
	//		number of required decimal places), and also formatting options for
	//		displaying the value when the field is not focused.
	// example:
	//		Minimum/maximum:
	//		To specify a field between 0 and 120:
	//	|		{min:0,max:120}
	//		To specify a field that must be an integer:
	//	|		{fractional:false}
	//		To specify a field where 0 to 3 decimal places are allowed on input:
	//	|		{places:'0,3'}
});
=====*/

	return declare("idx.oneui.form.NumberTextBox", [NumberTextBox, _CompositeMixin, _CssStateMixin], {
		/**@lends idx.oneui.form.NumberTextBox*/
		
		// instantValidate: Boolean
		//		Fire validation when widget get input by set true, 
		//		fire validation when widget get blur by set false
		instantValidate: false,
		
		templateString: template,
		baseClass: "oneuiNumberTextBoxWrap",
		oneuiBaseClass: "dijitTextBox dijitNumberTextBox",
		
		postCreate: function(){
			this.inherited(arguments);
			
			if(this.instantValidate){
				this.connect(this, "_onInput", function(){
					this.validate(this.focused);
				});
			}else{
				this.connect(this, "_onBlur", function(){
					this.validate(this.focused);
				});
				this.connect(this, "_onFocus", function(){
					this._set("state", "");
					if(this.message == ""){return;}
					this.displayMessage(this.message);
					this.message = "";
				});
				this.connect(this, "_onInput", function(){
					this.displayMessage();
				});
			}
			this.connect(this.iconNode, "onmouseenter", function(){
				if(this.message && domStyle.get(this.iconNode, "visibility") == "visible"){
					HoverHelpTooltip.show(this.message, this.iconNode, this.tooltipPosition, !this.isLeftToRight());
				}
			});
			
		},
		
		displayMessage: function(/*String*/ message){
			// summary:
			//		Overridable method to display validation errors/hints.
			//		By default uses a tooltip.
			// tags:
			//		extension
			HoverHelpTooltip.hide(this.oneuiBaseNode);
			HoverHelpTooltip.hide(this.iconNode);
			if(message && this.focused){
				var node = domStyle.get(this.iconNode, "visibility") == "hidden" ? this.oneuiBaseNode : this.iconNode;
				HoverHelpTooltip.show(message, node, this.tooltipPosition, !this.isLeftToRight());
			}
		},
		
		_refreshState: function(){
			TextBox.prototype._refreshState.apply(this, arguments);
		}
	});		
});
