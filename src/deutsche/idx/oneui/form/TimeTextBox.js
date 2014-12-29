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
	"dojo/keys",
	"dijit/_TimePicker",
	"../HoverHelpTooltip",
	"../_CssStateMixin",
	"./_DateTimeTextBox",
	"./_CompositeMixin",
	"dojo/text!./templates/DropDownBox.html"
], function(declare, lang, domStyle, keys, _TimePicker, HoverHelpTooltip, _CssStateMixin, _DateTimeTextBox, _CompositeMixin, template){

	/**
	* @name idx.oneui.form.TimeTextBox
	* @class A validating, serializable, range-bound time text box with a drop down time picker
	* @augments idx.oneui.form._DateTimeTextBox
	* @augments idx.oneui.form._CompositeMixin
	* @augments idx.oneui._CssStateMixin
	*/ 
	return declare("idx.oneui.form.TimeTextBox", [_DateTimeTextBox, _CompositeMixin, _CssStateMixin], {
	/**@lends idx.oneui.form.TimeTextBox*/ 
		// summary:
		//		A validating, serializable, range-bound time text box with a drop down time picker
		
		// instantValidate: Boolean
		//		Fire validation when widget get input by set true, 
		//		fire validation when widget get blur by set false
		instantValidate: false,
		baseClass: "idxTimeTextBoxWrap",
		oneuiBaseClass: "dijitTextBox dijitComboBox dijitTimeTextBox",
		popupClass: "dijit._TimePicker",
		_selector: "time",
		templateString: template,

		// value: Date
		//		The value of this widget as a JavaScript Date object.  Note that the date portion implies time zone and daylight savings rules.
		//
		//		Example:
		// |	new idx.oneui.form.TimeTextBox({value: dojo.date.stamp.fromISOString("T12:59:59", new Date())})
		//
		//		When passed to the parser in markup, must be specified according to locale-independent
		//		`dojo.date.stamp.fromISOString` format.
		//
		//		Example:
		// |	<input dojotype='idx.oneui.form.TimeTextBox' value='T12:34:00'>
		value: new Date(""),		// value.toString()="NaN"
		//FIXME: in markup, you have no control over daylight savings
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
		_onKey: function(evt){
			this.inherited(arguments);

			// If the user has backspaced or typed some numbers, then filter the result list
			// by what they typed.  Maybe there's a better way to detect this, like _handleOnChange()?
			switch(evt.keyCode){
				case keys.ENTER:
				case keys.TAB:
				case keys.ESCAPE:
				case keys.DOWN_ARROW:
				case keys.UP_ARROW:
					// these keys have special meaning
					break;
				default:
					// setTimeout() because the keystroke hasn't yet appeared in the <input>,
					// so the get('displayedValue') call below won't give the result we want.
					setTimeout(lang.hitch(this, function(){
						// set this.filterString to the filter to apply to the drop down list;
						// it will be used in openDropDown()
						var val = this.get('displayedValue');
						this.filterString = (val && !this.parse(val, this.constraints)) ? val.toLowerCase() : "";

						// close the drop down and reopen it, in order to filter the items shown in the list
						// and also since the drop down may need to be repositioned if the number of list items has changed
						// and it's being displayed above the <input>
						if(this._opened){
							this.closeDropDown();
						}
						this.openDropDown();
					}), 0);
			}
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