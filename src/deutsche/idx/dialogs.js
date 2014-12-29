/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

(function(){
function factory(iMain,
				 dLang,
				 dDomStyle,
				 iResources,
				 iSimpleIconDialog,
				 iErrorDialog) 
{
	var iDialogs = dLang.getObject("dialogs", true, iMain);
	
	var res = iResources.getResources("idx/dialogs");
	
	iMain.info = iDialogs.info = function(s, cb, labelOk){
		labelOk = (labelOk || res.close);
		var args = {showCancel: false, title: res.information, iconClass: "idxSignIcon idxInformIcon", labelOk: labelOk, labelCancel: null};
		if(dLang.isObject(s)){
			args = dLang.mixin(args, s);
		}else{
			args.text = s;
		}
		showSimpleIconDialog(args, cb);
	};
	
	iMain.warn = iDialogs.warn = function(s, cb, labelOk){
		labelOk = (labelOk || res.close);
		var args = {showCancel: false, title: res.warning, iconClass: "idxSignIcon idxWarnIcon", labelOk: labelOk, labelCancel: null};
		if(dLang.isObject(s)){
			args = dLang.mixin(args, s);
		}else{
			args.text = s;
		}
		showSimpleIconDialog(args, cb);
	};
	
	iMain.error = iDialogs.error = function(error, cb, labelOk){
		labelOk = (labelOk || res.close);
		if(dLang.isObject(error)){
			showErrorDialog({error: error}, cb, labelOk);
		}else if(dLang.isString(error)){
			showSimpleIconDialog({showCancel: false, title: res.error, text: error, iconClass: "idxSignIcon idxErrorIcon", labelOk: labelOk, labelCancel: null}, cb);
		}
	};
	
	iMain.confirm = iDialogs.confirm = function(s, cbOk, cbCancel, labelOk, labelCancel){
		var args = {showCancel: true, title: res.confirmation, iconClass: "idxSignIcon idxWarnIcon", labelOk: labelOk, labelCancel: labelCancel};
		if(dLang.isObject(s)){
			args = dLang.mixin(args, s);
		}else{
			args.text = s;
		}
		showSimpleIconDialog(args, cbOk, cbCancel);
	};
	
	iMain.showProgressDialog = iDialogs.showProgressDialog = function(s, msec){
		var dialog = iDialogs._progressDialog;
		if(!dialog){
			dialog = iMain._progressDialog = iDialogs._progressDialog = new iSimpleIconDialog({
				style: "min-width:350px; min-height:90px; max-width: 600px;", 
				title: res.progress,
				showActionBar: false,
				iconClass: "idxSignIcon dijitContentPaneLoading"
			});
			dDomStyle.set(dialog.closeButtonNode, "display", "none");
			dialog._onKey = function(){};
			dialog.startup();
		}
		if(dLang.isObject(s)){
			dialog.set(s);
		}else{
			dialog.set({"text": s || res.loading})
		}
		dialog.show();
		if(msec){
			setTimeout(iDialogs.hideProgressDialog, msec);
		}
	};
	
	iMain.hideProgressDialog = iDialogs.hideProgressDialog = function(){
		if(iDialogs._progressDialog){
			iDialogs._progressDialog.hide();
		}
	};
	
	var showSimpleIconDialog = iMain.showSimpleIconDialog = iDialogs.showSimpleDialog = function(args, cbOk, cbCancel){
		var dialog = iDialogs._simpleIconDialog;
		if(!dialog){
			dialog = iMain._simpleIconDialog = iDialogs._simpleIconDialog 
			= new iSimpleIconDialog({style:"min-width:350px; min-height:90px; max-width: 600px;"});
			dialog.startup();
		}
		showDialog(dialog, args, cbOk, cbCancel);
	};
	
	var showErrorDialog = function(args, cbOk, labelOk){
		var dialog = iDialogs._errorDialog;
		if(!dialog){
			dialog = iMain._errorDialog = iDialogs._errorDialog = new iErrorDialog({style:"width:350px;"});
			dialog.startup();
		}
		dialog.set("labelOk", labelOk);
		showDialog(dialog, args, cbOk);
	};
	
	var showDialog = function(dialog, args, cbOk, cbCancel){
		dialog.showCancelNode(args.showCancel);
		dialog.onExecute = function(){
			dialog.hide();
			if(dLang.isFunction(cbOk)){
				cbOk.apply(iDialogs, arguments);
			}
		};
		dialog.onCancel = function(){
			dialog.hide();
			if(dLang.isFunction(cbCancel)){
				cbCancel.apply(iDialogs, arguments);
			}
		};
		dialog.set(args);
		dialog.show();
	};
	
	return iDialogs;
}

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
	dojo.provide("idx.dialogs");
	dojo.require("idx.main");
	dojo.require("idx.widget.SimpleIconDialog");
	dojo.require("idx.widget.ErrorDialog");
	dojo.require("idx.resources");
	dojo.requireLocalization("idx","base");
	dojo.requireLocalization("idx","dialogs");
	
	factory(idx,									// iMain	
			dojo,									// dLang
			{ get: dojo.style, set: dojo.style},	// dDomStyle
			idx.resources,							// iResources
			idx.widget.SimpleIconDialog,			// iSimpleIconDialog
			idx.widget.ErrorDialog);				// iErrorDialog
} else {
	define(["idx",
	        "../../node_modules/intern-geezer/node_modules/dojo/_base/lang",
	        "../../../node_modules/intern-geezer/node_modules/dojo/dom-style",
	        "idx/resources",
	        "idx/widget/SimpleIconDialog",
	        "idx/widget/ErrorDialog"],
	        factory);
}
})();
