/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

//dojo.declare(
//		"idx.layout.ListNavController",
//		[dijit.layout.StackController],
(function() 
		/** @lends idx.layout.ListNavController# */
{
		function factory(dDeclare,			// (dojo/_base/declare)
					     dStackController, 	// (dijit/layout/StackController)
					     dStackButton,		// (dijit/layout/StackController.StackButton)
						 dLang,         	// (dojo/_base/lang)
						 dSetAttr,     		// (dojo/dom-attr.set)
						 dAddClass,    		// (dojo/dom-class.add)
						 dGetMarginBox, 	// (dojo/dom-geometry.getMarginBox)
						 dConnect)      	// (dojo/_base/connect)
        {
 		 var version = (window["dojo"] && dojo.version);
 		 var ListNavButton = dDeclare("idx.layout._ListNavButton", 
				 					  [dStackButton], {
			 
     		// summary:
     		//		A navigation button (the thing you click to select a pane).
     		// description:
     		//		Contains the title of the associated pane
     		//		This is an internal widget and should not be instantiated directly.
     		// tags:
     		//		private
     
     		// baseClass: String
     		//		The CSS class applied to the domNode.
     		baseClass: "idxListNavButton",
     
     
     		//prevent user click from being able to toggle _ListNavButton into an off state
     		_clicked: function(/*Event*/ evt)
     		{
     			if(!this.checked)
     				this.inherited("_clicked", arguments);
     		}
		 });
		
		var buttonWidget = (version && version.major == 1 && version.minor == 6) ? "idx.layout._ListNavButton" : ListNavButton;
		 
         var ListNavController = dDeclare("idx.layout.ListNavController",
        		 						  [dStackController], {

                buttonWidget: buttonWidget,
 
                idxBaseClass: "idxListNavController",
 
                /**
                 * @name idx.layout.ListNavController
                 * @class Similar to dijit.layout.StackController, but uses a custom button widget
                 *			to prevent the user from deselecting the navigation button that is
                 *			associated with a selected pane
                 * @constructor
                 * @augments dijit.layout.StackController
                 * 
                 */
                constructor: function(args, node) {

                },


                buildRendering: function() {
                   this.inherited(arguments);
                   dAddClass(this.domNode, this.idxBaseClass);	 
                },

                resize: function(changeSize, resultSize) {
                   this.inherited(arguments);
                   if (changeSize) dGetMarginBox(this.domNode, changeSize);
                },
                
                addChild: function(widget, index) {
                	this.inherited(arguments);
                	this.ensureKeyboardNav();
                },
                
                removeChild: function(widgetOrIndex) {
                	this.inherited(arguments);
                	this.ensureKeyboardNav();
                },
                	
                ensureKeyboardNav: function() {
                	var children = this.getChildren();
                	var firstButton = null;
                	var widgetType = (typeof this.buttonWidget == "string") ? dLang.getObject(this.buttonWidget) : this.buttonWidget;
                	for (var index = 0; index < children.length; index++) {
                		var child = children[index];
                		if (child instanceof widgetType) {
                			firstButton = child;
                			break;
                		}
                	}
                	if ((this._firstButton) && (this._firstButton.focusNode)) {
                	    dSetAttr(this._firstButton.focusNode, "tabindex", "-1");
                		dConnect.disconnect(this._firstFocus);
                		this._firstButton = null;
                		this._firstFocus = null;
                	}
                	if ((firstButton) && (firstButton.focusNode)) {
                	    dSetAttr(firstButton.focusNode, "tabindex", "0");
                		this._firstFocus = dConnect.connect(firstButton.focusNode, "onfocus", 
                										this, "onFirstButtonFocus");
                		this._firstButton = firstButton;
                	}
                },
                
                onAddChild: function(page) {
                	this.inherited(arguments);
                	var button = this.pane2button[page.id];
                	if (! button) return;
                	var controlNode = (button.focusNode ? button.focusNode : button.domNode);
                	var pageNode = page.domNode;
                	if ((! pageNode) || (!controlNode)) return;
                	dSetAttr(controlNode, "aria-controls", pageNode.id);
                	
                },
                onSelectChild: function(page) {
                	this.inherited(arguments);
                	if (! this._currentChild) {
                		this.ensureKeyboardNav();
                	}
                },
                
                onFirstButtonFocus: function() {
                	if (! this._currentChild) {
                		this._firstButton.onClick();
                	}
                },
                
                onkeypress: function(/*Event*/e) {
                	this.inherited(arguments);
                },
                
                //override dojo 1.7.2 code which doesn't check for _currentChild of null
                //if fixed in a future release, we should remove this method
                onButtonClick: function(/*dijit._Widget*/ page){

                    if(this._currentChild && this._currentChild.id === page.id) {
                        //In case the user clicked the checked button, keep it in the checked state because it remains to be the selected stack page.
                        var button=this.pane2button[page.id];
                        button.set('checked', true);
                    }
                    //var container = registry.byId(this.containerId); //registry not available in this file so using line below for now
                    var container = dijit.byId(this.containerId);
                    container.selectChild(page);
                }
            });
         
         	ListNavController.ListNavButton = ListNavButton;
         	
         	return ListNavController;
        }

		var version = (window["dojo"] && dojo.version);
		if(version && version.major == 1 && version.minor == 6){

            dojo.provide("idx.layout.ListNavController");

            dojo.require("dijit.layout.StackController");

            dojo.require("idx.util");

            factory(dojo.declare,					// dDeclare
            		dijit.layout.StackController,	// dStackController
            		dijit.layout._StackButton,		// dStackButton
            		dojo,            				// dLang        (dojo/_base/lang)
            		dojo.attr,       				// dSetAttr     (dojo/dom-attr.set)
            		dojo.addClass,   				// dAddClass    (dojo/dom-class.add)
            		dojo.marginBox,   				// dGetMarginBox  (dojo/dom-geometry.getMarginBox)
            		dojo);            				// dConnect     (dojo/_base/connect) 
		} else {
	        define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	                "../../../lib/dijit/layout/StackController",
	                "dojo/_base/lang",
	                "dojo/dom-attr",   
	                "dojo/dom-class",
	                "dojo/dom-geometry", 
	                "dojo/_base/connect"
	                ],
	                function (dDeclare,
	                          dStackController, 
	                          dLang,
	                          dDomAttr,		
	                          dDomClass,
	                          dDomGeo,  
	                          dConnect) {
	            
	            return factory(dDeclare,						// dDeclare
	            			   dStackController,				// dStackController
	            			   dStackController.StackButton,	// dStackButton
	            			   dLang,            				// dLang        (dojo/_base/lang)
	            			   dDomAttr.set,       				// dSetAttr     (dojo/dom-attr.set)
	            			   dDomClass.add,   				// dAddClass    (dojo/dom-class.add)
	            			   dDomGeo.getMarginBox,   			// dGetMarginBox  (dojo/dom-geometry.getMarginBox)
	            			   dConnect);            			// dConnect     (dojo/_base/connect) 
	           });
		}
	        
})();


