/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */
(function(){
 
var factory = function(dojo_declare, dojo_array, dojox_grid_Selection){

/**
 * @public
 * @name idx.grid._DataGridMixin
 * @class Mix-in class to add dojox.grid.DataGrid functions to deal with selection.
 */
return dojo_declare("idx.grid._DataGridMixin", null,
/**@lends idx.grid._DataGridMixin#*/
{

	/**
	 * Obtains a cell for the specified field.
	 * @param {String} field
	 * @returns {Object}
	 */
	getCellByField: function(field){
		var cell;
		dojo_array.some((this.layout.cells || []), function(c){
			if(c.field == field){
				cell = c;
				return true;
			}
			return false;
		});
		return cell;
	},

	/**
	 * Retrieves the selected data store item.
	 * @returns {Object}
	 */
	getSelectedItem: function(){
		var item;
		var index = this.selection.selectedIndex;
		if(index >= 0 && index < this.rowCount){
			item = this.getItem(index);
		}
		return item;
	},

	/**
	 * Selects a row matching the specified attribute value.
	 * @param {String} name
	 * @param {Object} value
	 */
	selectByAttribute: function(name, value){
		var selection = this.selection;
		var store = this.store;
		var count = this.rowCount;
		for(var i = 0; i < count; i++){
			var item = this.getItem(i);
			if(store.isItem(item) && store.getValue(item, name) == value){
				selection.addToSelection(i);
			}
		}
	},

	/**
	 * Simply move a row to the specified position. 
	 * Caller is responsible to call updateRows to reflect the move.
	 * @param {Numner} from
	 * @param {Number} to
	 */
	moveItem: function(from, to){
		if(to === from){
			return;
		}
		var item = this._by_idx[from];
		if(to < from){ // up
			for(var i = from; i > to; i--){
				this._by_idx[i] = this._by_idx[i - 1];
			}
		}else{ // down
			for(var i = from; i < to; i++){
				this._by_idx[i] = this._by_idx[i + 1];
			}
		}
		this._by_idx[to] = item;
	},

	/**
	 * Moves up the selected rows.
	 * If "top" is set to true, moves them to the top.
	 * @param {Boolean} top
	 */
	moveUpSelectedRows: function(top){
		var selected = dojox_grid_Selection.prototype.getSelected.call(this.selection);
		if(!selected || !selected.length){
			return;
		}
		var firstSelected = selected[0];
		if(!firstSelected){
			return;
		}
		var lastSelected = selected[selected.length - 1];
		var offset = (top ? 0 - firstSelected : -1);
		var selectedIndex = this.selection.selectedIndex;

		// start moving
		this.edit.apply();
		this.selection.deselectAll();
		var length = selected.length;
		for(var i = 0; i < length; i++){
			var index = selected[i];
			this.moveItem(index, index + offset);
		}
		this.updateRows(firstSelected + offset, (lastSelected - (firstSelected + offset) + 1));
		for(var i = 0; i < length; i++){
			this.selection.addToSelection(selected[i] + offset);
		}
		this.selection.addToSelection(selectedIndex + offset);
	},

	/**
	 * Moves down the selected rows.
	 * If "bottom" is set to true, moves them to the bottom.
	 * @param {Boolean} bottom
	 */
	moveDownSelectedRows: function(bottom){
		var selected = dojox_grid_Selection.prototype.getSelected.call(this.selection);
		if(!selected || !selected.length){
			return;
		}
		var last = this.rowCount - 1;
		var lastSelected = selected[selected.length - 1];
		if(lastSelected < 0 || lastSelected >= last){
			return;
		}
		var firstSelected = selected[0]; 
		var offset = (bottom ? last - lastSelected : 1);
		var selectedIndex = this.selection.selectedIndex;

		// start moving
		this.edit.apply();
		this.selection.deselectAll();
		var length = selected.length;
		for(var i = length - 1; i >= 0; i--){
			var index = selected[i];
			this.moveItem(index, index + offset);
		}
		this.updateRows(firstSelected, (lastSelected + offset) - firstSelected + 1);
		for(var i = 0; i < length; i++){
			this.selection.addToSelection(selected[i] + offset);
		}
		this.selection.addToSelection(selectedIndex + offset);
	}

});

}; // end of factory

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
	dojo.provide("idx.grid._DataGridMixin");
	dojo.require("dojox.grid.Selection");
	factory(dojo.declare, dojo, dojox.grid.Selection);
}else{
	define([
		"../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
		"../../../../node_modules/intern-geezer/node_modules/dojo/_base/array",
		"dojox/grid/Selection"
	], factory);
}

})();
