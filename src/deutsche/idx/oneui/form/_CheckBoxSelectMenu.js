/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	"../../../../lib/dojo/dom-class",
	"dojo/dom-construct",
	"dojo/dom-geometry",
	"dojo/dom-attr",
	"idx/oneui/Menu"
],function(declare, domClass, domConstruct, domGemometry, domAttr, Menu){
	
	//	module:
	//		idx/oneui/form/_CheckBoxSelectMenu
	//	summary:
	//		An internally-used menu for CheckBoxSelect
	
	return declare("idx.oneui.form._CheckBoxSelectMenu", Menu, {
		// summary:
		//		An internally-used menu for CheckBoxSelect

		buildRendering: function(){
			// summary:
			//		Stub in our own changes, so that our domNode is not a table
			//		otherwise, we won't respond correctly to heights/overflows
			this.inherited(arguments);
			var o = (this.menuTableNode = this.domNode),
			n = (this.domNode = domConstruct.create("div", {style: {overflowX: "hidden", overflowY: "scroll"}}));
			if(o.parentNode){
				o.parentNode.replaceChild(n, o);
			}
			domClass.remove(o, "dijitMenuTable");
			n.className = o.className + " idxCheckBoxSelectMenu";
			o.className = "dijitReset dijitMenuTable";
			domAttr.set(o, "role", "listbox");
			domAttr.set(n, "role", "presentation");
			n.appendChild(o);
		},
		
		resize: function(/*Object*/ mb){
			// summary:
			//		Overridden so that we are able to handle resizing our
			//		internal widget.  Note that this is not a "full" resize
			//		implementation - it only works correctly if you pass it a
			//		marginBox.
			//
			// mb: Object
			//		The margin box to set this dropdown to.
			if(mb){
				domGemometry.setMarginBox(this.domNode, mb);
				if("w" in mb){
					// We've explicitly set the wrapper <div>'s width, so set <table> width to match.
					// 100% is safer than a pixel value because there may be a scroll bar with
					// browser/OS specific width.
					this.menuTableNode.style.width = "100%";
				}
			}
		},
		
		onClose: function(){
			this.inherited(arguments);
			if(this.menuTableNode){
				// Erase possible width: 100% setting from _SelectMenu.resize().
				// Leaving it would interfere with the next openDropDown() call, which
				// queries the natural size of the drop down.
				this.menuTableNode.style.width = "";
			}
		},
		
		onItemClick: function(/*dijit._Widget*/ item, /*Event*/ evt){
			// summary:
			//		Handle clicks on an item.
			// tags:
			//		private
			// this can't be done in _onFocus since the _onFocus events occurs asynchronously
			if(typeof this.isShowingNow == 'undefined'){ // non-popup menu
				this._markActive();
			}
			
			this.focusChild(item);
			
			if(item.disabled || item.readOnly){ return false; }
			
			// user defined handler for click
			item.onClick(evt);
		}
	});
});

