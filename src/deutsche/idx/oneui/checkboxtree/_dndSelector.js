/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	"../../../../lib/dojo/_base/connect",
	"dojo/_base/array",
	"dojo/_base/lang",
	"dojo/_base/event",
	"dojo/_base/window",
	"dojo/mouse",
	"dijit/tree/_dndContainer"
], function(declare, connect, array, lang, event, win, mouse, _dndContainer){

	// module:
	//		oneui/checkboxtree/_dndSelector
	// summary:
	//		This is a base class for `oneui.checkboxtree.dndSource` , and isn't meant to be used directly.
	//		It's based on `dijit.tree._dndContainer`.

	return declare("idx.oneui.checkboxtree._dndSelector", _dndContainer, {
		// summary:
		//		This is a base class for `oneui.checkboxtree.dndSource` , and isn't meant to be used directly.
		//		It's based on `dijit.tree._dndSelector`.
		// tags:
		//		protected
		
		constructor: function(tree, params){
			// summary:
			//		Initialization
			// tags:
			//		private

			this.selection={};
			this.anchor = null;
			this.tree.domNode.setAttribute("aria-multiselect", !this.singular);
			this.events.push(
				connect.connect(this.tree, "_onNodeStateChange", this, "_onNodeStateChange"),
				connect.connect(this.tree.domNode, "onmousedown", this,"onMouseDown"),
				connect.connect(this.tree.domNode, "onmouseup", this,"onMouseUp"),
				connect.connect(this.tree.domNode, "onmousemove", this,"onMouseMove")
			);
		},
		
		//	singular: Boolean
		//		Allows selection of only one element, if true.
		//		Tree hasn't been tested in singular=true mode, unclear if it works.
		singular: false,
		
		//	candidateNode: oneui._TreeNode
		candidateNode: null,

		// methods
		getSelectedTreeNodes: function(){
			// summary:
			//		Returns a list of selected node(s).
			//		Used by dndSource on the start of a drag.
			// tags:
			//		protected
			var nodes=[], sel = this.selection;
			for(var i in sel){
				nodes.push(sel[i]);
			}
			return nodes;
		},

		selectNone: function(){
			// summary:
			//		Unselects all items
			// tags:
			//		private

			this.setSelection([]);
			return this;	// self
		},

		destroy: function(){
			// summary:
			//		Prepares the object to be garbage-collected
			this.inherited(arguments);
			this.selection = this.anchor = null;
		},
		addTreeNode: function(/*dijit._TreeNode*/node, /*Boolean?*/isAnchor){
			// summary
			//		add node to current selection
			// node: Node
			//		node to add
			// isAnchor: Boolean
			//		Whether the node should become anchor.

			this.setSelection(this.getSelectedTreeNodes().concat( [node] ));
			if(isAnchor){ this.anchor = node; }
			return node;
		},
		removeTreeNode: function(/*dijit._TreeNode*/node){
			// summary
			//		remove node from current selection
			// node: Node
			//		node to remove
			this.setSelection(this._setDifference(this.getSelectedTreeNodes(), [node]));
			return node;
		},
		isTreeNodeSelected: function(/*dijit._TreeNode*/node){
			// summary
			//		return true if node is currently selected
			// node: Node
			//		the node to check whether it's in the current selection

			return node.id && !!this.selection[node.id];
		},
		setSelection: function(/*dijit._treeNode[]*/ newSelection){
			// summary
			//      set the list of selected nodes to be exactly newSelection. All changes to the
			//      selection should be passed through this function, which ensures that derived
			//      attributes are kept up to date. Anchor will be deleted if it has been removed
			//      from the selection, but no new anchor will be added by this function.
			// newSelection: Node[]
			//      list of tree nodes to make selected
			var oldSelection = this.getSelectedTreeNodes();
			array.forEach(this._setDifference(oldSelection, newSelection), lang.hitch(this, function(node){
				node.setSelected(false);
				if(this.anchor == node){
					delete this.anchor;
				}
				delete this.selection[node.id];
			}));
			array.forEach(this._setDifference(newSelection, oldSelection), lang.hitch(this, function(node){
				node.setSelected(true);
				this.selection[node.id] = node;
			}));
			this._updateSelectionProperties();
		},
		
		_setDifference: function(xs,ys){
			// summary
			//      Returns a copy of xs which lacks any objects
			//      occurring in ys. Checks for membership by
			//      modifying and then reading the object, so it will
			//      not properly handle sets of numbers or strings.
			
			array.forEach(ys, function(y){ y.__exclude__ = true; });
			var ret = array.filter(xs, function(x){ return !x.__exclude__; });

			// clean up after ourselves.
			array.forEach(ys, function(y){ delete y['__exclude__']; });
			return ret;
		},
		
		_updateSelectionProperties: function() {
			// summary
			//      Update the following tree properties from the current selection:
			//      path[s], selectedItem[s], selectedNode[s]
			
			var selected = this.getSelectedTreeNodes();
			var paths = [], nodes = [];
			array.forEach(selected, function(node) {
				nodes.push(node);
				paths.push(node.getTreePath());
			});
			var items = array.map(nodes,function(node) { return node.item; });
			this.tree._set("paths", paths);
			this.tree._set("path", paths[0] || []);
			this.tree._set("selectedNodes", nodes);
			this.tree._set("selectedNode", nodes[0] || null);
			this.tree._set("selectedItems", items);
			this.tree._set("selectedItem", items[0] || null);
		},
		
		_onNodeStateChange: function(/*oneui._TreeNode*/ node, /*Boolean*/ checked){
			// If selected an unchecked item, clean the selection first.
			var nodes = this.getSelectedTreeNodes();
			if(nodes.length == 1 && nodes[0].checkboxNode.checked === false){
				this.selectNone();
			}
			// Add/Remove node
			if(checked == true){
				this.addTreeNode(node, true);
			}else{
				if(this.selection[ node.id ]) {
					this.removeTreeNode( node );
				}
			}
		},
		
		getItem: function(/*String*/ key){
			// summary:
			//		Returns the dojo.dnd.Item (representing a dragged node) by it's key (id).
			//		Called by dojo.dnd.Source.checkAcceptance().
			// tags:
			//		protected

			var widget = this.selection[key];
			return {
				data: widget,
				type: ["treeNode"]
			}; // dojo.dnd.Item
		},
		
		userSelect: function(node, multi, range){
			// summary:
			//		Add or remove the given node from selection, responding
			//      to a user action such as a click or keypress.
			// multi: Boolean
			//		Indicates whether this is meant to be a multi-select action (e.g. ctrl-click)
			// range: Boolean
			//		Indicates whether this is meant to be a ranged action (e.g. shift-click)
			// tags:
			//		protected

			if(this.singular){
				if(this.anchor == node && multi){
					this.selectNone();
				}else{
					this.setSelection([node]);
					this.anchor = node;
				}
			}else{
				if(range && this.anchor){
					var cr = this._compareNodes(this.anchor.rowNode, node.rowNode),
					begin, end, anchor = this.anchor;
					
					if(cr < 0){ //current is after anchor
						begin = anchor;
						end = node;
					}else{ //current is before anchor
						begin = node;
						end = anchor;
					}
					nodes = [];
					//add everything betweeen begin and end inclusively
					while(begin != end) {
						nodes.push(begin);
						begin = this.tree._getNextNode(begin);
					}
					nodes.push(end);

					this.setSelection(nodes);
				}else{
					if( this.selection[ node.id ] && multi ) {
						this.removeTreeNode( node );
					}else if(multi) {
						this.addTreeNode(node, true);
					}else {
						this.setSelection([node]);
						this.anchor = node;
					}
				}
			}
		},

		forInSelectedItems: function(/*Function*/ f, /*Object?*/ o){
			// summary:
			//		Iterates over selected items;
			//		see `dojo.dnd.Container.forInItems()` for details
			o = o || win.global;
			for(var id in this.selection){
				// console.log("selected item id: " + id);
				f.call(o, this.getItem(id), id, this);
			}
		},
		
		// mouse events
		onMouseDown: function(e){
			// summary:
			//		Event processor for onmousedown
			// e: Event
			//		mouse event
			// tags:
			//		protected

			// ignore click on not an item
			if(!this.current){ return; }

			if(!mouse.isLeft(e)){ return; }	// ignore right-click

			event.stop(e);

			this.candidateNode = this.current;
			
		},
		
		onMouseMove: function(e){
			// summary:
			//		Event processor for onmousemove
		},

		onMouseUp: function(e){
			// summary:
			//		Event processor for onmouseup
			// e: Event
			//		mouse event
			// tags:
			//		protected
			this.candidateNode = null;
		}
	});
});
