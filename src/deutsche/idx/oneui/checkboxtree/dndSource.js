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
	"idx/oneui/dnd/Manager",
	"dojo/mouse",
	"dojo/dom-class",
	"dojo/dom-geometry",
	"./_dndSelector"
], function(declare, connect, array, lang, event, DNDManager, mouse, domClass, domGeometry, _dndSelector){

	// module:
	//		idx/oneui/checkboxtree/_dndSelector
	// summary:
	//		Handles drag and drop operations (as a source or a target) for `idx.oneui.CheckBoxTree`
	
	/*=====
	idx.oneui.checkboxtree.__SourceArgs = function(){
		// summary:
		//		A dict of parameters for Tree source configuration.
		// isSource: Boolean?
		//		Can be used as a DnD source. Defaults to true.
		// accept: String[]
		//		List of accepted types (text strings) for a target; defaults to
		//		["text", "treeNode"]
		// copyOnly: Boolean?
		//		Copy items, if true, use a state of Ctrl key otherwise,
		// dragThreshold: Number
		//		The move delay in pixels before detecting a drag; 0 by default
		// betweenThreshold: Integer
		//		Distance from upper/lower edge of node to allow drop to reorder nodes
		this.isSource = isSource;
		this.accept = accept;
		this.autoSync = autoSync;
		this.copyOnly = copyOnly;
		this.dragThreshold = dragThreshold;
		this.betweenThreshold = betweenThreshold;
	}
	=====*/
	return declare("idx.oneui.checkboxtree.dndSource", _dndSelector, {
		// summary:
		//		Handles drag and drop operations (as a source or a target) for `idx.oneui.CheckBoxTree`

		// isSource: [private] Boolean
		//		Can be used as a DnD source.
		isSource: true,

		// accept: String[]
		//		List of accepted types (text strings) for the Tree; defaults to
		//		["text"]
		accept: ["text", "treeNode"],

		// copyOnly: [private] Boolean
		//		Copy items, if true, use a state of Ctrl key otherwise
		copyOnly: false,

		// dragThreshold: Number
		//		The move delay in pixels before detecting a drag; 5 by default
		dragThreshold: 5,

		// betweenThreshold: Integer
		//		Distance from upper/lower edge of node to allow drop to reorder nodes
		betweenThreshold: 0,

		constructor: function(/*dijit.Tree*/ tree, /*idx.oneui.checkboxtree.__SourceArgs*/ params){
			// summary:
			//		a constructor of the Tree DnD Source
			// tags:
			//		private
			if(!params){ params = {}; }
			lang.mixin(this, params);
			this.isSource = typeof params.isSource == "undefined" ? true : params.isSource;
			var type = params.accept instanceof Array ? params.accept : ["text", "treeNode"];
			this.accept = null;
			if(type.length){
				this.accept = {};
				for(var i = 0; i < type.length; ++i){
					this.accept[type[i]] = 1;
				}
			}

			// class-specific variables
			this.isDragging = false;
			this.mouseDown = false;
			this.targetAnchor = null;	// DOMNode corresponding to the currently moused over TreeNode
			this.targetBox = null;	// coordinates of this.targetAnchor
			this.dropPosition = "";	// whether mouse is over/after/before this.targetAnchor
			this._lastX = 0;
			this._lastY = 0;

			// states
			this.sourceState = "";
			if(this.isSource){
				domClass.add(this.node, "dojoDndSource");
//				if(dojo.dnd._manager){
//					dojo.dnd._manager = null;
//					var m = DNDManager.manager();
//					m.makeAvatar = function(){return new Avatar(m);};
//				}
//				this.dndManger = DNDManager.manager();
//				this.dndManger.makeAvatar = lang.partial(function(m){return new Avatar(m);}, this.dndManger);
			}
			this.targetState = "";
			if(this.accept){
				domClass.add(this.node, "dojoDndTarget");
			}
			// set up events
			this.topics = [
				connect.subscribe("/dnd/source/over", this, "onDndSourceOver"),
				connect.subscribe("/dnd/start", this, "onDndStart"),
				connect.subscribe("/dnd/drop", this, "onDndDrop"),
				connect.subscribe("/dnd/cancel", this, "onDndCancel")
			];
		},

		// methods
		checkAcceptance: function(source, nodes){
			// summary:
			//		Checks if the target can accept nodes from this source
			// source: dijit.tree.dndSource
			//		The source which provides items
			// nodes: DOMNode[]
			//		Array of DOM nodes corresponding to nodes being dropped, dijitTreeRow nodes if
			//		source is a dijit.Tree.
			// tags:
			//		extension
			return true;	// Boolean
		},

		copyState: function(keyPressed){
			// summary:
			//		Returns true, if we need to copy items, false to move.
			//		It is separated to be overwritten dynamically, if needed.
			// keyPressed: Boolean
			//		The "copy" control key was pressed
			// tags:
			//		protected
			return this.copyOnly || keyPressed;	// Boolean
		},
		destroy: function(){
			// summary:
			//		Prepares the object to be garbage-collected.
			this.inherited("destroy",arguments);
			array.forEach(this.topics, connect.unsubscribe);
			this.targetAnchor = null;
		},

		_onDragMouse: function(e){
			// summary:
			//		Helper method for processing onmousemove/onmouseover events while drag is in progress.
			//		Keeps track of current drop target.

			var m = DNDManager.manager(),
				oldTarget = this.targetAnchor,			// the TreeNode corresponding to TreeNode mouse was previously over
				newTarget = this.current,				// TreeNode corresponding to TreeNode mouse is currently over
				oldDropPosition = this.dropPosition;	// the previous drop position (over/before/after)
			var draggingRootNode = false;
			if(m.source.tree.model instanceof dijit.tree.ForestStoreModel){
				var rootNodes = m.source.tree.rootNode.getChildren();
				for(var i = 0; i < rootNodes.length; i++){
					if(rootNodes[i].id in m.source.selection){
						draggingRootNode = true;
						break;
					}
				}
			}else{
				if(m.source.tree.rootNode.id in m.source.selection){
					draggingRootNode = true;
				}
			}
		
			// calculate if user is indicating to drop the dragged node before, after, or over
			// (i.e., to become a child of) the target node
			var newDropPosition = "Over";
			if(!draggingRootNode && newTarget){
				if(newTarget && this.betweenThreshold > 0){
					// If mouse is over a new TreeNode, then get new TreeNode's position and size
					if(!this.targetBox || oldTarget != newTarget){
						this.targetBox = domGeometry.position(newTarget.rowNode, true);
					}
					if((e.pageY - this.targetBox.y) <= this.betweenThreshold){
						newDropPosition = "Before";
					}else if((e.pageY - this.targetBox.y) >= (this.targetBox.h - this.betweenThreshold)){
						newDropPosition = "After";
					}
				}
		
				if(newTarget != oldTarget || newDropPosition != oldDropPosition){
					if(oldTarget){
						this._removeItemClass(oldTarget.rowNode, oldDropPosition);
					}
					if(newTarget){
						this._addItemClass(newTarget.rowNode, newDropPosition);
					}
					// Check if it's ok to drop the dragged node on/before/after the target node.
					if(!newTarget){
						m.canDrop(false);
					}else if((newTarget == this.tree.rootNode || (this.tree.model instanceof dijit.tree.ForestStoreModel && newTarget.getParent() == this.tree.rootNode)) 
							&& newDropPosition != "Over"){
						// Can't drop before or after tree's root node; the dropped node would just disappear (at least visually)
						m.canDrop(false);
					}else if(m.source == this && (newTarget.id in this.selection)){
						// Guard against dropping onto yourself (TODO: guard against dropping onto your descendant, #7140)
						m.canDrop(false);
					}else if(this.checkItemAcceptance(newTarget.rowNode, m.source, newDropPosition.toLowerCase())
							&& !this._isParentChildDrop(m.source, newTarget.rowNode)){
						var bCanDrop = true;
						// If one of the selected nodes has the item of the target node.
						for(var x in m.source.selection){
							if(m.source.selection[x].item == newTarget.item){
								bCanDrop = false;
								break;
							}
						}
						m.canDrop(bCanDrop);
					}else{
						m.canDrop(false);
					}
		
					this.targetAnchor = newTarget;
					this.dropPosition = newDropPosition;
				}
			}else{
				m.canDrop(false);
			}
		},

		onMouseMove: function(e){
			// summary:
			//		Called for any onmousemove events over the Tree
			// e: Event
			//		onmousemouse event
			// tags:
			//		private
			if(this.isDragging && this.targetState == "Disabled"){ return; }
			var m = DNDManager.manager();
			if(this.isDragging){
				this._onDragMouse(e);
			}else{
				if(this.mouseDown && this.isSource &&
					 (Math.abs(e.pageX-this._lastX)>=this.dragThreshold || Math.abs(e.pageY-this._lastY)>=this.dragThreshold)){
					var nodes = this.getSelectedTreeNodes();
					if(nodes.length && !(nodes.length == 1 && nodes[0].checkboxNode.checked === false)){
						if(nodes.length > 1){
							//filter out all selected items which has one of their ancestor selected as well
							var seen = this.selection, i = 0, r = [], n, p;
							nextitem: while((n = nodes[i++])){
								for(p = n.getParent(); p && p !== this.tree; p = p.getParent()){
									if(seen[p.id]){ //parent is already selected, skip this node
										continue nextitem;
									}
								}
								//this node does not have any ancestors selected, add it
								r.push(n);
							}
							nodes = r;
						}
						nodes = array.map(nodes, function(n){return n.domNode;});
						m.startDrag(this, nodes, this.copyState(connect.isCopyKey(e)));
					}else{
						this.isDirectDnD = true;
						//Add candidate node to selection, should be removed once the DND
						//operation completed or canceled.
						this.setSelection([this.candidateNode]);
						m.startDrag(this, [this.candidateNode.domNode], this.copyState(connect.isCopyKey(e)));
					}
				}
			}
		},

		onMouseDown: function(e){
			// summary:
			//		Event processor for onmousedown
			// e: Event
			//		onmousedown event
			// tags:
			//		private
			this.mouseDown = true;
			this.mouseButton = e.button;
			this._lastX = e.pageX;
			this._lastY = e.pageY;
			event.stop(e);
			this.inherited(arguments);
		},

		onMouseUp: function(e){
			// summary:
			//		Event processor for onmouseup
			// e: Event
			//		onmouseup event
			// tags:
			//		private
			if(this.mouseDown){
				this.mouseDown = false;
				this.inherited(arguments);
			}
		},

		onMouseOut: function(){
			// summary:
			//		Event processor for when mouse is moved away from a TreeNode
			// tags:
			//		private
			this.inherited(arguments);
			this._unmarkTargetAnchor();
		},

		checkItemAcceptance: function(target, source, position){
			// summary:
			//		Stub function to be overridden if one wants to check for the ability to drop at the node/item level
			// description:
			//		In the base case, this is called to check if target can become a child of source.
			//		When betweenThreshold is set, position="before" or "after" means that we
			//		are asking if the source node can be dropped before/after the target node.
			// target: DOMNode
			//		The dijitTreeRoot DOM node inside of the TreeNode that we are dropping on to
			//		Use dijit.getEnclosingWidget(target) to get the TreeNode.
			// source: dijit.tree.dndSource
			//		The (set of) nodes we are dropping
			// position: String
			//		"over", "before", or "after"
			// tags:
			//		extension
			return true;
		},

		// topic event processors
		onDndSourceOver: function(source){
			// summary:
			//		Topic event processor for /dnd/source/over, called when detected a current source.
			// source: Object
			//		The dijit.tree.dndSource / dojo.dnd.Source which has the mouse over it
			// tags:
			//		private
			if(this != source){
				this.mouseDown = false;
				this._unmarkTargetAnchor();
			}else if(this.isDragging){
				var m = DNDManager.manager();
				m.canDrop(false);
			}
		},
		onDndStart: function(source, nodes, copy){
			// summary:
			//		Topic event processor for /dnd/start, called to initiate the DnD operation
			// source: Object
			//		The dijit.tree.dndSource / dojo.dnd.Source which is providing the items
			// nodes: DomNode[]
			//		The list of transferred items, dndTreeNode nodes if dragging from a Tree
			// copy: Boolean
			//		Copy items, if true, move items otherwise
			// tags:
			//		private

			if(this.isSource){
				this._changeState("Source", this == source ? (copy ? "Copied" : "Moved") : "");
			}
			var accepted = this.checkAcceptance(source, nodes);

			this._changeState("Target", accepted ? "" : "Disabled");

			if(this == source){
				DNDManager.manager().overSource(this);
			}

			this.isDragging = true;
		},

		itemCreator: function(/*DomNode[]*/ nodes, /*dojo.dnd.Source*/ source, /*Store*/ store){
			// summary:
			//		Returns objects passed to `Tree.model.newItem()` based on DnD nodes
			//		dropped onto the tree.   Developer must override this method to enable
			// 		dropping from external sources onto this Tree, unless the Tree.model's items
			//		happen to look like {id: 123, name: "Apple" } with no other attributes.
			// description:
			//		For each node in nodes[], which came from source, create a hash of name/value
			//		pairs to be passed to Tree.model.newItem().  Returns array of those hashes.
			// returns: Object[]
			//		Array of name/value hashes for each new item to be added to the Tree, like:
			// |	[
			// |		{ id: 123, label: "apple", foo: "bar" },
			// |		{ id: 456, label: "pear", zaz: "bam" }
			// |	]
			// tags:
			//		extension

			// TODO: for 2.0 refactor so itemCreator() is called once per drag node, and
			// make signature itemCreator(sourceItem, node, target) (or similar).
			var callBack = function(node){
				var item = dijit.byNode(node).item;
				var store = source.tree.model.store;
				var attrs = store.getIdentityAttributes(item);
				var result = {};
				var identity = "id";
				for(var i = attrs.length - 1; i >= 0; --i){
					result[attrs[i]] = store.getValue(item, attrs[i]);
					identity = attrs[i];
				}
				var fixIdentity = function(i){
					result[identity] = store.getValue(item, identity) + (new Date()).getTime();
				};
				store.fetchItemByIdentity({
					identity: identity,
					onItem: fixIdentity,
					scope: this
				});
				result["name"] = store.getValue(item, "name");
				return result;
			};
			return array.map(nodes, callBack, this); // Object[]
		},

		onDndDrop: function(source, nodes, copy){
			// summary:
			//		Topic event processor for /dnd/drop, called to finish the DnD operation.
			// description:
			//		Updates data store items according to where node was dragged from and dropped
			//		to.   The tree will then respond to those data store updates and redraw itself.
			// source: Object
			//		The dijit.tree.dndSource / dojo.dnd.Source which is providing the items
			// nodes: DomNode[]
			//		The list of transferred items, dndTreeNode nodes if dragging from a Tree
			// copy: Boolean
			//		Copy items, if true, move items otherwise
			// tags:
			//		protected
			if(this.containerState == "Over"){
				var tree = this.tree,
					model = tree.model,
					target = this.targetAnchor,
					requeryRoot = false;	// set to true iff top level items change

				this.isDragging = false;

				// Compute the new parent item
				var targetWidget = target;
				var newParentItem;
				var insertIndex;
				newParentItem = (targetWidget && targetWidget.item) || tree.item;
				if(this.dropPosition == "Before" || this.dropPosition == "After"){
					// TODO: if there is no parent item then disallow the drop.
					// Actually this should be checked during onMouseMove too, to make the drag icon red.
					newParentItem = (targetWidget.getParent() && targetWidget.getParent().item) || tree.item;
					// Compute the insert index for reordering
					insertIndex = targetWidget.getIndexInParent();
					if(this.dropPosition == "After"){
						insertIndex = targetWidget.getIndexInParent() + 1;
					}
				}else{
					newParentItem = (targetWidget && targetWidget.item) || tree.item;
				}

				// If necessary, use this variable to hold array of hashes to pass to model.newItem()
				// (one entry in the array for each dragged node).
				var newItemsParams;
				var addNewNode = function(node, newParentItem, insertIndex, checked, scope){
					var treeNode =  dijit.byNode(node);
					// Get the hash to pass to model.newItem().  A single call to
					// itemCreator() returns an array of hashes, one for each drag source node.
					var newItemsParams = scope.itemCreator([node], source, model.store);
					// model.store.fetchByIdentti
					// Create new item in the tree, based on the drag source.
					model.newItem(newItemsParams[0], newParentItem, insertIndex);
					// Update new item check state
					scope.tree.toggleNode(newItemsParams[0].id, checked);
					var childrenNodes = treeNode.getChildren();
					// Call addNewNode for the children nodes recursively.
					array.forEach(childrenNodes, function(childrenNode, idx){
						scope.tree.model.store.fetchItemByIdentity({
							identity: newItemsParams[0].id,
							onItem: lang.hitch(scope, function(item){
								addNewNode(childrenNode.domNode, item, idx, checked, this);
							})
						});
					}, this);
				};
				// Remove old items
				var removeNode = function(parentNode){
					var children = parentNode.getChildren();
					array.forEach(children, function(child, idx){
						removeNode(child);
					}, this);
					if(source.selection[parentNode.id]){
						source.removeTreeNode(parentNode);
					}
					source.tree.model.store.deleteItem(parentNode.item);
				};
				
				array.forEach(nodes, function(node, idx){
					// dojo.dnd.Item representing the thing being dropped.
					// Don't confuse the use of item here (meaning a DnD item) with the
					// uses below where item means dojo.data item.
					var sourceItem = source.getItem(node.id);

					// Information that's available if the source is another Tree
					// (possibly but not necessarily this tree, possibly but not
					// necessarily the same model as this Tree)
					if(array.indexOf(sourceItem.type, "treeNode") != -1){
						var childTreeNode = sourceItem.data,
							childItem = childTreeNode.item,
							oldParentItem = childTreeNode.getParent().item;
					}
					// Save check state for child node
					var checked = childTreeNode.checkboxNode.checked;
					// Save old children nodes.
					var oldParentNode = childTreeNode.getParent();
					var oldChildren = oldParentNode.getChildren();
					if(model.isItem(childItem)){
						// This is a node from a tree which is sharing the same model
						if(source == this){
							// This is a node from my own tree.
							if(typeof insertIndex == "number"){
								if(newParentItem == oldParentItem && childTreeNode.getIndexInParent() < insertIndex){
									insertIndex -= 1;
								}
							}
						}
						if(copy){
							// Call the recursive function to add dragged all nodes.
							addNewNode(node, newParentItem, insertIndex, checked, this);
						}else{
							model.pasteItem(childItem, oldParentItem, newParentItem, copy, insertIndex);
						}
						// TODO: Remove following code after fully tested.
//						// Update old parent check state
//						if(oldChildren && oldChildren.length > 0){
//							oldParentNode.update();
//							oldParentNode.updateParent();
//						}else{
//							this.tree.toggleNode(oldParentNode, false);
//						}
						// Update new item check state
						this.tree.toggleNode(childItem.id[0], checked);
						
						// TODO: Remove following code after fully tested.
//						// Update the source tree if the trees are sharing the same model
//						if(source != this){
//							var targetParent = this.tree.getNodesByItem(oldParentItem);
//							if(targetParent && targetParent[0]){
//								targetParent = targetParent[0];
//							}
//							var targetChildren = targetParent.getChildren();
//							if(targetChildren && targetChildren.length > 0){
//								targetParent.update();
//								targetParent.updateParent();
//							}
//							source.tree.toggleNode(childItem.id[0], checked);
//						}
					}else{
						// Call the recursive function to add dragged all nodes.
						addNewNode(node, newParentItem, insertIndex, checked, this);
						if(!copy){
							// Remove old items
							var oldNode = dijit.byNode(node);
							removeNode(oldNode);
							source.tree.model.store.save();
							// TODO: Remove following code after fully tested.
//							// Update old parent check state
//							if(oldChildren && oldChildren.length > 0){
//								oldParentNode.update();
//								oldParentNode.updateParent();
//							}else{
//								this.tree.toggleNode(oldParentNode, false);
//							}
						}
					}
				}, this);
				// Expand the target node (if it's currently collapsed) so the user can see
				// where their node was dropped.   In particular since that node is still selected.
				this.tree._expandNode(targetWidget);
			}
			this.onDndCancel();
		},
		
		onDndCancel: function(){
			// summary:
			//		Topic event processor for /dnd/cancel, called to cancel the DnD operation
			// tags:
			//		private
			this._unmarkTargetAnchor();
			this.isDragging = false;
			this.mouseDown = false;
			delete this.mouseButton;
			this._changeState("Source", "");
			this._changeState("Target", "");
			// Remove the selection which only contains the candidate node.
			if(this.isDirectDnD == true){
				//this.selectNone();
				this.isDirectDnD = false;
			}
		},

		// When focus moves in/out of the entire Tree
		onOverEvent: function(){
			// summary:
			//		This method is called when mouse is moved over our container (like onmouseenter)
			// tags:
			//		private
			this.inherited(arguments);
			DNDManager.manager().overSource(this);
		},

		onOutEvent: function(){
			// summary:
			//		This method is called when mouse is moved out of our container (like onmouseleave)
			// tags:
			//		private
			this._unmarkTargetAnchor();
			var m = DNDManager.manager();
			if(this.isDragging){
				m.canDrop(false);
			}
			m.outSource(this);

			this.inherited(arguments);
		},

		_isParentChildDrop: function(source, targetRow){
			// summary:
			//		Checks whether the dragged items are parent rows in the tree which are being
			//		dragged into their own children.
			//
			// source:
			//		The DragSource object.
			//
			// targetRow:
			//		The tree row onto which the dragged nodes are being dropped.
			//
			// tags:
			//		private

			// If the dragged object is not coming from the tree this widget belongs to,
			// it cannot be invalid.
			if(!source.tree || source.tree != this.tree){
				return false;
			}


			var root = source.tree.domNode;
			var ids = source.selection;

			var node = targetRow.parentNode;

			// Iterate up the DOM hierarchy from the target drop row,
			// checking of any of the dragged nodes have the same ID.
			while(node != root && !ids[node.id]){
				node = node.parentNode;
			}

			return node.id && ids[node.id];
		},

		_unmarkTargetAnchor: function(){
			// summary:
			//		Removes hover class of the current target anchor
			// tags:
			//		private
			if(!this.targetAnchor){ return; }
			this._removeItemClass(this.targetAnchor.rowNode, this.dropPosition);
			this.targetAnchor = null;
			this.targetBox = null;
			this.dropPosition = null;
		},

		_markDndStatus: function(copy){
			// summary:
			//		Changes source's state based on "copy" status
			this._changeState("Source", copy ? "Copied" : "Moved");
		}
	});
});