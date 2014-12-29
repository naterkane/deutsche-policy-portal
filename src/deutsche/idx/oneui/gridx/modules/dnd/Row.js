define([
	"../../../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	"../../../../gridx/modules/dnd/Row",
	"../../../../gridx/core/_Module",
	"./Avatar"
], function(declare, Row, _Module, Avatar){

	return _Module.register(
	declare([Row], {
		avatar: Avatar
	}));
});
