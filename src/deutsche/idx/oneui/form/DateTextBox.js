/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	"../../../../../node_modules/intern-geezer/node_modules/dojo/dom-style",
	"dijit/Calendar",
	"../HoverHelpTooltip",
	"../_CssStateMixin",
	"./_DateTimeTextBox",
	"./_CompositeMixin",
	"dojo/text!./templates/DropDownBox.html"
], function(declare, domStyle, Calendar, HoverHelpTooltip, _CssStateMixin, _DateTimeTextBox, _CompositeMixin, template){

	// module:
	//		dijit/form/DateTextBox
	// summary:
	//		A validating, serializable, range-bound date text box with a drop down calendar

	/**
	* @name idx.oneui.form.DateTextBox
	* @class A validating, serializable, range-bound date text box with a drop down calendar
	* @augments idx.oneui.form._DateTimeTextBox
	* @augments idx.oneui.form._CompositeMixin
	* @augments idx.oneui._CssStateMixin
	*/ 
	return declare("idx.oneui.form.DateTextBox", [_DateTimeTextBox, _CompositeMixin, _CssStateMixin], {
	/**@lends idx.oneui.form.DateTextBox*/ 
		// summary:
		//		A validating, serializable, range-bound date text box with a drop down calendar
		//
		//		Example:
		// |	new dijit.form.DateTextBox({value: new Date(2009, 0, 20)})
		//
		//		Example:
		// |	<input dojotype='dijit.form.DateTextBox' value='2009-01-20'>

		// instantValidate: Boolean
		//		Fire validation when widget get input by set true, 
		//		fire validation when widget get blur by set false
		instantValidate: false,
		baseClass: "idxDateTextBoxWrap",
		oneuiBaseClass: "dijitTextBox dijitComboBox dijitDateTextBox",
		popupClass: "dijit.Calendar",
		_selector: "date",
		templateString: template,
		
		// value: Date
		//		The value of this widget as a JavaScript Date object, with only year/month/day specified.
		//		If specified in markup, use the format specified in `dojo.date.stamp.fromISOString`.
		//		set("value", ...) accepts either a Date object or a string.
		value: new Date(""),// value.toString()="NaN"
		/** @ignore */
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
		/**
		* Overridable method to display validation errors/hints
		*/
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
		}
	});
});
