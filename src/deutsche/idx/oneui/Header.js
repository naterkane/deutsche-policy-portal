/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/array",
        "../../../../dist/lib/dojo/_base/declare",
		"dojo/_base/lang",
		"dojo/_base/window",
		"dojo/aspect",
		"dojo/dom-attr",
		"dojo/dom-class",
		"dojo/dom-construct",
		"dojo/dom-style",
		"dojo/i18n",
		"dojo/keys",
		"dojo/string",
		"dijit/_base/popup",
		"dijit/place",
		"dijit/registry",
		"dijit/_Widget",
		"dijit/_TemplatedMixin",
		"dojo/i18n!./nls/Header" ],
        function(_array,
		         declare,
				 _lang,
				 _window,
				 aspect,
				 domattr,
				 domclass,
				 domconstruct,
				 domstyle,
				 i18n,
				 keys,
				 string,
				 popup,
				 place,
				 registry,
				 _Widget,
				 _TemplatedMixin){
		
	// ensure we're not relying on the old globals, ready for 2.0
	var dojo = {}, dijit = {};
	
	// these widgets will be loaded later if needed
	var Button = function(){ log.error("dijit/form/Button has been used without being loaded"); }
	var TextBox = function(){ log.error("dijit/form/TextBox has been used without being loaded"); }
	var MenuTabController = function(){ log.error("idx/oneui/layout/MenuTabController has been used without being loaded"); }

	var prepareMenu = function(menu, cssclasses, trigger, around, trailing){
		// prepare a menu or menu bar to be presented from the One UI header widget.
		//
		// if cssclasses (array of strings) is specified, the open logic of the
		// menu is overridden to ensure that if it is used as a popup then there
		// is an outer wrapper DIV element always in place carrying the specified
		// CSS class and containing the popup DOM elements. The menu is recursively
		// processed to ensure this is true of all cascaded/popup menu items
		// within the menu. Successive elements of the array are applied to each
		// successive level of cascaded menu, and the last element is applied to 
		// all subsequent cascade levels.
		//
		// if trigger (DOM Node) is specified, the menu is assumed to be a popup
		// or cascaded menu, and is bound to the trigger.
		//
		// if around (DOM Node) is specified, the open logic of the popup is
		// overridden to position the popup to that node.
		
		if(cssclasses){
			if(cssclasses[0]){
				aspect.after(menu, "onOpen", function(){
					if(menu._popupWrapper){
						if(!menu._oneuiWrapper){
							// Create another wrapper <div> for our outermost oneui marker class.
							menu._oneuiWrapper = domconstruct.create("div", { "class": "idxHeaderContainer " + cssclasses[0] }, _window.body());

							aspect.after(menu, "destroy", function(){
								domconstruct.destroy(menu._oneuiWrapper);
								delete menu._oneuiWrapper;
							});
						}
						
						menu._oneuiWrapper.appendChild(menu._popupWrapper);
					}
				});
			}
			
			var nextcssclasses = (cssclasses.length > 1) ? cssclasses.slice(1) : cssclasses;
			_array.forEach(menu.getChildren(), function(child){
				if(child.popup){				
					prepareMenu(child.popup, nextcssclasses);
				}
				if(child.currentPage){
					domclass.add(child.domNode, "idxHeaderNavCurrentPage");
				}
			});
		}
		
		if(around){
			var _around = around;
			menu._scheduleOpen = function(/*DomNode?*/ target, /*DomNode?*/ iframe, /*Object?*/ coords){
				if(!this._openTimer){
					var ltr = menu.isLeftToRight(),
						where = place.around(//placeOnScreenAroundElement(
							popup._createWrapper(menu),
							_around,
							/*(menu.isLeftToRight() == (trailing ? false : true)) ? 
								{'BL':'TL', 'BR':'TR', 'TL':'BL', 'TR':'BR'} :
								{'BR':'TR', 'BL':'TL', 'TR':'BR', 'TL':'BL'},*/
							trailing ?
								[ "below-alt", "below", "above-alt", "above" ] : 
								[ "below", "below-alt", "above", "above-alt" ],
							ltr,
							menu.orient ? _lang.hitch(menu, "orient") : null);
						
					if(!ltr){
						where.x = where.x + where.w;
					}
					
					this._openTimer = setTimeout(_lang.hitch(this, function(){
						delete this._openTimer;
						this._openMyself({
							target: target,
							iframe: iframe,
							coords: where
						});
					}), 1);
				}
			}

			menu.leftClickToOpen = true;
		
			if(trigger){
				menu.bindDomNode(trigger);
			}
		}
	}
	
	/**
	 * Creates a new idx.oneui.Header
	 * @name idx.oneui.Header
	 * @class The Header widget generates the HTML and CSS to provide an
	 * IBM One UI header according to the design specification and templates.
	 * <p>
	 * To construct a header, initialise the widget with the required
	 * properties. The appropriate HTML and CSS is created immediately, and
	 * subsidiary dijit components may be created and marshalled. No dynamic
	 * layout is performed: once the HTML has been injected into the DOM,
	 * all layout is delegated to the renderer and associated CSS rules.
	 * </p>
	 * @augments dijit._Widget
	 * @augments dijit._TemplatedMixin
	 * @example
	 * var hdr = new idx.oneui.Header({ primaryTitle: "Hello" }, "myHeader");
	 */
	declare("idx.oneui.Header", [_Widget, _TemplatedMixin], 
	/** @lends idx.oneui.Header.prototype */
	{
		/**
		 * The IBM Brand/product name.
		 * @type string
		 */
		primaryTitle: "",
		
		/**
		 * The desired style of primary (black) banner: "thick" or "thin".
		 * @type string
		 * @default "thin"
		 */
		primaryBannerType: "thin",
		
		/**
		 * A menu bar, which can contain items and popup menu items, which
		 * will be displayed as navigation actions/menus in the header. The
		 * menu bar may be supplied as an instance or by id or as a DOM node.
		 * @type string | dijit.MenuBar | DOMNode
		 */
		navigation: undefined,
		
		/**
		 * True (the default) if navigation menu items that have a popup
		 * menu associated with them are to show a drop-down arrow affordance.
		 * If false, drop-down arrows are not shown on navigation items.
		 * @type boolean
		 */
		showNavigationDropDownArrows: true,

		/**
		 * Specifies that a primary search box should be included in the
		 * header, and supplies the parameters for it. All the properties are
		 * optional:
		 * <ul>
		 * <li>
		 * entryPrompt: {string | function} A string containing the prompt
		 * text for entering the search terms, or a function (which will be
		 * called with no arguments) which returns the prompt text.
		 * </li>
		 * <li>
		 * submitPrompt: {string | function} A string containing the prompt
		 * text for submitting the search, or a function (which will be called
		 * with no arguments) which returns the prompt text.
		 * </li>
		 * <li>onChange: {function} A function which will be called whenever
		 * the text in the search box changes. The function will receive one
		 * argument, which is the text currently in the search box.
		 * </li>
		 * <li>
		 * onSubmit: {function} A function which will be called whenever
		 * the user submits a search (eg, by pressing enter, or activating a
		 * search affordance). The function will receive one argument, which
		 * is the text currently in the search box.
		 * </li>
		 * </ul>
		 * @type Object
		 */
		primarySearch: undefined,
		
		/**
		 * The identity of the user to be included in the header. All
		 * properties are optional.
		 * <ul>
		 * <li>
		 * displayName: {string | function} A string containing the displayable
		 * name of the current user, or a function (which will be called with
		 * no arguments) which returns the displayable name of the current
		 * user. The displayable name may include mark-up (for example,
		 * entities for accented characters, etc). A displayName should always
		 * be supplied whenever feedback of the user's identity is required.
		 * The displayName can be modified after construction by setting the
		 * "userDisplayName" property of the header.
		 * Examples: "Clark, D. J. (Dave)"
		 * </li>
		 * <li>
		 * displayImage: {string | Object | function} A string containing the
		 * URI of an image to be displayed alongside the user name or welcome
		 * message, or an HTML image object (or other suitable mark-up object)
		 * to be used as the image alongside the user name or welcome message,
		 * or a function (which will be called with no arguments) which returns
		 * either a string or an object to specify the image to use. If omitted,
		 * null or undefined, no image is shown. The displayImage can be
		 * modified after construction by setting the "userDisplayName" property
		 * of the header.
		 * </li>
		 * <li>
		 * messageName: {string | function} A string containing the displayable
		 * name of the current user as it should appear in the message shown
		 * in the header to confirm the user's identity, if that is different
		 * from the displayName (for example, a shortened or simplified form
		 * of the user's name might be used as the messageName). If messageName
		 * is not supplied, the displayName is used. Note that displayName
		 * should still be supplied as well as messageName, because although it
		 * is the messageName that is substituted into the message for display,
		 * the displayName is also added as alternative text/title to add clarity
		 * for the user. The messageName can be set or modified after construction
		 * by setting the "userMessageName" property of the header.
		 * Examples: "Dave", "No&euml;l"
		 * </li>
		 * <li>
		 * message: {string | function} A string containing the message to be
		 * shown in the header to confirm the current user's identity, or a
		 * function (which will be called with no arguments) which returns
		 * the message to be shown. The string pattern will have the following
		 * substitutions applied:
		 * 	<ul>
		 * 	<li>
		 * 	${messageName} - the message name of the current user, if supplied,
		 * 	othewise the display name is used, if supplied
		 * 	</li>
		 * 	<li>
		 * 	$(displayName} - the display name of the current user
		 * 	</li>
		 * 	</ul>
		 * The message may include mark-up (for example, entities for accented
		 * characters, etc). If message is not supplied, the message that is
		 * used is "${messageName}". The message can be set or modified after
		 * construction by setting the "userMessage" property of the header.
		 * Examples: "Welcome back, ${messageName}",
		 * "Welcome, new user"
		 * </li>
		 * <li>
		 * actions: {string | dijit.Menu | dijit.MenuItem} A dijit.Menu to be
		 * used as the popup of available actions for the current user. If a
		 * single dijit.MenuItem is supplied, the current user name will be
		 * presented as a simple action and onClick will be triggered on the
		 * menu item when that action is selected. The menu or item may be
		 * supplied as an instance or by id.
		 * </li>
		 * </ul>
		 * @type Object
		 */
		user: undefined,
		
		/**
		 * True (the default) if a drop-down arrow affordance is to be shown
		 * on the user identification when a popup menu of user actions is supplied.
		 * If false, a drop-down arrow is not shown on the user identification.
		 * @type boolean
		 */
		showUserDropDownArrow: true,

		/**
		 * A dijit.Menu to be used as the popup of available site settings
		 * actions. If a single dijit.MenuItem is supplied, a simple site
		 * settings action will be presented and onClick will be triggered on
		 * the menu item when that action is selected.
		 * @type dijit.Menu | dijit.MenuItem
		 */
		settings: undefined,
	
		/**
		 * True (the default) if a drop-down arrow affordance is to be shown on the
		 * site settings icon when a popup menu of site settings items is supplied.
		 * If false, a drop-down arrow is not shown on the site settings icon.
		 * @type boolean
		 */
		showSettingsDropDownArrow: true,

		/**
		 * A dijit.Menu to be used as the popup of available site help actions. 
		 * If a single dijit.MenuItem is supplied, a simple site help action
		 * will be presented and onClick will be triggered on the menu item when
		 * that action is selected.
		 * @type dijit.MenuBarItem | dijit.MenuBarPopupItem
		 */
		help: undefined,
	
		/**
		 * True (the default) if a drop-down arrow affordance is to be shown on the
		 * site help icon when a popup menu of site help items is supplied.
		 * If false, a drop-down arrow is not shown on the site help icon.
		 * @type boolean
		 */
		showHelpDropDownArrow: true,

		/**
		 * The context title which shows users where they are, for example
		 * if they have arrived here by selecting a menu item.
		 * @type string
		 */
		secondaryTitle: "",
		
		/**
		 * The desired style of secondary (context) banner: "blue" or "lightgrey".
		 * @default "blue"
		 * @type string
		 */
		secondaryBannerType: "blue",
		
		/**
		 * A subtitle which gives additional context information.
		 * @type string
		 */
		secondarySubtitle: "",
		
		/**
		 * Text containing additional context information, such as when page
		 * content was last updated and by whom.
		 * @type string
		 */
		additionalContext: "",

		/**
		 * An array of objects defining actions which will be displayed as
		 * action buttons in the context part of the header. Each object
		 * must contain the following properties:
		 * <ul>
		 * <li>
		 * label: text label for the action
		 * </li>
		 * <li>
		 * onClick: click handler for the action button
		 * </li>
		 * </ul>
		 * @type Object[]
		 */
		actions: undefined,
		
		/**
		 * The id of a content container which is to be controlled by tabs
		 * included in the header, or the widget itself. Each ContentPane in
		 * the StackContainer may additionally include the following properties
		 * (all optional):
		 * <ul>
		 * <li>
		 * closable: {boolean} If true, a close affordance will be displayed on
		 * the corresponding tab and will close the content pane when activated.
		 * If false, or if this property is not set, no close affordance is shown.
		 * </li>
		 * <li>
		 * actions: {dijit.Menu} A menu of items to be presented when the
		 * drop-down affordance on the tab is activated. The drop-down
		 * affordance will be displayed on the tab if this property is set and
		 * either the tab is selected or alwaysShowMenu is true.
		 * </li>
		 * <li>
		 * alwaysShowMenu: {boolean} If true, a drop-down affordance will be
		 * displayed on the tab if the actions property has been set,
		 * regardless of whether the tab is currently selected. If false, a
		 * drop-down affordance will only be displayed on the tab if the
		 * actions property has been set AND the tab is currently selected.
		 * </li>
		 * </ul>
		 * @type string | dijit.StackContainer
		 */
		contentContainer: "",
		
		/**
		 * If true, content tabs will be placed on the same line as a context
		 * title and/or other secondary banner content. If false, the tabs will
		 * occupy their own row within the secondary banner. The default value is false.
		 * @type boolean
		 */
		contentTabsInline: false,
		
		/**
		 * Specifies that a secondary search box should be included in the
		 * header, and supplies the parameters for it. All the properties are
		 * optional:
		 * <ul>
		 * <li>
		 * entryPrompt: {string | function} A string containing the prompt text
		 * for entering the search terms, or a function (which will be called
		 * with no arguments) which returns the prompt text.
		 * </li>
		 * <li>
		 * submitPrompt: {string | function} A string containing the prompt
		 * text for submitting the search, or a function (which will be called
		 * with no arguments) which returns the prompt text.
		 * </li>
		 * <li>
		 * onChange: {function} A function which will be called whenever the
		 * text in the search box changes. The function will receive one
		 * argument, which is the text currently in the search box.
		 * </li>
		 * <li>
		 * onSubmit: {function} A function which will be called whenever user
		 * submits a search (eg, by pressing enter, or activating a 
		 * search affordance). The function will receive one argument, which
		 * is the text currently in the search box.
		 * </li>
		 * </ul>
		 * @type Object
		 */
		secondarySearch: undefined,
		
		/**
		 * Specifies the desired layout mode, which can be "fixed" for a
		 * fixed-width layout independent of the browser width (extra space
		 * will be left at the side margins, and a scroll bar will appear if
		 * the browser window is too narrow) or "variable" for a variable-width
		 * layout that exploits the full browser window width (extra space will
		 * be left within the layout, which will change as the browser window
		 * is resized). 
		 * @default "variable".
		 * @type string
		 */
		layoutType: "variable",
		
		// The following properties (read-only) can be used to obtain the DOM
		// nodes of key elements of the constructed UI. These properties will
		// not be defined unless the corresponding UI element is used/required.
		//
		// Container nodes:
		//  domNode: outer containing DOM node
		//  primaryBannerNode: container (div) for all primary banner content
		//  navigationNode: contains a menu bar of navigation action items
		//  userNode: contains the user identity and actions display
		//  secondaryBannerNode: container (div) for all secondary banner content
		//
		// Widget and content nodes:
		//  primaryTitleTextNode: contains primary title text/markup
		//  userTextNode: contains user identity text/markup
		//  primarySearchTextNode: the text field for primary search
		//  primarySearchButtonNode: the submit button for primary search
		//  secondaryTitleTextNode: contains secondary title text/markup
		//  secondarySubtitleTextNode: contains secondary subtitle text/markup
		//  contextActionNodes: array of action button nodes
		//  contentControllerNode: the content controller (tab bar)
		//  secondarySearchTextNode: the text field for secondary search
		//  secondarySearchButtonNode: the submit button for secondary search
		//  
		// Other nodes used internally:
		//  _mainContainerNode: container for the primary and secondary banners
		//  _globalActionsNode: container for all global actions
		//  _secondaryTitleSeparatorNode: text separating secondary title and subtitle
		//  _contextActionsNode: container for all context actions
		//
		/**
	 	 * The template HTML for the widget.
		 * @constant
		 * @type string
		 * @private
		 */
		templateString: '<div>' +
		                '<div dojoAttachPoint="_mainContainerNode">' +
						'</div>' +
						'</div>',

		/**
		 * Return the user identity display name, calling supplied functions
		 * where applicable.
		 * @private
		 */		
		_getComputedUserName: function(){
			return (this.user && (typeof this.user.displayName == "function")) ? this.user.displayName() : (this.user.displayName || "");
		},
		
		/**
		 * Return the user identity display image, calling supplied functions
		 * where applicable.
		 * @private
		 */		
		_getComputedUserImage: function(){
			return (this.user && (typeof this.user.displayImage == "function")) ? this.user.displayImage() : this.user.displayImage;
		},
		
		/**
		 * Return the user identity message, taking into account any custom
		 * message template and calling supplied functions where applicable.
		 * @private
		 */		
		_getComputedUserMessage: function(){
			// name to use in message: if no message name, use display name
			var displayname = this._getComputedUserName(),
				messagename = ((typeof this.user.messageName == "function") ? this.user.messageName() : this.user.messageName) || displayname,
				result = messagename;
			
			if(this.user && this.user.message){
				var message = (typeof this.user.message == "function") ? this.user.message() : this.user.message;
				
				result = string.substitute(message, this.user, function(value, key){
					switch(key){
						case "messageName": return messagename;
						case "displayName": return displayname;
						default: return value || "";
					}
				});
			}
			
			return result;
		},
		
		_setUserDisplayNameAttr: function(value){
			this.user = this.user || {};
			this.user.displayName = value;
			this._refreshUser();
		},
		
		_setUserDisplayImageAttr: function(value){
			this.user = this.user || {};
			this.user.displayImage = value;
			this._refreshUser();
		},
		
		_setUserMessageNameAttr: function(value){
			this.user = this.user || {};
			this.user.messageName = value;
			this._refreshUser();
		},
		
		_setUserMessageAttr: function(value){
			this.user = this.user || {};
			this.user.message = value;
			this._refreshUser();
		},
		
		_refreshUser: function(){
			var name = this._getComputedUserName(),
				imgsrc = this._getComputedUserImage(),
				msg = this._getComputedUserMessage();
				
			domattr.set(this.userNode, "title", name);
			domattr.set(this.userImageNode, "alt", name);
			
			domattr.set(this.userImageNode, "src", imgsrc || "");
			domstyle.set(this.userImageNode, "display", imgsrc ? "block" : "none");
			
			this.userTextNode.innerHTML = msg;
			domclass.replace(this.userNode, msg ? "idxHeaderUserName" : "idxHeaderUserNameNoText", "idxHeaderUserName idxHeaderUserNameNoText");
		},
		
		/**
		 * Construct UI from a template, injecting the resulting DOM items
		 * as children on of the supplied container node.
		 * @param {Object} containerNode
		 * @param {Object} templateString
		 */
		_injectTemplate: function(containerNode, templateString){
			
			// this code is generalised from _Templated.buildRendering

			// Look up cached version of template, or download to cache.
			var cached = _TemplatedMixin.getCachedTemplate(templateString, true);

			var node;
			if(_lang.isString(cached)){
				// if the cache returned a string, it contains replacement parameters,
				// so replace them and create DOM
				node = domconstruct.toDom(this._stringRepl(cached));
			}else{
				// if the cache returned a node, all we have to do is clone it
				node = cached.cloneNode(true);
			}

			// recurse through the node, looking for, and attaching to, our
			// attachment points and events, which should be defined on the template node.
			this._attachTemplateNodes(node, function(n,p){ return n.getAttribute(p); });
			
			// append resolved template as child of container
			containerNode.appendChild(node);
		},

		/**
		 * Standard widget lifecycle postMixInProperties() method.
		 * @private
		 */
		postMixInProperties: function(){
			this._nls = i18n.getLocalization("idx.oneui", "Header");
		
			if(this.primarySearch){
				this.primarySearch = _lang.mixin({
					entryPrompt: this._nls.searchEntry,
					submitPrompt: this._nls.searchSubmit
				}, this.primarySearch);
			}

			if(this.secondarySearch){
				this.secondarySearch = _lang.mixin({
					entryPrompt: this._nls.searchEntry,
					submitPrompt: this._nls.searchSubmit
				}, this.secondarySearch);
			}
		},
		
		/**
		 * Standard widget lifecycle buildRendering() method.
		 * @private
		 */
		buildRendering: function(){
			// summary:
			//     Generate the HTML and CSS for the header.

			// call down to apply the template and base widget handling
			this.inherited(arguments);
			
			// The following logic allocates all header items into either a
			// primary or a secondary banner, both of which are optional.
			//
			// The primary banner will accommodate:
			//  - primary title (if any)
			//  - navigation links/menus (if any)
			//  - search (if any, and if there's room)
			//  - user identity (if any)
			// The search will only be accommodated if at least one of the
			// other items is omitted; if a primary title, navigation
			// links/menus and user identity are all provided then the search
			// (if required) will be placed into the secondary banner.
			//
			// The primary banner will place the primary title at the top left
			// and the user identity at the top right. The navigation
			// links/menus and search will be placed between them, flowing onto
			// a second line if necessary.
			//
			// The secondary banner will accommodate:
			//  - secondary title (if any)
			//  - action links/menus (if any)
			//  - content controller (if any)
			//  - search (if any, and if not accommodated in primary banner)
			//
			// The secondary banner will place the secondary title at the top
			// left and the search at the top right. The action links/menus and
			// content controller will be placed between them, flowing onto a
			// second line if necessary.
			// 
			// Other layout schemes (eg for mobile) will require separate logic
			// not yet provided here.
			
			// First issue warnings for situations that may not be intended.
			if(this.contentContainer && this.secondaryBannerType && this.secondaryBannerType.toLowerCase() == "white"){
				// content tabs in "white" style are not supported
				require.log('*** Warning: Header will not display content tabs when secondaryBannerType is "white". Specify a different type to see content tabs.');
			}
			
			var show_primary_title = this.primaryTitle,
				show_primary_logo = true,
				show_primary_help = this.help,
				show_primary_settings = this.settings,
				show_primary_user = this.user,
				show_primary_navigation = this.navigation,
				show_primary_search = this.primarySearch,
			    show_secondary_title = this.secondaryTitle || this.secondarySubtitle,
			    show_secondary_actions = this.contextActions,
			    show_secondary_search = this.secondarySearch,
			    show_content = this.contentContainer && (!this.secondaryBannerType || (this.secondaryBannerType.toLowerCase() != "white")),  // never show content tabs in "white" style (not supported)
				show_secondary_content = show_content && (this.contentTabsInline || !show_secondary_title),
				show_secondary_border = this.secondaryBannerType && (this.secondaryBannerType.toLowerCase() == "white"),
				show_tertiary_content = show_content && !show_secondary_content,
			    show_primary_items = show_primary_title || show_primary_logo || show_primary_help || show_primary_settings || show_primary_user || show_primary_navigation || show_primary_search,  
			    show_secondary_items = show_secondary_title || show_secondary_actions || show_secondary_search || show_secondary_content,
				show_tertiary_items = show_tertiary_content,
				show_lip;
			
			if(show_primary_items || show_secondary_items || show_tertiary_items){
				domclass.add(this.domNode, "idxHeaderContainer");
				
				if(this.primaryBannerType && (this.primaryBannerType.toLowerCase() == "thick")){
					domclass.add(this._mainContainerNode, "idxHeaderPrimaryThick");
				}else{
					domclass.add(this._mainContainerNode, "idxHeaderPrimaryThin");
				}
				
				if(this.secondaryBannerType && ((this.secondaryBannerType.toLowerCase() == "lightgrey") || (this.secondaryBannerType.toLowerCase() == "lightgray"))){
					domclass.add(this._mainContainerNode, "idxHeaderSecondaryGray");
					domclass.add(this._mainContainerNode, show_tertiary_items ? "idxHeaderSecondaryGrayDoubleRow" : "idxHeaderSecondaryGraySingleRow");
					show_lip = show_primary_items;
				}else if(this.secondaryBannerType && (this.secondaryBannerType.toLowerCase() == "white")){
					domclass.add(this._mainContainerNode, "idxHeaderSecondaryWhite");
					domclass.add(this._mainContainerNode, show_tertiary_items ? "idxHeaderSecondaryWhiteDoubleRow" : "idxHeaderSecondaryWhiteSingleRow");
					show_lip = show_primary_items;
				}else{
					domclass.add(this._mainContainerNode, "idxHeaderSecondaryBlue");
					domclass.add(this._mainContainerNode, (show_tertiary_items) ? "idxHeaderSecondaryBlueDoubleRow" : "idxHeaderSecondaryBlueSingleRow");
					show_lip = show_primary_items && !show_secondary_items && !show_tertiary_items;
				}
				domclass.add(this._mainContainerNode, show_tertiary_items ? "idxHeaderSecondaryDoubleRow" : "idxHeaderSecondarySingleRow");
				
				if(this.layoutType && (this.layoutType.toLowerCase() == "fixed")){
					domclass.add(this._mainContainerNode, "idxHeaderWidthFixed");
				}else{
					domclass.add(this._mainContainerNode, "idxHeaderWidthLiquid");
				}				
			}
			
			// now load any additional modules we know we need
			var modules = [],
			    assigns = [],
				me = this;
			
			if(show_primary_search || show_secondary_search || show_secondary_actions){
				modules.push("dijit/form/Button");
				assigns.push(function(obj){ Button = obj; });
			}
			
			if(show_primary_search || show_secondary_search){
				modules.push("dijit/form/TextBox");
				assigns.push(function(obj){ TextBox = obj; });
			}
			
			if(show_content){
				modules.push("idx/oneui/layout/MenuTabController");
				assigns.push(function(obj){ MenuTabController = obj; });
			}
			
			require(modules, function(){
			
				for(var i=0; i<assigns.length; i++){
					assigns[i](arguments[i]);
				}
			
				// create the primary bar
				
				if(show_primary_items){
					me._injectTemplate(me._mainContainerNode,
										 '<div class="idxHeaderPrimary">' +
										 '<div class="idxHeaderPrimaryInner" dojoAttachPoint="primaryBannerNode">' +
										 '<ul dojoAttachPoint="_globalActionsNode">' +
										 '</ul>' +
										 '</div>' +
										 '</div>');
				}
				
				if(show_primary_title){
					me._renderPrimaryTitle(me._globalActionsNode);
				}
				
				if(show_primary_logo){
					me._renderLogo(me._globalActionsNode);
				}
				
				if(show_primary_help){
					me._renderHelp(me._globalActionsNode, show_primary_settings || show_primary_user);
				}
				
				if(show_primary_settings){
					me._renderSettings(me._globalActionsNode, show_primary_user);
				}
				
				if(show_primary_user){
					me._renderUser(me._globalActionsNode);
				}
				
				if(show_primary_search){
					me._renderPrimarySearch(me._globalActionsNode);
				}			
				
				if(show_primary_navigation){
					me._renderNavigation(me.primaryBannerNode);
				}
				
				// create the blue lip
				
				if(show_lip){
					me._injectTemplate(me._mainContainerNode,
										 '<div class="idxHeaderBlueLip">' + 
										 '</div>');
				}
				
				// create the secondary bar
				
				if(show_secondary_items){
					me._injectTemplate(me._mainContainerNode,
										 '<div class="idxHeaderSecondary"> ' +
										 '<div class="idxHeaderSecondaryInner" dojoAttachPoint="secondaryBannerNode">' + 
										 '</div>' + 
										 '</div>');
				}
				
				if(show_secondary_search){
					me._renderSecondarySearch(me.secondaryBannerNode);
				}			

				if(show_secondary_title){
					me._renderSecondaryTitle(me.secondaryBannerNode);
				}
				
				if(show_secondary_content){
					me._renderContent(me.secondaryBannerNode, false);
				}

				if(show_secondary_actions){
					me._renderContextActions(me.secondaryBannerNode);
				}
				
				if(show_secondary_border){
					me._renderSecondaryInnerBorder(me.secondaryBannerNode);
				}
				
				// create the tertiary bar
				
				if(show_tertiary_content){
					me._renderContent(me._mainContainerNode, true);
				}
			});
		},
		
		_renderPrimaryTitle: function(domNode){
			this._injectTemplate(domNode,
			         			 '<li>' +
			         			 '<span>' +
			         			 '<div class="idxHeaderPrimaryTitle">' +
			         			 '${primaryTitle}' +
			         			 '</div>' +
			         			 '</span>' +
			         			 '</li>'); 
		},
		
		_renderLogo: function(domNode){
			this._injectTemplate(domNode,
			         			 '<li class="idxHeaderPrimaryAction end">' +
			         			 '<span>' +
			         			 '<div class="idxHeaderLogoBox">' +
			         			 '<div class="idxHeaderLogo" alt="${_nls.ibmlogo}">' +
			         			 '</div>' +
			         			 '</div>' +
			         			 '</span>' +
			         			 '</li>'); 
		},
		
		_renderHelp: function(domNode, addSeparator){
			this._injectTemplate(domNode,
			         			 '<li class="idxHeaderPrimaryAction idxHeaderHelp">' +
			         			 '<span dojoAttachPoint="_helpNode" alt="${_nls.actionHelp}" title="${_nls.actionHelp}">' +
									 '<span class="idxHeaderHelpIcon">' +
									 '</span>' +
							         '<span class="idxHeaderDropDownArrow">' +
							         '</span>' +
			         			 '</span>' +
			         			 '</li>');
			
			if(addSeparator){
				this._injectTemplate(domNode,
				                     '<li class="idxHeaderPrimaryAction idxHeaderSeparator"><span></span></li>');
			}

			if(this.help){
				this.help = registry.byId(this.help);
				prepareMenu(this.help, [ "oneuiHeaderGlobalActionsMenu", "oneuiHeaderGlobalActionsSubmenu" ], this._helpNode, this._helpNode, true);
				domclass.toggle(this._helpNode, "idxHeaderDropDown", this.showHelpDropDownArrow);
			}
		},
		
		_renderSettings: function(domNode, addSeparator){
			this._injectTemplate(domNode,
			         			 '<li class="idxHeaderPrimaryAction idxHeaderTools">' +
			         			 '<span dojoAttachPoint="_settingsNode" alt="${_nls.actionShare}" title="${_nls.actionShare}">' +
									 '<span class="idxHeaderShareIcon">' +
									 '</span>' +
							         '<span class="idxHeaderDropDownArrow">' +
							         '</span>' +
			         			 '</span>' +
			         			 '</li>'); 
			
			if(addSeparator){
				this._injectTemplate(domNode,
				                     '<li class="idxHeaderPrimaryAction idxHeaderSeparator"><span></span></li>');
			}

			if(this.settings){
				this.settings = registry.byId(this.settings);
				prepareMenu(this.settings, [ "oneuiHeaderGlobalActionsMenu", "oneuiHeaderGlobalActionsSubmenu" ], this._settingsNode, this._settingsNode, true);
				domclass.toggle(this._settingsNode, "idxHeaderDropDown", this.showSettingsDropDownArrow);
			}
		},
		
		_renderUser: function(domNode){
			this._injectTemplate(domNode,
			                     '<li class="idxHeaderPrimaryAction">' + 
									'<span dojoAttachPoint="userNode" class="idxHeaderUserNameNoText">' +
										'<span class="idxHeaderUserIcon">' +
											'<img dojoAttachPoint="userImageNode" class="idxHeaderUserIcon" />' +
										'</span>' +
										'<span class="idxHeaderUserText" dojoAttachPoint="userTextNode">' +
										'</span>' +
								        '<span class="idxHeaderDropDownArrow">' +
								        '</span>' +
									'</span>' +
			                     '</li>');			                     
			
			this._refreshUser();

			if(this.user.actions){
				this.user.actions = registry.byId(this.user.actions);
				prepareMenu(this.user.actions, [ "oneuiHeaderGlobalActionsMenu", "oneuiHeaderGlobalActionsSubmenu" ], this.userNode, this.userNode, true);
				domclass.toggle(this.userNode, "idxHeaderDropDown", this.showUserDropDownArrow);
			}
		},
		
		_renderNavigation: function(domNode){
			this.navigation = ((typeof this.navigation == "object") && ('nodeType' in this.navigation)) ? registry.byNode(this.navigation) : registry.byId(this.navigation);
			
			if(!this.navigation){
				require.log("WARNING: navigation widget not found");
			}else{
				this.navigation.placeAt(domNode);
				this.navigation.startup();
				
				var children = this.navigation.getChildren();
				if((children.length == 1) && (children[0].label == "")){
					// if there is just a single menu bar item with no text, make it a "home" icon
					domclass.toggle(children[0].containerNode, "idxHeaderNavigationHome", true);
				}else if(this.showNavigationDropDownArrows){
					for(var i = 0; i < children.length; i++){
						if(children[i].popup){
							this._injectTemplate(children[i].focusNode, '<span class="idxHeaderDropDownArrow"></span>'); 
							domclass.toggle(children[i].domNode, "idxHeaderDropDown", true);
						}
					}
				}
				
				// remove whitespace-only text nodes in the menu-bar, as these
				// can disrupt precise layout of the menu items
				var node = this.navigation.domNode.firstChild, del;
				while(node){
					del = node;
					node = node.nextSibling;
					if((del.nodeType == 3) && (!del.nodeValue.match(/\S/))){
						this.navigation.domNode.removeChild(del);
					}
				}
				
				prepareMenu(this.navigation, [null, "oneuiHeaderNavigationMenu", "oneuiHeaderNavigationSubmenu"]);
			}
		},
		
		_renderPrimarySearch: function(domNode){
			this._injectTemplate(domNode,
			                     '<li role="search" class="idxHeaderSearchContainer">' +
			                     '<input type="text" dojoAttachPoint="primarySearchTextNode" />' + 
			                     '<input type="image" dojoAttachPoint="primarySearchButtonNode" />' +
			                     '</li>');
								 
			this.primarySearch.onChange = _lang.isFunction(this.primarySearch.onChange) ? this.primarySearch.onChange : new Function("value", this.primarySearch.onChange);
			this.primarySearch.onSubmit = _lang.isFunction(this.primarySearch.onSubmit) ? this.primarySearch.onSubmit : new Function("value", this.primarySearch.onSubmit);
			
			var me = this;
			
			var text = new TextBox({
				trim: true,
				placeHolder: this.primarySearch.entryPrompt,
				intermediateChanges: true,
				title: this.primarySearch.entryPrompt,
				onChange: function(){ me._onPrimarySearchChange(text.attr("value")); },
				onKeyUp: function(event){ if(event.keyCode == keys.ENTER){ me._onPrimarySearchSubmit(text.attr("value")); } }
			},
			this.primarySearchTextNode);
			
			new Button({
				label: this.primarySearch.submitPrompt,
				showLabel: false,
				iconClass: "idxHeaderSearchButton",
				onClick: function(){ me._onPrimarySearchSubmit(text.attr("value")); }				
			},
			this.primarySearchButtonNode);
		},
		
		_renderSecondaryTitle: function(domNode){
			this._injectTemplate(domNode,
			                     '<span class="idxHeaderSecondaryTitleContainer">' +
								 '<span class="idxHeaderSecondaryTitle" dojoAttachPoint="secondaryTitleTextNode">' +
			                     '${secondaryTitle}' +
			                     '</span>' +
			                     '<span class="idxHeaderSecondarySubtitle" dojoAttachPoint="_secondaryTitleSeparatorNode">' +
			                     '&nbsp;&ndash;&nbsp;' +
			                     '</span>' +
			                     '<span class="idxHeaderSecondarySubtitle" dojoAttachPoint="secondarySubtitleTextNode">' +
			                     '${secondarySubtitle}' +
			                     '</span>' +
								 '&nbsp;&nbsp;' +
			                     '<span class="idxHeaderSecondaryAdditionalContext" dojoAttachPoint="additionalContextTextNode">' +
			                     '${additionalContext}' +
			                     '</span>' +
								 '</span>');
								 
			domstyle.set(this._secondaryTitleSeparatorNode, "display", (this.secondaryTitle && this.secondarySubtitle) ? "" : "none");
		},
		
		_renderContextActions: function(domNode){
			this._injectTemplate(domNode,
			                     '<div class="idxHeaderSecondaryActions" dojoAttachPoint="_contextActionsNode"></div>');
			this.contextActionNodes = [];
			
			for(var i=0; i<this.contextActions.length; i++){
				this._injectTemplate(this._contextActionsNode,
									 '<button type="button" dojoAttachPoint="_nextActionNode"></button>');
				new Button(this.contextActions[i], this._nextActionNode);
				this.contextActionNodes.push(this._nextActionNode);
				delete this._nextActionNode;
			}
		},
		
		_renderSecondarySearch: function(domNode){
			this._injectTemplate(domNode,
			                     '<div role="search" class="idxHeaderSearchContainer">' +
			                     '<input type="text" dojoAttachPoint="secondarySearchTextNode" />' + 
			                     '<input type="image" dojoAttachPoint="secondarySearchButtonNode" />' +
			                     '</div>');
			
			this.secondarySearch.onChange = _lang.isFunction(this.secondarySearch.onChange) ? this.secondarySearch.onChange : new Function("value", this.secondarySearch.onChange);
			this.secondarySearch.onSubmit = _lang.isFunction(this.secondarySearch.onSubmit) ? this.secondarySearch.onSubmit : new Function("value", this.secondarySearch.onSubmit);
			
			var me = this;
			
			var text = new TextBox({
				trim: true,
				placeHolder: this.secondarySearch.entryPrompt,
				intermediateChanges: true,
				title: this.secondarySearch.entryPrompt,
				onChange: function(){ me._onSecondarySearchChange(text.attr("value")); },
				onKeyUp: function(event){ if(event.keyCode == keys.ENTER){ me._onSecondarySearchSubmit(text.attr("value")); } }
			},
			this.secondarySearchTextNode);
			
			new Button({
				label: this.secondarySearch.submitPrompt,
				showLabel: false,
				iconClass: "idxHeaderSearchButton",
				onClick: function(){ me._onSecondarySearchSubmit(text.attr("value")); }				
			},
			this.secondarySearchButtonNode)
		},
		
		_renderSecondaryInnerBorder: function(domNode){
			this._injectTemplate(domNode,
			                     '<div role="presentation" class="idxHeaderSecondaryInnerBorder">' +
			                     '</div>');
		},
		
		_renderContent: function(domNode, includeInnerDiv){
			this._injectTemplate(domNode,
			                     '<div class="oneuiContentContainer">' +
								 (includeInnerDiv ? '<div class="oneuiContentContainerInner">' : '') +
			                     '<div dojoAttachPoint="contentControllerNode"></div>' +
								 (includeInnerDiv ? '</div>' : '') +
			                     '</div>');	
			
			var controller = new MenuTabController({
				containerId: (typeof this.contentContainer === "string") ? this.contentContainer : this.contentContainer.id,
				"class": "dijitTabContainerTop-tabs",
				useMenu: this._tabMenu,
				useSlider: this._tabSlider,
				buttonWidget: _lang.extend(idx.oneui.layout._PopupTabButton, { tabDropDownText: "", tabSeparatorText: "|" })
			},
			this.contentControllerNode);
			
			prepareMenu(controller._menuBtn, [ "oneuiHeader2ndLevMenu", "oneuiHeader2ndLevSubmenu" ]);
			aspect.after(controller, "_bindPopup", function(page, tabNode, popupNode, popup){
				prepareMenu(popup, [ "oneuiHeader2ndLevMenu", "oneuiHeader2ndLevSubmenu" ], popupNode, tabNode);
			}, true);
			
			controller.startup();
				
			// if the content container is already started, ensure the controller initialises correctly
			var container = registry.byId(this.contentContainer);
			if(container && container._started){
				controller.onStartup({ children: container.getChildren(), selected: container.selectedChildWidget });
			}
		},
		
		_onPrimarySearchChange: function(value){
			this.primarySearch.onChange(value);
		},
		
		_onPrimarySearchSubmit: function(value){
			this.primarySearch.onSubmit(value);
		},
		
		_onSecondarySearchChange: function(value){
			this.secondarySearch.onChange(value);
		},
		
		_onSecondarySearchSubmit: function(value){
			this.secondarySearch.onSubmit(value);
		}
		
	});
	
	return idx.oneui.Header;
		
});
