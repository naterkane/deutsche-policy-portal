/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */


(function() {
function factory(dDeclare,			// (dojo/_base/declare)
		         dWidget,			// (dijit/_Widget)
		         dTemplated,		// (dijit/_Templated)
		         dLang,				// (dojo/_base/lang)
		         dString,			// (dojo/string)
		         dConnect,			// (dojo/_base/connect)
		         dEvent,			// (dojo/_base/event) (for dEvent.stop)
		         dDom,				// (dojo/dom)
		         dDomAttr,			// (dojo/dom-attr) (for dDomAttr.get/set)
		         dDomConstruct,		// (dojo/dom-construct)
		         dijitMgr,			// (dijit/_base/manager)
		         dijitFocus,		// (dijit/focus)
		         dijitA11y,			// (dijit/a11y)
		         dStackContainer,	// (dijit/layout/StackContainer)
		         iString,			// (idx/string)
		         iUtil,				// (idx/util)
		         iResources,		// (idx/resources)
		         templateText)	    // (dojo/text!./templates/A11yPrologue.html)
{
	/**
	 * Provides a hidden-from-view prologue for accessibility.  Other widgets
	 * interface with this widget when it exist on the page as a direct child 
	 * of the "body" tag. 
	 */
	return dDeclare("idx.app.A11yPrologue", [dWidget,dTemplated],
	/**@lends idx.app.A11yPrologue#*/	
{
	/**
	 * The access key for jumping to the accessibility prologue.
	 * @type String
	 * @default '0'
	 */
	prologueAccessKey: "0",
	
	/**
	 * The URL to the application's accessibility statement so this can be
	 * launched in a new window.
	 */
	a11yStatementURL: "",
	
	/**
	 * If the a11yStatementURL is set, then this is the access key to use to 
	 * activate the link to take the user to the accessibility statement.
	 * @type String
	 * @default '1'
	 */
	a11yStatementAccessKey: "1",
	
	/**
	 * Set this value to a non-empty string ID or node to register the node 
	 * for jumping to the main content area with the Acccessibility Prologue.
	 * If this is left as empty-string then the widget will not provide information 
	 * on how to quickly access the main content area.
	 * 
	 * @type String|node
	 * @default ""
	 */
	mainNode: "",
	
	/**
	 * If the mainNode is set, then this is the access key to use to 
	 * activate the link that jumps the user to the main content area.
	 * @type String
	 * @default 'm'
	 */
	mainAccessKey: '2',
	
	/**
	 * Set this value to a non-empty string ID or node to register the node 
	 * for jumping to the navigation area with the Acccessibility Prologue.
	 * If this is left as empty-string then the widget will not provide information 
	 * on how to quickly access the navigation area.
	 * 
	 * @type String|node
	 * @default ""
	 */
	navigationNode: "",
	
	/**
	 * If the navigationNode is set, then this is the access key to use to 
	 * activate the link that jumps the user to the navigation content area.
	 * @type String
	 * @default 'n'
	 */
	navigationAccessKey: '3',
	
	/**
	 * Set this value to a non-empty string ID or node to register the node 
	 * for jumping to the banner area with the Acccessibility Prologue.
	 * If this is left as empty-string then the widget will not provide information 
	 * on how to quickly access the banner area.
	 * 
	 * @type String|node
	 * @default ""
	 */
	bannerNode: "",
	
	/**
	 * If the bannerNode is set, then this is the access key to use to 
	 * activate the link that jumps the user to the banner content area.
	 * @type String
	 * @default 'b'
	 */
	bannerAccessKey: '4',	
	
	/**
	 * Set this to true to open external links in their own window, and
	 * false to have external links replace the current window.  The new
	 * window names are consistent for each shortcut. 
	 * @type boolean
	 * @default true 
	 */
	externalLinksInOwnWindow: true,
	
	/**
   	 * Overrides of the base CSS class.
   	 * This string is used by the template, and gets inserted into
   	 * template to create the CSS class names for this widget.
   	 * @private
   	 * @constant
   	 * @type String
   	 * @default "idxAppFrame"
   	 */
	baseClass: "idxA11yPrologue",

	/**
 	 * The widget template text for the dijit._Templated base class.
 	 * @constant
 	 * @type String
 	 * @private
 	 * 
 	 */
	templateString: templateText,
	
	/**
 	 * Constant to indicate if there is an HTML file with this widget
     *
 	 * @private
 	 * @constant
 	 * @type boolean
 	 * @default false
 	 */
	widgetsInTemplate: false,
  
	/**
	 * The resources to use for obtaining the labels for each of the properties.
	 * The resources that are used by this are:
	 *    - TBD 1
	 *    - TBD 2
	 *    - TBD 3
	 *    
	 * @type Object
	 * @default null
	 */
	resources: null,
  
	/**
	 * Constructor
	 * Handles the reading any attributes passed via markup.
	 * @param {Object} args
	 * @param {Object} node
	 */
	constructor: function(args, node) {
		this.domNode = node;
		this.ctorArgs = args;
		this._nextNodeID = 0;
		this._nextShortcutID = 0;
		this._mainNode = null;
		this._navigationNode = null;
		this._bannerNode = null;
		this._shortcutsByID = new Array();
		this._shortcuts = new Array();
		this._magicNumber = Math.floor(Math.random() * 1000000);
	},

	/**
	  * Overrides dijit._Widget.postMixInProperties() to ensure
	  * that the resources are reset.
	  * @see dijit._Widget.postMixInProperties
	  */
	postMixInProperties: function() {
	    this.inherited(arguments);
	    if (! this._rawResources) {
	      this._rawResources = null;
	      this._resetResources();
	    }
	},

	/**
	 * 
	 */
	_getKeySequenceMessage: function(accessKey) {
		if (! accessKey) return null;
		var messageFormat = "${accessKey}";
		if (iUtil.isIE) {
			messageFormat = this._resources.keySequence_InternetExplorer;
		} else if (iUtil.isFF) {
			messageFormat= this._resources.keySequence_Firefox;
		} else if (iUtil.isSafari) {
			messageFormat = this._resources.keySequence_Safari;
		} else if (iUtil.isChrome) {
			messageFormat = this._resources.keySequence_Chrome;
		}

		var result = dString.substitute(messageFormat, {accessKey: accessKey.toUpperCase()});
		return result;
	},
	
	/**
	 * Private method that sets the resources attribute with the
	 * specified value and if the state is started, calls
	 * the reset resources method.
	 * @param {Object} value
	 * @private
	 */
	_setResourcesAttr: function(/*Object*/ value) {
		this.resources = value;
		this._resetResources();
	},	
	
	/**
	 * Private method to get the resources attribute.
	 * @returns {Object} value
	 * @private
	 */
	_getResourcesAttr: function() {
	    return this._resources;
	},

	/**
	 * Private method that sets the default resources
	 * and if the state is started, calls reformat.
	 * @private
	 */
	_resetResources: function() {
		var defaultResources 
	      = iResources.getResources("idx/app/A11yPrologue", this.lang);

	    // determine if custom resources were specified and if so override 
	    // the defaults as needed, otherwise use the defaults as-is
	    if (this.resources) {
	      var combinedResources = new Object();
	      dLang.mixin(combinedResources, defaultResources);
	      dLang.mixin(combinedResources, this.resources);
	      this._resources = combinedResources;

	    } else {
	      this._resources = defaultResources;
	    }
	    if (this._started) this._reformat();
	},

	/**
	 * 
	 */
	_reformat: function() {
		if (this.shortcutListMsgNode) {
			this.shortcutListMsgNode.innerHTML = this._resources.shortcutListMessage;
		}
		this._setupLinks();
		this._setupShortcuts();
	},
	
	/**
	 * Called at startup to create an idx.border.BorderLayout
	 * given the input arguments.
	 */
	startup: function() {
		if(this._started){ return; }

		this.inherited(arguments);

		// connect to resize events from contained BorderContainer
		this._started = true;
		
		// ensure the dom node has an ID
		var myID = dDomAttr.get(this.domNode, "id");
		if (! iString.nullTrim(myID)) {
			dDomAttr.set(this.domNode, "id", this.id);
		}
		
		// reformat everything
		this._resetResources();
	},

	/**
	 * 
	 */
	addShortcut: function(target, description, accessKey) {
		var targetType = iUtil.typeOfObject(target);
		var node = null;
		if (targetType == "string") {
			node = dDom.byId(target);
			if (node) target = node;
		} else {
			node = target;
		}
		if ((node) && (!accessKey)) {
			accessKey = this._getExistingAccessKey(node);
		}
		var shortcutID = this.id + "_shortcut_" + this._nextShortcutID++;
		
		var shortcut = {
				shortcutID: shortcutID,
				target: target,
				accessKey: accessKey,
				description: description
		};

		this._shortcuts.push(shortcut);
		this._shortcutsByID[shortcutID] = shortcut;
		
		shortcut.itemNode = this._setupShortcut(
				shortcut.target,
				shortcut.accessKey,
				shortcut.description,
				null,
				this._prologueShortcut,
				"before",
				shortcut.shortcutID);
		
		return shortcutID;
	},
	
	/**
	 * 
	 */
	removeShortcut: function(shortcutID) {
		var foundShortcut = this._shortcutsByID[shortcutID]; 
		if (! foundShortcut) return;
		
		var foundIndex = -1;
		for (var index = 0; index < this._shortcuts.length; index++) {
			var shortcut = this._shortcuts[index];
			if (shortcut.shortcutID == shortcutID) {
				foundIndex = index;
				break;
			}
		}

		// cleanup the arrays
		if (foundIndex >= 0) {
			this._shortcuts.splice(foundIndex, 1);
		}
		this._shortcutsByID[shortcutID] = null;
		
		// remove the list
		shortcut.itemNode = this._setupShortcut(
				null,
				shortcut.accessKey,
				shortcut.description,
				shortcut.itemNode,
				this._prologueShortcut,
				"before",
				shortcut.shortcutID);
		
	},
	
  	/**
	 * 
	 */
	_setA11yStatementURLAttr: function(url) {
		this.a11yStatementURL = url;
		this._setupStatementShortcut();
	},
	
  	/**
	 * 
	 */
	_setA11yStatementAccessKeyAttr: function(key) {
		this.a11yStatementAccessKey = key;
		this._setupStatementShortcut();
	},
	
  	/**
	 * 
	 */
	_setMainAccessKeyAttr: function(key) {
		this.mainAccessKey = key;
		this._setupMainLink();
		this._setupMainShortcut();
	},
	
	/**
	 * 
	 */
	_setNavigationAccessKeyAttr: function(key) {
		this.navigationAccessKey = key;
		this._setupNavigationLink();
		this._setupNavigationShortcut();
	},
	
	/**
	 * 
	 */
	_setBannerAccessKeyAttr: function(key) {
		this.bannerAccessKey = key;
		this._setupBannerLink();
		this._setupBannerShortcut();
	},
	
	/**
	 * 
	 */
	_generateNodeID: function() {
		var random = Math.floor(Math.random()*1000000001);
		return this.id + "_id_" + random + "_" + (this._nextNodeID++);		
	},
	
	/**
	 * 
	 */
	_resolveNode: function(nodeOrID) {
		var node = null;
		var nodeID = null;
		var paramType = iUtil.typeOfObject(nodeOrID);
		if (paramType == "string") {
			nodeID = nodeOrID;
			if (! iString.nullTrim(nodeID)) {
				return null;
			}
			node = dDom.byId(nodeID);
			if (! node) {
				throw new Error("Could not find node for ID: " + nodeID);
			}
		} else {
			// set the node
			node = nodeOrID;
			
			// get the node ID
			nodeID = node.id;
			if (! iString.nullTrim(nodeID)) {
				nodeID = this._generateNodeID();
				dDomAttr.set(node, "id", nodeID);
			}
		}
		
		var result = { node: node, nodeID: nodeID };
		
		// check for a widget
		if (node) {
			// check if we need to substitute the focus node for a widget
			var widget = dijitMgr.getEnclosingWidget(node);
			if (widget && (widget.domNode == node)) { 
				result.widget = widget;
			}
		}
		
		// return the result
		return result;
	},
	
	/**
	 * Attempts to focus the node by the given node ID.
	 * Returns true if the caller should further attempt to
	 * achieve focus or if the link should be followed.
	 */
	_focusNode: function(nodeID,event) {
		// check if parameter is null
		if (!nodeID) return true;
		
		// attempt to get the node
		var node = null;
		if (nodeID instanceof dWidget) {
			node = nodeID.domNode;
			if (node) nodeID = node.id;
		} else if (iUtil.typeOfObject(nodeID) != "string") {
			node = nodeID;
			nodeID = node.id;
		} else {
			node = dDom.byId(nodeID);
			if (!node) {
				// just in case it is a widget ID
				var widget = dijitMgr.byId(nodeID);
				if (widget) {
					node = widget.domNode;
					if (node) nodeID = node.id;
				}
			}
		} 
		// if no node, then return true
		if (!node) return true;
		
		// attempt to focus the node
		dijitFocus.focus(node);
		
		// return whether or not the node was
		// tab navigable (if not try further focus)
		var result = (! dijitA11y.isTabNavigable(node));
		if (!result && event) dEvent.stop(event);
		return result;
	},

	/**
	 * Attempts to focus the widget by the given widget ID.
	 * Returns true if the caller should further attempt to
	 * achieve focus or if the link should be followed.
	 */
	_focusWidget: function(widgetID,event) {
		if (!widgetID) return true;
		
		// attempt to get the widget
		var widget = null;
		if (widgetID instanceof dWidget) {
			widget = widgetID;
			widgetID = widget.get("id");
		} else {
			if (iUtil.typeOfObject(widgetID) == "string") {
				widget = dijitMgr.byId(widgetID);
			}
			if (! widget) {
				// attempt to get a node instead
				var node = widgetID;
				if (iUtil.typeOfObject(widgetID) == "string") {
					node = dDom.byId(widgetID);
				
					// if not a widget or node, return false
					if (event) dEvent.stop(event);
					if (!node) return false;
				}
				
				// get the enclosing widget for the node
				widget = dijitMgr.getEnclosingWidget(node);
			
				// check if no widget was found, or the node
				// is a child node of the widget, rather than the domNode
				if ((!widget) || (widget.domNode != node)) {
					// if this is case, try to focus the node instead
					var result = this._focusNode(widgetID);
					if (!result && event) dEvent.stop(event);
					return result;
				}
			}
			
			// get the widget ID
			widgetID = widget.get("id");
		} 

		// check if we have a stack container (special case for IE)
		if (widget instanceof dStackContainer) {
			// work around stack container problem with internet explorer
			var child = widget.get("selectedChildWidget");
			if ((child) && (child.domNode)) {
				var result = this._focusWidget(child.domNode);
				if (!result && event) dEvent.stop(event);
				return result;
			}
		}
		
		// check if the widget is focusable
		if (! widget.isFocusable()) {
			// if not then focus its node
			var result = this._focusNode(widget.domNode);
			if (!result && event) dEvent.stop(event);
			return result;
		}
		
		// check if the widget has a focus method
		if (widget.focus) {
			// call the widget's focus method
			widget.focus();
			if (event) dEvent.stop(event);
			return false;
		}
		
		// check if the widget has a focus node
		if (widget.focusNode) {
			// focus the widgets focus node
			this._focusNode(widget.focusNode);
			if (event) dEvent.stop(event);
			return false;
		}
		
		// otherwise focus the widget's dom node
		this._focusNode(widget.domNode);
		if (event) dEvent.stop(event);
		return false;
	},	

	/**
	 * 
	 */
	_setMainNodeAttr: function(nodeOrID) {
		var nodeAndID = this._resolveNode(nodeOrID);
		if (nodeAndID) {
			this._mainNode = nodeAndID.node;
			this.mainNode = nodeOrID;
			var accessKey = dDomAttr.get(this._mainNode, "accessKey");
			if (iString.nullTrim(accessKey)) {
				this.set("mainAccessKey", iString.nullTrim(accessKey));		
			}
		} else {
			this.mainNode = nodeOrID;
			this._mainNode = null;
		}
		this._setupMainLink();
		this._setupMainShortcut();
	},
	
	/**
	 * 
	 */
	_setNavigationNodeAttr: function(nodeOrID) {
		var nodeAndID = this._resolveNode(nodeOrID);
		if (nodeAndID) {
			this._navigationNode = nodeAndID.node;
			this.navigationNode = nodeOrID;
			var accessKey = dDomAttr.get(this._navigationNode, "accessKey");
			if (iString.nullTrim(accessKey)) {
				this.set("navigationAccessKey", iString.nullTrim(accessKey));		
			}
		} else {
			this.navigationNode = nodeOrID;
			this._navigationNode = null;
		}
		this._setupNavigationLink();
		this._setupNavigationShortcut();
	},
	
	/**
	 * 
	 */
	_setBannerNodeAttr: function(nodeOrID) {
		var nodeAndID = this._resolveNode(nodeOrID);
		if (nodeAndID) {
			this._bannerNode = nodeAndID.node;
			this.bannerNode = nodeOrID;
			var accessKey = dDomAttr.get(this._bannerNode, "accessKey");
			if (iString.nullTrim(accessKey)) {
				this.set("bannerAccessKey", iString.nullTrim(accessKey));		
			}
		} else {
			this.bannerNode = nodeOrID;
			this._bannerNode = null;
		}
		this._setupBannerLink();
		this._setupBannerShortcut();
	},
	
	/**
	 * 
	 */
	_setupLinks: function() {	
		this._setupMainLink();
		this._setupNavigationLink();
		this._setupBannerLink();
	},
  
	/**
	 * 
	 */
	_setupShortcuts: function() {
		this._setupPrologueShortcut();
		this._setupStatementShortcut();
		this._setupMainShortcut();
		this._setupNavigationShortcut();
		this._setupBannerShortcut();
		
		for (var index = 0; index < this._shortcuts; index++) {
			var shortcut = this._shortcuts[index];
			
			this._setupShortcut(shortcut.target,
								shortcut.accessKey,
								shortcut.description,
								shortcut.itemNode,
								this._prologueShortcut,
								"before",
								shortcut.shortcutID);
		}
	},
  
	/**
	 * 
	 */
	_getExistingAccessKey: function(node){
		// check if the node has an access key (not all node types are allowed this)
		var existKey = dDomAttr.get(node, "accessKey");
		
		// if so, return it
		if (iString.nullTrim(existKey)) return existKey;
		
		// check if the node is the dom node for a widget, if not return null
		var widget = dijitMgr.getEnclosingWidget(node);
		if (! widget) return null;
		if (widget.domNode != node) return null;
		
		// check if the widget has a "focusNode"
		if (!widget.focusNode) return null;
		
		// check if the "focusNode" has an "accessKey", if so use it
		existKey = dDomAttr.get(widget.focusNode, "accessKey");
		
		// return the access key
		return existKey;
	},
	
	/**
	 * 
	 */
	_setupLink: function(targetNode, accessKey, description, linkNode, refNode, pos) {
		if (! this._started) return;
		if (targetNode) {
			var resolvedNode = this._resolveNode(targetNode);
			
			if (! linkNode) {
				// create the link
				linkNode = dDomConstruct.create("DIV");
				dDomConstruct.place(linkNode, refNode, pos);
			}
			
			var location = resolvedNode.nodeID;
			var accessKeyAttr = "";
			var existKey = this._getExistingAccessKey(targetNode);
			if (iString.nullTrim(accessKey) && (accessKey != iString.nullTrim(existKey))) {
				accessKeyAttr = " accessKey='" + accessKey + "'";
			}
			var clickHandler  = null;
			if (resolvedNode.widget) {
				clickHandler = dLang.hitch(this, "_focusWidget", location);
			} else {
				clickHandler = dLang.hitch(this, "_focusNode", location);
			}

			var nodeID = this._generateNodeID();
			
			var innerHTML = dString.substitute(
					this._resources.skipToLocationMessage,
				{
					nodeID: nodeID,
					location: location,
					accessKeyAttr: accessKeyAttr,
					description: description
				}
			);
			
			linkNode.innerHTML = innerHTML;

			var clickableNode = dDom.byId(nodeID);
			if (clickableNode) dConnect.connect(clickableNode, "onclick", clickHandler);

		} else {
			if (linkNode) {
				dDomConstruct.destroy(linkNode);
				linkNode = null;
			}
		}
		return linkNode;
	},

	/**
	 * 
	 */
	_setupShortcut: function(target, accessKey, description, itemNode, refNode, pos, shortcutID) {
		if (! this._started) return;		
		if (target) {
			if (! itemNode) {
				// create the item
				itemNode = dDomConstruct.create("LI");
				dDomConstruct.place(itemNode, refNode, pos);
			}
			var targetType = iUtil.typeOfObject(target);
			var shortcutType = (targetType == "string") ? "external" : "internal";
			var primaryShortcut = ((target != null)
					&& ((target == this._mainNode)
						|| (target == this._navigationNode)
						|| (target == this._bannerNode)));

			var keyComponent = ((iString.nullTrim(accessKey)) ? "Key" : "");
			var resourceKey = "shortcut" + keyComponent + "Message_" + shortcutType;
			var messageFormat = this._resources[resourceKey];
			var keySequence = this._getKeySequenceMessage(accessKey);
			var location = target;
			var clickHandler = null;
			var targetWindowAttr = "";
			if (targetType != "string") {
				var nodeAndID = this._resolveNode(target);
				location = nodeAndID.nodeID;
				if (nodeAndID.widget) {
					clickHandler = dLang.hitch(this, "_focusWidget", location);
				} else {
					clickHandler = dLang.hitch(this, "_focusNode", location);
				}
			} else {
				var windowName = "_blank";
				if (shortcutID) {
					windowName = shortcutID + "_" + this._magicNumber;
				}
				targetWindowAttr="target='" + windowName + "'";
			}
			var accessKeyAttr = "";
			if (iString.nullTrim(accessKey)) {
				if (targetType == "string") {
					if (iString.nullTrim(accessKey)) {
						accessKeyAttr = " accessKey='" + accessKey + "'";
					}
				} else {
					var existKey = this._getExistingAccessKey(target);
					if ((!primaryShortcut) && (accessKey != iString.nullTrim(existKey))) {
						accessKeyAttr = " accessKey='" + accessKey + "'";
					}
				}
			}
			var nodeID = this._generateNodeID();
			
			var itemHTML = dString.substitute(
					messageFormat, 
				{
					nodeID: nodeID,
					keySequence: keySequence,
					location: location,
					accessKeyAttr: accessKeyAttr,
					targetWindowAttr: targetWindowAttr,
					description: description
				}
			);

			itemNode.innerHTML = itemHTML;
			
			var clickableNode = dDom.byId(nodeID);
			if ((clickableNode)&&(clickHandler)) dConnect.connect(clickableNode, "onclick", clickHandler);

			
		} else {
			if (itemNode) {
				dDomConstruct.destroy(itemNode);
				itemNode = null;
			}
		}
		return itemNode;
	},
	
	/**
	 * 
	 */
	_setupPrologueShortcut: function() {
		if (! this._started) return;
		this._prologueShortcut = this._setupShortcut(
				this.domNode,
				this.prologueAccessKey,
				this._resources.a11yPrologueLabel,
				this._prologueShortcut,
				this.shortcutListNode,
				"last",
				this.id + "_prologue");
	},
	
	/**
	 * 
	 */
	_setupStatementShortcut: function() {
		if (! this._started) return;
		this._stmtShortcut = this._setupShortcut(
				this.a11yStatementURL,
				this.a11yStatementAccessKey,
				this._resources.a11yStatementLabel,
				this._stmtShortcut,
				this.shortcutListNode,
				"first",
				this.id + "_a11yStatement" );
	},
  
	/**
	 * 
	 */
	_setupMainLink: function() {
		if (! this._started) return;
		this._mainLink = this._setupLink(
				this._mainNode,
				this.mainAccessKey,
				this._resources.a11yMainContentAreaName,
				this._mainLink,
				this.domNode,
				"first");
	},
  
	/**
	 * 
	 */
	_setupMainShortcut: function() {
		if (! this._started) return;
		var refNode = this._stmtShortcut;
		var pos = "after";
		if (! refNode) {
			refNode = this.shortcutListNode;
			pos = "first";
		}
		this._mainShortcut = this._setupShortcut(
				this._mainNode,
				this.mainAccessKey,
				this._resources.a11yMainContentAreaName,
				this._mainShortcut,
				refNode,
				pos,
				this.id + "_main");
	},

	/**
	 * 
	 */
	_setupNavigationLink: function() {
		if (! this._started) return;
		var refNode = this._mainLink;
		var pos = "after";
		if (! refNode) {
			refNode = this.domNode;
			pos = "first";
		}
		this._navigationLink = this._setupLink(
				this._navigationNode,
				this.navigationAccessKey,
				this._resources.a11yNavigationAreaName,
				this._navigationLink,
				refNode,
				pos);
	},
  
	/**
	 * 
	 */
	_setupNavigationShortcut: function() {
		if (! this._started) return;
		var refNode = this._mainShortcut;
		var pos = "after";
		if (! refNode) {
			refNode = this._stmtShortcut;
		}
		if (! refNode) {
			refNode = this.shortcutListNode;
			pos = "first";
		}
		this._navigationShortcut = this._setupShortcut(
				this._navigationNode,
				this.navigationAccessKey,
				this._resources.a11yNavigationAreaName,
				this._navigationShortcut,
				refNode,
				pos,
				this.id + "_nav");
	},
	
	/**
	 * 
	 */
	_setupBannerLink: function() {
		if (! this._started) return;
		this._bannerLink = this._setupLink(
				this._bannerNode,
				this.bannerAccessKey,
				this._resources.a11yBannerAreaName,
				this._bannerLink,
				this.shortcutListMsgNode,
				"before");
	},
  
  
	/**
	 * 
	 */
	_setupBannerShortcut: function() {
		if (! this._started) return;
		var refNode = this._navigationShortcut;
		var pos = "after";
		if (! refNode) {
			refNode = this._mainShortcut;
		}
		if (! refNode) {
			refNode = this._stmtShortcut;
		}
		if (! refNode) {
			refNode = this.shortcutListNode;
			pos = "first";
		}
		this._bannerShortcut = this._setupShortcut(
				this._bannerNode,
				this.bannerAccessKey,
				this._resources.a11yBannerAreaName,
				this._bannerShortcut,
				refNode,
				pos,
				this.id + "_banner");
	}
});
}
var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
	dojo.provide("idx.app.A11yPrologue");

	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.require("dijit.layout.StackContainer");
	dojo.require("idx.util");
	dojo.require("dojo.parser");
	dojo.require("dojo.string");
	dojo.require("dojo.i18n");
	dojo.require("idx.string");
	dojo.require("idx.resources");
	dojo.requireLocalization("idx","base");
	dojo.requireLocalization("idx.app","base");
	dojo.requireLocalization("idx.app","A11yPrologue");
	var templateText = dojo.cache("idx.app", "templates/A11yPrologue.html");

	factory(dojo.declare,						// dDeclare			(dojo/_base/declare)
			dijit._Widget,						// dWidget			(dijit/_Widget)
			dijit._Templated,					// dTemplated		(dijit/_Templated)
			dojo, 								// dLang   			(dojo/_base/lang)
			dojo.string, 						// dString 			(dojo/string)
			dojo, 								// dConnect			(dojo/_base/connect)
			{stop: dojo.stopEvent},				// dEvent			(dojo/_base/event) for (dEvent.stop)
			dojo, 								// dDom				(dojo/dom)
			{get: dojo.attr, set: dojo.attr},	// dDomAttr 		(dojo/dom-attr) for (dDomAttr.get/set) 
			dojo, 								// dDomConstruct	(dojo/dom-construct)
			dijit, 								// dijitMgr			(dijit/_base/manager)
			dijit,								// dijitFocus		(dijit/focus)
			dijit,								// dijitA11y,		(dijit/a11y)
			dijit.layout.StackContainer,		// dStackContainer  (dijit/layout/StackContainer)
			idx.string,							// iString			(idx/string)
			idx.util,							// iUtil			(idx/util) 
			idx.resources,						// iResources		(idx/resources)
			templateText);						// (dojo/text!./templates/A11yPrologue.html)

} else {
	define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	        "../../../lib/dijit/_Widget",
	        "dijit/_Templated",
	        "dojo/_base/lang",
	        "dojo/string",
	        "dojo/_base/connect",
	        "dojo/_base/event",
	        "dojo/dom",
	        "dojo/dom-attr",
	        "dojo/dom-construct",
	        "dijit/_base/manager",
	        "dijit/focus",
	        "dijit/a11y",
	        "dijit/layout/StackContainer",
	        "../string",
	        "../util",
	        "../resources",
	        "dojo/text!./templates/A11yPrologue.html",
	        "dojo/i18n!../nls/base",
	        "dojo/i18n!./nls/base",
	        "dojo/i18n!./nls/A11yPrologue"
	        ], factory);
}

})();

