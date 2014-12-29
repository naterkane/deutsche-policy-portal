/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */


// This widget extends the Dijit ScrollingTabController to provider a tab
// controller that supports the scrolling behaviour and adds popup menu
// functionality to the tabs provided for content panes.
//
// This widget has all the methods and properties of ScrollingTabController.
// To include a popup menu on the tab for a content pane, add a property
// 'popup' to the content pane, specifying the menu to display when the popup
// affordance is activated.

define(["dojo", "../../../lib/dijit/layout/ScrollingTabController"],
       function(dojo, ScrollingTabController){

	var MenuTabController = dojo.declare("idx.oneui.layout.MenuTabController", [ScrollingTabController], {
		//	summary:
		//
		//		MenuTabController
		//
		//      An extension of the dijit ScrollingTabController which adds support for popup menus.
		//
		constructor: function(){
			this.buttonWidget = "idx.oneui.layout._PopupTabButton";
		},
		
		onAddChild: function(/*dijit._Widget*/ page, /*Integer?*/ insertIndex){
			this.inherited(arguments);
			
			// at this point (although it might get overridden later)
			// page.controlButton gives us the button instance we just created
			var button = page.controlButton;
			
			if(page.popup && button.dropdownNode){
				this._bindPopup(page, button.domNode, button.dropdownNode, dijit.byId(page.popup));
				button.set("arrowButton", true);
			}else{
				button.set("arrowButton", false);
			}
			
			// watch() for changes to the 'popup' property on the content pane
			this.pane2watches[page.id].push(
				page.watch("popup", function(name, oldpopup, newpopup){
					if(oldpopup){
						this._unbindPopup(page, button.domNode, button.dropdownNode, oldpopup);
					}
					
					if(newpopup){
						this._bindPopup(page, button.domNode, button.dropdownNode, newpopup);
						button.set("arrowButton", true);
					}else{
						button.set("arrowButton", false);
					}
				})
			);
				
			this.pane2connects[page.id].push(
				this.connect(button, 'onClickArrowButton', dojo.hitch(this, "onArrowButtonClick", page))
			);
		},
		
		_bindPopup: function(/*dijit._Widget*/ page, /*DOM node*/ tabNode, /*DOM node*/ popupNode, /*dijit._Widget*/ popup){
			// summary:
			//		Bind a popup to display when triggered by the specified popupNode.
			
			popup.leftClickToOpen = true;
			popup.bindDomNode(popupNode);
		},
		
		_unbindPopup: function(/*dijit._Widget*/ page, /*DOM node*/ tabNode, /*DOM node*/ popupNode, /*dijit._Widget*/ popup){
			// summary:
			//		Unbind a popup which used to display when triggered by the specified popupNode.
			
			popup.unbindDomNode(popupNode);
		},
		
		onArrowButtonClick: function(/*dijit._Widget*/ page){
			// summary:
			//		Called whenever one of my child buttons [v] is pressed in an attempt to open a menu
			// tags:
			//		private
		}
	});	

	dojo.declare("idx.oneui.layout._PopupTabButton", [dijit.layout._TabButton], {
		//	summary:
		//
		//		_PopupTabButton
		//
		//      An extension of the dijit _TabButton which adds a popup affordance.
		//
	    templateString:
	    	'<div role="presentation" dojoAttachPoint="titleNode" dojoAttachEvent="onclick:onClick">' +
				'<div role="presentation" dojoAttachPoint="focusNode">' +
					'<div role="presentation" class="dijitTabInnerDiv" dojoAttachPoint="innerDiv">' +
						'<div role="presentation" class="dijitTabContent" dojoAttachPoint="tabContent">' +
			        		'<img src="${_blankGif}" alt="" class="dijitIcon dijitTabButtonIcon" dojoAttachPoint="iconNode" />' +
					        '<span dojoAttachPoint="containerNode" class="tabLabel">' + 
					        '</span>' +
					        '<span class="dijitInline dijitTabArrowButton dijitTabArrowIcon" dojoAttachPoint="dropdownNode" dojoAttachEvent="onclick: onClickArrowButton, onmouseenter: onMouseEnterArrowButton, onmouseleave: onMouseLeaveArrowButton" role="presentation">' +
					            '<span class="dijitTabDropDownText">${tabDropDownText}</span>' +
					        '</span>' +
					        '<span class="dijitInline dijitTabCloseButton dijitTabCloseIcon" dojoAttachPoint="closeNode" dojoAttachEvent="onclick: onClickCloseButton" role="presentation">' +
					            '<span class="dijitTabCloseText">${tabCloseText}</span>' +
					        '</span>' +
					        '<span class="idxTabSeparator" dojoAttachPoint="separatorNode">${tabSeparatorText}</span>' +
						'</div>' +
					'</div>' +
				'</div>' +
			'</div>',
			
		tabDropDownText: "&nbsp;[v]",
		tabCloseText: "[x]",
		tabSeparatorText: "",
			
		_setCloseButtonAttr: function(/*Boolean*/ disp){
			// we suppress the default pop-up menu containing "Close"
			// if the tab is closable but we have our own menu to display
			if(this.arrowButton){
				this._set("closeButton", disp);
				dojo.toggleClass(this.innerDiv, "dijitClosable", disp);
				this.closeNode.style.display = disp ? "" : "none";
			}else{
				this.inherited(arguments);
			}
		},

		_setArrowButtonAttr: function(/*Boolean*/ disp){
			this._set("arrowButton", disp);
			dojo.toggleClass(this.innerDiv, "dijitPopup", disp);
			this.dropdownNode.style.display = disp ? "" : "none";
		},

		onClickArrowButton : function(/*Event*/ evt){
			evt.stopPropagation();
		},

		onMouseEnterArrowButton : function(event){
			dojo.addClass(event.currentTarget, "enter");
		},

		onMouseLeaveArrowButton : function(event){
			dojo.removeClass(event.currentTarget, "enter");
		}
	});

	return MenuTabController;	
});