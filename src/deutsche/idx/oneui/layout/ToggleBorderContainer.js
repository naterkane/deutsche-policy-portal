/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	"../../../../../dist/lib/dijit/layout/BorderContainer",
	"./ToggleSplitter"
], function(declare, BorderContainer){
	/**
	 * @name idx.oneui.layout.ToggleBorderContainer
	 * @class A BorderContainer using idx.oneui.layout.ToggleSplitter
	 * @augments dijit.layout.BorderContainer
	 */
	return declare("idx.oneui.layout.ToggleBorderContainer", [BorderContainer], {
		// _splitterClass: String
		//		Optional hook to override the default Splitter widget used by BorderContainer
		_splitterClass: "idx.oneui.layout.ToggleSplitter"
	});
});
