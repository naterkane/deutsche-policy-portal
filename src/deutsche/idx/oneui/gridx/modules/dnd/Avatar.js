define([
	"../../../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	"../../../../../../../dist/lib/dojo/string",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dojo/_base/window",
	"dojo/dnd/Avatar",
	"dojo/i18n!../../nls/Dnd"
], function(declare, string, domClass, domConstruct, win, Avatar, nls){

	return declare(Avatar, {
		construct: function(manager){
			// summary:
			//		constructor function;
			//		it is separate so it can be (dynamically) overwritten in case of need
			var t = this;
			t.isA11y = domClass.contains(win.body(), "dijit_a11y");
			t.node = domConstruct.toDom([
				"<div class='gridxDndAvatar' style='position:absolute;'><div class='gridxDnDIcon' style='position:absolute;'>",
					t.isA11y ? "<span id='a11yIcon'>" + (t.manager.copy ? '+' : '<') + "</span>" : '',
				"</div><div class='gridxDnDItemCount'>", t._generateText(), "</div></div>"
			].join(''));
		},

		_generateText: function(){
			// summary:
			//		generates a proper text to reflect copying or moving of items
			var m = this.manager,
				info = m._dndInfo;
			return string.substitute(nls[[
				m.copy ? "copy" : "move",
				info.count == 1 ? "One" : "",
				info.cssName
			].join('')], [info.count]);
		}
	});
});
