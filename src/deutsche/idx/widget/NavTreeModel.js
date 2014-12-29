/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

(function() {

	function factory(dDeclare,			// (dojo/_base/declare)
					 dLang,				// (dojo/_base/lang)
					 dString,			// (dojo/string)
					 dTree,				// (dijit/Tree)
			  		 dForestStoreModel,	// (dijit/tree/ForestStoreModel
			  		 iString)			// (../string)
	{
		/**
 		 * @name idx.widget.NavTree
 		 * @class Widget for sidebar navigation via a tree control.
 		 * @augments dijit.Tree
 		 */
		var iNavTreeModel = dDeclare("idx.widget.NavTreeModel",[dForestStoreModel], 
			/** @lends idx.widget.NavTreeModel# */
		{
			/**
			 * The attribute used to classify the tree nodes into different types to
			 * lookup different default behaviors for nodes of that type. 
			 */
			typeAttr: "type",

			/**
			 * The attribute to check per-item to see if it is selectable.
			 * 
			 * Order of precedence is:
			 *  - Value from selectabilityMap (when present)
			 *  - Value of selectableAttr for item (when available)
			 *  - Value of typeSelectabilityMap (when present)
			 *  - defaultSelectability
			 */
			selectableAttr: "selectable",

			/**
			 * The associative array/map of item IDs to their selectability (true or false).
			 * Items not in this map have their selectability determined by the "selectableAttr"
			 * (per item) or the "defaultSelectability" attribute for the model.
			 * Example:
			 *  { "item1": true, "item2": false}
			 *  
			 * Order of precedence is:
			 *  - Value from selectabilityMap (when present)
			 *  - Value of selectableAttr for item (when available)
			 *  - Value of typeSelectabilityMap (when present)
			 *  - defaultSelectability
			 */
			selectabilityMap: null,
			
			/**
			 * The associative array/map of item types (obtained via the optional "typeAttr") to 
			 * the selectability for items of that type (true or false).  For items of types not
			 * found in this map have their selectability determined by the "defaultSelectability"
			 * attribute for the model.
			 * Example:
			 *  { "typeA": true, "typeB": false}
			 * 
			 * Order of precedence is:
			 *  - Value from selectabilityMap (when present)
			 *  - Value of selectableAttr for item (when available)
			 *  - Value of typeSelectabilityMap (when present)
			 *  - defaultSelectability
			 */
			typeSelectabilityMap: null,
			
			/**
			 * Used to determine the default selectability of nodes if the item is not found in the
			 * selectability map or the item or this model does not have a defined 
			 * "selectableAttr" or its type is not in the type selectabliltiy map.  The possible 
			 * values are:
			 *   "all" - All node are selectable by default.
			 *   "none" - No nodes are selectable default (per-node exceptions required)
			 *   "leaves" - Only nodes for which "mayHaveChildren()" is false are selectable
			 */
			defaultSelectability: "leaves",

			/**
			 * The attribute to check per-item to see if a badge label should be 
			 * displayed.  The value of the attribute may be a number or a string 
			 * that is parseable to cause it to be directly displayed.  If the
			 * string is not parseable as a number the NavTree may either display it
			 * literally or use it as a basis for a resource lookup key to obtain the
			 * text to display. 
			 */
			badgeLabelAttr: "badgeLabel",
			
			/**
			 * The attribute to check per-item to see if a badge icon should be 
			 * displayed.  The value of the attribute is used by the NavTree to lookup
			 * an "icon class" in its "badgeIconMap".
			 */
			badgeIconTypeAttr: "badgeIconType",
			
			/**
			 * The associative array/map of item IDs to their badge values.  The badge 
			 * values may take one of the following forms:
			 *  -- an integer numeric value (used as a badge label without resource lookup)
			 *  -- a string representing an integer value (used as a badge label without resource lookup)
			 *  -- an alpha-numeric string (either display literally or used as a resource lookup key)
			 *  -- an object of the form:
			 *  	{label: *badgeLabel*, iconType: *iconType*}
			 *     Where *badgeLabel* is either an integer, numeric string or alpha-numeric string (as above)
			 *     and *iconType* is a string indicating a key for the NavTree to lookup in its badgeIconMap.
			 *     
			 * Items not in this map have their badge value determined by the "badgeLabelAttr" 
			 * and/or "badgeIconTypeAttr" (per item).
			 * 
			 * Example:
			 *  { "item1": 10, "item2": "warning", "item3": "info"}
			 */
			badgeMap: null,
			
			/**
			 * Returns the type of the item.
			 */
			getItemType: function(/*dojo.data.Item*/ item) {
				if (!iString.nullTrim(this.typeAttr)) return null;
				if (! this.store.isItem(item)) return null;
				if (! this.store.hasAttribute(item, this.typeAttr)) return null;
				return this.store.getValue(item, this.typeAttr);
			},
			
			/**
			 * Function to determine if a node is selectable.
			 */
			isSelectable: function(/*dojo.data.Item*/ item) {
				if (!this.store.isItem(item)) return false;
				
				// check if we have a selectability map
				if (this.selectabilityMap) {
					// if we do then get the item identity
					var id = this.getIdentity(item);
					
					// if the item appears in the map, then use the value for the item
					if (id in this.selectabilityMap) {
						return this.selectabilityMap[id];
					}
				}
				
				// check if we have a selectableAttr defined
				if (iString.nullTrim(this.selectableAttr)) {
					// if we do then check if the item has that attribute
					if (this.store.hasAttribute(item, this.selectableAttr)) {
						return this.store.getValue(item, this.selectableAttr);
					}
				}

				// check if we have a type selectability map
				if (this.typeSelectabilityMap) {
					// get the type of the item
					var itemType = this.getItemType(item);
					if ((itemType) && (itemType in this.typeSelectabilityMap)) {
						// if we have a type and it appears in our map, then return the value
						return this.typeSelectabilityMap[itemType];
					}
				}
				
				// use the default selectability
				switch (this.defaultSelectability) {
				case "all":
					return true;
				case "none":
					return false;
				case "leaves":
					return (! this.mayHaveChildren(item));
				default: 
					return true;
				}
			},
			
			/**
			 * Gets the badge for the specified item or returns null if no badge is associated
			 * with the specified item.  If the return value is not null it takes the form of:
			 * {
			 * 	label: *badgeLabel*,
			 *  iconType: *badgeIconType*
			 * }
			 * 
			 * Where *badgeLabel* and *badgeIconType* are as follows:
			 * 
			 * *badgeLabel*: Either an integer/numeric value indicating a literal badge
			 * value or a string that the NavTree may use to create a resource lookup key to obtain
			 * the displayable text or may be null to indicate no label.
			 * 
			 * *badgeIconType*: Either null to indicate no icon or a string to be used as a key in the
			 * badgeIconMap of the NavTree to lookup an iconClass to associate with the type.
			 * 
			 */
			getBadge: function(/*dojo.data.Item*/ item) {
				if (! this.store.isItem(item)) return null;
				var badgeValue = {label: null, iconType: null};
				// check if we have a selectability map
				if (this.badgeMap) {
					// if we do then get the item identity
					var id = this.getIdentity(item);
					
					// if the item appears in the map, then use the value for the item
					if (id in this.badgeMap) {
						var badge = this.badgeMap[id];
						if (! badge) return null;
						var badgeType = iUtil.typeOfObject(badge);
						
						switch (badgeType) {
						case "number":
							badgeValue.label = badge;
							return badgeValue;
							
						case "string":
							badgeValue.label = this._normalizeBadgeLabel(badge);
							return badgeValue;
							
						case "object":
							if ((!badge.label)&&(!badge.iconType)) return null;
							if (badge.label) {
								badgeValue.label = this._normalizeBadgeLabel(badge.label);
							}
							if (badge.iconType) {
								badgeValue.iconType = badge.iconType;
							}
							return badgeValue;
						}
					}
				}
				
				// check if we have a badgeLabelAttr defined
				if (iString.nullTrim(this.badgeLabelAttr)) {
					// if we do then check if the item has that attribute
					if (this.store.hasAttribute(item, this.badgeLabelAttr)) {
						var val = this.store.getValue(item,this.badgeLabelAttr);
						badgeValue.label = this._normalizeBadgeLabel(val);
					}
				}
				
				// check if we have a badgeIconTypeAttr defined
				if (iString.nullTrim(this.badgeIconTypeAttr)) {
					// if we do then check if the item has that attribute
					if (this.store.hasAttribute(item, this.badgeIconTypeAttr)) {
						badgeValue.iconType = this.store.getValue(item, this.badgeIconTypeAttr);
					}
				}

				// if no label and icon type then return null
				if ((!badgeValue.label)&&(!badgeValue.iconType)) return null;

				// otherwise return the badge value
				return badgeValue;
			},
			
			/**
			 * Normalizes the badge label as a number or a string.
			 */
			_normalizeBadgeLabel: function(label) {
				var labelType = iUtil.typeOfObject(label);
				switch (labelType) {
				case "number":
					return label;
				case "string":
					if (label.match(/^\s*(\+|-)?\d+\s*$/)) {
						return Number(dString.trim(label));
					} else {
						return label;
					}
				default:
					return "" + label;
				}
			},
			
			/**
			 * Call this method when the badgeMap is updated.
			 */
			onBadgesChanged: function() {

			},
			
			/**
			 * Call this method when the selectabilityMap or typeSelectbailityMap is updated.
			 */
			onSelectabilityChanged: function() {

			},
			
			/**
			 * Returns a snapshot object that contains all the attributes and values of the specified
			 * item so that it is simplified from the data store interface.
			 * 
			 *  @param item The item to be normalized.
			 */
			normalizeItem: function(item) {
				var attrs = this.store.getAttributes(item);
				var result = { };
				for (var index = 0; index < attrs.length; index++) {
					var attr = attrs[index];
					var value = this.store.getValue(item, attr);
					result[attr] = value;
				}
				return result;
			} 
		
		});

		// return the module
		return iNavTreeModel;
	}

	var version = (window["dojo"] && dojo.version);
	if(version && version.major == 1 && version.minor == 6){
		dojo.provide("idx.widget.NavTreeModel");
		dojo.require("dijit.Tree");
		dojo.require("dijit.tree.ForestStoreModel");
		dojo.require("dojo.string");
		dojo.require("idx.string");
		
		factory(dojo.declare,					// dDeclare				(dojo/_base/declare)
				dojo,							// dLang				(dojo/_base/lang)
				dojo.string,					// dString				(dojo/string)
				dijit.Tree,						// dTree				(dijit/Tree)
				dijit.tree.ForestStoreModel, 	// dForestStoreModel	(dijit/tree/ForestStoreModel)
				idx.string);					// iString				(../string)
		
	} else {
		define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",						// dDeclare
		        "../../../../dist/lib/dojo/_base/lang",							// dLang
				"dojo/string",								// dString
				"dijit/Tree",								// dTree
				"dijit/tree/ForestStoreModel",				// dForestStoreModel
				"../string"],								// iString
				factory);
			
	}
})();