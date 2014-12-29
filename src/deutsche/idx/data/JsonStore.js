/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

/**
 * @name idx.data.JsonStore
 * @class Data store to deal with simple JSON object/array.
 * @augments dojo.data.ItemFileWriteStore
 */
(function() /**@lends idx.data.JsonStore#*/ {
function factory(dDeclare,dItemFileWriteStore,dLang,dArray) {
return dDeclare("idx.data.JsonStore", [dItemFileWriteStore], 
{
	/**
   	 * Identifier for items.
   	 * @type String
   	 * @default ""
   	 */
	identifier: "",

	/**
   	 * Label attribute for items.
   	 * @type String
   	 * @default ""
   	 */
	label: "",

	/**
   	 * Property name to contain item array when JSON object is passed as data.
   	 * @type String
   	 * @default ""
   	 */
	items: "",

	/**
	 * Constructs with parameters.
	 * @param {Object} args
	 */
	constructor: function(args){
		if(args){
			this.identifier = (args.identifier || this.identifier);
			this.label = (args.label || this.label);
			this.items = (args.items || this.items);
		}
	},

	/**
	 * Specifies a URL to load data.
	 * @param {String} url
	 */
	setUrl: function(url){
		this.url = url;
		this.forceLoad();
	},

	/**
	 * Sets new data.
	 * @param {Object|Array} data
	 */
	setData: function(data){
		this.data = data;
		this.forceLoad();
	},

	/**
	 * Retrieves the current data.
	 * @returns {Object|Array}
	 */
	getData: function(){
		var data = dArray.map(this._getItemsArray(), this.getItemData, this);
		if(this.items){
			var items = data;
			data = {};
			data[this.items] = items;
		}
		return data;
	},

	/**
	 * Retrieves the current data of the specified item.
	 * @param {Object} item
	 * @returns {Object}
	 */
	getItemData: function(item){
		var data = {};
		dArray.forEach(this.getAttributes(item), function(attribute){
			var values = item[attribute];
			if(!values || values.length === 0){
				return;
			}
			if(values.length === 1){
				var value = values[0];
				if(this.isItem(value)){
					value = this.getItemData(value);
				}
				data[attribute] = value;
			}else{
				data[attribute] = dArray.map(values, function(value){
					if(this.isItem(value)){
						value = this.getItemData(value);
					}
					return value;
				}, this);
			}
		}, this);
		return data;
	},

	/**
	 * Enforces loading or building items from "url" or "data" properties.
	 */
	forceLoad: function(){
		this._loadFinished = false;
	},

	/**
	 * Converts data to the format for the base class to build items.
	 * @param {Object} data
	 * @private
	 */
	_getItemsFromLoadedData: function(data){
		var items;
		if(this.items){
			items = data[this.items];
		}else{
			if(data && !dLang.isArray(data)){
				data = [data];
			}
			items = data;
		}
		arguments[0] = {items: items, identifier: this.identifier, label: this.label};
		return this.inherited(arguments);
	}
});
}

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
	dojo.provide("idx.data.JsonStore");
	dojo.require("dojo.data.ItemFileWriteStore");
	factory(dojo.declare, dojo.data.ItemFileWriteStore,	dojo, dojo);
} else {
	define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	        "../../../../dist/lib/dojo/data/ItemFileWriteStore",
	        "dojo/_base/lang",
	        "dojo/_base/array"],
	        factory);
}
})();
