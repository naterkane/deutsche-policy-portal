/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	"../../../../lib/dojo/_base/event",
	"dojo/dom-class",
	"dojo/query",
	"dijit/form/_ComboBoxMenu"
], function(declare, event, domClass, query, _ComboBoxMenu){
	
	//	module:
	//		idx/oneui/form/_ComboBoxMenu
	//	summary:
	//		One UI version ComboBox Menu

	return declare("idx.oneui.form._ComboBoxMenu", [_ComboBoxMenu],{
		// summary:
		//		One UI version ComboBox Menu
		
		_onMouseUp: function(/*Event*/ evt){
			if(!this.readOnly){
				this.inherited(arguments);
			}
		},
		
		_onMouseDown: function(/*Event*/ evt){
			event.stop(evt);
			if(this._hoveredNode){
				this.onUnhover(this._hoveredNode);
				this._hoveredNode = null;
			}
			this._isDragging = true;
			var node = this._getTarget(evt);
			this._setSelectedAttr(node);
			if(node && node.parentNode == this.containerNode){
				this.onMouseDown(node);
			}
		},
		
		_onMouseOut: function(/*Event*/ /*===== evt ====*/){
			if(this._hoveredNode){
				this.onUnhover(this._hoveredNode);
				if(this._getSelectedAttr() == this._hoveredNode){
					this.onSelect(this._hoveredNode);
				}
				this._hoveredNode = null;
			}
			if(this._isDragging){
				this._cancelDrag = (new Date()).getTime() + 1000; // cancel in 1 second if no _onMouseOver fires
			}
			this.onUnMouseDown();
		},
		
		onMouseDown: function(/*DomNode*/ node){
			domClass.add(node, "dijitMenuItemActive");
		},
		onUnMouseDown: function(/*DomNode*/ node){
			query(".dijitMenuItemActive", this.domNode).removeClass("dijitMenuItemActive");
		}
	});
});