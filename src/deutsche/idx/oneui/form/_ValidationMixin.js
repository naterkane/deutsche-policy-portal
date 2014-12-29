/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	"../../../../../node_modules/intern-geezer/node_modules/dojo/dom-style",
	"dojo/i18n", 
	"dijit/_base/wai", 
	"idx/oneui/HoverHelpTooltip", 
	"dojo/i18n!dijit/form/nls/validate"
], function(declare, domStyle, i18n, wai, HoverHelpTooltip){

	return declare("idx.oneui.form._ValidationMixin", null, {
			
		// instantValidate: Boolean
		//		Fire validation when widget get input by set true, 
		//		fire validation when widget get blur by set false
		instantValidate: false,
		
		// required: Boolean
		//		Indicate whether this widget must have a value
		required: false,
		
		// invalidMessage: String
		//		The message to be shown when the validation fails
		invalidMessage: "$_unset_$",
		
		// missingMessage: String
		//		The message to be shown whent the value is required but missing
		missingMessage: null,
		
		// tooltipPosition: Array
		//		The position of the tooltip
		tooltipPosition: [],
		
		postMixInProperties: function(){
			this.inherited(arguments);
			this._nlsResource = i18n.getLocalization("dijit.form", "validate", this.lang);
			this.missingMessage || (this.missingMessage = this._nlsResource.missingMessage);
		},
		
		postCreate: function(){
			this.inherited(arguments);
			
			if(this.instantValidate){
				this.connect(this, this.extension["input"], function(){
					this.validate(this.focused);
				});
			}else{
				this.connect(this, this.extension["blur"], function(){
					this.validate(this.focused);
				});
				this.connect(this, this.extension["focus"], function(){
					this._set("state", "");
					if(this.message == ""){return;}
					this.displayMessage(this.message);
					this.message = "";
				});
				this.connect(this, this.extension["input"], function(){
					this.displayMessage();
				});
			}
			
			
			this.connect(this.iconNode, "onmouseenter", function(){
				if(this.message && domStyle.get(this.iconNode, "visibility") == "visible"){
					HoverHelpTooltip.show(this.message, this.iconNode, this.tooltipPosition, !this.isLeftToRight());
				}
			});
		},
		
		_isValid: function(/*Boolean*/ isFocused){
			return this.isValid(isFocused) && !(this.required && this._isEmpty());
		},
		
		_isEmpty: function(){
			// summary:
			// 		Checks for whitespace. Should be overridden.
			return false;
		},
		
		isValid: function(isFocused){
			//	summary:
			//		Add validation rules. Should be overridden.
			return true;
		},
		
		getErrorMessage: function(/*Boolean*/ isFocused){
			return (this.required && this._isEmpty()) ? this.missingMessage : this.invalidMessage;
		},
		
		validate: function(/*Boolean*/ isFocused){
			//	summary: 
			//		add in-context message and corresponding style to widget.
			//	description:
			//		This function will add a new class to the widget according to the message type, 
			//		If the baseClass is "dojoxFileInput", "dojoxFileInputError" will be added when 
			//		the type is "Error". The text is in the popup tooltip when the widget got focused.
			var message, isValid = this.disabled || this._isValid(isFocused);
			
			this.set("state", isValid ? "" : "Error");
			wai.setWaiState(this.focusNode, "invalid", !isValid);
			if(this.state == "Error"){
				message = this.getErrorMessage(isFocused);
			}
			this._set("message", message);
			this.displayMessage(message);
			return isValid;
		},
		
		displayMessage: function(/*String*/ message, /*Boolean*/ force){
			// summary:
			//		Overridable method to display validation errors/hints.
			//		By default uses a tooltip.
			// tags:
			//		extension
			HoverHelpTooltip.hide(this.oneuiBaseNode);
			HoverHelpTooltip.hide(this.iconNode);
			if(message && this.focused || force){
				var node = domStyle.get(this.iconNode, "visibility") == "hidden" ? this.oneuiBaseNode : this.iconNode;
				HoverHelpTooltip.show(message, node, this.tooltipPosition, !this.isLeftToRight());
			}
		},
		
		_onBlur: function(){
			this.inherited(arguments);
			this.displayMessage("");
		}
	});
});
