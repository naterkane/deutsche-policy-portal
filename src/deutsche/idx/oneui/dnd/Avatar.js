/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["../../../../node_modules/intern-geezer/node_modules/dojo/main", "../../../../../node_modules/intern-geezer/node_modules/dojo/dnd/common"], function(dojo) {
	// module:
	//		oneui/dnd/Avatar
	// summary:
	//		TODOC


dojo.declare("idx.oneui.dnd.Avatar", null, {
	// summary:
	//		Object that represents transferred DnD items visually
	// manager: Object
	//		a DnD manager object

	constructor: function(manager){
		this.manager = manager;
		this.construct();
	},

	// methods
	construct: function(){
		// summary:
		//		constructor function;
		//		it is separate so it can be (dynamically) overwritten in case of need
		var a = dojo.create("div", {
				"class": "idxDndAvatar",
				style: {
					position: "absolute",
					zIndex:   "1999",
					margin:   "0px"
				}
			}),
			source = this.manager.source, node,
			canDropIndicator = dojo.create("div", {
				"class": "dropIndicator dijitInline"
			}, a);
			avatarBody = dojo.create("div", {
				"class": "idxDndAvatarBody dijitInline",
				style: {opacity: 0.9}
			}, a),
			typeName = dojo.create("span", {
				"class": "dndType",
				innerHTML: (this.manager.copy ? "Copy" : "Move")
			}, avatarBody),
			itemNumber = dojo.create("span", {
				"class": "itemNumber",
				innerHTML: this._generateText()
			}, avatarBody);
		this.node = a;
	},
	destroy: function(){
		// summary:
		//		destructor for the avatar; called to remove all references so it can be garbage-collected
		dojo.destroy(this.node);
		this.node = false;
	},
	update: function(){
		// summary:
		//		updates the avatar to reflect the current DnD state
		dojo[(this.manager.canDropFlag ? "add" : "remove") + "Class"](this.node, "idxDndAvatarCanDrop");
		// replace text
		dojo.query(("idxDndAvatarBody itemNumber"), this.node).forEach(
			function(node){
				node.innerHTML = this._generateText();
			}, this);
	},
	_generateText: function(){
		// summary: generates a proper text to reflect copying or moving of items
		var leafNumber = 0;
		dojo.forEach(this.manager.nodes, function(node){
			leafNumber += dojo.query(".dijitLeaf", node).length;
		})
		return leafNumber;
	}
});

return idx.oneui.dnd.Avatar;
});
