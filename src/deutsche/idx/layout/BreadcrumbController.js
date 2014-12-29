/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

(function(){
var factory = function(dojo_declare, 
					   dojo_class, 
					   dojo_geo, 
					   dojo_lang, 
					   dijit_registry, 
					   dojo_array, 
					   dojo_construct, 
					   dijit_layout_StackController, 
					   dijit_layout__StackButton) {

	var version = (window["dojo"] && dojo.version);
	
	var Breadcrumb = dojo_declare("idx.layout._Breadcrumb",dijit_layout__StackButton, {
		
		// summary:
		//		A breadcrumb button (the thing you click to select a pane).
		// description:
		//		Contains the title of the associated pane
		//		This is an internal widget and should not be instantiated directly.
		// tags:
		//		private

		baseClass: "idxBreadcrumb",


		//prevent user click from being able to toggle _Breadcrumb into an off state
		_clicked: function(/*Event*/ evt)
		{
			if(!this.checked)
				this.inherited("_clicked", arguments);
		}

   });
	
	var buttonWidgetValue = (version && version.major == 1 && version.minor == 6) 
					   ? "idx.layout._Breadcrumb" : Breadcrumb;

/**
 * @name idx.layout.BreadcrumbController
 * @class Bread crumb controller
 * @augments dijit.layout.StackControler
 */
var BreadcrumbController = dojo_declare("idx.layout.BreadcrumbController", dijit_layout_StackController, 
/** @lends idx.layout.BreadcrumbController# */
{
			
                buttonWidget: buttonWidgetValue,
 
                idxBaseClass: "idxBreadcrumbController",
 
                
                /**
                 * @name idx.layout.BreadcrumbController
                 * @class A stack controller that behaves like a breadcrumb trail.  When children
                 * 			are added to the associated StackContainer, it adds another breadcrumb.
                 * 			When a breadcrumb is clicked, it removes all breadcrumbs to the right
                 * 			of it, along with their associated screens.
                 * @constructor
                 * @augments dijit.layout.StackController
                 * 
                 */
                constructor: function(args, node) {

                },


                /**
                 * String used to separate the breadcrumb links
                 * 
                 * @type String
                 * @default >
                 */
                breadcrumbSeparator: "&gt;",
                
                buildRendering: function() {
                   this.inherited(arguments);
                   dojo_class.add(this.domNode, this.idxBaseClass);
                },

                /**
                 * Override - Called after StackContainer has finished initializing
                 * 
                 * @private
                 */
                onStartup: function(/*Object*/ info)
                {
                	dojo_array.forEach(info.children, this.onAddChild, this);
                },
                
                resize: function(changeSize, resultSize) {
                   this.inherited(arguments);
                   if (changeSize) dojo_geo.getMarginBox(this.domNode, changeSize);
                },
                
                /**
                 * Override
                 * 
                 * @private
                 */
                onAddChild: function(/*dijit._Widget*/ page, /*Integer?*/ insertIndex) {

                	var firstChild = !this._currentChild || insertIndex == 0;
                	
                	var separatorIndex = insertIndex;
            		if(insertIndex)
            		{
            			if( typeof insertIndex == "number" )
            				separatorIndex = insertIndex*2 - 1;
            		}
            		else
            		{
            			separatorIndex = this.containerNode.children.length;
            		}
                	
            		//add breadcrumb
                	this.inherited(arguments,[page,separatorIndex]);
                	
                	//add breadcrumb separator
                	if( !firstChild )
                	{
                		var refNode = this.containerNode;

                		dojo_construct.place("<span class='idxBreadcrumbSeparator'>"+this.breadcrumbSeparator+"</span>",refNode,separatorIndex);
                	}
                	
                	//if adding a breadcrumb to the end, automatically select it
                	var container = dijit_registry.byId(this.containerId);
    				   var children = container.getChildren();
                	if( this.containerNode.children.length >= (children.length*2-1) &&
                			separatorIndex >= this.containerNode.children.length-2 )
                	{
                		var newBreadcrumb=this.pane2button[page.id];
                		newBreadcrumb.set('checked', true);
                		
                		try
                		{
                    		dijit_registry.byId(this.containerId).selectChild(page);
                    	}
                    	catch(e)
                    	{
                    		
                    	}
                	}

    			},
    			
    			/**
                 * Override
                 * 
                 * @private
                 */
                onRemoveChild: function(/*dijit._Widget*/ page) {

                	//remove breadcrumb separator node
                	var refNode = this.containerNode;
                	
                	var container = dijit_registry.byId(this.containerId);
                	var breadcrumb = this.pane2button[page.id];
                	
                	if( breadcrumb && breadcrumb.domNode)
                	{
                		var node = breadcrumb.domNode.previousSibling;
                		
        				if(node && node.parentNode)
        				{
        					node.parentNode.removeChild(node);
        				}
            			
                	}	
                	
                	//remove breadcrumb button
                	this.inherited(arguments);
    			},

    			/**
                 * Override
                 * 
                 * @private
                 */
    			onSelectChild: function(/*dijit._Widget*/ page){
    				

    				if(!page || !this.selectionConfirmed(page)){ return; }
    				
    				//remove all breadcrumbs to the right of selection
    				var container = dijit_registry.byId(this.containerId);
    				var pageIndex = container.getIndexOfChild(page);
    				var children = container.getChildren();
    				for( var i = pageIndex+1; i < children.length; i++)
    				{
    					var child = children[i];
    					container.removeChild(child);
    					child.destroy();
    				}

					this.inherited(arguments);
    			},
    			
    			/**
    			 * Before moving to the user's selected link (removing all breadcrumbs
    			 * to the right), users can implement this method in order to prevent
    			 * the click from happening.  For example, to show a confirmation dialog
    			 * if changes that were made have not been saved.
    			 * 
    			 * @param {dijit._Widget} page The page in the container which the end-user wants to return to
    			 * @returns {boolean} Whether the breadcrumb move should take place.
    			 */
    			selectionConfirmed: function(/*dijit._Widget*/ page)
    			{
    				return true;
    			},

    			resize: function(changeSize, resultSize)
    			{
    				var cn = this.domNode;
    				var mb = resultSize || {};
    				dojo_lang.mixin(mb, changeSize || {}); // changeSize overrides resultSize
    				if(!("h" in mb) || !("w" in mb))
    				{
    					mb = dojo_lang.mixin(dojo_geo.getMarginBox(cn), mb); // just use dojo.marginBox() to fill in missing values
    				}

    				var childWidth = 0;
    				for(var pane in this.pane2button)
    				{
    					var dm = this.pane2button[pane].domNode;
    					
    					if(dm)
    					{
    						childWidth += dojo_geo.getMarginBox(dm).w;
    					}
    					
    				}
    			}
    			 

	});

   BreadcrumbController.Breadcrumb = Breadcrumb; 
   return BreadcrumbController; 

}; // end of factory

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
   dojo.provide("idx.layout.BreadcrumbController");
   dojo.require("dijit.layout.StackController");
	factory(dojo.declare, 									// dojo_declare
			{	add: dojo.addClass, 						// dojo_class
				remove: dojo.removeClass},
			{   getMarginBox: dojo.marginBox,				// dojo_geo 
				getContentBox: dojo.contentBox}, 
			dojo, 											// dojo_lang
			dijit, 											// dijit_registry
			dojo, 											// dojo_array
			dojo, 											// dojo_construct
			dijit.layout.StackController,					// dijit_layout_StackController
			dijit.layout._StackButton);						// dijit_layout_StackButton
}else{
	define([
	  "../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",             // dojo_delcare
      "../../../lib/dojo/dom-class",                 // dojo_class
      "dojo/dom-geometry",              // dojo_geo
      "dojo/_base/lang",                // dojo_lang
      "dijit/registry",                 // dijit_registry
      "dojo/_base/array",               // dojo_array
      "dojo/dom-construct",             // dojo_construct
	  "dijit/layout/StackController"    // dijit_layout_StackController
	], function(dojo_declare, dojo_class, dojo_geo,dojo_lang,dijit_registry,dojo_array,dojo_construct,dijit_layout_StackController) {
		return factory(dojo_declare,
					   dojo_class,
					   dojo_geo,
					   dojo_lang,
					   dijit_registry,
					   dojo_array,
					   dojo_construct,
					   dijit_layout_StackController,
					   dijit_layout_StackController.StackButton);
	});
}

})();
