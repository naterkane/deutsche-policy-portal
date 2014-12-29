/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

(function(){

var factory = function(dojo_declare, dijit_wai, dojo_array, idx_layout_ListNavController){

/**
 * @name idx.layout.PartialListNavController
 * @class Similar to {@link idx.layout.ListNavController}, however, it can contain only a subset
 *			of buttons.	The intent is to allow multiple PartialListNavControllers
 *			to be associated with a single dijit.layout.StackContainer.
 *			Just like dijit.layout.StackController, a PartialListNavController monitors the
 *			specified StackContainer,	and whenever a page is added, deleted, or selected,
 *			it updates itself accordingly.
 *
 * @augments idx.layout.ListNavController
 * 
 */
var PartialListNavController = dojo_declare("idx.layout.PartialListNavController", idx_layout_ListNavController,
/** @lends idx.layout.PartialListNavController# */
{
			/**
			 * The index of the first item in the StackContainer that should
			 *  have a corresponding button in this PartialListNavController
			 *  
			 *  @default 0
			 */
			startIndex: 0,
			
			/**
			 * The index of the last item in the StackContainer that should
			 *  have a corresponding button in this PartialListNavController
			 *  
			 *  @default 0
			 */
			endIndex: 0,

			/**
			 * Called whenever a page is added to the container.
			 *	Create button corresponding to the page.
			 *
			 * @private
			 */
			onAddChild: function(/*dijit._Widget*/ page, /*Integer?*/ insertIndex)
			{
				if( insertIndex >= this.startIndex && insertIndex <= this.endIndex )
				{
					this.inherited("onAddChild", arguments);
				}
				
			},

			/**
			 * Called when a page has been selected in the StackContainer,
			 *  either by me or by another StackController
			 *
			 * @private
			 */
			onSelectChild: function(/*dijit._Widget*/ page)
			{
				if(!page){ return; }

				var container = dijit.byId(this.containerId);
				var children = container.getChildren();
				var index = dojo.indexOf(children, page);
				if( index >= this.startIndex && index <= this.endIndex )
				{
					this.inherited(arguments);//.(page);
				}
				else if(this._currentChild)
				{
					var oldButton=this.pane2button[this._currentChild.id];
					oldButton.set('checked', false);
					dijit_wai.setWaiState(oldButton.focusNode, "selected", "false");
					oldButton.focusNode.setAttribute("tabIndex", "-1");
					
					this._currentChild = null;
					this.ensureKeyboardNav();
				}

			}

});

return PartialListNavController;

}; // end of factory

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
   dojo.provide("idx.layout.PartialListNavController");
   dojo.require("idx.layout.ListNavController");
	factory(dojo.declare, dijit, dojo, idx.layout.ListNavController);
}else{
	define([
		"../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",          // dojo_declare
		"../../../lib/dijit/_base/wai",             // dojo_wai
        "dojo/_base/array",            // dojo_array
		"idx/layout/ListNavController" // idx_layout_ListNavController
	], factory);
}

})();
