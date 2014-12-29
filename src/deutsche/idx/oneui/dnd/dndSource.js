/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
"../../../../node_modules/intern-geezer/node_modules/dojo/_base/array",
"../../../../lib/dojo/_base/connect",
"dojo/_base/declare",
"dojo/dom-geometry",
"dijit/tree/dndSource", 
"dijit/tree/_dndSelector", 
"./Manager"], function(array, connect, declare, domGeometry, TreeDndSource,_TreeDndSelector,DNDManager){
	
return declare("idx.oneui.dnd.dndSource", [TreeDndSource], {
	_onDragMouse: function(e){
		// summary:
		//		Helper method for processing onmousemove/onmouseover events while drag is in progress.
		//		Keeps track of current drop target.

		var m = DNDManager.manager(),
			oldTarget = this.targetAnchor,			// the TreeNode corresponding to TreeNode mouse was previously over
			newTarget = this.current,				// TreeNode corresponding to TreeNode mouse is currently over
			oldDropPosition = this.dropPosition;	// the previous drop position (over/before/after)

		// calculate if user is indicating to drop the dragged node before, after, or over
		// (i.e., to become a child of) the target node
		var newDropPosition = "Over";
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
			}else if(newTarget == this.tree.rootNode && newDropPosition != "Over"){
				// Can't drop before or after tree's root node; the dropped node would just disappear (at least visually)
				m.canDrop(false);
			}else{
				// Guard against dropping onto yourself (TODO: guard against dropping onto your descendant, #7140)
				var model = this.tree.model,
					sameId = false;
				if(m.source == this){
					for(var dragId in this.selection){
						var dragNode = this.selection[dragId];
						if(dragNode.item === newTarget.item){
							sameId = true;
							break;
						}
					}
				}
				if(sameId){
					m.canDrop(false);
				}else if(this.checkItemAcceptance(newTarget.rowNode, m.source, newDropPosition.toLowerCase())
						&& !this._isParentChildDrop(m.source, newTarget.rowNode)){
					m.canDrop(true);
				}else{
					m.canDrop(false);
				}
			}

			this.targetAnchor = newTarget;
			this.dropPosition = newDropPosition;
		}
	},
	onMouseMove: function(e){
		// summary:
		//		Called for any onmousemove/ontouchmove events over the Tree
		// e: Event
		//		onmousemouse/ontouchmove event
		// tags:
		//		private
		if(this.isDragging && this.targetState == "Disabled"){ return; }
		_TreeDndSelector.prototype.onMouseMove.apply(this, arguments);
		var m = DNDManager.manager();
		if(this.isDragging){
			this._onDragMouse(e);
		}else{
			if(this.mouseDown && this.isSource &&
				 (Math.abs(e.pageX-this._lastX)>=this.dragThreshold || Math.abs(e.pageY-this._lastY)>=this.dragThreshold)){
				var nodes = this.getSelectedTreeNodes();
				if(nodes.length){
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
					nodes = array.map(nodes, function(n){return n.domNode});
					m.startDrag(this, nodes, this.copyState(connect.isCopyKey(e)));
				}
			}
		}
	},
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
		// When focus moves in/out of the entire Tree
	onOverEvent: function(){
		// summary:
		//		This method is called when mouse is moved over our container (like onmouseenter)
		// tags:
		//		private
		_TreeDndSelector.prototype.onOverEvent.apply(this, arguments);
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
		_TreeDndSelector.prototype.onOutEvent.apply(this, arguments);
	}

})
	
});
