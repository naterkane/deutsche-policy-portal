define([
	"../../../../../node_modules/intern-geezer/node_modules/dojo/_base/kernel",
	"dijit",
	"../../../../../../dist/lib/dojo/string",
	"dojo/_base/declare",
	"dojo/text!../../templates/FilterConfirmDialog.html",
	"dojo/i18n!../../nls/FilterBar",
	"dijit/Dialog",
	"dijit/layout/AccordionContainer",
	"dojo/data/ItemFileReadStore",
	"./FilterPane",
	"./Filter"
], function(dojo, dijit, string, declare, template, i18n){

	return declare(dijit.Dialog, {
		title: i18n.clearFilterDialogTitle,
		cssClass: 'gridxFilterConfirmDialog',
		autofocus: false,
		postCreate: function(){
			this.inherited(arguments);
			this.i18n = i18n;
			this.set('content', string.substitute(template, this));
			var arr = dijit.findWidgets(this.domNode);
			this.btnClear = arr[0];
			this.btnCancel = arr[1];
			this.connect(this.btnCancel, 'onClick', 'hide');
			this.connect(this.btnClear, 'onClick', 'onExecute');
		},
		onExecute: function(){
			this.execute();
		},
		execute: function(){}
	});
});