/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"../../../../node_modules/intern-geezer/node_modules/dojo/_base/kernel", // kernel.isAsync
	"../../../../../node_modules/intern-geezer/node_modules/dojo/_base/array", // array.forEach array.indexOf array.map
	"dojo/_base/declare", // declare
	"dojo/_base/html", // Deferred
	"dojo/_base/event", // event.stop
	"dojo/_base/lang", // lang.mixin lang.hitch
	"dojo/query", // Query
	"dojo/dom-attr", // attr.set
	"dojo/dom-class", // domClass.add domClass.contains
	"dojo/dom-style", // domStyle.set
	"dojo/i18n", // i18n.getLocalization
	"dojo/keys",
	"dojo/on",
	"dojo/ready",
	"dojo/date/locale",
	"dijit/_base/wai",
	"dijit/_base/manager",	// manager.defaultDuration
	"dijit/a11y",
	"dijit/focus",
	"dijit/layout/ContentPane",
	"dijit/Dialog", 
	"dijit/layout/TabContainer", 
	"dijit/TitlePane", 
	"dijit/form/Button",
	"dojo/text!./templates/ModalDialog.html",
	"dojo/i18n!./nls/ModalDialog"
], function(kernel, array, declare, html, event, lang, 
		query, domAttr, domClass, domStyle, i18n, keys, on, ready, locale, 
		wai, manager, a11y, focus, ContentPane, Dialog, TabContainer, TitlePane, Button, template){
	
	/**
	* @name idx.oneui.messaging.ModalDialog
	* @class The ModalDialog provides the standard OneUI Modal Dialog
	* @augments dijit.Dialog
	* @see The <a href="http://livedocs.dojotoolkit.org/dijit/info">dijit.Dialog</a>.
	*/ 
	return declare("idx.oneui.messaging.ModalDialog", [Dialog], {
	/**@lends idx.oneui.messaging.ModalDialog*/ 
		templateString: template,
		widgetsInTemplate: true,
		baseClass: "idxModalDialog",
		alert: false, // Determines if the modal dialog is 'alertdialog' role. 
		_messagingTypeMap: {
			error: "Error",
			warning: "Warning",
			information: "Information",
			success: "Success",
			confirmation: "Confirmation",
			question: "Question"
		},
		/**
		 * Message type
		 * @type String
		 */
		type: "",
		/**
		 * Message summary 
		 * @type String
		 */
		text: "",
		/**
		 * Message main content, create compact tab container in array
		 * @type String | Array[{title, content}]
		 */
		info: null,
		/**
		 * Message identifier
		 * @type String
		 */
		messageId: "",
		/**
		 * Message additional reference
		 * @type HTML URL
		 */
		messageRef: null,
		/**
		 * Timestamp of Message
		 * @type String | Date
		 */
		messageTimeStamp: "",
		
		/** @ignore */
		postMixInProperties: function(){
			//	Set "Information" as default messaging type.no 
			this._nlsResources = i18n.getLocalization("idx.oneui.messaging", "ModalDialog", this.lang);
			var type = this._messagingTypeMap[(this.type || "information").toLowerCase()],
				title = this._nlsResources[type];
			lang.mixin(this, {title: title, type: type});
			this.messageTimeStamp = this.messageTimeStamp || "";
			this.messageTime = this.messageTime || false;
			//	Set error modal dialog as 'alertdialog' role by default.
			if(!this.alert && (this.type == "Error")){
				this.alert = true;
			}
			this.inherited(arguments);
		},
		/** @ignore */
		buildRendering: function(){
			this.inherited(arguments);
			if(this.messageId == "" && this.reference){
				domStyle.set(this.reference, "display", "none");
			}
			(this.timestamp && !this.messageTime && !this.messageTimeStamp) && domStyle.set(this.timestamp, "display", "none");
			if(!this.info){
				domStyle.set(this.messageWrapper, "display", "none");
			}else if(lang.isArray(this.info)){
				this.tabs = new TabContainer({
					useMenu: false,
					useSlider: false,
					style: "height:175px"
				}, this.containerNode);
				domStyle.set(this.messageWrapper, "borderTop", "0 none");
				array.forEach(this.info, function(item){
					var contentPane = new ContentPane({
						title: item.title,
						content: item.content
					});
					wai.setWaiRole(contentPane.domNode, "document");
					this.tabs.addChild(contentPane);
				}, this);
			}
		},
		/** @ignore */
		postCreate: function(){
			this.inherited(arguments);
			domStyle.set(this.confirmAction, "display", "none");
			this.closeAction = new Button({
				label: this._nlsResources.closeButtonLabel,
				onClick: lang.hitch(this, function(evt){
					this.onCancel();
					event.stop(evt);
				})
			}, this.closeAction);
			
			if(this.tabs){
				this.connect(this, "show", function(){
					// enable focus indications for message details as static text.
					query(".dijitTabPane",this.messageWrapper).attr("tabindex", 0).style({padding:"6px",margin:"2px"});
					this.tabs.resize();
				});
			}else{
				wai.setWaiRole(this.containerNode, "document");
				this.set("content", this.info);
			}
			if(this.alert){
				wai.setWaiRole(this.domNode, "alertdialog");
			}
			query(".dijitTitlePaneContentInner", this.messageWrapper).attr("tabindex", 0);
			
			if(this.reference){
				if(this.messageRef){
					domAttr.set(this.reference, "href", this.messageRef);
				}else{
					domClass.add(this.reference, "messageIdOnly");
				}
			}
		},
		_onKey: function(evt){
			this.inherited(arguments);
			var node = evt.target;
			if(domAttr.has(node, "href")){return;}
			if(node == this.closeAction.focusNode || node == this.confirmAction.focusNode){return;}
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
		/**
		* call back after the dialog show completed
		*/
		onShow: function(){
			this.timestamp && (this.timestamp.innerHTML = ((this.messageTimeStamp && (typeof this.messageTimeStamp == "object")) ? 
				locale.format(this.messageTimeStamp, {formatLength: 'medium'}) : this.messageTimeStamp) || 
				locale.format(new Date(), {formatLength: 'medium'}));
			this.inherited(arguments);
		},
		/** @ignore */
		startup: function(){
			if(this.tabs){
				this.tabs.startup();
			}
			this.inherited(arguments);
		},
		_setTypeAttr: function(type){
			domClass.remove(this.icon, "message" + this.type + "Icon");
			this.type = type;
			var title = this._nlsResources[this.type]
			this.set("title", title);
			domClass.add(this.icon, "message" + this.type + "Icon");
		},
		
		_getFocusItems: function(){
			//	summary:
			//		override _DialogMixin._getFocusItems.
			if(this._firstFocusItem){
				this._firstFocusItem = this.description;
				return;
			}
			if(!this.tabs){
				this._firstFocusItem = this.closeAction.focusNode;
				this._lastFocusItem = //this.messageId == "" ? this.description : this.reference;
					this.closeAction.focusNode;
			}else{
				var elems = a11y._getTabNavigable(this.messageWrapper);
				this._firstFocusItem = elems.lowest || elems.first || this.closeButtonNode || this.domNode;
				this._lastFocusItem = this.closeAction.focusNode;//this.description;
			}
		},
		/**
		* hide the dialog
		*/
		hide: function(){
			this.inherited(arguments);
			this._firstFocusItem = null;
		}
	});
});