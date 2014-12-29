(function(){

var factory = function(dojo_kernel, dojo_declare, dojo_lang, dojo_html, dojo_event, dojo_keys, dojo_i18n, dijit_registry, dijit_TitlePane, idx_resources){

/**
 * @deprecated idx.layout.ECMTitlePane is deprecated. Use idx.layout.TitlePane instead.
 * @name idx.layout.ECMTitlePane
 * @class TabPane with icons on the title bar performing actions.
 * @augments dijit.TitlePane
 */
return dojo_declare(
	"idx.layout.ECMTitlePane",
	dijit_TitlePane,
/**@lends idx.layout.ECMTitlePane#*/
	{
		/**
		 * Specifies whether the pane is closable.
		 * @type Boolean
		 * @default false
		 */
		closable: false,

		/**
		 * Specifies whether the pane is resizable.
		 * @type Boolean
		 * @default false
		 */
		resizable: false,

		/**
		 * URL for a help document
		 * @type String
		 * @default ""
		 */
		helpUrl: "",

		/**
		 * Specifies whether a help icon is shown.
		 * @type Boolean
		 * @default false
		 */
		hideIcon: false,
		
		res: null,
		_iconLinkNodes: null,
		_maximized: false,

		constructor: function(){
			dojo_kernel.deprecated("idx.layout.ECMTitlePane is deprecated.", "Use idx.layout.TitlePane instead.");
		},

		/**
		 * Initializes gloablization resource.
		 */
		postMixInProperties: function() {
			this.inherited(arguments);
			
			this.res = idx_resources.getResources("idx/layout/ECMTitlePane", this.lang);
		},

		/**
		 * Creates icons and sets up event handlers.
		 */
		postCreate: function() {
			this.inherited(arguments);
			
			dojo_html.addClass(this.domNode, "idxECMTitlePane");
			if(this.hideIcon) {
				dojo_html.addClass(this.domNode, "idxHideIcon");
			}
			this._iconLinkNodes = [ ];
			if(this.closable) {
				this._createCloseIcon();
			}
			if(this.resizable) {
				this._createResizeIcon();
			}
			if(this.helpUrl) {
				this._createHelpIcon();
			}
			
			this.connect(this.focusNode, "onfocus", "_onTitleFocus");
			this.connect(this.focusNode, "onblur", "_onTitleBlur");
		},

		/**
		 * Adds a CSS class for focus.
		 * @private
		 */
		_onTitleFocus: function() {
			dojo_html.addClass(this.titleBarNode, "idxECMTitlePaneTitleFocused");
		},
		
		/**
		 * Removes a CSS class for focus.
		 * @private
		 */
		_onTitleBlur: function() {
			dojo_html.removeClass(this.titleBarNode, "idxECMTitlePaneTitleFocused");
		},

		/**
		 * Creates an icon.
		 * @param {String} titleText
		 * @param {String} altText
		 * @param {String} iconClass
		 * @param {String} a11yText
		 * @returns {Object}
		 */
		createIcon: function(titleText, altText, iconClass, a11yText) {
			var linkNode = dojo_html.create("A", {
				href: "javascript:;",
				title: titleText
			}, this.focusNode);
			dojo_html.addClass(linkNode, "idxECMTitlePaneIconLink");
			var offset = 1 + this._iconLinkNodes.length*14 + "px";
			dojo_html.style(linkNode, "right", offset);
			this._iconLinkNodes.push(linkNode);
			
			var iconNode = dojo_html.create("IMG", {
				src: this._blankGif,
				alt: altText
			}, linkNode);
			dojo_html.addClass(iconNode, "idxECMTitleBarIcon " + iconClass);
			
			var a11ySpan = dojo_html.create("SPAN", {
				innerHTML: a11yText
			}, linkNode);
			dojo_html.addClass(a11ySpan, "idxECMTitlePaneA11yText")
			
			return linkNode;
		},

		/**
		 * Creates a close icon.
		 * @private
		 */
		_createCloseIcon: function() {
			var linkNode = this.createIcon(this.res.titleClose, this.res.altClose, "idxCloseIcon", "x");
			this.connect(linkNode, "click", dojo_lang.hitch(this, "_closePane"));
			this.connect(linkNode, "onkeypress", dojo_lang.hitch(this, "_closeIconKeypressHandler"));
		},

		/**
		 * Creates a help icon.
		 * @private
		 */
		_createHelpIcon: function() {
			var linkNode = this.createIcon("Help", "help", "idxHelpIcon", "?");
			this.connect(linkNode, "click", dojo_lang.hitch(this, "_openHelp"));
			this.connect(linkNode, "onkeypress", dojo_lang.hitch(this, "_helpIconKeypressHandler"));
		},

		/**
		 * Creates a resize icon.
		 * @private
		 */
		_createResizeIcon: function() {
			var linkNode = this.createIcon(this.res.titleMaximize, this.res.altMaximize, "idxMaximizeIcon", "*");
			var iconNode = linkNode.getElementsByTagName("IMG")[0];
			this.connect(linkNode, "click", function(e) {
				this._resizePane(e, linkNode, iconNode);
			});
			this.connect(linkNode, "onkeypress", function(e) {
				if(e.keyCode == dojo_keys.ENTER || e.charCode == dojo_keys.SPACE) {
					this._resizePane(e, linkNode, iconNode);
				}
			});
		},

		/**
		 * Handles ENTER and SPACE keys to close the pane.
		 * @parem {Object} e
		 * @private 
		 */
		_closeIconKeypressHandler: function(e) {
			if(e.keyCode == dojo_keys.ENTER || e.charCode == dojo_keys.SPACE) {
				this._closePane(e);
			}
		},

		/**
		 * Closes the pane.
		 * @param {Obkect} e
		 * @private
		 */
		_closePane: function(e) {
			if (e) {
				dojo_event.stop(e);
			}
			this.onHide();
			this.destroy();
		},

		/**
		 * Callback to be called when closed.
		 */
		onHide: function() {
			
		},

		/**
		 * Handles ENTER and SPACE keys to open help document
		 * @parem {Object} e
		 * @private 
		 */
		_helpIconKeypressHandler: function(e) {
			if(e.keyCode == dojo_keys.ENTER || e.charCode == dojo_keys.SPACE) {
				this._openHelp();
			}
		},

		/**
		 * Opens help document.
		 * @param {Obkect} e
		 * @private
		 */
		_openHelp: function(e) {
			dojo_event.stop(e);
			window.open(this.helpUrl, "_blank");
		},

		/**
		 * Resizes the pane.
		 * @param {Object} e
		 * @param {Object} linkNode
		 * @param {Object} iconNode
		 * @private
		 */
		_resizePane: function(e, linkNode, iconNode) {
			if(this._maximized) {
				this.restorePane();
				this._maximized = false;
				dojo_html.attr(iconNode, "alt", this.res.altMaximize);
				dojo_html.attr(linkNode, "title", this.res.titleMaximize);
				dojo_html.toggleClass(iconNode, "idxMaximizeIcon", true);
				dojo_html.toggleClass(iconNode, "idxRestoreIcon", false);
			} else {
				this.maximizePane();
				this._maximized = true;
				dojo_html.attr(iconNode, "alt", this.res.altRestore);
				dojo_html.attr(linkNode, "title", this.res.titleRestore);
				dojo_html.toggleClass(iconNode, "idxMaximizeIcon", false);
				dojo_html.toggleClass(iconNode, "idxRestoreIcon", true);
			}
			dojo_event.stop(e);
		},

		/**
		 * Callback to be called when maximized.
		 */
		maximizePane: function() {
			
		},

		/**
		 * Callback to be called when restored.
		 */
		restorePane: function() {
			
		},

		/**
		 * Handles setting title node.
		 * @param {String} name
		 * @parem {Object} value
		 */
		set: function(name, value) {
			/**
			 * Override default behavior
			 */
			// Will be updated
			if(name == "title" && typeof(value) == "object") {
				this._setTitleNode(value);
			} else {
				this.inherited(arguments);
			}
		},

		/**
		 * Sets title node.
		 * @param {Object} node
		 * @private
		 */
		_setTitleNode: function(node) {
			var ws = dijit_registry.findWidgets(this.titleNode);
			for(w in ws) {
				if(ws[w].destroy) {
					ws[w].destroy();
				}
			}
			this.titleNode.innerHTML = "";
			this.titleNode.appendChild(node);
		}
	}
);

}; // end of factory

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
	dojo.provide("idx.layout.ECMTitlePane");
	dojo.require("dijit.TitlePane");
	dojo.require("dojo.i18n");
	dojo.require("idx.resources");
	dojo.requireLocalization("idx","base");
	dojo.requireLocalization("idx.layout","base");
	dojo.requireLocalization("idx.layout","ECMTitlePane");
	var dojo_event = {stop: dojo.stopEvent};
	factory(dojo, dojo.declare, dojo, dojo, dojo_event, dojo.keys, dojo.i18n, dijit, dijit.TitlePane, idx.resources);
}else{
	define([
		"../../../node_modules/intern-geezer/node_modules/dojo/_base/kernel",
		"../../../../dist/lib/dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/_base/html",
		"dojo/_base/event",
		"dojo/keys",
		"dojo/i18n",
		"dijit/registry",
		"dijit/TitlePane",
		"idx/resources",
		"dojo/i18n!../nls/base",
		"dojo/i18n!./nls/base",
		"dojo/i18n!./nls/ECMTitlePane"
	], factory);
}

})();
