/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["../../../../node_modules/intern-geezer/node_modules/dojo/_base/lang",
		"../../../../lib/dojo/dom-class",
		"dojo/dom-style",
		"idx/oneui/Dialog",
		"dijit/Dialog"], function(lang,domClass,domStyle,oneuiDialog,dijitDialog){
	lang.extend(oneuiDialog, {
		startup: function(){
			dijitDialog.prototype.startup.apply(this, arguments);
			dojo.place(this.domNode, dojo.byId("widgetsContainer"));
			dojo.style(this.domNode, "position","static");
			dojo.style(this.domNode, "display","block");
		}
	})
})
