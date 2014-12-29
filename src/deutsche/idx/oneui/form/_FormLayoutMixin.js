/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	"../../../../../dist/lib/dojo/_base/lang",
	"dojo/_base/array", // array.forEach array.indexOf array.map
	"dojo/dom-construct", // domConstruct.place
	"dojo/query", // domConstruct.place
	"dijit/registry"	// registry.byId()
], function(declare, lang, array, domConstruct, query, registry){
	
	return declare("idx.oneui.form._FormLayoutMixin", null, {
		// rows: Integer
		//		"rows" - as a integer - indicates the amount of rows in form. If "rows" is an array, it indicate 
		//		the max item number in each row.
		rows: null,
		// columns: Array | Integer
		//		If "columns" is value-assigned, the widgets in form would be layout by columns;
		//		"columns" - as an array - stands for layout rules for each column,  each item of "columns" 
		//		includes "labelWidth" and "fieldWidth"; If the "columns" is an integer, it indicates
		//		the columns counts of the form, and width of label&field are "120px" and "180px" by default.
		columns: null,
		
		rowWidth: "600px",
		
		forceRows: false,
		
		postMixInProperties: function(){
			this.inherited(arguments);
			this.children = this.children || [];
			if(this.columns){
				if(typeof this.columns == "number"){
					var columns = [];
					for(var i = 0; i < this.columns; i++){
						columns.push({labelWidth: "120px", fieldWidth: "180px"});
					}
					this.columns = columns;
				}
				if(!(this.rows instanceof Array)){ return; }
				this.rows = array.map(this.rows, function(){
					return {
						itemNumber : this.columns.length,
						node : this._newRow()
					}
				}, this);
			}else{
				if(!(this.rows instanceof Array)){ return; }
				this.rows = array.map(this.rows, function(itemNumber){
					return {
						itemNumber : itemNumber,
						node : this._newRow()
					}
				}, this);
			}
		},
		addChild: function(/* Widget | String */ widget, /* Integer? */ rowIndex, /* Integer? */ indexInRow){
			widget = registry.byId(widget);
			if(!widget){ return; }
			
			if(typeof rowIndex == "undefined"){
				rowIndex = this._lastRowIndex();
			}else if(this._isRowFilled(rowIndex)){
				return;
			}
			
			var row = this.rows ? this.rows[rowIndex] : null;
			var indexInRow = (typeof indexInRow == "undefined") ? this.getWidgetsInRow(rowIndex).length : indexInRow;
			
			if(row && row["itemNumber"] &&(row["itemNumber"] <= indexInRow)){ return; }
			
			if(row){
				this.children.push({
					row: rowIndex,
					index: indexInRow,
					item: widget
				});
			}else if(!this.rows || (!this.forceRows && rowIndex == this.rows.length)){
				var row = {
					itemNumber: this.columns ? this.columns.length : "",
					node: this._newRow()
				};
				this.children.push({
					row: rowIndex,
					index: indexInRow,
					item: widget
				});
				if(!this.rows){
					this.rows = [];
				}
				this.rows.push(row)
			}else{
				return;
			}
		},
		
		_lastRowIndex: function(){
			if(!this.rows || this.rows.length == 0){return 0;}
			var i = this.rows.length;
			while(this.getWidgetsInRow(i).length == 0 && i > 0){
				if(this._isRowFilled(i - 1)){
					break;
				}
				i--;
			}
			return i;		
		},
		
		_isRowFilled: function(rowIndex){
			if(this.rows && this.rows[rowIndex]){
				var itemNumber = this.rows[rowIndex].itemNumber;
				return itemNumber && this.getWidgetsInRow(rowIndex).length == itemNumber;
			}else{
				return false;
			}
		},
		_setChildrenAttr: function(/* Array */ widgets){
			this.children = [];
			array.forEach(widgets, function(widget){
				this.addChild(widget);
			}, this);
		},
		_setColumnsAttr: function(/* Integer | Array */ columns){
			// set columns 
			if(typeof columns == "number"){
				this.columns = [];
				for(var i = 0; i < columns; i++){
					this.columns.push({labelWidth: "120px", fieldWidth: "180px"});
				}
			}else if(columns instanceof Array){
				this.columns = columns;
			}else{
				return;
			}
			// reset rows
			if(this.forceRows){
				var rows = (this.rows instanceof Array) ? this.rows : new Array(this.rows);
				this.rows = array.map(rows, function(){
					return {
						itemNumber : this.columns.length,
						node : this._newRow()
					}
				}, this);
			}else{
				this.rows = null;
			}
			this.children.sort(function(a,b){
				return (a.row - b.row > 0) || ((a.row == b.row) && (a.index > b.index));
			});
			var widgets = array.map(this.children, function(child){return child.item});
			this.children = [];
			this.set("children", widgets);
		},
		
		_setRowsAttr: function(/* Integer | Array */ rows){
			this.forceRows = (rows != null);
			if(rows instanceof Array){
				// reset columns
				this.columns = null;
				this.rows = array.map(rows, function(itemNumber){
					return {
						itemNumber : itemNumber,
						node : this._newRow()
					}
				}, this);
			}else if(typeof rows == "number"){
				this.rows = array.map(new Array(rows), function(){
					return {
						itemNumber : this.columns ? this.columns.length : "",
						node : this._newRow()
					}
				}, this);
			}else{
				return;
			}
		},
		
		
		setLabelWidthInColumn: function(columnIndex, labelWidth){
			if((!this.columns) || (this.columns.length <= columnIndex)){ return;}
			var widgets = this.getWidgetsInColumn(columnIndex);
			array.forEach(widgets, function(widget){
				widget.set("labelWidth", labelWidth);
			});
			this.columns[columnIndex]["labelWidth"] = labelWidth;
		},
		setFieldWidthInColumn: function(columnIndex, fieldWidth){
			if((!this.columns) || (this.columns.length <= columnIndex)){ return;}
			var widgets = this.getWidgetsInColumn(columnIndex);
			array.forEach(widgets, function(widget){
				widget.set("fieldWidth", fieldWidth);
			})
			this.columns[columnIndex]["fieldWidth"] = fieldWidth;
		},
		getLabelWidthInColumn: function(index){
			return this.columns[index]["labelWidth"];
		},
		getFieldWidthInColumn: function(index){
			return this.columns[index]["fieldWidth"];
		},
		getWidgetsInColumn: function(columnIndex){
			if(this.columns && !this.columns[columnIndex]){ return [];}
			var childrenInColumn = array.filter(this.children, function(child){
				return child.index == columnIndex;
			})
			return array.map(childrenInColumn, function(child){
				return child.item;
			});
		},
		getWidgetsInRow: function(rowIndex){
			if(this.rows && !this.rows[rowIndex]){ return [];}
			var childrenInRow = array.filter(this.children, function(child){
				return child.row == rowIndex;
			});
			return array.map(childrenInRow, function(child){
				return child.item;
			})
			
		},
		startup: function(){
			this.set("labelAlignment", this.labelAlignment);
			if(this.children.length == 0){ return; }
			if(this.columns){
				array.forEach(this.columns, function(column, index){
					var widgets = this.getWidgetsInColumn(index);
					array.forEach(widgets, function(widget){
						widget.set("labelWidth", column.labelWidth);
						widget.set("fieldWidth", column.fieldWidth);
					})
				},this)
			}else{
				array.forEach(this.rows, function(row, index){
					var widgets = this.getWidgetsInRow(index),
						count = widgets.length,
						totalWidth = parseInt(this.rowWidth),
						labelWidth, fieldWidth, lastOneWidth;
					totalWidth -= count > 2 ? 21 * (count - 2) + 38 : 19*count;
					
					
					
					if(this.labelAlignment == "vertical"){
						labelWidth = fieldWidth = Math.ceil(totalWidth / count);
						lastOneWidth = totalWidth - fieldWidth * (count-1);
					}else{
						labelWidth = Math.ceil((totalWidth / count) * 0.4),
						fieldWidth = Math.ceil((totalWidth / count) * 0.6);
						lastOneWidth = totalWidth - (labelWidth + fieldWidth) * (count-1);
					}
					array.forEach(widgets, function(widget, index){
						if(index == count-1){
							if(this.labelAlignment == "vertical"){
								widget.set("labelWidth", lastOneWidth + "px");
								widget.set("fieldWidth", lastOneWidth + "px");
							}else{
								widget.set("labelWidth", lastOneWidth * 0.4 + "px");
								widget.set("fieldWidth", lastOneWidth * 0.6 + "px");
							}
						}else{
							widget.set("labelWidth", labelWidth + "px");
							widget.set("fieldWidth", fieldWidth + "px");
						}
					}, this)
				}, this)
			}
			this._clean();
			this.children.sort(function(a,b){
				return (a.row - b.row > 0) || ((a.row == b.row) && (a.index > b.index));
			});
			array.forEach(this.children, function(child){
				domConstruct.place(child.item.domNode, this.rows[child.row].node, child.index);			
			}, this);
			array.forEach(this.rows, function(row, index){
				domConstruct.place(row.node, this.containerNode);
			}, this);
			this.inherited(arguments);
		},
		_newRow: function(){
			return domConstruct.create("div", {className: "oneuiFormBodyRow"});
		},
		_clean: function(){
			var rowNodes = query(".oneuiFormBodyRow", this.containerNode);
			array.forEach(rowNodes, function(row){
				if(row&&row.parentNode){
					var items = query(".idxComposite", row);
					array.forEach(items, function(item){
						if(item&&item.parentNode){
							item.parentNode.removeChild(item);
						}
					})
					row.parentNode.removeChild(row);
				}
			});
		}
	});
})
