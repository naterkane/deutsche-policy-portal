define([
	"../../../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	"../../../../gridx/modules/dnd/Column",
	"../../../../gridx/core/_Module",
	"./Avatar"
], function(declare, Column, _Module, Avatar){

	return _Module.register(
	declare([Column], {
		avatar: Avatar
	}));
});
