/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	"../../../../../dist/lib/dojo/_base/lang", // lang.mixin lang.hitch
	"dojo/_base/event", // event.stop
	"dojo/dom-style", // domStyle.set
	"dojo/cookie", // domStyle.set
	"dijit/form/Button",
	"idx/oneui/messaging/ModalDialog",
	"idx/oneui/form/CheckBox",
	"dojo/text!./templates/ConfirmationDialog.html"
], function(declare, lang, event, domStyle, cookie, Button, ModelDialog, CheckBox, template){
	/**
	 * @name idx.oneui.messaging.ConfirmationDialog
	 * @class One UI version.
	 * @augments dijit.messaging.ConfirmationDialog
	 */
	 
	 
	return declare("idx.oneui.messaging.ConfirmationDialog", ModelDialog, {
		/**@lends idx.oneui.messaging.ConfirmationDialog*/
		
		baseClass: "idxConfirmDialog",
		templateString: template,
		/**
		 * Execute button label
		 * @type String
		 */
		buttonLabel:"",
		
		postCreate: function(){
			this.inherited(arguments);
			domStyle.set(this.confirmAction, "display", "block");
			this.confirmAction = new Button({
				label: this.buttonLabel, 
				onClick: lang.hitch(this, function(evt){
					this.onExecute();
					event.stop(evt);
				})
			}, this.confirmAction);
			this.closeAction.set("label", this._nlsResources.cancelButtonLabel);
			this.closeAction.focusNode && dojo.style(this.closeAction.focusNode, "fontWeight", "normal");
			this.checkbox = new CheckBox({
				label: this._nlsResources.checked,
				onChange: lang.hitch(this, function(evt){
					if(this.checkbox.get("value") == "on"){
						this.check();
					}else{
						this.uncheck();
					}
				})
			}, this.checkbox);
			this.set("type", this.type || "Confirmation");
			(this.checkboxNode && this.dupCheck) && domStyle.set(this.checkboxNode, "display", "");
		},
		_confirmed: function(){
			return cookie(this.id + "_confirmed") == "true";
		},
		check: function(){
			dojo.cookie(this.id + "_confirmed", "true");
		},
		uncheck: function(){
			dojo.cookie(this.id + "_confirmed", null);
			this.checkbox.set("value", false);
		},
		confirm: function(action, context){
			if(!this._confirmed()){
				this.show();
				this.checkbox.set("value", false);
				this.disconnect(this._actionListener)
				this._actionListener = this.connect(this, "onExecute", dojo.hitch(context, action));
			}else{
				dojo.hitch(context, action)();
			}
		}
	});
})
