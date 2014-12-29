/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	"../../../../lib/dojo/_base/event", // event.stop
	"dojo/dom-style",
	"dojo/dom-class",
	"dojo/keys",
	"dijit/_base/wai",
	"../HoverHelpTooltip",
	"dijit/form/_Spinner",
	"dijit/form/NumberTextBox",
	"../_CssStateMixin",
	"./_CompositeMixin",
	"./TextBox",
	"dojo/text!./templates/Spinner.html"
], function(declare, event, domStyle, domClass, keys, wai, HoverHelpTooltip, _Spinner, NumberTextBox, _CssStateMixin, _CompositeMixin, TextBox, template){
/**
	 * @name idx.oneui.form.NumberSpinner
	 * @class One UI version.
	 * @augments dijit.form.NumberSpinner
	 */
	 
	// module:
	//		dijit/form/NumberSpinner
	// summary:
	//		Extends NumberTextBox to add up/down arrows and pageup/pagedown for incremental change to the value

	return declare("idx.oneui.form.NumberSpinner", [_Spinner, NumberTextBox.Mixin, _CompositeMixin, _CssStateMixin], {
		/**@lends idx.oneui.form.NumberSpinner*/
		
		// summary:
		//		Extends NumberTextBox to add up/down arrows and pageup/pagedown for incremental change to the value
		//
		// description:
		//		A `dijit.form.NumberTextBox` extension to provide keyboard accessible value selection
		//		as well as icons for spinning direction. When using the keyboard, the typematic rules
		//		apply, meaning holding the key will gradually increase or decrease the value and
		// 		accelerate.
		//
		// example:
		//	| new idx.oneui.form.NumberSpinner({ constraints:{ max:300, min:100 }}, "someInput");
		
		// instantValidate: Boolean
		//		Fire validation when widget get input by set true, 
		//		fire validation when widget get blur by set false
		instantValidate: false,
		templateString: template,
		baseClass: "oneuiNumberSpinnerWrap",
		oneuiBaseClass: "dijitTextBox dijitSpinner",
		cssStateNodes: {
			"inputNode": "dijitInputContainer",
			"upArrowNode": "dijitUpArrowButton",
			"downArrowNode": "dijitDownArrowButton"
		},
	
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
			
			wai.setWaiState(this.upArrowNode, "describedby", this.id + "_unit");
			wai.setWaiState(this.downArrowNode, "describedby", this.id + "_unit");
		},
		adjust: function(/*Object*/ val, /*Number*/ delta){
			// summary:
			//		Change Number val by the given amount
			// tags:
			//		protected
	
			var tc = this.constraints,
				v = isNaN(val),
				gotMax = !isNaN(tc.max),
				gotMin = !isNaN(tc.min)
			;
			if(v && delta != 0){ // blank or invalid value and they want to spin, so create defaults
				val = (delta > 0) ?
					gotMin ? tc.min : gotMax ? tc.max : 0 :
					gotMax ? this.constraints.max : gotMin ? tc.min : 0
				;
			}
			var newval = val + delta;
			if(v || isNaN(newval)){ return val; }
			if(gotMax && (newval > tc.max)){
				newval = tc.max;
			}
			if(gotMin && (newval < tc.min)){
				newval = tc.min;
			}
			return newval;
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
		_onKeyPress: function(e){
			if((e.charOrCode == keys.HOME || e.charOrCode == keys.END) && !(e.ctrlKey || e.altKey || e.metaKey)
			&& typeof this.get('value') != 'undefined' /* gibberish, so HOME and END are default editing keys*/){
				var value = this.constraints[(e.charOrCode == keys.HOME ? "min" : "max")];
				if(typeof value == "number"){
					this._setValueAttr(value, false);
				}
				// eat home or end key whether we change the value or not
				event.stop(e);
			}
		},
		_onInputContainerEnter: function(){
			domClass.toggle(this.oneuiBaseNode, "dijitSpinnerInputContainerHover", true);
		},
		
		_onInputContainerLeave: function(){
			domClass.toggle(this.oneuiBaseNode, "dijitSpinnerInputContainerHover", false);
		}
	});
});
