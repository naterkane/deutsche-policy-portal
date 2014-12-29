/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2011, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */
(function() {
function factory(dLang,iMain) {
	return dLang.getObject("ext", true, iMain);
}

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){

	dojo.provide("idx.ext");

	dojo.require("idx.widgets");
	dojo.require("idx.containers");
	dojo.require("idx.trees");
	dojo.require("idx.tooltips");
	dojo.require("idx.form.formWidgets");
	dojo.require("idx.form.buttons");
	dojo.require("idx.form.comboButtons");
	dojo.require("idx.form.dropDownButtons");
	dojo.require("idx.grid.grids");
	dojo.require("idx.grid.treeGrids");
	
	factory(dojo,idx);
	
} else {
	define(["../../node_modules/intern-geezer/node_modules/dojo/_base/lang",
	        "idx",
	        "./widgets",
	        "./containers",
	        "./trees",
	        "./tooltips",
	        "./form/formWidgets",
	        "./form/buttons",
	        "./form/comboButtons",
	        "./form/dropDownButtons",
	        "./grid/grids",
	        "./grid/treeGrids"],
	        factory);
}

})();
