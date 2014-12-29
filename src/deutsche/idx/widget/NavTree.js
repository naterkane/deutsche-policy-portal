/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

(function() {

	function factory(dDeclare,			// (dojo/_base/declare)
					 dKernel,			// (dojo/_base/kernel)
					 dLang,				// (dojo/_base/lang)
					 dConnect,			// (dojo/_base/connect)
					 dDomClass,			// (dojo/dom-class)
			  		 dTree, 			// (dijit/Tree)
			  		 iUtil,				// (../util)
			  		 iResources,		// (../resources)
			  		 iString,			// (../string)
			  		 iNavTreeModel,		// (./NavTreeModel)
					 templateText, 		// (dojo/text!./templates/NavTree.html)
					 nodeTemplateText)	// (dojo/text!./templates/NavTreeNode.html)
	{
		// determine the tree node base class (switch based on Dojo 1.6 versus Dojo 1.7)
		var dTreeNode = (dTree._TreeNode) ? dTree._TreeNode : dLang.getObject("dijit._TreeNode");
		
		/**
		 * @name idx.widget._NavTreeNode
		 * @class Provides the TreeNode implementation for idx.widget.NavTree.
 		 * @augments dijit.Tree
 		 */
		var iNavTreeNode = dDeclare("idx.widget._NavTreeNode",[dTreeNode],
			/** @lends idx.widget._NavTreeNode# */
		{
			/**
			 * Inherit the base class from the parent.
			 */
			baseClass: "dijitTreeNode",
			
			/**
			 * Override the base class.
			 */
			idxBaseClass: "idxNavTreeNode",
			
			/**
			 * The template string.
			 */
			templateString: nodeTemplateText,
			
			/**
			 * The badge label to display or empty-string or null for no badge label.
			 */
			badgeLabel: "",
						
			/**
			 * Handles update of the badge label.
			 */
			_setBadgeLabelAttr: function(value) {
				this.badgeLabel = value;
				var html = (value) ? value : "";
				this.badgeLabelNode.innerHTML = html; 
				if (iString.nullTrim(this.badgeLabel)) {
					dDomClass.remove(this.badgeNode, this.idxBaseClass + "NoBadgeLabel");
				} else {
					dDomClass.add(this.badgeNode, this.idxBaseClass + "NoBadgeLabel");
				}
			},
			
			/***
			 * Override to update the badge icon class as well. 
			 */
			_updateItemClasses: function(item) {
				this.inherited(arguments);

				// update the badge icon class
				var oldClass = this._badgeIconClass;
				this._badgeIconClass = this.tree.getBadgeIconClass(item, this.isExpanded);
				if (iString.nullTrim(oldClass)) {
					dDomClass.remove(this.badgeIconNode, oldClass);
					dDomClass.add(this.badgeNode, this.idxBaseClass + "NoBadgeIcon");
				}
				if (iString.nullTrim(this._badgeIconClass)) {
					dDomClass.remove(this.badgeNode, this.idxBaseClass + "NoBadgeIcon");
					dDomClass.add(this.badgeIconNode, this._badgeIconClass);
				} else {
					dDomClass.add(this.badgeNode, this.idxBaseClass + "NoBadgeIcon");
				}
			}
		});

		/**
 		 * @name idx.widget.NavTree
 		 * @class Widget for sidebar navigation via a tree control.
 		 * @augments dijit.Tree
 		 */
		var iNavTree = dDeclare("idx.widget.NavTree",[dTree], 
			/** @lends idx.widget.NavTree# */
		{
			/**
			 * Inherit the base class from the parent class.
			 */
			baseClass: "dijitTree",
			
			/**
			 * Override the base class.
			 */
			idxBaseClass: "idxNavTree",
			
			/**
			 * Indicate that the root of the tree should not be shown since our 
			 * navigation tree will have multiple roots. 
			 */
			showRoot: false,
			
			/**
			 * Sets the template string used by the navigation tree.
			 */
			templateString: templateText,

			/**
			 * Indicates whether or not to show icons adjacent to items.
			 */
			showIcons: false,
			
			/**
			 * Handles setting the approprirate CSS class on the DOM node. 
			 */
			_setShowIconsAttr: function(value) {
				this.showIcons = value;
				this._updateShowIconsClass();
			},
			
			/**
			 * Indicates whether or not to show badges. 
			 */
			showBadges: true,
			
			/**
			 * Handles setting the approprirate CSS class on the DOM node. 
			 */
			_setShowBadgesAttr: function(value) {
				this.showBadges = value;
				this._updateShowBadgesClass();
			},
			
			/**
			 * An associative map that maps the node/item type to the icon class to use for that type.
			 * Format of the specified object should be as follows:
			 * {
			 *   "type1": "iconClass1",
			 *   "type2": "iconClass2",
			 *   "type3": {leaf: "leafIconClass3", branch: "branchIconClass3"},
			 *   "type4": {leaf: "leafIconClass4", open: "openIconClass4", closed: "closedIconClass4"},
			 *   "type5": null
			 * }
			 * 
			 * The keys in the associative map take the form of the string type names while the values
			 * may either be simple strings indicating the icon class or an object representing different
			 * a "leaf" icon class and a "branch" icon class where the choice of which depends on whether
			 * or not the item has children.  Finally, the value may be null to indicate that no icon 
			 * should be used for that type.
			 */
			iconMap: null,
			
			/**
			 * Handles updating the icons of existing nodes when the iconMap is updated.
			 */
			_setIconMapAttr: function(value) {
				this.iconMap = value;
				if (! this._itemNodesMap) return;
				for (var itemID in this._itemNodesMap) {
					var nodes = this._itemNodesMap[itemID];
					if (!nodes) continue;
					for (var index = 0; index < nodes.length; index++) {
						var node = nodes[index];
						node._updateItemClasses(node.item);
					}
				}
			},

			/**
			 * An associative map that maps the string badge types to the icon class to use for that 
			 * badge type.  Format of the specified object should be as follows:
			 * {
			 *   "type1": "iconClass1",
			 *   "type2": "iconClass2",
			 *   "type3": {leaf: "leafIconClass3", branch: "branchIconClass3"},
			 *   "type4": {leaf: "leafIconClass4", open: "openIconClass4", closed: "closedIconClass4"},
			 *   "type4": null
			 * }
			 * 
			 * The keys in the associative map take the form of the string type badge names while the values
			 * may either be simple strings indicating the icon class or an object representing different
			 * a "leaf" badge icon class and a "branch" badge icon class where the choice of which depends
			 * on whether or not the item has children.  Finally, the value may be null to indicate that 
			 * no icon should be used for that badge type.
			 */
			badgeIconMap: null,

			/**
			 * Handles updating the icons of existing nodes when the badgeIconMap is updated.
			 */
			_setBadgeIconMapAttr: function(value) {
				this.badgeIconMap = value;
				if (! this._itemNodesMap) return;
				for (var itemID in this._itemNodesMap) {
					var nodes = this._itemNodesMap[itemID];
					if (!nodes) continue;
					for (var index = 0; index < nodes.length; index++) {
						var node = nodes[index];
						node._updateItemClasses(node.item);
					}
				}
			},

			/**
			 * Indiciates whether or not the selection should be highlighted.  If this is true then 
			 * "idxNavTreeHighlight" class is applied to the base node, otherwise "idxNavTreeNoHighlight"
			 * is applied.  Usuaully when the selection is not highlighted it is still indicated in some
			 * other way (e.g.: an adjacent dot and bold text). 
			 */
			highlightSelection: true,
			
			/**
			 * 
			 */
			_setHighlightSelectionAttr: function(value) {
				this.highlightSelection = value;
				this._updateHighlightSelectionClass();
			},
			
			/**
			 * Set this to true to use the item labels as the basis for "label" keys
			 * for looking up the labels to display in the tree items from resources.
			 * Set this to false to take all labels literally without attempting a
			 * resource lookup. 
			 */
			lookupItemLabels: true,
			
			/**
			 * Handles updating the labels when this property changes.
			 * @param value
			 * @returns
			 */
			_setLookupItemLabelsAttr: function(value) {
				var oldValue = this.lookupItemLabels;
				this.lookupItemLabels = value;
				
				if (this._started && (oldValue != value)) {
					for (var itemID in this._itemNodesMap) {
						var nodes = this._itemNodesMap[itemID];
						if (nodes) {
							for (var index = 0; index < nodes.length; index++) {
								var node = nodes[index];
								var item = node.get("item");
								var label = this.getLabel(item);
								node.set("label", label);
							}
						}
					}
				}
			},
			
			/**
			 * Set this to true to use the non-numeric badge labels as the basis for 
			 * "label" keys for looking up the labels to display in the tree items
			 * from resources.  Set this to false to take all labels literally without
			 * attempting a lookup.
			 */
			lookupBadgeLabels: true,
			
			/**
			 * Handles updating the badge labels when this property changes.
			 * @param value
			 * @returns
			 */
			_setLookupBadgeLabelsAttr: function(value) {
				var oldValue = this.lookupBadgeLabels;
				this.lookupBadgeLabels = value;
				
				if (this._started && (oldValue != value)) {
					for (var itemID in this._itemNodesMap) {
						var nodes = this._itemNodesMap[itemID];
						if (nodes) {
							for (var index = 0; index < nodes.length; index++) {
								var node = nodes[index];
								var item = node.get("item");
								var label = this.getBadgeLabel(item);
								node.set("badgeLabel", label);
							}
						}
					}
				}
			},
			
			/**
			 * Prefix to use for looking up labels for items in the specified resources.
			 * If this is not set then the value is obtained from idx.resources using the
			 * key "itemLabelKeyPrefix".
			 */
			itemLabelKeyPrefix: "",
			
			/**
			 * Suffix to use for looking up labels for items in the specified resources.
			 * If this is not set then the value is obtained from idx.resource using the
			 * key "badgeLabelKeySuffix".
			 */
			itemLabelKeySuffix: "",
			
			/**
			 * Prefix to use for looking up labels for items in the specified resources.
			 * If this is not set then the value is obtained from idx.resources using the
			 * key "badgeLabelKeyPrefix".
			 */
			badgeLabelKeyPrefix: "",
			
			/**
			 * Suffix to use for looking up labels for badges in the specified resources.
			 * If this is not set then the value is obtained from idx.resource using the
			 * key "badgeLabelKeySuffix".
			 * 
			 */
			badgeLabelKeySuffix: "",
			
			/**
			 * The resources for this instance.
			 */
			resources: null,
			
			/**
			 * Updates the CSS class related to highlighting the current selection.
			 */
			_updateHighlightSelectionClass: function() {
				if (this.highlightSelection) {
					dDomClass.remove(this.domNode, this.idxBaseClass + "NoHighlight");
				} else {
					dDomClass.add(this.domNode, this.idxBaseClass + "NoHighlight");
				}				
			},
			
			/**
			 * Updates the CSS class related to showing/hiding the icons.
			 */
			_updateShowIconsClass: function() {
				if (this.showIcons) {
					dDomClass.remove(this.domNode, this.idxBaseClass + "HideIcons");
				} else {
					dDomClass.add(this.domNode, this.idxBaseClass + "HideIcons");
				}				
			},
			
			/**
			 * Updates the CSS class related to showing/hiding the badges.
			 */
			_updateShowBadgesClass: function() {
				if (this.showBadges) {
					dDomClass.remove(this.domNode, this.idxBaseClass + "HideBadges");
				} else {
					dDomClass.add(this.domNode, this.idxBaseClass + "HideBadges");
				}				
			},
			
			/**
			 * Handles updating CSS classes for the top-level tree.
			 */
			_updateTopLevelClasses: function() {
				this._updateShowIconsClass();
				this._updateShowBadgesClass();
				this._updateHighlightSelectionClass();
			},
			
			/**
			 * 
			 */
			buildRendering: function() {
				this.inherited(arguments);
				this._updateTopLevelClasses();
			},
			
			/**
			 * Override to modify the "dndParams" to force "singular" selection behavior.
			 */
			postCreate: function() {
				this.inherited(arguments);
				var tree = this;
				
				this.dndController.singular = true;
				this.dndController._baseUserSelect = this.dndController.userSelect;
				this.dndController.userSelect = function(node, multi, range){
					if (! tree.model.isSelectable(node.item)) return;
					return this._baseUserSelect(node,multi,range);
				};
				this.dndController._baseSetSelection = this.dndController.setSelection;
				this.dndController.setSelection = function(nodeArray) {
					if (nodeArray.length > 1) return;
					if ((nodeArray.length == 1) && (! tree.model.isSelectable(nodeArray[0].item))) {
						// ignore attempts to select unselectable nodes
						return;
					}
					return this._baseSetSelection(nodeArray);
				};
				
				dConnect.connect(this.model, "onBadgesChanged", this, "_onBadgesChanged");
				dConnect.connect(this.model, "onSelectabilityChanged", this, "_onSelectabilityChanged");
			},
			
			/**
			 * Overrides dijit._Widget.postMixInProperties() to ensure
			 * that the dijit._Widget.attr() function is called for each
			 * property that was set.
			 * @see dijit._Widget.postMixInProperties
			 */
			postMixInProperties: function() {
				// nullify some fields that were not explicitly set
			    iUtil.nullify(this, this.params, 
			    		["itemLabelPrefix",
			    		 "itemLabelSuffix",
			    		 "badgeLabelPrefix",
			    		 "badgeLabelSuffix"]);
			    
			    this.inherited(arguments);
			    this._defaultResources 
			      = iResources.getResources("idx/widget/NavTree", this.lang);
			},
			
			/**
			 * Private worker. Resets resources
			 * by calling update methods for each.
			 * @param {Object} value
			 * @private
			 */
			_resetResources: function() {
			  this._updateItemLabels();
			  this._updateBadgeLabels();
			  this._updateBadgeIconLabels();
			},

			/**
			 * 
			 */
			_updateItemLabels: function() {
				// todo
			},
			
			/**
			 * 
			 */
			_updateBadgeLabels: function() {
				// todo
			},
			
			/**
			 * 
			 */
			_updateBadgeIconLabels: function() {
				// todo
			},
			
			/**
			 * Private convenience method to look up a resource
			 * @param {String} key in resource file
			 * @returns {String} result (message)
			 * @private
			 */
			_resourceLookup: function(key) {
			  var result = null;
			  if (this.resources) result = this.resources[key];
			  if (! result) result = this._defaultResources[key];
			  return result;
			},

			/**
			 * Private method that gets the prefix to use when building the item label key.
			 * @returns {String} item label key prefix
			 * @private
			 */
			_getItemLabelKeyPrefix : function() {
			  if (this.itemLabelKeyPrefix) return this.itemLabelKeyPrefix;
			  var prefix = this._resourceLookup("itemLabelKeyPrefix");
			  return (prefix) ? prefix : "";
			},
			

			/**
			 * Private method that gets the suffix to use when building the item label key.
			 * @returns {String} item label key suffix
			 * @private
			 */
			_getItemLabelKeySuffix : function() {
			  if (this.itemLabelKeySuffix) return this.itemLabelKeySuffix;
			  var suffix = this._resourceLookup("itemLabelKeySuffix");
			  return (suffix) ? suffix : "";
			},
			
			/**
			 * Private method that gets the prefix to use when building the item label key.
			 * @returns {String} item label key prefix
			 * @private
			 */
			_getBadgeLabelKeyPrefix : function() {
			  if (this.badgeLabelKeyPrefix) return this.badgeLabelKeyPrefix;
			  var prefix = this._resourceLookup("badgeLabelKeyPrefix");
			  return (prefix) ? prefix : "";
			},
			

			/**
			 * Private method that gets the suffix to use when building the badge label key.
			 * @returns {String} badge label key suffix
			 * @private
			 */
			_getBadgeLabelKeySuffix : function() {
			  if (this.badgeLabelKeySuffix) return this.badgeLabelKeySuffix;
			  var suffix = this._resourceLookup("badgeLabelKeySuffix");
			  return (suffix) ? suffix : "";
			},
			
			/**
			 * Override to try to use the label prefix/suffix. 
			 */
			getLabel: function(/*dojo.data.Item*/ item) {
				var baseLabel = this.inherited(arguments);
				if (!this.lookupItemLabels) return baseLabel;
				var prefix = this._getItemLabelKeyPrefix();
				var suffix = this._getItemLabelKeySuffix();
				var key = prefix + baseLabel + suffix;
				var result = this._resourceLookup(key);
				if (!result) return baseLabel;
				return result;
			},
			
			/**
			 * Obtains the badge label to use for the item. 
			 */
			getBadgeLabel: function(/*dojo.data.Item*/ item) {
				var badge = this.model.getBadge(item);
				if ((! badge) || ((!badge.label) && (!badge.iconType))) return "";
				var baseLabel = null;
				if (badge.label) {
					var badgeLabelType = iUtil.typeOfObject(badge.label);
					if (badgeLabelType == "number") return "" + badge.label; // todo locale-format numeric badges
					baseLabel = "" + badge.label;
				} else {
					baseLabel = "" + badge.iconType;
				}
				if (!this.lookupBadgeLabels) return baseLabel;
				var prefix = this._getBadgeLabelKeyPrefix();
				var suffix = this._getBadgeLabelKeySuffix();
				var key = prefix + baseLabel + suffix;
				var result = this._resourceLookup(key);
				if (!result) return baseLabel;
				return result;
			},
			
			/**
			 * Overridden to leverage the "iconMap" attribute and the item type classifications.
			 */
			getIconClass: function(/*dojo.data.Item*/ item, /*boolean*/ opened) {
				if (!item) return this.idxBaseClass + "HiddenIcon";
				var itemType = this.model.getItemType(item);
				if (!itemType) return this.inherited(arguments);
				
				// check for the item type in the icon map
				if ((this.iconMap) && (itemType in this.iconMap)) {
					var iconMapping = this.iconMap[itemType];
					if (!iconMapping) return this.idxBaseClass + "NoIcon";
					var objType = iUtil.typeOfObject(iconMapping);
					if (objType == "string") return iconMapping;
					var leafIcon = iconMapping.leaf ? iconMapping.leaf : "";
					var openIcon = iconMapping.open ? iconMapping.open 
									: (iconMapping.branch ? iconMapping.branch : "");
					var closedIcon = iconMapping.closed ? iconMapping.closed
							        : (iconMapping.branch ? iconMapping.branch : "");
						
					return (!item || this.model.mayHaveChildren(item)) 
							? (opened ? openIcon : closedIcon) : leafIcon;
				}
				
				// use default behavior
				return this.inherited(arguments);
			},

			/**
			 * Provides the badge icon class to use (if any).
			 */
			getBadgeIconClass: function(/*dojo.data.Item*/ item, /*boolean*/ opened) {
				if (!item) return null;
				var badge = this.model.getBadge(item);
				if ((!badge) || (!badge.iconType) 
				    || (!this.badgeIconMap) || (!this.badgeIconMap[badge.iconType])) return null;
				
				// get the icon mapping
				var iconMapping = this.badgeIconMap[badge.iconType];
				var objType = iUtil.typeOfObject(iconMapping);
				if (objType == "string") return iconMapping;
				var leafIcon = iconMapping.leaf ? iconMapping.leaf : "";
				var openIcon = iconMapping.open ? iconMapping.open 
								: (iconMapping.branch ? iconMapping.branch : "");
				var closedIcon = iconMapping.closed ? iconMapping.closed
						        : (iconMapping.branch ? iconMapping.branch : "");
					
				return (!item || this.model.mayHaveChildren(item)) 
						? (opened ? openIcon : closedIcon) : leafIcon;
			},

			/**
			 * 
			 */
			_createTreeNode: function(args) {
				var item = args.item;
				args.badgeLabel = this.getBadgeLabel(item);
				return new iNavTreeNode(args); 
			},

			/**
			 * Updates the badges for all the nodes.
			 */
			_onBadgesChanged: function() {
				for (var itemID in this._itemNodesMap) {
					var nodes = this._itemNodesMap[itemID];
					if ((nodes)&&(nodes.length>0)) {
						var item = nodes[0].get("item");
						var badgeLabel = this.getBadgeLabel(item);
						for (var index = 0; index < nodes.length; index++) {
							var node = nodes[index];
							node.set("badgeLabel", badgeLabel);
							node._updateItemClasses(node.item);
						}
					}
				}
			},
			
			/**
			 * Updates the selection if previously selected nodes are no longer selectable.
			 */
			_onSelectabilityChanged: function() {
				var nodes = this.dndController.getSelectedTreeNodes();
				if ((!nodes)||(nodes.length == 0)) return;
				var selectionChanged = false;
				for (var index = 0; index < nodes.length; index++) {
					var node = nodes[index];
					var item = node.get("item");
					var selectable = this.model.isSelectable(item);
					if (!selectable) {
						this.dndController.removeTreeNode(node);
						selectionChanged = true;
					}
				}
				if (selectionChanged) {
					this._onSelectionChanged();
				}
			},
			
			/**
			 * Overridden to handle updating the badge label.
			 * 
			 * @param item
			 * @returns
			 */
			_onItemChange: function(/*Item*/ item){
				this.inherited(arguments);
				var model = this.model,
					identity = model.getIdentity(item),
					nodes = this._itemNodesMap[identity];

				var selectable = this.model.isSelectable(item);
				var selectionChanged = false;
				if(nodes){
					var badgeLabel = this.getBadgeLabel(item);
					for (var index = 0; index < nodes.length; index++) {
						var node = nodes[index];
						node.set("badgeLabel", badgeLabel);
						if ((!selectable) && this.dndController.isTreeNodeSelected(node)) {
							this.dndController.removeTreeNode(node);
							selectionChanged = true;
						}
					}
				}
				if (selectionChanged) this._onSelectionChanged();
			},

			/**
			 * Override to use NavTreeModel.
			 */
			_store2model: function(){
				// summary:
				//		User specified a store&query rather than model, so create model from store/query
				this._v10Compat = true;
				dKernel.deprecated("Tree: from version 2.0, should specify a model object rather than a store/query");

				var modelParams = {
					id: this.id + "_NavTreeModel",
					store: this.store,
					query: this.query,
					childrenAttrs: this.childrenAttr
				};

				// Only override the model's mayHaveChildren() method if the user has specified an override
				if(this.params.mayHaveChildren){
					modelParams.mayHaveChildren = dLang.hitch(this, "mayHaveChildren");
				}

				if(this.params.getItemChildren){
					modelParams.getChildren = dLang.hitch(this, function(item, onComplete, onError){
						this.getItemChildren((this._v10Compat && item === this.model.root) ? null : item, onComplete, onError);
					});
				}
				this.model = new iNavTreeModel(modelParams);

				// For backwards compatibility, the visibility of the root node is controlled by
				// whether or not the user has specified a label
				this.showRoot = Boolean(this.label);
			},
			
			/**
			 * Override to trigger calling the "onSelectionChanged" function when a new node is selected.
			 */
			onClick: function(item,node,evt) {
				if (item) {
					if (this.model.isSelectable(item)) {
						this._onSelectionChanged(evt);
					} else {
						if (node.isExpandable) this._onExpandoClick({node:node});
					}
				}
			},
			
			/***
			 * Internal method to call when the selection changes to trigger
			 * a call to "onSelectionChanged".
			 */
			_onSelectionChanged: function(evt) {
				var nodes = this.dndController.getSelectedTreeNodes();
				var items = [];
				if (!nodes) nodes = [];
				for (var index = 0; index < nodes.length; index++) {
					var node = nodes[index];
					var item = node.get("item");
					items.push(item);
				}
				this.onSelectionChanged(items,nodes,this);
			},
			
			/**
			 * Called when the selection changes with an array of items that is paired
			 * with an array of nodes and a reference to the tree itself.  Typically
			 * the arrays have a single item in them for the NavTree.
			 */
			onSelectionChanged: function(items,nodes,tree) {
				
			},
			
			/**
			 * Pass-through method to the underlying NavTreeModel to request that it
			 * normalize the item for direct use.
			 * 
			 *  @param item The item to be normalized.
			 */
			normalizeItem: function(item) {
				return this.model.normalizeItem(item);
			} 
		});

		// provide a handle to the tree node
		iNavTree._NavTreeNode = iNavTreeNode;

		// return the module
		return iNavTree;
	}

	var version = (window["dojo"] && dojo.version);
	if(version && version.major == 1 && version.minor == 6){
		dojo.provide("idx.widget.NavTree");
		dojo.require("dijit.Tree");
		dojo.require("idx.util");
		dojo.require("idx.resources");
		dojo.require("idx.string");
		dojo.require("idx.widget.NavTreeModel");
		
		dojo.requireLocalization("idx","base"); 
		dojo.requireLocalization("idx.widget","base"); 
		dojo.requireLocalization("idx.widget","NavTree"); 
		
		var templateText 		= dojo.cache("idx.widget", "templates/NavTree.html");
		var nodeTemplateText 	= dojo.cache("idx.widget", "templates/NavTreeNode.html");
	
		factory(dojo.declare,				// dDeclare			(dojo/_base/declare)
				dojo,						// dKernel			(dojo/_base/kernel)
				dojo,						// dLang			(dojo/_base/lang)
				dojo,						// dConnect			(dojo/_base/connect)
				{add: dojo.addClass,		// dDomClass		(dojo/dom-class)
			     remove: dojo.removeClass,
			     contains: dojo.hasClass
				},
				dijit.Tree,					// dTree			(dijit/Tree)
				idx.util,					// iUtil			(../util)
				idx.resources,				// iResources		(../resources)
				idx.string,					// iString			(../string)
				idx.widget.NavTreeModel,	// iNavTreeModel	(./NavTreeModel)
				templateText,				// templateText		(dojo/text!./templates/NavTree.html)
				nodeTemplateText);			// nodeTemplateText	(dojo/text!./templates/NavTreeNode.html)
	} else {
		define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",						// dDeclare
		        "../../../../dist/lib/dojo/_base/kernel",						// dKernel
		        "dojo/_base/lang",							// dLang
		        "dojo/_base/connect",						// dConnect
		        "dojo/dom-class",							// dDomClass
				"dijit/Tree",								// dTree
				"../util",									// iUtil
				"../resources",								// iResources
				"../string",								// iString
				"./NavTreeModel",							// iNavTreeModel
				"dojo/text!./templates/NavTree.html",		// templateText
				"dojo/text!./templates/NavTreeNode.html",	// nodeTemplateText
		        "dojo/i18n!../nls/base",
		        "dojo/i18n!./nls/base",
		        "dojo/i18n!./nls/NavTree"],
				factory);
			
	}
})();