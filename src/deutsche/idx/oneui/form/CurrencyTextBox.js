/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	"../../../../../dist/lib/dojo/_base/lang",
	"dojo/dom-style",
	"dojo/dom-class",
	"dojo/currency",
	"dijit/form/CurrencyTextBox",
	"dijit/form/NumberTextBox",
	"../HoverHelpTooltip",
	"../_CssStateMixin",
	"./TextBox",
	"./_CompositeMixin",
	"dojo/text!./templates/CurrencyTextBox.html"
], function(declare, lang, domStyle, domClass, currency, CurrencyTextBox, NumberTextBox, HoverHelpTooltip, _CssStateMixin, TextBox, _CompositeMixin, template){
/**
	 * @name idx.oneui.form.CurrencyTextBox
	 * @class One UI version.
	 * @augments dijit.form.CurrencyTextBox
	 */
	 
	 
	return declare("idx.oneui.form.CurrencyTextBox", [CurrencyTextBox, _CompositeMixin, _CssStateMixin], {
		/**@lends idx.oneui.form.CurrencyTextBox*/
		
		// instantValidate: Boolean
		//		Fire validation when widget get input by set true, 
		//		fire validation when widget get blur by set false
		instantValidate: false,
		
		templateString: template,
		baseClass: "oneuiTextBoxWrap",
		oneuiBaseClass: "dijitTextBox dijitCurrencyTextBox",
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
		},
		_setCurrencyAttr: function(/*String*/ currency){
			this.currencyLabel.innerHTML = currency;
			domClass.toggle(this.currencyLabel, "dijitHidden", /^\s*$/.test(currency));
			this._set("currency", currency);
		},
		_setConstraintsAttr: function(/*Object*/ constraints){
			NumberTextBox.prototype._setConstraintsAttr(arguments, [currency._mixInDefaults(lang.mixin(constraints, {exponent: false}))]);
		}
	});
})
