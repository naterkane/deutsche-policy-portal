/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	"../../../../../dist/lib/dojo/_base/lang",
	"dojo/dom-class",
	"dojo/window",
	"dijit/form/FilteringSelect",
	"./_CompositeMixin",
	"./_ValidationMixin",
	"../_CssStateMixin",
	"dojo/text!./templates/ComboBox.html"
], function(declare, lang, domClass, winUtils, FilteringSelect, _CompositeMixin, _ValidationMixin, _CssStateMixin, template) {
	/**
	 * @name idx.oneui.form.FilteringSelect
	 * @class One UI version FilteringSelect
	 * @augments dijit.form.FilteringSelect
	 * @augments idx.oneui.form._CompositeMixin
	 * @augments idx.oneui._CssStateMixin
	 * @augments idx.oneui.form._ValidationMixin
	 */
	return declare("idx.oneui.form.FilteringSelect", [FilteringSelect, _CompositeMixin, _CssStateMixin, _ValidationMixin],
	/**@lends idx.oneui.form.FilteringSelect.prototype*/
	{
		
		instantValidate: true,
		
		baseClass: "idxFilteringSelectWrap",
		
		oneuiBaseClass: "dijitTextBox dijitComboBox",
		
		templateString: template,
		
		selectOnClick: true,
		
		missingMessage: "$_unset_$",
		
		cssStateNodes: {
			"_buttonNode": "dijitDownArrowButton"
		},
		
		postCreate: function(){
			this.extension = {
				"input" : "_onInput",
				"blur" 	: "_onBlur",
				"focus" : "_onFocus"
			}
			this.inherited(arguments);
		},
		
		isValid: function(){
			// Overrides ValidationTextBox.isValid()
			return this.item || (!this.required && this.get("displayedValue") == "");
		},
			
		_isEmpty: function(){
			return (/^\s*$/.test(this.textbox.value || ""));
		},
		
		_openResultList: function(/*Object*/ results, /*Object*/ query, /*Object*/ options){
			//	Overwrite dijit.form.FilteringSelect._openResultList to focus the selected
			//	item when open the menu.

			// #3285: tap into search callback to see if user's query resembles a match
			if(query[this.searchAttr] !== this._lastQuery){
				return;
			}

			this._fetchHandle = null;
			if(	this.disabled ||
				this.readOnly ||
				(query[this.searchAttr] !== this._lastQuery)	// TODO: better way to avoid getting unwanted notify
			){
				return;
			}
			var wasSelected = this.dropDown.getHighlightedOption();
			this.dropDown.clearResultList();
			if(!results.length && options.start == 0){ // if no results and not just the previous choices button
				this.closeDropDown();
				return;
			}
	
			// Fill in the textbox with the first item from the drop down list,
			// and highlight the characters that were auto-completed. For
			// example, if user typed "CA" and the drop down list appeared, the
			// textbox would be changed to "California" and "ifornia" would be
			// highlighted.
	
			var nodes = this.dropDown.createOptions(
				results,
				options,
				lang.hitch(this, "_getMenuLabelFromItem")
			);
	
			// show our list (only if we have content, else nothing)
			this._showResultList();
			
			// Focus the selected item
			if(!this._lastInput){
				for(var i = 0; i < nodes.length; i++){
					if(nodes[i].item){
						var value = this.store.getValue(nodes[i].item, this.searchAttr).toString();
						if(value == this.displayedValue){
							this.dropDown._setSelectedAttr(nodes[i]);
							winUtils.scrollIntoView(this.dropDown.selected);
							break;
						}
					}
				}
			}
			
			// #4091:
			//		tell the screen reader that the paging callback finished by
			//		shouting the next choice
			if(options.direction){
				if(1 == options.direction){
					this.dropDown.highlightFirstOption();
				}else if(-1 == options.direction){
					this.dropDown.highlightLastOption();
				}
				if(wasSelected){
					this._announceOption(this.dropDown.getHighlightedOption());
				}
			}else if(this.autoComplete && !this._prev_key_backspace
				// when the user clicks the arrow button to show the full list,
				// startSearch looks for "*".
				// it does not make sense to autocomplete
				// if they are just previewing the options available.
				&& !/^[*]+$/.test(query[this.searchAttr].toString())){
					this._announceOption(nodes[1]); // 1st real item
			}

			if(this.item === undefined){ // item == undefined for keyboard search
				// If the search returned no items that means that the user typed
				// in something invalid (and they can't make it valid by typing more characters),
				// so flag the FilteringSelect as being in an invalid state
				this.validate(true);
			}
		},
		
		_onInputContainerEnter: function(){
			domClass.toggle(this.oneuiBaseNode, "dijitComboBoxInputContainerHover", true);
		},
		
		_onInputContainerLeave: function(){
			domClass.toggle(this.oneuiBaseNode, "dijitComboBoxInputContainerHover", false);
		},
		
		_onBlur: function(){
			this.inherited(arguments);
			this.displayMessage("");
		}
	});

});
