/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

(function() 
{
function factory(dLang,					// (dojo/_base/lang)
				 iMain,					// (idx)
				 dDeclare,				// (dojo/_base/declare)
				 dKeys,					// (dojo/keys)
				 dDateLocale,			// (dojo/date/locale)
				 dConnect,				// (dojo/_base/connect)
				 dEvent,				// (dojo/_base/event) for (dEvent.stop)
				 dDomConstruct,			// (dojo/dom-construct)
				 dDomAttr,				// (dojo/dom-attr) for (dDomAttr.get)
				 dDomGeo,				// (dojo/dom-geometry) for (dDomGeo.getContentBox/getMarginBox)
				 dijitMgr,				// (dijit/_base/manager)
				 dCheckBox,				// (dijit/form/CheckBox)
				 dRadioButton,			// (dijit/form/RadioButton)
				 dCells,				// (dojox/grid/cells)
				 iSelect,				// (../form/Select)
				 iDropDownMultiSelect)	// (../form/DropDowmMultiSelect)
{
	var iCells = dLang.getObject("grid.cells", true, iMain);
	
/**
 * @name idx.grid.cells._Widget
 * @class Base class for cell type creating and managing widget in each cell.
 * @augments dojox.grid.cells.Cell
 */
iCells._Widget = dDeclare("idx.grid.cells._Widget", dCells.Cell,
/**@lends idx.grid.cells._Widget#*/
{

	/**
   	 * Specifies this cell is read-only.
   	 * @type Boolean
   	 * @default false
   	 */
	readonly: false,

	/**
	 * Initializes properties.
	 */
	constructor: function(){
		this.editable = false; // always editing
		this._widgets = [];
	},

	/**
	 * Sets value to a widget for the row.
	 * @param {String} value
	 * @param {Number} index
	 * @returns {Object}
	 */
	formatter: function(value, index){
		var widget = this._getWidget(index);
		widget._onChangeActive = false; // suppress onChange
		widget.set("value", value);
		widget._lastValueReported = value; // make sure next onChange work
		widget._onChangeActive = true;
		return widget;
	},

	/**
	 * Applies widget's value to the item.
	 * @param {Numner} index
	 */
	apply: function(index){
		var widget = this._getWidget(index);
		if(widget){
			var value = widget.get("value");
			var grid = this.grid;
			grid.edit.apply(); // apply other editor's change
			var item = grid.getItem(index);
			grid.store.setValue(item, this.field, value);
		}
	},

	/**
	 * Returns a widget for the row.
	 * @param {Number} index
	 * @returns {Object}
	 * @private
	 */
	_getWidget: function(index){
		var widget = this._widgets[index];
		if(!widget){
			widget = this._widgets[index] = this._createWidget(index);
		}
		return widget;
	},

	/**
	 * Creates a widget for the row.
	 * Sub-class must implement this method.
	 * @param {Number} index
	 * @returns {Object}
	 * @private
	 */
	_createWidget: function(index){
		// concrete class to override
		return null;
	},

	/**
	 * Resizes a widget for the row to fit the cell size.
	 * @param {Number} index
	 * @private
	 */
	_resizeWidget: function(index){
		var widget = this._widgets[index];
		if(widget){
			var node = this.getNode(index);
			var box = dDomGeo.getContentBox(node);
			dDomGeo.getMarginBox(widget.domNode, {w: box.w - 1});
		}
	}

});

iCells._Widget.markupFactory = function(node, cell){
	dCells.Cell.markupFactory(node, cell);

	var readonly = dLang.trim(dDomAttr.get(node, "readonly") || "");
	if(readonly){
		cell.readonly = (readonly.toLowerCase() == "true");
	}
};

/**
 * @name idx.grid.cells.CheckBox
 * @class Always shows a check box in each cell.
 * @augments idx.grid.cells._Widget
 */
iCells.Checkbox = dDeclare("idx.grid.cells.CheckBox", iCells._Widget,
/**@lends idx.grid.cells.CheckBox#*/
{

	/**
   	 * Shows a check box in the header cell to check/uncheck all rows.
   	 * @type Boolean
   	 * @default false
   	 */
	allCheckable: false,

	/**
	 * Sets "checked" attribute to the widget of the row.
	 * If applicable, adds a check box to the column header.
	 * @param {Boolean} value
	 * @param {Number} index
	 * @returns {Object}
	 */
	formatter: function(value, index){
		if(this.allCheckable){
			if(this._headerWidget && this._headerWidget.domNode && !this._headerWidget.domNode.firstChild){
				// recreate when being corrupt on dojo1.5+IE
				this._headerWidget.destroy();
				delete this._headerWidget;
			}
			if(!this._headerWidget){
				var cell = this;
				var checkAll = function(event){
					cell.checkAll(cell._headerWidget.checked);
					dEvent.stop(event);
				};
				var stop = function(event){
					dEvent.stop(event);
				};
				var headerWidget = this._headerWidget = new dCheckBox({onClick: checkAll,
						onMouseDown: stop, onMouseUp: stop});
				var cell = this;
				var grid = this.grid;
				headerWidget.connect(grid, "onKeyDown", function(event){
					if(event.keyCode == dKeys.SPACE && grid.focus.getHeaderIndex() == cell.index){
						headerWidget._onClick(event);
					}
				});
			}
			var headerNode = this.getHeaderNode();
			if(headerNode){
				var widget = dijitMgr.findWidgets(headerNode)[0];
				if(!widget){
					dDomConstruct.place(this._headerWidget.domNode, headerNode.firstChild, "first");
				}
			}
			if(this._headerWidget.checked != value){
				this._headerWidget.set("checked", this.isAllChecked());
			}
		}

		var widget = this._getWidget(index);
		widget.set("checked", (value && value != "false"));
		return widget;
	},

	/**
	 * Creates a check box widget.
	 * @param {Number} index
	 * @returns {Object}
	 * @private
	 */
	_createWidget: function(index){
		var cell = this;
		var grid = this.grid;
		var apply = function(event){
			cell.apply(index);
			setTimeout(function(){
				grid.focus.findAndFocusGridCell();
			}, 0);
			dEvent.stop(event);
		}; 
		var widget = new dCheckBox({onClick: apply});
		widget.connect(grid, "onKeyDown", function(event){
			if(event.keyCode == dKeys.SPACE
					&& grid.focus.isFocusCell(cell, index) && grid.focus.getHeaderIndex() < 0){
				widget._onClick(event);
			}
		});
		return widget;
	},

	/**
	 * Applies "checked" attribute of the check box to the data store item.
	 * @param {Number} index
	 */
	apply: function(index){
		var widget = this._getWidget(index);
		if(widget){
			var checked = widget.checked;
			var grid = this.grid;
			grid.edit.apply(); // apply other editor's change
			var item = grid.getItem(index);
			grid.store.setValue(item, this.field, checked);
		}
	},

	/**
	 * Checks on or off all check boxes.
	 * @param {Boolean} checked
	 */
	checkAll: function(checked){
		var count = this.grid.rowCount;
		for(var i = 0; i < count; i++){
			var widget = this._widgets[i];
			if(widget && widget.checked != checked){
				widget.set("checked", checked);
				this.apply(i);
			}
		}
	},

	/**
	 * Returns true if all check boxes are checked.
	 * @returns {Boolean}
	 */
	isAllChecked: function(){
		var count = this.grid.rowCount;
		for(var i = 0; i < count; i++){
			var widget = this._widgets[i];
			if(widget && !widget.checked){
				return false;
			}
		}
		return true;
	}

});

iCells.CheckBox.markupFactory = function(node, cell){
	iCells._Widget.markupFactory(node, cell);

	var allCheckable = dLang.trim(dDomAttr.get(node, "allCheckable") || "");
	if(allCheckable){
		cell.allCheckable = (allCheckable.toLowerCase() == "true");
	}
};

/**
 * @name idx.grid.cells.RowSelector
 * @class Always shows a check box in each cell to select the row
 * @augments idx.grid.cells.CheckBox
 */
iCells.RowSelector = dDeclare("idx.grid.cells.RowSelector", iCells.CheckBox,
/**@lends idx.grid.cells.RowSelector#*/
{
    
	/**
	 * Returns true if the row is selected to check the check box.
	 * @param {Number} index
	 * @returns {Boolean}
	 */
    get: function(index){
        return this.grid.selection.isSelected(index);
    },

	/**
	 * Installs the event handler for selection change.
	 * @returns {Object}
	 */
	formatter: function(){
		if(!this._selectionChanged){
			this._selectionChanged = dLang.hitch(this, this.render);
			this.grid.connect(this.grid, "onSelectionChanged", this._selectionChanged);
		}
		return this.inherited(arguments);
	},

	/**
	 * Applies "checked" attribute of the check box to the row selection.
	 * @param {Number} index
	 */
    apply: function(index){
        var widget = this._getWidget(index);
        if(widget){
            var checked = widget.checked;
            if(checked){
                this.grid.selection.addToSelection(index);
            }else{
                this.grid.selection.deselect(index);
            }
            if(this._headerWidget && this._headerWidget.checked != checked){
                this._headerWidget.set("checked", this.isAllChecked());
            }
        }
    },

	/**
	 * Updates "checked" attribute of all widgets based on the selection
	 */
    render: function(){
        var allChecked = true;
        var count = this.grid.rowCount;
        for(var i = 0; i < count; i++){
            var widget = this._getWidget(i);
            var checked = this.get(i);
            if(widget && widget.checked != checked){
                widget.set("checked", checked);
            }
            if(!checked){
                allChecked = false;
            }
        }
        if(this._headerWidget && this._headerWidget.checked != allChecked){
            this._headerWidget.set("checked", allChecked);
        }
    }

});

iCells.RowSelector.markupFactory = function(node, cell){
    iCells.CheckBox.markupFactory(node, cell);
};

/**
 * @name idx.grid.cells.RadioButton
 * @class Always shows a radio button in each cell.
 * @augments idx.grid.cells.CheckBox
 */
iCells.RadioButton = dDeclare("idx.grid.cells.RadioButton", iCells.CheckBox,
/**@lends idx.grid.cells.RadioButton#*/
{

	_selectedIndex: -1,

	/**
	 * Tracks selected index.
	 * @param {Boolean} value
	 * @param {Number} index
	 * @returns {Object}
	 */
	formatter: function(value, index){
		if(value){
			this._selectedIndex = index;
		}

		return this.inherited(arguments);
	},

	/**
	 * Creates a radio button widget for the row.
	 * @param {Number} index
	 * @returns {Object}
	 * @private
	 */
	_createWidget: function(index){
		var cell = this;
		var grid = this.grid;
		var apply = function(event){
			cell.apply(index);
			setTimeout(function(){
				grid.focus.findAndFocusGridCell();
			}, 0);
			dEvent.stop(event);
		}; 
		var widget = new dRadioButton({onClick: apply});
		widget.connect(grid, "onKeyDown", function(event){
			if(event.keyCode == dKeys.SPACE
					&& grid.focus.isFocusCell(cell, index) && grid.focus.getHeaderIndex() < 0){
				widget._onClick(event);
			}
		});
		return widget;
	},

	/**
	 * Applies the value to the item with checking off the previously checked button.
	 * @param {Number} index
	 */
	apply: function(index){
		var widget = this._getWidget(index);
		if(widget){
			var checked = widget.checked;
			var grid = this.grid;
			grid.edit.apply(); // apply other editor's change
			var selectedIndex = this._selectedIndex;
			if(checked && selectedIndex >= 0 && selectedIndex != index){
				var selectedItem = grid.getItem(selectedIndex);
				grid.store.setValue(selectedItem, this.field, false);
			}
			var item = grid.getItem(index);
			grid.store.setValue(item, this.field, checked);
		}
	}

});

iCells.RadioButton.markupFactory = function(node, cell){
	iCells.CheckBox.markupFactory(node, cell);
};

/**
 * @name idx.grid.cells.Select
 * @class Always shows a drop-down selection box in each cell.
 * @augments idx.grid.cells._Widget
 */
iCells.Select = dDeclare("idx.grid.cells.Select", iCells._Widget,
/**@lends idx.grid.cells.Select#*/
{

	/**
   	 * Data store for the selection options.
   	 * @type Object (data store)
   	 * @default null
   	 */
	store: null,

	/**
   	 * Place holder (or prompt) text shown for an empty value.
   	 * @type String
   	 * @default ""
   	 */
	placeHolder: "",

	/**
	 * Resizes the widget for the row after created.
	 * @param {String} value
	 * @param {Number} index
	 * @returns {Object}
	 */
	formatter: function(value, index){
		var cell = this;
		setTimeout(function(){
			cell._resizeWidget(index);
		}, 0);
		return this.inherited(arguments);
	},

	/**
	 * Creates a selection box widget for the row.
	 * @param {Number} index
	 * @returns {Object}
	 * @private
	 */
	_createWidget: function(index){
		var cell = this;
		var grid = this.grid;
		var stop = function(event){
			dEvent.stop(event);
		};
		var apply = function(){
			cell.apply(index);
			setTimeout(function(){
				grid.focus.findAndFocusGridCell();
			}, 0);
		};
		var widget = new iSelect({store: this.store, placeHolder: this.placeHolder,
				onClick: stop, onChange: apply});
		if(!widget.toggleDropDown){ // dojo 1.5
			widget.toggleDropDown = function(){
				if(this._isShowingNow){
					this._hideResultList();
				}else{
					this._startSearchAll();
				}
			};
		}
		widget.connect(grid, "onKeyDown", function(event){
			if(event.keyCode == dKeys.SPACE
					&& grid.focus.isFocusCell(cell, index) && grid.focus.getHeaderIndex() < 0){
				widget.toggleDropDown();
			}
		});
		return widget;
	},

	/**
	 * Sets data store for the selection box.
	 * @param {Object} store
	 */
	setStore: function(store){
		this.store = store;
	}

});

iCells.Select.markupFactory = function(node, cell){
	iCells._Widget.markupFactory(node, cell);

	var store = dLang.trim(dDomAttr.get(node, "store") || "");
	if(store){
		cell.store = dLang.getObject(store);
	}
	var placeHolder = dLang.trim(dDomAttr.get(node, "placeHolder") || "");
	if(placeHolder){
		cell.placeHolder = placeHolder;
	}
};

/**
 * @name idx.grid.cells.MultiSelect
 * @class Always shows a drop-down selection box allowing multiple selection in each cell.
 * @augments idx.grid.cells.Select
 */
iCells.MultiSelect = dDeclare("idx.grid.cells.MultiSelect", iCells.Select,
/**@lends idx.grid.cells.MultiSelect#*/
{

	/**
   	 * Specifies whether selection options are sorted by their labels.
   	 * @type Boolean
   	 * @default false
   	 */
	sortByLabel: false,

	/**
   	 * Attribute name for option items to retrieve value, if "identifier" is not specified to the data store.
   	 * @type String
   	 * @default ""
   	 */
	identifier: "",

	/**
	 * Retrieves an array of values from the item.
	 * @param {Number} index
	 * @param {Object} item
	 * @returns {Array}
	 */
	get: function(index, item){
		var value;
		var store = this.grid.store;
		if(store.isItem(item)){
			value = store.getValues(item, this.field);
		}
		return (value || []);
	},

	/**
	 * Applies values as an array to the item.
	 * @param {Number} index
	 */
	apply: function(index){
		var widget = this._getWidget(index);
		if(widget){
			var value = widget.get("value");
			var grid = this.grid;
			grid.edit.apply(); // apply other editor's change
			var item = grid.getItem(index);
			grid.store.setValues(item, this.field, (value || []));
		}
	},

	/**
	 * Creates a selection box with multiple values.
	 * @param {Number} index
	 * @returns {Object}
	 * @private
	 */
	_createWidget: function(index){
		var cell = this;
		var grid = this.grid;
		var stop = function(event){
			dEvent.stop(event);
		};
		var apply = function(){
			cell.apply(index);
			setTimeout(function(){
				grid.focus.findAndFocusGridCell();
			}, 0);
		}; 
		var widget = new iDropDownMultiSelect({store: this.store, placeHolder: this.placeHolder,
				sortByLabel: this.sortByLabel, identifier: this.identifier,
				onClick: stop, onChange: apply, "class": "dijitSelectFixedWidth"});
		if(!widget.toggleDropDown){ // dojo 1.5
			widget.toggleDropDown = function(){
				if(this._isShowingNow){
					this._hideResultList();
				}else{
					this._startSearchAll();
				}
			};
		}
		widget.connect(grid, "onKeyDown", function(event){
			if(event.keyCode == dKeys.SPACE
					&& grid.focus.isFocusCell(cell, index) && grid.focus.getHeaderIndex() < 0){
				widget.toggleDropDown();
			}
		});
		return widget;
	}
});

iCells.MultiSelect.markupFactory = function(node, cell){
	iCells.Select.markupFactory(node, cell);

	var sortByLabel = dLang.trim(dDomAttr.get(node, "sortByLabel") || "");
	if(sortByLabel){
		cell.sortByLabel = (sortByLabel.toLowerCase() == "true");
	}
	var identifier = dLang.trim(dDomAttr.get(node, "identifier") || "");
	if(identifier){
		cell.identifier = identifier;
	}
};

/**
 * @name idx.grid.cells.Text
 * @class Renders cell with optional CSS class and/or place holder text.
 * @augments dojox.grid.cells.Cell
 */
iCells.Text = dDeclare("idx.grid.cells.Text", dCells.Cell,
/**@lends idx.grid.cells.Text#*/
{

	/**
   	 * CSS class for the text.
   	 * @type String
   	 * @default ""
   	 */
	textClass: "",

	/**
   	 * Place holder text shown for an empty value.
   	 * @type String
   	 * @default "&nbsp;"
   	 */
	placeHolder: "&nbsp;",

	/**
	 * Applies the change when the editor's loosing focus.
	 * @type Boolean
	 * @default false
	 */
	applyOnBlur: false,

	/**
	 * Converts null and undefined value to an empty string.
	 * @param {Number} index
	 * @param {Object} item
	 * @returns {String}
	 */
	get: function(index, item){
		var value;
		var store = this.grid.store;
		if(store.isItem(item)){
			value = store.getValue(item, this.field);
		}
		return (value || "");
	},

	/**
	 * Applies text calss and place holder text.
	 * @param (String) value
	 * @returns {String}
	 */
	formatter: function(value){
		var textClass = this.textClass;
		if(!value){
			value = this.placeHolder;
			textClass = (textClass ? textClass + " " : "") + "idxGridPlaceHolder";
		}
		return "<div class='" + textClass + "'>" + value + "</div>";
	},

	/**
	 * Sets up an event handler for applying the change when the editor's loosing focus.
	 */
	formatNode: function(node, value, index){
		this.inherited(arguments);

		if(node && this.applyOnBlur && this.editable){
			var scope = this;
			this._connect = dConnect.connect(node, "onblur", function(){
				setTimeout(function(){
					if(scope.grid.edit.isEditCell(index, scope.index)){
						scope.grid.edit.apply();
					}
				}, 100);
				dConnect.disconnect(scope._connect);;
				delete scope._connect;
			});
		}
	}

});

iCells.Text.markupFactory = function(node, cell){
	dCells.Cell.markupFactory(node, cell);

	var textClass = dLang.trim(dDomAttr.get(node, "textClass") || "");
	if(textClass){
		cell.textClass = textClass;
	}
	var placeHolder = dLang.trim(dDomAttr.get(node, "placeHolder") || "");
	if(placeHolder){
		cell.placeHolder = placeHolder;
	}
	var applyOnBlur = dLang.trim(dDomAttr.get(node, "applyOnBlur") || "");
	if(applyOnBlur){
		cell.applyOnBlur = (applyOnBlur.toLowerCase() == "true");
	}
};

/**
 * @name idx.grid.cells.DateTime
 * @class Formats date/time.
 * @augments idx.grid.cells.Text
 */
iCells.DateTime = dDeclare("idx.grid.cells.DateTime", iCells.Text,
/**@lends idx.grid.cells.DateTime#*/
{

	/**
   	 * Specifies "selector" option for dojo.date.locale.format()
   	 * @type String
   	 * @default ""
   	 */
	selector: "",

	/**
   	 * Specifies "formatLength" option for dojo.date.locale.format()
   	 * @type String
   	 * @default "medium"
   	 */
	formatLength: "medium",

	/**
	 * Formats date.
	 * @param {Object} value
	 * @returns {String}
	 */
	formatter: function(value){
		if(value){
			arguments[0] = dDateLocale.format(new Date(value),
					{selector: this.selector, formatLength: this.formatLength, fullYear: true});
		}

		return this.inherited(arguments);
	}

});

iCells.DateTime.markupFactory = function(node, cell){
	iCells.Text.markupFactory(node, cell);

	var selector = dLang.trim(dDomAttr.get(node, "selector") || "");
	if(selector){
		cell.selector = selector;
	}
	var formatLength = dLang.trim(dDomAttr.get(node, "formatLength") || "");
	if(formatLength){
		cell.formatLength = formatLength;
	}
};

/**
 * @name idx.grid.cells.Empty
 * @class Renders an empty cell
 * @augments dojox.grid.cells.Cell
 */
iCells.Empty = dDeclare("idx.grid.cells.Empty", dCells.Cell,
/**@lends idx.grid.cells.Empty#*/
{

	/**
	 * Renders an empty string.
	 * @returns {String}
	 */
	formatter: function(){
		return "";
	}

});

iCells.Empty.markupFactory = function(node, cell){
	dCells.Cell.markupFactory(node, cell);
};

return iCells;
}

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){

	dojo.provide("idx.grid.cells");

	dojo.require("dojo.date.locale");
	dojo.require("dijit.form.CheckBox");
	dojo.require("dijit.form.RadioButton");
	dojo.require("dojox.grid.cells");
	dojo.require("idx.form.DropDownMultiSelect");
	dojo.require("idx.form.Select");

	factory(
		  dojo,								// dLang				(dojo/_base/lang)
		  idx,								// iMain				(idx)
		  dojo.declare,						// dDeclare				(dojo/_base/declare)
		  dojo.keys,						// dKeys				(dojo/keys)
		  dojo.date.locale,					// dDateLocale			(dojo/date/locale)
		  dojo,								// dConnect				(dojo/_base/connect)
		  {stop: dojo.stopEvent},			// dEvent				(dojo/_base/event) for (dEvent.stop)
		  dojo,								// dDomConstruct		(dojo/dom-construct)
		  {get: dojo.attr},					// dDomAttr				(dojo/dom-attr) for (dDomAttr.get)
		  {getContentBox: dojo.contentBox,	// dDomGeo				(dojo/dom-geometry) for (dDomGeo.getContentBox/getMarginBox)
		   getMarginBox: dojo.marginBox},
		  dijit,							// dijitMgr				(dijit/_base/manager)
		  dijit.form.CheckBox,				// dCheckBox			(dijit/form/CheckBox)
		  dijit.form.RadioButton,			// dRadioButton			(dijit/form/RadioButton)
		  dojox.grid.cells,					// dCells				(dojox/grid/cells)
		  idx.form.Select,					// iSelect				(../form/Select)
		  idx.form.DropDownMultiSelect);	// iDropDownMultiSelect	(../form/DropDowmMultiSelect)

} else {
define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/lang",
        "idx",
        "../../../../dist/lib/dojo/_base/declare",
        "dojo/keys",
        "dojo/date/locale",
        "dojo/_base/connect",
        "dojo/_base/event",
        "dojo/dom-construct",
        "dojo/dom-attr",
        "dojo/dom-geometry",
        "dijit/_base/manager",
        "dijit/form/CheckBox",
        "dijit/form/RadioButton",
        "dojox/grid/cells",
        "../form/Select",
        "../form/DropDownMultiSelect"], 
        factory);
}


})();
