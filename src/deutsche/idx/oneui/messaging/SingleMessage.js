/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	"../../../../../node_modules/intern-geezer/node_modules/dojo/_base/array",
	"dojo/_base/event",
	"dojo/_base/lang",
	"dojo/_base/sniff",
	"dojo/date/locale",
	"dojo/dom-class",
	"dojo/dom-attr",
	"dojo/dom-style",
	"dojo/dom-geometry",
	"dojo/i18n",
	"dojo/keys",
	"dijit/focus",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/text!./templates/SingleMessage.html",
	"dojo/i18n!./nls/_MessageItem",
	"dojox/html/ellipsis"
], function(declare, array, event, lang, has, locale, domClass, domAttr, domStyle, domGeometry, i18n, keys, focus, _Widget, _TemplatedMixin,
			_WidgetsInTemplateMixin, template){
	/**
	 * @name idx.oneui.messaging.SingleMessage
	 * @class One UI version message.
	 * @augments dijit._Widget
	 * @augments dijit._TemplatedMixin
	 * @augments dijit._WidgetsInTemplateMixin
	 */
	return declare("idx.oneui.messaging.SingleMessage", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin],
	/**@lends idx.oneui.messaging.SingleMessage.prototype*/
	{
		templateString: template,
		
		baseClass: "idxSingleMessage",
		
		tabIndex: "0",
		
		/**
		 * Message ID
		 * @type String
		 */
		messageId: "",
		
		/**
		 * Message type. Can be 'error', 'warning', 'success', 'information', 'critical', 'attention', 'compliance'
		 * @type String
		 * @default "error"
		 */
		type: "error",
		
		/**
		 * Message time stamp
		 * @type Date
		 */
		date: new Date(),
		
		/**
		 * The options being used for date formatting
		 * @type dojo.date.locale.__FormatOptions
		 */
		dateFormat: {
			formatLength: "medium",
			locale: this.lang
		},
		
		/**
		 * Message text.
		 * @type String
		 */
		title: "",
		
		/**
		 * Action text.
		 * @type String
		 * @default "View All"
		 */
		actionText: "",
		
		/**
		 * Whether to show the message ID. By default, success message and information message does not
		 * display the message ID. Error, Critical, Warning messages cannot hide ID.
		 * @type Boolean
		 * @default true
		 */
		showId: true,
		
		/**
		 * Whether to show the action link (View All).
		 * @type Boolean
		 * @default true
		 */
		showAction: true,
		
		/**
		 * Whether to show the refresh link in the message description part.
		 * @type Boolean
		 * @default true
		 */
		showRefresh: true,
		
		/**
		 * The message number to be put in the action link 'View All(n)'.
		 * @type Integer | String
		 * @default "n"
		 */
		messageNumber: "n",
		
		/**
		 * Message details
		 * @type String
		 */
		description: "",
		
		/**
		 * Whether the message is collapsed
		 * @type Boolean
		 */
		collapsed: true,
		
		/**
		 * Whether the message is destructive
		 * @type Boolean
		 */
		closable: true,
		
		/**
		 * Alt text for message icons
		 * @private
		 * @type Object
		 */
		_iconTextMap: {
			"error": "X",
			"warning": "!",
			"information": "i",
			"success": "&#8730;",
			"critical": "X",
			"attention": "&#9670",
			"compliance": "&#9671"
		},
		
		
		/**
		 * Possible message types
		 * @private
		 * @type Array
		 * @default ["error", "warning", "information", "success", "critical", "attention", "compliance"]
		 */
		_allowedTypes: ["error", "warning", "information", "success", "critical", "attention", "compliance"],
		
		postMixInProperties: function(){
			this.inherited(arguments);
			this._nlsResources = i18n.getLocalization("idx.oneui.messaging", "SingleMessage", this.lang);
			this.type = array.indexOf(this.type.toLowerCase()) ? this.type.toLowerCase() : "error";
			if(!this.description){
				this.description = this.title;
			}
		},
		
		postCreate: function(){
			// summary:
			//		Set tab index and time stamp for the message
			this.inherited(arguments);
			this._created = true;
			if(!this.actionText){
				this.set("actionText", this._nlsResources.viewAll);
			}
			domAttr.set(this.viewDetailsNode, "innerHTML", this._nlsResources.viewDetails);
			domAttr.set(this.refreshNode, "innerHTML", this._nlsResources.refresh);
			this.set("title", this.title);
		},
		
		_setActionTextAttr: function(value){
			this._set("actionText", value);
			domAttr.set(this.actionNode, "innerHTML", lang.replace(value, {num: this.messageNumber}));
		},
		
		_setTitleAttr: function(value){
			this._set("title", value);
			this._resizeTitle();
			domAttr.set(this.fakeTitleNode, "innerHTML", value + "&nbsp;&nbsp;");
		},
		
		
		_setDescriptionAttr: function(value){
			this._set("description", value);
			domAttr.set(this.descriptionNode, "innerHTML", value);
		},
		
		_setMaxLengthAttr: function(value){
			this._set("maxLength", value);
			this._resizeTitle();
		},
		
		_setMessageIdAttr: function(/*String*/ value){
			domAttr.set(this.idNode, "innerHTML", value);
			this._set("messageId", value);
			this._resizeTitle();
			domAttr.set(this.fakeIdNode, "innerHTML", value);
		},
		
		_setTypeAttr: function(/*String*/ value){
			domAttr.set(this.typeNode, "innerHTML", this._iconTextMap[value]);
			domClass.toggle(this.domNode, this.value + "Message", false);
			domClass.toggle(this.domNode, value + "Message", true);
			this._set("type", value);
			this._toggleId();
		},
		
		_setDateAttr: function(/*Date*/ value){
			this._set("date", value);
			domAttr.set(this.timestampNode, "innerHTML", locale.format(this.date, this.dateFormat));
			this._resizeTitle();
		},
		
		_setDateFormatAttr: function(/*dojo.date.locale.__FormatOptions?*/ value){
			this._set("dateFormat", value);
			domAttr.set(this.timestampNode, "innerHTML", locale.format(this.date, this.dateFormat));
			this._resizeTitle();
		},
		
		_setMessageNumberAttr: function(/*Integer|String*/ value){
			this._set("messageNumber", value);
			this.set("actionText", this.actionText);
			this._resizeTitle();
		},
		
		_setShowIdAttr: function(/*Boolean*/ value){
			this._set("showId", value);
			this._toggleId();
			this._resizeTitle();
		},
		
		_setShowActionAttr: function(/*Boolean*/ value){
			this._set("showAction", value);
			domClass.toggle(this.actionNode, "dijitHidden", !this.showAction);
			domClass.toggle(this.separatorNode, "dijitHidden", !this.showAction);
			if(has("ie") == 6 || has("ie") == 7){
				domClass.toggle(this.timestampNode, "idxMessageTimeStampMargin", !value);
			}
			this._resizeTitle();
		},
		
		_setShowRefreshAttr: function(/*Boolean*/ value){
			this._set("showRefresh", value);
			domClass.toggle(this.refreshNode, "dijitHidden", !this.showRefresh);
		},
		
		_setClosableAttr: function(/*Boolean*/ value){
			this._set("closable", value);
			domStyle.set(this.closeNode, {
				"visibility": this.closable ? "visible" : "hidden"
			});
		},
		
		_toggleId: function(){
			if(this.type == "information" || this.type == "success" || this.type == "attention" || this.type == "compliance"){
				domClass.toggle(this.idNode, "dijitHidden", !this.showId);
				domClass.toggle(this.fakeIdNode, "dijitHidden", !this.showId);
			}
		},
		
		_resizeTitle: function(){
			if(!this._created){
				return;
			}
			domStyle.set(this.titleNode, {"width": "auto"});
			domAttr.set(this.titleNode, {"innerHTML": ''});
			if(this.collapsed){
				var idWidth = domGeometry.getMarginBox(this.idNode).w;
				var width = domGeometry.getContentBox(this.domNode).w - domGeometry.getMarginBox(this.iconNode).w
							- domGeometry.getMarginBox(this.infoNode).w - idWidth;
				domAttr.set(this.titleNode, {"innerHTML": '<div class="messageTitles">' + this.title + '&nbsp&nbsp</div>'});
				var currentWidth = domStyle.get(this.titleNode, "width");
				if(width > 20){
					width = width - 10;
				}

				if(currentWidth > width){
					if(width < 0){
						width = 0;
					}
					domStyle.set(this.titleNode, {"width": width + "px"});
					domAttr.set(this.titleNode, {"innerHTML": '<div class="messageTitles dojoxEllipsis">' + this.title + '&nbsp&nbsp</div>'});;
					//console.log("idWidth:" + idWidth + ",width:" + width + ", currentWidth:" + currentWidth);
					domStyle.set(this.fakeFocusNode, {"width": width + idWidth + "px"});
				}else{
					domAttr.set(this.titleNode, {"innerHTML": '<div class="messageTitles">' + this.title + '&nbsp&nbsp</div>'});;
				}
			}else{
				var idWidth = domGeometry.getMarginBox(this.fakeIdNode).w;
				var width = domGeometry.getContentBox(this.domNode).w - domGeometry.getMarginBox(this.iconNode).w
							- domGeometry.getMarginBox(this.infoNode).w - idWidth;
				var currentWidth = domStyle.get(this.fakeTitleNode, "width");
				if(width > 20){
					width = width - 10;
				}
				domStyle.set(this.fakeFocusNode, {"width": width + idWidth + "px"});
			}
		},
		
		_setCollapsedAttr: function(value){
			if(value){
				domAttr.set(this.focusNode, "title", this._nlsResources.showDetails);
			}else{
				domAttr.set(this.fakeFocusNode, "title", this._nlsResources.hideDetails);
			}
			
			domClass.toggle(this.domNode, "idxMessageCollapsed", value);
			if(has("ie") == 6 || has("ie") == 7){
				if(value){
					domStyle.set(this.domNode, {"height": "33px"});
				}else{
					domStyle.set(this.domNode, {"height": "auto"});
				}
			}
			domClass.toggle(this.focusNode, "dijitHidden", !value);
			domClass.toggle(this.fakeFocusNode, "dijitHidden", value);
			this._set("collapsed", value);
			this._resizeTitle();
			
			if(has("ie") == 6){
				this.resize();
			}
		},
		
		_onClick: function(e){
			this.set("collapsed", !this.collapsed);
			focus.focus(this.collapsed ? this.focusNode : this.fakeFocusNode);
			this.onClick(e);
		},
		
		_onClose: function(e){
			this.onClose(e);
			this.destroy();
		},
		
		resize: function(){
			this._resizeTitle();
		},
		
		/**
		 * Called when the close button is clicked. Before .destroy method call. 
		 */
		onClose: function(e){
		},
		
		/**
		 * Called when mouse enter the icon image.
		 */
		onIconEnter: function(e){
		},
		
		/**
		 * Called when mouse leave the icon image.
		 */
		onIconLeave: function(e){
		},
		
		/**
		 * Called when message title is clicked.
		 */
		onClick: function(e){
		},
		
		/**
		 * Called when action link 'View All' is clicked.
		 */
		onAction: function(e){
		},
		
		/**
		 * Called when action link 'Refresh' is clicked.
		 */
		onRefresh: function(e){
		},
		
		/**
		 * Called when action link 'More Details' is clicked.
		 */
		onMoreDetails: function(e){
		}
	});
});



