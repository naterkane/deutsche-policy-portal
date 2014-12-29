define([
	"../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	"../../../../../dist/lib/dojo/_base/lang",
	"dojo/_base/Deferred"
], function(declare, lang, Deferred){

	/**
	 * @name	idx.gridx.core.Row
	 * @class	An instance of this class represents a grid row.
	 *			This class should not be directly instantiated by users. It should be returned by grid APIs.
	 * @property {idx.gridx.Grid} grid Reference to the grid
	 * @property {idx.gridx.core.model.Model} model Reference to the grid model
	 * @property {String} id The ID of this row
	 */
	return declare(/*===== "gridx.core.Row", =====*/[], {
		// summary:
		//		Represents a row of a grid
		// description:
		//		An instance of this class represents a grid row.
		//		This class should not be directly instantiated by users. It should be returned by grid APIs.

		/*=====
		// id: [readonly] String
		//		The ID of this row
		id: null,

		// grid: [readonly] gridx.Grid
		//		Reference to the grid
		grid: null,

		// model: [readonly] grid.core.model.Model
		//		Reference to this grid model
		model: null,
		=====*/

		/**@lends idx.gridx.core.Row#*/

		constructor: function(grid, id){
			this.grid = grid;
			this.model = grid.model;
			this.id = id;
		},

		/**
		 * Get the index of this row
		 * @returns {Integer} The row index
		 */
		index: function(){
			// summary:
			//		Get the index of this row
			// returns:
			//		The row index
			return this.model.idToIndex(this.id);	//Integer
		},

		/**
		 * Get a cell object in this row
		 * @param {idx.gridx.core.Column|Integer|String} column Column index or column ID or a column object
		 * @param {Boolean?} isId If the column parameter is a numeric ID, set this to true
		 * @returns {idx.gridx.core.Cell} If the params are valid return the cell object, else return NULL.
		 */
		cell: function(column, isId){
			// summary:
			//		Get a cell object in this row
			// column: gridx.core.Column|Integer|String
			//		Column index or column ID or a column object
			// isId: Boolean?
			//		If the column parameter is a numeric ID, set this to true
			// returns:
			//		If the params are valid return the cell object, else return null.
			return this.grid.cell(this, column, isId);	//gridx.core.Cell|null
		},

		/**
		 * Get cells in this row.
		 * @param {Integer?} start The column index of the first cell in the returned array.
		 *		If omitted, defaults to 0, so row.cells() gets all the cells in this row.
		 * @param {Integer?} count The number of cells to return.
		 *		If omitted, all the cells starting from column 'start' will be returned.
		 * @returns {idx.gridx.core.Cell} An array of cells in this row.
		 */
		cells: function(start, count){
			// summary:
			//		Get cells in this row.
			// start: Integer?
			//		The column index of the first cell in the returned array.
			//		If omitted, defaults to 0, so row.cells() gets all the cells.
			// count: Integer?
			//		The number of cells to return.
			//		If omitted, all the cells starting from column 'start' will be returned.
			// returns:
			//		An array of cells in this row
			var t = this,
				g = t.grid,
				cells = [],
				cols = g._columns,
				total = cols.length,
				i = start || 0,
				end = count >= 0 ? start + count : total;
			for(; i < end && i < total; ++i){
				cells.push(g.cell(t.id, cols[i].id, 1));	//1 as true
			}
			return cells;	//gridx.core.Cell[]
		},

		/**
		 * Get the grid data in this row.
		 * Grid data means the result of the formatter functions (if exist). It can be different from store data (a.k.a. raw data).
		 * @returns {Object} An associative array using column IDs as keys and grid data as values
		 */
		data: function(){
			// summary:
			//		Get the grid data in this row.
			// description:
			//		Grid data means the result of the formatter functions (if exist).
			//		It can be different from store data (a.k.a. raw data).
			// returns:
			//		An associative array using column IDs as keys and grid data as values
			return this.model.byId(this.id).data;	//Object
		},

		/**
		 * Get the store data in this row.
		 * Store data means the data defined in store. It is the data before applying the formatter functions.
		 * It can be different from grid data (a.k.a. formatted data)
		 * @returns {Object} An associative array using store fields as keys and store data as values
		 */
		rawData: function(){
			// summary:
			//		Get the store data in this row.
			// description:
			//		Store data means the data defined in store. It is the data before applying the formatter functions.
			//		It can be different from grid data (a.k.a. formatted data)
			// returns:
			//		An associative array using store fields as keys and store data as values
			return this.model.byId(this.id).rawData;	//Object
		},

		/**
		 * Get the store item of this row
		 * If using the old dojo.data store, store items usually have complicated structures, 
		 * and they are also useful when doing store operations.
		 * @returns {Object} A store item
		 */
		item: function(){
			// summary:
			//		Get the store item of this row
			// description:
			//		If using the old dojo.data store, store items usually have complicated structures,
			//		and they are also useful when doing store operations.
			// returns:
			//		A store item
			return this.model.byId(this.id).item;	//Object
		},

		/**
		 * Set new raw data of this row into the store
		 * @param {Object} rawData The new data to be set. It can be incomplete, only providing a few fields.
		 * @returns	{dojo.Deferred} If using server side store, a Deferred object is returned to indicate when the operation is finished.
		 */
		setRawData: function(rawData){
			// summary:
			//		Set new raw data of this row into the store
			// rawData: Object
			//		The new data to be set. It can be incomplete, only providing a few fields.
			// returns:
			//		If using server side store, a Deferred object is returned to indicate when the operation is finished.
			var t = this, 
				s = t.grid.store,
				item = t.item(),
				field, d;
			if(s.setValue){
				d = new Deferred;
				try{
					for(field in rawData){
						s.setValue(item, field, rawData[field]);
					}
					s.save({
						onComplete: lang.hitch(d, d.callback),
						onError: lang.hitch(d, d.errback)
					});
				}catch(e){
					d.errback(e);
				}
			}
			return d || Deferred.when(s.put(lang.mixin(lang.clone(item), rawData)));	//dojo.Deferred
		}
	});
});
