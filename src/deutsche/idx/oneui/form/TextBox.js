/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	"../../../../../node_modules/intern-geezer/node_modules/dojo/dom-style",
	"dijit/form/TextBox",
	"dijit/form/ValidationTextBox",
	"../HoverHelpTooltip",
	"../_CssStateMixin",
	"./_CompositeMixin",
	"dojo/text!./templates/TextBox.html"
], function(declare, domStyle, TextBox, ValidationTextBox, HoverHelpTooltip, _CssStateMixin, _CompositeMixin, template){
/**
	 * @name idx.oneui.form.TextBox
	 * @class One UI version.
	 * @augments dijit.form.TextBox
	 */
	 
	return declare("idx.oneui.form.TextBox", [ValidationTextBox, _CssStateMixin, _CompositeMixin], {
		/**@lends idx.oneui.form.TextBox*/
		
		// summary:
		//		Base class for textbox widgets with the ability to validate content of various types and provide user feedback.
		// tags:
		//		protected

		// instantValidate: Boolean
		//		Fire validation when widget get input by set true, 
		//		fire validation when widget get blur by set false
		instantValidate: false,
		templateString: template,
		baseClass: "idxTextBoxWrap",
		oneuiBaseClass: "dijitTextBox dijitValidationTextBox",
		
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
			//		By default uses a oneui.HoverHelpTooltip.
			// tags:
			//		extension
			HoverHelpTooltip.hide(this.oneuiBaseNode);
			HoverHelpTooltip.hide(this.iconNode);
			if(message && this.focused){
				var node = domStyle.get(this.iconNode, "visibility") == "hidden" ? this.oneuiBaseNode : this.iconNode;
				HoverHelpTooltip.show(message, node, this.tooltipPosition, !this.isLeftToRight());
			}
		},
		
		_setValueAttr: function(){
			TextBox.prototype._setValueAttr.apply(this, arguments);
		},
		_refreshState: function(){
			TextBox.prototype._refreshState.apply(this, arguments);
		}
	});
});
