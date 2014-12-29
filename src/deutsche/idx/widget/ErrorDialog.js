/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

(function(){

var factory = function(dojo_declare, dojo_lang, dojo_html, dijit_layout_TabContainer, dijit_layout_ContentPane, idx_widget_SimpleIconDialog, idx_resources, idx_util){

/**
 * @name idx.widget.ErrorDialog
 * @class Error dialog with multiple panes for summary and details.
 * @augments idx.widget.SimpleIconDialog
 */
return dojo_declare("idx.widget.ErrorDialog", [idx_widget_SimpleIconDialog],
/**@lends idx.widget.ErrorDialog#*/
{

	iconClass: "idxSignIcon idxErrorIcon",

	/**
	 * Error object to report.
	 * @type Object
	 * @default null
	 */
	error: null,

	/**
	 * Initializes globalization resource.
	 */
	postMixInProperties: function(){
		this.inherited(arguments);
		dojo_lang.mixin(this.res, idx_resources.getResources("idx/widget/ErrorDialog", this.lang));
	},

	/**
	 * Sets up the dialog title and CSS classes.
	 */
	buildRendering: function(){
		this.inherited(arguments);
		this.set("title", this.res.error);
		dojo_html.addClass(this.textNode, "idxErrorDialogSummary");
		dojo_html.addClass(this.contentNode, "idxErrorDialogDetail");
	},

	/**
	 * Renders the error object.
	 */
	startup: function(){
		this.set("error", this.error);
	},

	/**
	 * Renders the error object.
	 * @param {Object} error
	 * @private
	 */
	_setErrorAttr: function(error){
		/*
		 * error: {
		 * 		messageId: "ABC01234E",
		 * 		summary: "Error summary",
		 * 		detail: "Error detail",
		 * 		moreContent: DOM Node
		 * }
		 */
		if(!error){
			return;
		}
		if(this.tab){
			this.tab.destroy();
		}
		if(this.contentNode.firstChild){
			this.contentNode.removeChild(this.contentNode.firstChild);
		}
		this.set("messageId", error.messageId);
		this.set("summary", error.summary);
		if(error.moreContent){
			var tab = this.tab = new dijit_layout_TabContainer({useSlider: false, useMenu: false}).placeAt(this.contentNode);
			tab.startup();
			var detail = new dijit_layout_ContentPane({
				selected: true, 
				title: this.res.idxErrorDialog_detailTabLabel, 
				content: error.detail
			});
			tab.addChild(detail);
			var more = new dijit_layout_ContentPane({
				title: this.res.idxErrorDialog_moreTabLabel, 
				content: error.moreContent
			});
			tab.addChild(more);
		}else if(error.detail){
			var n = dojo_html.create("div", {innerHTML: error.detail});
			dojo_html.place(n, this.contentNode);
		}
		if(error.onMessageIdClick){
			this.onMessageIdClick = error.onMessageIdClick; 
		}else{
			delete this.onMessageIdClick;
		}
	},

	/**
	 * Shows a message ID.
	 * @param {String} s
	 * @private
	 */
	_setMessageIdAttr: function(s){
		var span = this._messageIdNode;
		if(!span){
			span = this._messageIdNode = dojo_html.create("a", {className: "idxErrorDialogMessageId",
				href: "javascript:;", onclick: dojo_lang.hitch(this, function(){
					if(this.onMessageIdClick){
						var messageId = dojo_html.attr(this._messageIdNode, "innerHTML");
						this.onMessageIdClick(messageId);
					}
				})});
			dojo_html.place(span, this.actionBar, "first");
		}
		if(s){
			span.innerHTML=s;
		}
	},

	/**
	 * Shows a summary text.
	 * @param {String} s
	 * @private
	 */
	_setSummaryAttr: function(s){
		if(s){
			this.set("text", s);
		}
	},

	/**
	* Resizes tab container.
	* @private
	*/
	show: function(){
		this.inherited(arguments);

		if(idx_util.isIE && this.tab){
			var box = dojo_html.contentBox(this.contentNode);
			this.tab.resize(box);
		}
	}

});

}; // end of factory

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
	dojo.provide("idx.widget.ErrorDialog");
	dojo.require("dijit.layout.TabContainer");
	dojo.require("dijit.layout.ContentPane");
	dojo.require("idx.widget.SimpleIconDialog");
	dojo.require("idx.resources");
	dojo.require("idx.util");
	dojo.requireLocalization("idx","base");
	dojo.requireLocalization("idx.widget","base");
	dojo.requireLocalization("idx.widget","ErrorDialog");
	factory(dojo.declare, dojo, dojo, dijit.layout.TabContainer, dijit.layout.ContentPane, idx.widget.SimpleIconDialog, idx.resources, idx.util);
}else{
	define([
		"../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
		"../../../../dist/lib/dojo/_base/lang",
		"dojo/_base/html",
		"dijit/layout/TabContainer",
		"dijit/layout/ContentPane",
		"idx/widget/SimpleIconDialog",
		"idx/resources",
		"idx/util",
		"dojo/i18n!../nls/base",
		"dojo/i18n!./nls/base",
		"dojo/i18n!./nls/ErrorDialog"
	], factory);
}

})();
