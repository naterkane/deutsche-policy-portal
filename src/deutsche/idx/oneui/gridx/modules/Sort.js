define([
	"../../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	"../../../../../lib/dojo/_base/query",
	"dojo/_base/event",
	"dojo/_base/sniff",
	"dojo/keys",
	"dojo/dom",
	"dojo/dom-class",
	"../../../gridx/core/model/extensions/Sort",
	"../../../gridx/core/_Module",
	"dojo/i18n!../nls/Sort"
], function(declare, query, event, sniff, keys, dom, domClass, Sort, _Module, nls){

	return _Module.register(
	declare(_Module, {
		name: 'sort',

		forced: ['header'],

		modelExtensions: [Sort],
		
		constructor: function(){
			this._sortData = [];
		},

		getAPIPath: function(){
			return {
				sort: this
			};
		},

		load: function(){
			var g = this.grid;
			this.batchConnect(
				[g, 'onHeaderCellClick', '_onClick'],
				[g, 'onHeaderCellMouseOver', 'reLayout', g.vLayout],
				[g, 'onHeaderCellMouseOut', 'reLayout', g.vLayout]
			);
			g.columns().forEach(function(col){
				if(col.isSortable()){
					this._initHeader(col);
				}
			}, this);
			if(sniff('ff')){
				//Only in FF, there will be a selection border on the header node when clicking it holding CTRL.
				dom.setSelectable(g.header.domNode, false);
			}
			this._initFocus();
			this.loaded.callback();
		},
	
		columnMixin: {
			sort: function(isDescending, isAdd){
				var sort = this.grid.sort;
				sort._prepareSortData(this.id, isAdd);
				return sort.sort(sort._sortData);
			},
	
			isSorted: function(){
				return this.grid.sort.isSorted(this.id);
			},
	
			clearSort: function(){
				this.grid.sort.clear();
				return this;
			},
	
			isSortable: function(){
				var col = this.grid._columnsById[this.id];
				return col.sortable || col.sortable === undefined;
			},
	
			setSortable: function(isSortable){
				this.grid._columnsById[this.id].sortable = isSortable;
				return this;
			}
		},
	
		//Public--------------------------------------------------------------
		sort: function(sortData){
			//A column is always sortable programmatically. The sortable attribute is only meaningful for UI
			this._sortData = sortData || [];
			this.model.sort(sortData);
			this._updateHeader();
			return this.grid.body.refresh();
		},

		isSorted: function(colId){
			for(var i = this._sortData.length - 1; i >= 0; --i){
				var s = this._sortData[i];
				if(s.colId === colId){
					return true;
				}
			}
			return false;
		},
	
		clear: function(){
			this.sort();
		},

		getSortData: function(){
			return this._sortData;
		},
	
		//Private--------------------------------------------------------------
		_sortData: null,

		_onClick: function(e){
			event.stop(e);
			this._sort(e.columnId, domClass.contains(e.target, 'gridxArrowButtonNode'), e.ctrlKey);
		},

		_sort: function(id, isSortArrow, isNested){
			var g = this.grid;
			this._focusHeaderId = id;
			this._focusSortArrow = isSortArrow;
			if(g.column(id, 1).isSortable() && (isSortArrow || !g.select || !g.select.column)){
				this._prepareSortData(id,  isNested);
				this.sort(this._sortData);
			}
		},

		_prepareSortData: function(colId, isAdd){
			var oneway = true, desc = false, sortable = this.grid._columnsById[colId].sortable;
			if(sortable == 'descend'){
				desc = true;
			}else if(sortable != 'ascend'){
				oneway = false;
			}
			for(var s, i = this._sortData.length - 1; i >= 0; --i, s = 0){
				s = this._sortData[i];
				if(s.colId === colId){
					s.descending = oneway ? desc : !s.descending;
					break;
				}
			}
			if(!s){
				s = {
					colId: colId,
					descending: oneway && desc
				};
				this._sortData.push(s);
			}
			if(!isAdd){
				this._sortData = [s];
			}
		},

		_getSortModeCls: function(col){
			return {
				ascend: 'gridxSortAscendOnly',
				descend: 'gridxSortDescendOnly'
			}[col.isSortable()] || '';
		},

		_initHeader: function(col){
			var	n = col.headerNode();
			n.innerHTML = ["<div class='gridxSortNode'><div role='presentation' tabindex='0' class='gridxArrowButtonNode ",
				this._getSortModeCls(col),
				"'></div><div class='gridxColCaption'>",
				col.name(),
				"</div></div>"
			].join('');
			n.removeAttribute('aria-sort');
			n.setAttribute('title', nls.helpMsg);
		},
	
		_updateHeader: function(){
			var g = this.grid;
			query('[aria-sort]', g.header.domNode).forEach(function(n){
				this._initHeader(g.column(n.getAttribute('colid'), 1));
			}, this);
			for(var i = 0, len = this._sortData.length; i < len; ++i){
				var s = this._sortData[i],
					col = g.column(s.colId, 1),
					n = col.headerNode();
				n.innerHTML = ["<div class='gridxSortNode ",
					(s.descending ? 'gridxSortDown' : 'gridxSortUp'),
					"'><div role='presentation' tabindex='0' class='gridxArrowButtonNode ",
					this._getSortModeCls(col), "'></div>",
					"<div class='gridxArrowButtonChar'>",
					(s.descending ? "&#9662;" : "&#9652;"),
					"</div><div class='",
					len == 1 ? "gridxSortSingle" : "gridxSortNested",
					"'>", i + 1,
					"</div><div class='gridxColCaption'>", col.name(),
					"</div></div>"
				].join('');
				n.setAttribute('aria-sort', s.descending ? 'descending' : 'ascending');
			}
			g.vLayout.reLayout();
			if(g.focus && g.focus.currentArea() == 'header'){
				this._focus(this._focusHeaderId);
			}
		},

		//Keyboard support-----------------------------------------------------------------
		_focusHeaderId: null,

		_focusSortArrow: false,

		_initFocus: function(){
			var g = this.grid, focus = g.focus;
			if(focus){
				if(g.select && g.select.column){
					focus.registerArea({
						name: 'header',
						priority: 0,
						focusNode: g.header.domNode,
						scope: this,
						doFocus: this._doFocus,
						onFocus: this._onFocus,
//                        doBlur: hitch(this, this._doBlur),
//                        onBlur: hitch(this, this._onBlur),
						connects: [this.connect(g, 'onHeaderCellKeyPress', '_onKeyPress')]
					});
				}else{
					this.connect(g, 'onHeaderCellKeyDown', function(evt){
						if(evt.keyCode == keys.ENTER || evt.keyCode == keys.SPACE){
							this._sort(evt.columnId, false, evt.ctrlKey);
						}
					});
				}
			}
		},

		_doFocus: function(evt){
			var id = this._focusHeaderId = this._focusHeaderId || this.grid._columns[0].id;
			this._focus(id, evt);
			return true;
		},

		_onFocus: function(evt){
			this._focusSortArrow = false;
			return true;
		},

//        _doBlur: function(){
//            return true;
//        },

//        _onBlur: function(){
//            return true;
//        },

		_onKeyPress: function(e){
			switch(e.keyCode){
				case keys.RIGHT_ARROW:
				case keys.LEFT_ARROW:
					this._moveFocus(e);
					break;
				case keys.ENTER:
				case keys.SPACE:
					this._sort(this._focusHeaderId, this._focusSortArrow, e.ctrlKey);
			}
		},

		_moveFocus: function(evt){
			if(this._focusHeaderId){	//Only need to move focus when we are already focusing on a column
				var col, g = this.grid, dir = g.isLeftToRight() ? 1 : -1,
					delta = evt.keyCode == keys.LEFT_ARROW ? -dir : dir,
					focusSortArrow = this._focusSortArrow;
				event.stop(evt);	//Prevent scrolling the whole page.
				col = g.column(this._focusHeaderId, 1);
				var sortable = col.isSortable();
				if(!sortable || focusSortArrow ^ (delta < 0)){
					col = g.column(col.index() + delta);
				}
				if(col){
					this._focusHeaderId = col.id;
					this._focusSortArrow = col.isSortable() && (sortable || delta < 0) && !focusSortArrow;
					this._focus(col.id, evt);
				}
			}
		},

		_focus: function(id, evt){
			var header = this.grid.header,
				headerNode = header.getHeaderNode(id);
			header._focusNode(headerNode);
			if(evt){
				header.onMoveToHeaderCell(id, evt);
			}
			this._focusArrow(id);
		},

		_focusArrow: function(id){
			var header = this.grid.header;
			query('.gridxArrowButtonFocus', header.domNode).forEach(function(node){
				domClass.remove(node, 'gridxArrowButtonFocus');
			});
			if(this._focusSortArrow){
				var arrowNode = query('.gridxArrowButtonNode', header.getHeaderNode(id))[0];
				if(arrowNode){
					domClass.add(arrowNode, 'gridxArrowButtonFocus');
					arrowNode.focus();
				}
			}
		}
	}));
});

