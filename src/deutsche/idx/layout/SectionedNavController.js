/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

(function(){

var factory = function(dojo_declare, dijit_registry, dojo_event, dojo_connect, dojo_lang, dojo_keys){
/**
 * @name idx.layout.SectionedNavController
 * @class Non-visual control to handle highlighting of several grids,
 * 			so that only one grid can have a selected row at a time.
 *			The SectionedNavController also publishes a selectionChanged
 *			topic that can be used as a central point to handle the
 *			navigation selection coming from all the grids.
 */

var SectionedNavController = dojo_declare("idx.layout.SectionedNavController",[],
/** @lends idx.layout.SectionedNavController# */
{

			id: "",
			
			/**
			 * A comma-separated list of the id's of the grids that are to be coordinated.
			 * 
			 * @type String
			 */ 
			associatedGrids: "",
			
			_associatedGrids: [],

			_lastGridSelected: "",
			
			_lastRowSelected: -1,

			/**
			 * @constructor
			 */
			constructor: function(n){

				//console.log("in constructor of SectionedNavController " + n.associatedGrids);
				this.id = n.id;
				this._associatedGrids = n.associatedGrids.split(",");
				
				// Listen to notifications from grids
				for(i=0; i<this._associatedGrids.length; i++)
				{
					//console.log("in constructor of SectionedNavController " + i + " " + this._associatedGrids[i]);
					var gridID = this._associatedGrids[i];
					var grid = dijit_registry.byId(gridID);
					if( grid )
					{
						// BMC: Force NO SORTING until we properly translate the row indexes when sorted
						// and we properly change the selected content pane when sorting triggers the
						// selected row to actually be highlighting alternate data.
						grid.canSort = function() { return false; }
						
						var caller = { owner: this, grid: grid };
						dojo_connect.connect(grid, 'onSelected', dojo_lang.hitch(caller, function(index) {
							this.owner._handleSelect(this.grid, index);
						}));
						dojo_connect.connect(grid, 'onCellFocus', dojo_lang.hitch(caller, function(cell, index) {
							this.owner._handleFocus(this.grid, cell, index);
						}));
						dojo_connect.connect(grid, "onKeyEvent", dojo_lang.hitch(caller, function(e) {
							this.owner._handleKey(this.grid, e);
						}));
						
					}
					else
					{
						console.log( "A grid with id=" + this._associatedGrids[i] + " does not exist.");
					}
					
				}
				
				
			},

			/**
			 * 
			 */
			_handleKey: function(grid, e) {
				var funcName = "_handle_" + e.dispatch;
				if (funcName in this) {
					this[funcName](grid, e);
				}
			},

			_handle_dokeydown: function(grid, e) {
				switch (e.keyCode) {
				case dojo_keys.UP_ARROW:
				case dojo_keys.DOWN_ARROW:
				case dojo_keys.LEFT_ARROW:
				case dojo_keys.RIGHT_ARROW:
					break; // fall through
				default: 
					return; // ignore other keys
				}
				
				var cell = grid.focus.cell;
				var rowIndex = grid.focus.rowIndex;
				if (! cell) return;
				if (rowIndex < 0) return;
				var selIndex = grid.selection.selectedIndex;
				
				if (selIndex < 0) {
					grid.selection.select(rowIndex);
				} else {
					var node = cell.getNode(rowIndex);
					node.focus();
				}
            dojo_event.stop(e);
			},
			
			_handle_dokeyup: function(grid, e) {
				switch (e.keyCode) {
				case dojo_keys.UP_ARROW:
				case dojo_keys.DOWN_ARROW:
				case dojo_keys.LEFT_ARROW:
				case dojo_keys.RIGHT_ARROW:
					return; // don't trap arrow keys
				default: 
					break; // fall through
				}

				var cell = grid.focus.cell;
				var rowIndex = grid.focus.rowIndex;
				if (! cell) return;
				if (rowIndex < 0) return;
				var selIndex = grid.selection.selectedIndex;
				
				if (selIndex < 0) {
					grid.selection.select(rowIndex);
				} else {
					var node = cell.getNode(rowIndex);
					node.focus();
				}
				dojo_event.stop(e);
			},
			
			_handle_dokeypress: function(grid, e) {
				// only IE 8 and IE 9 need help here, lest our widget lose keyboard focus
				if ((dojo.isIE != 8) && (dojo.isIE != 9))return;
				
				// determine if we care about these keys (navigation keys)
				if (e.altKey || e.ctrlKey) return;
				switch (e.keyCode) {
				case dojo_keys.UP_ARROW:
				case dojo_keys.DOWN_ARROW:
				case dojo_keys.LEFT_ARROW:
				case dojo_keys.RIGHT_ARROW:
					// drop through
					break;
				default: 
					return;
				}

				var cell = grid.focus.cell;
				if (! cell) {
					cell = grid.getCell(0);
				}
				var rowIndex = grid.focus.rowIndex;
				if (rowIndex < 0) rowIndex = 0;
				var node = cell.getNode(rowIndex);
				node.focus();
				dojo_event.stop(e);
			},
			
			/**
			 * 
			 */
			_handleFocus: function(grid, cell, rowIndex) {
				if (this._internalCall) {
					this._internalCall = false;
					return;
				}
				if (rowIndex < 0) return;
				grid.selection.select(rowIndex);				
				var cellNode = cell.getNode(rowIndex); 
				if (! grid.focus.isFocusCell(cell, rowIndex)) {
					this._internalCall = true;
					grid.focus.setFocusCell(cell, rowIndex);
				}
			},
			
			/**
			 * Called after onClick of all associated grids to handle selection.
			 * Publishes <this.id>-selectionChanged topic
			 * 
			 * @private
			 * @param e Event row's click event
			 */
			_handleSelect: function(sourceGrid, rowIndex){
				for(i=0; i<this._associatedGrids.length; i++)
				{
					var gridID = this._associatedGrids[i];
					if( gridID != sourceGrid.id )
					{
						var grid = dijit_registry.byId(gridID);
						if( grid ) grid.selection.clear();
					}
				}
				
				if( this._lastGridSelected != sourceGrid.id
					|| this._lastRowSelected != rowIndex) {
					
					this._lastGridSelected = sourceGrid.id;
					this._lastRowSelected = rowIndex;
					var e = { grid: sourceGrid, rowIndex: rowIndex };
					dojo_connect.publish(this.id+"-selectionChanged", [e]);
				}
			}
	

});

return SectionedNavController;

}; // end of factory

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
	dojo.provide("idx.layout.SectionedNavController");
	var dojo_event = {stop: dojo.stopEvent};
	factory(dojo.declare,dijit,dojo_event,dojo,dojo,dojo.keys);
}else{
	define([
	  "../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",    // dojo_declare
      "../../../../dist/lib/dijit/registry",        // dijit_registry
	  "dojo/_base/event",      // dojo_event
      "dojo/_base/connect",    // dojo_connect
      "dojo/_base/lang",       // dojo_lang
      "dojo/keys"              // dojo_keys
	], factory);
}

})();

