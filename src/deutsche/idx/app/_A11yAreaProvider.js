(function() 
	/**@lends idx.app._A11yAreaProvider#*/			
{

function factory(dDeclare, iUtil,iA11y) {
	/*
	 * Licensed Materials - Property of IBM
	 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
	 * US Government Users Restricted Rights - Use, duplication or 
	 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
	 */
  return dDeclare("idx.app._A11yAreaProvider", null, { 
	/**
	 * Set this to false if this widget should not try to register
	 * the main content area with idx.a11y.registerMainArea().
	 * @default true
	 * @type boolean
	 */
	a11yRegisterMain: true,  

	/**
	 * Flag indicating if this widget will allow a request to defer
	 * registration of the main content area.
	 * @default true
	 * @type boolean
	 */
	a11yAllowMainDeferral: true,
	
	/**
	 * Set this to false if this widget should not try to register
	 * the banner area with idx.a11y.registerBannerArea().
	 * @default true
	 * @type boolean
	 */
	a11yRegisterBanner: true,  

	/**
	 * Flag indicating if this widget will allow a request to defer
	 * registration of the banner area.
	 * @default true
	 * @type boolean
	 */
	a11yAllowBannerDeferral: true,
	
	/**
	 * Set this to false if this widget should not try to register
	 * the navigation area with idx.a11y.registerNavigationArea().
	 * @default true
	 * @type boolean
	 */
	a11yRegisterNavigation: true,  
	
	/**
	 * Flag indicating if this widget will allow a request to defer
	 * registration of the navigation area.
	 * @default true
	 * @type boolean
	 */
	a11yAllowNavigationDeferral: true,
	
	/**
	 * Hanndles setting the registration flag for the main content area.
	 * 
	 */
	_setA11yRegisterMainAttr: function(register) {
		this.a11yRegisterMain = register;
		if (! this._started) return;
		if (register) {
			var mainNode = this._getA11yMainNode();
			if (!mainNode) return;
			if (iA11y.isMainAreaRegistered()) {
				this._a11yRequestMainPriority();
			}
			if (! iA11y.isMainAreaRegistered()) {
				iA11y.registerMainArea(mainNode);
				this._registeredMainNode = mainNode;
			}
		} else {
			if (!this._registeredMainNode) return;
			iA11y.unregisterMainArea(this._registeredMainNode);
			this._registeredMainNode = null;
		}
	},
	
	/**
	 * Hanndles setting the registration flag for the banner area.
	 */
	_setA11yRegisterBannerAttr: function(register) {
		this.a11yRegisterBanner = register;
		if (! this._started) return;
		if (register) {
			var bannerNode = this._getA11yBannerNode();
			if (!bannerNode) return;
			if (iA11y.isBannerAreaRegistered()) {
				this._a11yRequestBannerPriority();
			}
			if (! iA11y.isBannerAreaRegistered()) {
				iA11y.registerBannerArea(bannerNode);
				this._registeredBannerNode = bannerNode;
			}
		} else {
			if (!this._registeredBannerNode) return;
			iA11y.unregisterBannerArea(this._registeredBannerNode);
			this._registeredBannerNode = null;
		}
	},
	  
	/**
	 * Hanndles setting the registration flag for the navigation area.
	 */
	_setA11yRegisterNavigationAttr: function(register) {
		this.a11yRegisterNavigation = register;
		if (! this._started) return;
		if (register) {
			var navNode = this._getA11yNavigationNode();
			if (! navNode) return;
			if (iA11y.isNavigationAreaRegistered()) {
				this._a11yRequestNavigationPriority();
			}
			if (! iA11y.isNavigationAreaRegistered()) {
				iA11y.registerNavigationArea(navNode);
				this._registeredNavNode = navNode;
			 }
		} else {
			if (!this._registeredNavNode) return;
			iA11y.unregisterNavigationArea(this._registeredNavNode);
			this._registeredNavNode = null;
		}
	},
	
	/**
	 * 
	 */
	_requestPriority: function(functionName) {
		var parent = iUtil.getParentWidget(this);
		while ((parent) && (!(parent[functionName]))) {
			parent = iUtil.getParentWidget(parent);
		}
		if ((!parent) || (!(parent[functionName]))) {
			return true;
		}
		return (parent[functionName]());
	},
	
	/**
	 * Instructs this widget to request priority for the main area registration.
	 */
	_a11yRequestMainPriority: function() {
		this._requestPriority("a11yRequestMainDeferral");
	},
	
	/**
	 * Instructs this widget to request priority for the navigation area registration.
	 */
	_a11yRequestNavigationPriority: function() {
		this._requestPriority("a11yRequestNavigationDeferral");		
	},
	
	/**
	 * Instructs this widget to request priority for the banner area registration.
	 */
	_a11yRequestBannerPriority: function() {
		this._requestPriority("a11yRequestBannerDeferral");				
	},

	/**
	 * Requests this widget to defer registration of the main content area.
	 */
	a11yRequestMainDeferral: function() {
		if (!this.a11yAllowMainDeferral) return false;
		var result = this._requestPriority("a11yRequestMainDeferral");
		if (! result) return false;
		this.set("a11yRegisterMain", false);
		return true;
	},
	
	/**
	 * Requests this widget to defer registration of the navigation area.
	 */
	a11yRequestNavigationDeferral: function() {
		if (!this.a11yAllowNavigationDeferral) return false;
		var result = this._requestPriority("a11yRequestNavigationDeferral");		
		if (! result) return false;
		this.set("a11yRegisterNavigation", false);
		return true;
	},
	
	/**
	 * Requests this widget to defer registration of the banner area.
	 */
	a11yRequestBannerDeferral: function() {
		if (!this.a11yAllowBannerDeferral) return false;
		var result = this._requestPriority("a11yRequestBannerDeferral");
		if (! result) return false;
		this.set("a11yRegisterBanner", false);
		return true;
	},
	
	/**
	 * Call this from your "startup()" function after setting "_startup" to true. 
	 */
	a11yStartup: function() {
		if (! this._started) return;
		this.set("a11yRegisterMain", this.a11yRegisterMain);
		this.set("a11yRegisterNavigation", this.a11yRegisterNavigation);
		this.set("a11yRegisterBanner", this.a11yRegisterBanner);
	},
	
	/**
	 * Override this to return a non-null main node to be registered.
	 * @protected 
	 */
	_getA11yMainNode: function() {
		return null;
	},
	
	/**
	 * Override this to return a non-null banner node to be registered.
	 * @protected 
	 */
	_getA11yBannerNode: function() {
		return null;
	},
	
	/**
	 * Override this to return a non-null navigation node to be registered.
	 * @protected 
	 */
	_getA11yNavigationNode: function() {
		return null;
	}
  });
}

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){

	dojo.provide("idx.app._A11yAreaProvider");

	dojo.require("idx.util");
	dojo.require("idx.a11y");


	factory(dojo.declare,	// dDeclare 	(dojo/_base/declare)
			idx.util,		// iUtil		(../util)
			idx.a11y);		// iA11y		(../a11y)
} else {
	define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/declare","../util","../a11y"],factory);
}
  	
})();

