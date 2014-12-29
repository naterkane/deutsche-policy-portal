/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"require",
	"../../../node_modules/intern-geezer/node_modules/dojo/_base/array", // array.forEach array.indexOf array.map
	"../../../lib/dojo/_base/connect", // connect._keypress
	"dojo/_base/declare", // declare
	"dojo/_base/Deferred", // Deferred
	"dojo/dom", // dom.isDescendant
	"dojo/dom-class", // domClass.add domClass.contains
	"dojo/dom-construct",
	"dojo/dom-geometry", // domGeometry.position
	"dojo/dom-style", // domStyle.set
	"dojo/dom-attr", // attr.has
	"dojo/_base/event", // event.stop
	"dojo/_base/fx", // fx.fadeIn fx.fadeOut
	"dojo/i18n", // i18n.getLocalization
	"dojo/_base/kernel", // kernel.isAsync
	"dojo/keys",
	"dojo/_base/lang", // lang.mixin lang.hitch
	"dojo/on",
	"dojo/ready",
	"dojo/_base/sniff", // has("ie") has("opera")
	"dojo/_base/window", // win.body
	"dojo/window", // winUtils.getBox
	"dijit/focus",
	"dijit/a11y",
	"dijit/_base/manager",	// manager.defaultDuration
	"dijit/Dialog",
	"dijit/form/Button",
	"dojo/text!./templates/Dialog.html",
	"dijit",			// for back-compat, exporting dijit._underlay (remove in 2.0)
	"dojo/i18n!./nls/Dialog"
], function(require, array, connect, declare, Deferred,
			dom, domClass, domConstruct, domGeometry, domStyle, domAttr, event, fx, i18n, kernel, keys, lang, on, ready, has, win, winUtils,
			focus, a11y, manager, Dialog, Button, template, dijit){
	/**
	 * @name idx.oneui.Dialog
	 * @class One UI version.
	 * @augments dijit.Dialog
	 */
	var Dialog = declare("idx.oneui.Dialog", Dialog, {
	/**@lends idx.oneui.Dialog*/
		templateString: template,
		baseClass: "idxDialog",
		_setTitleAttr: [],
		
		draggable: false,
		/**
		 * Dialog title
		 * @type String
		 */
		title: "",
		/**
		 * Dialog instruction, just below the title
		 * @type String
		 */
		instruction: "",
		/**
		 * Dialog content
		 * @type String | dijit.layout.TabContainer
		 */
		content: "",
		/**
		 * Referance link of Dialog, reference.name for link name, and reference.link for link url
		 * @type Object
		 */
		reference: {
			name: "",
			link: ""
		},
		/**
		 * Action buttons for Dialog in the action bar
		 * @type Array [dijit.form.Button]
		 */
		buttons: null,
		/**
		 * Label on Dialog close button
		 * @type String
		 */
		closeButtonLabel: "",
		
		postMixInProperties: function(){
			this.inherited(arguments);
			this.referenceName = this.reference.name;
			this.referenceLink = this.reference.link;
			this._nlsResources = i18n.getLocalization("idx.oneui", "Dialog", this.lang);
		},
		postCreate: function(){
			this.inherited(arguments);
			this.closeButton = new Button({
				label: this.closeButtonLabel || this._nlsResources.closeButtonLabel,
				onClick: lang.hitch(this, function(evt){
					this.onCancel();
					event.stop(evt);
				})
			}, this.closeButtonNode);
			array.forEach(this.buttons, function(button){
				if(button.declaredClass == "dijit.form.Button"){
					if(!domClass.contains(this.closeButton.domNode, "idxSecondaryButton")){
						domClass.add(this.closeButton.domNode, "idxSecondaryButton");
					}
					domConstruct.place(button.domNode, this.closeButton.domNode, "before");
				}
			}, this);
		},
		startup: function(){
			this.inherited(arguments);
			if(domClass.contains(this.containerNode.children[0], "dijitTabContainer")){
				domStyle.set(this.contentWrapper, {
					borderTop: "0 none",
					paddingTop: "0"
				});
			}
		},
		_size: function(){
			this.inherited(arguments);
			//resize the Dialog to wrap the content
			var children = this.containerNode.children,
				innerWidth = 0;
			array.forEach(children, function(child){
				innerWidth = Math.max(domStyle.get(child, "width"), innerWidth);
			});
			if(innerWidth > domStyle.get(this.containerNode, "width")){
				domStyle.set(this.domNode, {
					width:"auto"
				});
				domStyle.set(this.containerNode, {
					width:"auto",
					height:"auto"
				})
			}
		},
		_onKey: function(evt){
			this.inherited(arguments);
			var node = evt.target;
			if(domAttr.has(node, "href")){return;}
			if(node == this.closeButton.domNode){return;}
			while(node){
				if(node == this.domNode || domClass.contains(node, "dijitPopup")){
					if(evt.keyCode == keys.ENTER){
						this.onExecute();
					}else{
						return; // just let it go
					}
				}
				node = node.parentNode;
			}
			event.stop(evt);
		},
		_getFocusItems: function(){
			//	summary:
			//		override _DialogMixin._getFocusItems.
			if(this._firstFocusItem){
				this._firstFocusItem = this._getFirstItem();
				if(!this._firstFocusItem){
					var elems = a11y._getTabNavigable(this.messageWrapper);
					this._firstFocusItem = elems.lowest || elems.first || this.closeButton.focusNode || this.domNode;
				}
				return;
			}
			this._firstFocusItem = this.closeButton.focusNode;
			this._lastFocusItem = this.closeButton.focusNode;
		},
		hide: function(){
			this.inherited(arguments);
			this._firstFocusItem = null;
		},
		_getFirstItem: function(){
			if(this.title){return this.titleNode;}
			if(this.instruction){return this.instructionNode;}
			return null;
		}
	});

	// Back compat w/1.6, remove for 2.0
	if(!kernel.isAsync){
		ready(0, function(){
			var requires = ["dijit/TooltipDialog"];
			require(requires);	// use indirection so modules not rolled into a build
		});
	}

	return Dialog;
});
