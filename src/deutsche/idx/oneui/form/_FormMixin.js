/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	"../../../../../node_modules/intern-geezer/node_modules/dojo/_base/array",
	"dojo/_base/lang", 
	"dojo/dom-attr", 
	"dojo/dom-style", 
	"dojo/i18n", 
	"dijit/form/Button",
	"dojo/i18n!./nls/_FormMixin"
], function(declare, array, lang, domAttr, domStyle, i18n, Button){
	// module:
	// oneui/form/_FormMixin
	// summary:
	return declare("idx.oneui.form._FormMixin", null, {
		// summary:
			
		// name: String?
		//		Name of form for scripting
		name: "",
		
		// action: String?
		//		Server-side form handler
		action: "",
		
		// method: String?
		//		HTTP method used tosubmit the form, either "GET" or "POST"
		method: "",
		
		// encType: String
		//		Encoding type for the form, ex: application/x-www-form-urlencoded
		encType: "",
		
		// accept-charset: String?
		//		List of supported charsets
		"accept-charset": "",
		
		// accept: String?
		//		List of MIME types for file upload
		accept: "",
		
		// target: String?
		//		Target frame for the document to be opened in
		target: "",
		
		//heading: String
		//		Form title or dialog title if it's a popup form
		heading: "",
		
		// description: String?
		//		The description in forms the user of the form task, and it's optional
		description: "",
		
		// executeLabel: String?
		executeLabel: "submit",
		
		// resetLabel: String? 
		resetLabel: "reset",
		
		// invlidMessage: String
		//		Used in inline message box when form is invalid
		invalidMessage: "",
		
		// labelAlignment: String?
		//		Alignment of label and field, "vertical" as top-aligned, "horizontal" as left-aligned.
		labelAlignment: "vertical",
		
		children: null,
		
		actionButtons: [],
		
		postMixInProperties: function(){
			this.inherited(arguments);
			this._nlsResources = i18n.getLocalization("idx.oneui.form", "_FormMixin", this.lang);
			this.legend = this._nlsResources.legendText;
		},
		
		postCreate: function(){
			// summary:
			// Hideinline messages
			this.inherited(arguments);
			this.hideInvalidMessage();
		},
		
		_clearActions: function(){
			array.forEach(this.actionButtons, function(aBtn){
				aBtn && aBtn.destroy && aBtn.destroy();
			});
			this.actionButtons = [];
		},
		_addActions: function(/* DOM | Object */ containerNode, /* Object */actionNameMapList){
			if(actionNameMapList && lang.isArray(actionNameMapList)){
				array.forEach(actionNameMapList, function(anMap, i){
					var btn = new Button({label: anMap.name, onClick: anMap.action});
					containerNode.appendChild(btn.domNode);
					this.actionButtons.push(btn);
				}, this);
			}
		},
		
		_setExecuteLabelAttr: function(/* String */label){
			this.submitButton && this.submitButton.set("label", label);
		},
		
		_setResetLabelAttr: function(/* String */label){
			this.resetButton && this.resetButton.set("label", label);
			//this.resetButton.set("label", label);
		},
		
		_setDescription: function(/* String*/ description){
			this._setNodeText(this.descriptionNode, description);
		},
		
		_setHeadingAttr: function(/* String */ heading){
			this.headingNode.innerHTML = heading;
		},
		
		_setActionAttr: function(action){
			this.formNode.action = action;
		},
		
		_setMethodAttr: function(method){
			this.formNode.method = method;
		},
		
		_setTargetAttr: function(target){
			this.formNode.target = target;
		},
		
		_setEncTypeAttr: function(encType){
			domAttr.set(this.formNode, {
				encTypte: encType
			});
		},
		
		_setLabelAlignmentAttr: function(labelAlignment){
			if(this.children && this.children.length > 0){
				array.forEach(this.children, function(child){
					child.item.set("labelAlignment", labelAlignment)
				})
			}
			this.labelAlignment = labelAlignment;
		},
		
		_setNodeText: function (/*Dom*/node, /* String*/ text) {
			domStyle.set(node, {
				visibility: text ? "visible" : "hidden",
				display: text ? "block" : "none"
			});
			if(text){
				node.innerHTML = text;
			}
		},
		
		onSubmit: function(){
			return this.isValid();
		},
		
		showInvalidMessage: function(){
			// summary:
			//	Show invaliad message in inline message box
			this._setNodeText(this.inlineMessageNode, this.invalidMessage);
		},
		
		hideInvalidMessage: function(){
			// summary:
			// Show invaliad message in inline message box
			this._setNodeText(this.inlineMessageNode, null);
		},
		
		_onSubmit: function(){
			this.inherited(arguments);
			if(this.isValid()){
				this.hideInvalidMessage();
			}
			else{
				this.showInvalidMessage();
			}
		},
		
		_onReset: function(){
			this.inherited(arguments);
			this.hideInvalidMessage();
		},
		
		submit: function(){
			// summary:
			// programmatically submit form if and onlyif the `onSubmit` returns true
			if(!(this.onSubmit() === false)){
				this.formNode.submit();
			}
		}
	});
});