/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

(function() { // outer-scope to prevent polluting global namespace
	
function factory(dLang,iMain,dDom,dDomAttr,iUtil) {
	var iA11y = dLang.getObject("a11y", true, iMain);
	
    iA11y._mainNode = null;
    iA11y._navigationNode = null;
    iA11y._bannerNode = null;
    iA11y._a11yStatementURL = "";
    
    /**
     * Gets the prologue.
     */
    iA11y._getPrologue = function() {
		var b = dojo.body();
		var ap = iUtil.getChildWidget(b, false, idx.app.A11yPrologue);
		return ap;
    };
    
    /**
     * 
     */
    iA11y.setA11yStatementURL = function(url) {
    	var ap = iA11y._getPrologue();
    	if (!ap) return;
    	ap.set("a11yStatementURL", url);
    };
    
    /**
     * 
     */
    iA11y.getA11yStatementURL = function() {
    	return iA11y._a11yStatementURL;
    };
    
    /**
     * Checks if the main content area node has been registered.
     * @return boolean 
     */
    iA11y.isMainAreaRegistered = function() {
    	return iA11y._mainNode != null;
    };
    
    /**
     * Checks if the navigation area node has been registered.
     * @return boolean 
     */
    iA11y.isNavigationAreaRegistered = function() {
    	return iA11y._navigationNode != null;
    };
    
    /**
     * Checks if the banner area node has been registered.
     * @return boolean 
     */
    iA11y.isBannerAreaRegistered = function() {
    	return iA11y._bannerNode != null;
    };
    
    /**
     * @private
     * @param nodeOrID
     * @param attrName
     */
    iA11y._register = function(nodeOrID, currentNode, attrName, roleName) {
    	// get the node
    	var node = nodeOrID;
    	if (iUtil.typeOfObject(nodeOrID) == "string") {
    		node = dojo.byId(nodeOrID);
    		if (!node) {
				throw new Error("Could not find node for ID: " + nodeID);    			
    		}
    	}
    	
    	// unregister the current node
    	iA11y._unregister(node, currentNode, attrName, roleName);
    	
    	// set the wairole and role on the node
    	dojo.attr(node, {wairole: roleName, role: roleName});
    	
    	// look for the prologue
    	var ap = iA11y._getPrologue();
    	
    	// if no prologue then we are done
		if (!ap) return node;
		
		// clear the node with the prologue
		ap.set(attrName, nodeOrID);
		
		// return the node
		return node;
    };
    
	/**
	 * 
     * @param nodeOrID
     * @param attrName
	 * @private
	 */
	iA11y._unregister = function(nodeOrID, currentNode, attrName, roleName) {
		// initialize the result
		var result = currentNode;
		
		// get the node
    	var node = nodeOrID;
    	if (iUtil.typeOfObject(nodeOrID) == "string") {
    		node = dDom.byId(nodeOrID);
    		if (!node) {
				throw new Error("Could not find node for ID: " + nodeID);    			
    		}
    	}
    	
    	// check if the node matches the currently registered node
    	if (node == currentNode) {
    		// check to see if the roles are still as we last left them
    		var currentRole = dDomAttr.get(node, "wairole");
    		if (currentRole == roleName) dDomAttr.remove(node, "wairole");
    		currentRole = dojo.attr(node, "role");
    		if (currentRole == roleName) dDomAttr.remove(node, "role");
    		
    		// set the result to null to unregister
    		result = null;
    	} 
    	
    	// attempt to unregister with the prologue
		var ap = iA11y._getPrologue();
		
		// if no prologue then we are done
		if (!ap) return result;
		
		// get the current node registered with the prologue
		var current = ap.get(attrName);
		if (iUtil.typeOfObject(current) == "string") {
			current = dDom.byId(current);
		}
		
		// if not changed, clear the node with prologue
		if (current == node) ap.set(attrName, "");
		
		// return the result
		return result;
	};

	/**
	 * 
	 * @param nodeOrID
	 */
	iA11y.registerMainArea = function(nodeOrID) {
    	iA11y._mainNode = iA11y._register(nodeOrID, iA11y._mainNode, "mainNode", "main");
	};

	/**
	 * 
	 * @param nodeOrID
	 */
	iA11y.unregisterMainArea = function(nodeOrID) {
		iA11y._mainNode = iA11y._unregister(nodeOrID, iA11y._mainNode, "mainNode", "main");
	};

	/**
	 * 
	 * @param nodeOrID
	 */
	iA11y.registerBannerArea = function(nodeOrID) {
    	iA11y._bannerNode = iA11y._register(nodeOrID, iA11y._bannerNode, "bannerNode", "banner");
	};

	/**
	 * 
	 * @param nodeOrID
	 */
	iA11y.unregisterBannerArea = function(nodeOrID) {
		iA11y._bannerNode = iA11y._unregister(nodeOrID, iA11y._bannerNode, "bannerNode", "banner");
	};

	/**
	 * 
	 * @param nodeOrID
	 */
	iA11y.registerNavigationArea = function(nodeOrID) {
    	iA11y._navigationNode = iA11y._register(nodeOrID, iA11y._navigationNode, "navigationNode", "navigation");
	};

	/**
	 * 
	 * @param nodeOrID
	 */
	iA11y.unregisterNavigationArea = function(nodeOrID) {
		iA11y._navigationNode = iA11y._unregister(nodeOrID, iA11y._navigationNode, "navigationNode", "navigation");
	};

	/**
	 * 
	 * @param nodeOrID
	 */
	iA11y.registerShortcut = function(target, description, accessKey) {
		var ap = iA11y._getPrologue();
		if (!ap) return;
		return ap.addShortcut(target, description, accessKey);
	};

	/**
	 * 
	 * @param nodeOrID
	 */
	iA11y.unregisterShortcut = function(shortcutID) {
		var ap = iA11y._getPrologue();
		if (!ap) return;
		return ap.removeShortcut(shortcutID);
	};

	return iA11y;
} 

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){

	dojo.provide("idx.a11y");
	dojo.require("idx.main");
	dojo.require("idx.util");

	factory(dojo, 						// dLang		(dojo/_base/lang)
			idx,						// iMain		(idx)
			dojo,						// dDom			(dojo/dom)
			{get: dojo.attr,			// dDomAttr		(dojo/dom-attr)
			remove: dojo.removeAttr},
			idx.util); 					// iUtil		(./util)
} else {
	define(["../../node_modules/intern-geezer/node_modules/dojo/_base/lang",
	        "idx",
	        "../../../node_modules/intern-geezer/node_modules/leadfoot/node_modules/dojo/dom",
	        "dojo/dom-attr",
	        "./util"], 
	        factory);
}

})(); // end outer scope and execute function