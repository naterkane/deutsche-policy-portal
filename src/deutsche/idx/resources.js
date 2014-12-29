/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

/**
 * @name idx.resources
 * @class Provides a set of resources 
 */
(function()
{
function factory(dLang,iMain,dI18n,iString,iUtil)
{
  var iResources = dLang.getObject("resources", true, iMain);
  
  /**
   * Internal map of legacy scope names to new scope names for IDX 1.2+.
   */
  iResources._legacyScopeMap = {
		  "": 								"idx/",
		  ".":								"idx/",
		  "app": 							"idx/app/",
		  "app._Launcher": 					"idx/app/_Launcher",
		  "app.A11yPrologue": 				"idx/app/A11yPrologue",
		  "app.WorkspaceType": 				"idx/app/WorkspaceType",
		  "app.WorkspaceTab": 				"idx/app/WorkspaceTab",
		  "dialogs":						"idx/dialogs",
		  "form": 							"idx/form/",
		  "form.buttons":					"idx/form/buttons",
		  "grid": 							"idx/grid/",
		  "grid.prop":	 					"idx/grid/",
		  "grid.prop.PropertyGrid":			"idx/grid/PropertyGrid",
		  "grid.prop.PropertyFormatter":	"idx/grid/PropertyGrid",
		  "layout": 						"idx/layout/",
		  "layout.BorderContainer": 		"idx/layout/BorderContainer",
		  "layout.ECMTitlePane": 			"idx/layout/ECMTitlePane",
		  "widget": 						"idx/widget/",
		  "widget.ErrorDialog":				"idx/widget/ErrorDialog",
		  "widget.TypeAhead":				"idx/widget/TypeAhead",
		  "widget.HoverHelp":				"idx/widget/HoverHelp",
		  "widget.EditController":			"idx/widget/EditController"
  };
  
  /**
   * The cache (by locale) of default resources.  Each locale name points to
   * another array that maps bundle names to bundles that have been loaded. 
   * @type Array
   * @default []
   */
  iResources._localResources = [ ];

  /**
   * The cache (by locale) of current resources.  Each locale name points to
   * another array that maps bundle names to bundles that have been loaded
   * and possibly modified.
   * @type Array
   * @default []
   */
  iResources._currentResources = [ ];

  /**
   * the cache (by locale and then scope) of flattened scope-resources
   * @type Array
   * @default []
   */
  iResources._scopeResources = [ ];

  /**
   * Converts the previous "foo.bar" scopes to "idx/foo/bar" scopes.
   * This allows legacy usage to continue to function while allowing
   * product applications to use idx.resources as well for say "my/foo/bar".
   * The new preferred format is "[pkgA]/[pkgB]/[module]".
   * @param {String} scppe The optional scope to normalize.
   */
  iResources._normalizeScope = function(/*String*/scope) {
	  if ((! scope)||(scope.length == 0)) {
		  return "idx/";
	  }
	  if (iResources._legacyScopeMap[scope]) {
		  return iResources._legacyScopeMap[scope];
	  }
	  return scope;
  };

  /**
   * 
   */  
  iResources._getBundle = function(/*String*/packageName,/*String*/bundleName,/*String?*/locale) {
	  locale = dI18n.normalizeLocale(locale);
	  var scope = packageName + "." + bundleName;
	  var curResources = iResources._currentResources[locale];
	  if (!curResources) {
		  curResources = [ ];
		  iResources._currentResources[locale] = curResources;
	  }
	  var locResources = iResources._localResources[locale];
	  if (!locResources) {
		  locResources = [ ];
		  iResources._localResources[locale] = locResources;
	  }
	  
	  var bundle = curResources[scope];
	  if (!bundle) {
		  var locBundle = locResources[scope];
		  if (!locBundle) {
			  locBundle = dI18n.getLocalization(packageName, bundleName, locale);
			  if (!locBundle) locBundle = new Object();
			  locResources[scope] = locBundle;
		  }
		  bundle = new Object();
		  dLang.mixin(bundle,locBundle);
		  curResources[scope] = bundle;
	  }
	  
	  // return the bundle
	  return bundle;
  };
  
  /**
   * Clears any resource overrides and resets to the default resources for the
   * specified (or default) locale.
   * @param {String} locale
   */
  iResources.clearLocalOverrides = function(/*String?*/ locale) {
	 locale = dI18n.normalizeLocale(locale);
     iResources._currentResources[locale] = null;
     iResources._scopeResources[locale] = null;
  };

  /**
   * Clears all resource overrides for all locales.
   */
  iResources.clearOverrides = function() {
     iResources._currentResources = [ ];
     iResources._scopeResources = [ ];
  };

  /**
   * Installs new resources and/or overrides existing resources being either in
   * the base resource scope or in a specified scope.  Resources should only be
   * installed during application startup and then should be left unchanged to
   * maximize efficiency.
   * @param {Object} resources the new resources to override the old ones
   * @param {String} scope The optional string to override resources in a specific scope
   * rather than the whole of the resources.
   * @param {String} locale The locale to override for.
   */
  iResources.install = function(/*Object*/  resources, 
                                /*String*/  scope,
                                /*String?*/ locale) {
	locale = dI18n.normalizeLocale(locale);
	scope = iResources._normalizeScope(scope);
	var lastIndex = scope.lastIndexOf("/");
	
	var packageName = "";
	var bundleName  = "";
	if (lastIndex == scope.length - 1) {
		bundleName = "base";
		packageName = scope.substr(0,scope.length-1);
	} else if (lastIndex >= 0) {
		bundleName = scope.substr(lastIndex+1);
		packageName = scope.substr(0, lastIndex);
	}
    var bundle = iResources._getBundle(packageName, bundleName, locale);
    dLang.mixin(bundle, resources);
    iResources._clearResourcesCache(locale, scope);
  };

  /**
   * @returns {Object} Returns a flattened resources object containing all resources
   * for the optionally specified scope.  This is handy for obtaining an object of all
   * available strings for template population during buildRendering() functions.
   * If the scope is not specified then the root scope is assumed.  If the 
   * locale is not specified then the default locale is assumed.
   */
  iResources.getResources = function(/*String?*/ scope, /*String?*/ locale) {
    locale = dI18n.normalizeLocale(locale);
    scope = iResources._normalizeScope(scope);
    var scopeResources = iResources._scopeResources[locale];
    if (! scopeResources) {
       scopeResources = [ ];
       iResources._scopeResources[locale] = scopeResources;
    }

    var resourcesByScope = scopeResources[scope];

    // if we have a cached array of the resources, return it
    if (resourcesByScope) return resourcesByScope;

    resourcesByScope = new Object();

    var scopes = scope.split("/");
    var index = 0;
    var pkg = "";
    var prefix = "";
    for (index = 0; index < scopes.length; index++) {
    	var bundleName = "base";
    	if (index < scopes.length-1) {
    		pkg = pkg + prefix + scopes[index];
    		prefix = ".";
    	} else {
    		bundleName = scopes[index];
    	}
    	var bundle = iResources._getBundle(pkg,bundleName,locale);
    	if (!bundle) continue;
    	for (var field in bundle) {
    		resourcesByScope[field] = bundle[field];
    	}
    }
  
  	// cache for later
  	scopeResources[scope] = resourcesByScope;

  	// return the resources
    return resourcesByScope;     
  };

  /**
   * @returns {Object} Returns a flattened resources object containing all resources
   * for the optionally specified scope.  This is handy for obtaining an object of all
   * available strings for template population during buildRendering() functions.
   * If the scope is not specified then the root scope is assumed.  If the 
   * locale is not specified then the default locale is assumed.
   * @deprecated Use idx.resources.getResources instead
   */
  iResources.getStrings = function(/*String?*/ scope, /*String?*/ locale) {
	  return iResources.getResources(scope,locale);
  };
  
  /**
   * Clears out any cached objects represnting the resources by scope for a
   * particular locale.  This is called whenever new resources are installed 
   * for the locale (which should not be very often).
   * @param {String} locale
   */
  iResources._clearResourcesCache = function(/*String?*/ locale,/*String?*/scope) {
	locale = dI18n.normalizeLocale(locale);
	if (iResources._scopedResources[locale]) {
		if (!scope) {
			iResources._scopeResources[locale] = null;
		} else {
			var cache = iResources._scopeResources[locale];
			for (field in cache) {
				if (iString.startsWith(field,scope)) {
					cache[field] = null;
				}
			}
		}
	}
  };

  /**
   * Gets the named resources in the specified scope.  If the name is not found
   * in the specified scope then the parent scope is searched and then its 
   * parent up until the root scope.  If the resources is not found then null
   * is returned.  If the scope is not specified then the root scope is assumed.
   * The locale may be optionally specified as well.
   * @param {String} name
   * @param {String} scope
   * @param {String} locale
   * @returns {String} resource
   */
  iResources.get = function(/*String*/  name, 
                               /*String?*/ scope,
                               /*String?*/ locale) {
	locale = dI18n.normalizeLocale(locale);
	scope = iResources._normalizeScope(scope);
    var scopes = scope.split("/");
    var index = 0;
    for (index = 0; index < scopes.length; index++) {
    	var bundleName = (index == 0) ? scopes[scopes.length-1] : "base";
    	var pkgName = "";
    	var prefix = "";
    	var pkgMax = (index == 0) ? (scopes.length - index - 1) : (scopes.length - index);
    	for (var idx2 = 0; idx2 < pkgMax; idx2++) {
    		pkgName = pkgName + prefix + scopes[idx2];
    		prefix = ".";
    	}
    	var bundle = iResources._getBundle(pkgName,bundleName,locale);
    	if (!bundle) continue;
    	if (name in bundle) return bundle[name];
    }
    return null;
  };

  /**
   * Returns the resources to use for separating labels from their fields.
   * Typically this is a ":" or something to that effect.
   */
  iResources.getLabelFieldSeparator = function(/*String?*/ scope,
                                                  /*String?*/ locale) {
      return iResources.get("labelFieldSeparator", scope, locale);  
  };
  
  /**
   * Getter for date format options
   * @param {String} scope
   * @param {String} locale
   * @returns {String} date format options
   */
  iResources.getDateFormatOptions = function(/*String?*/ scope, 
                                                /*String?*/ locale) {
     return iResources.get("dateFormatOptions", scope, locale);
  };
  
  /**
   * Getter for time format options
   * @param {String} scope
   * @param {String} locale
   * @returns {String} time format options
   */
  iResources.getTimeFormatOptions = function(/*String?*/ scope,
                                                /*String?*/ locale) {
     return iResources.get("timeFormatOptions", scope, locale);
  };

  /**
   * Getter for date time format options
   * @param {String} scope
   * @param {String} locale
   * @returns {String} date time format options
   */
  iResources.getDateTimeFormatOptions = function(/*String?*/ scope,
                                                    /*String?*/ locale) {
     return iResources.get("dateTimeFormatOptions", scope, locale);
  };

  /**
   * Getter for decimal format format options
   * @param {String} scope
   * @param {String} locale
   * @returns {String} decimal format format options
   */
  iResources.getDecimalFormatOptions = function(/*String?*/ scope,
                                                   /*String?*/ locale) {
     return iResources.get("decimalFormatOptions", scope, locale);
  };

  /**
   * Getter for integer format format options
   * @param {String} scope
   * @param {String} locale
   * @returns {String} integer format format options
   */
  iResources.getIntegerFormatOptions = function(/*String?*/ scope, 
                                                   /*String?*/ locale) {
     return iResources.get("integerFormatOptions", scope, locale);
  };

  /**
   * Getter for percent format format options
   * @param {String} scope
   * @param {String} locale
   * @returns {String} percent format format options
   */
  iResources.getPercentFormatOptions = function(/*String?*/ scope,
                                                   /*String?*/ locale) {
     return iResources.get("percentFormatOptions", scope, locale);
  };

  /**
   * 
   * @param scope
   * @param locale
   * @returns
   */
  iResources.getCurrencyFormatOptions = function(/*String?*/ scope,
                                                    /*String?*/ locale) {
     return iResources.get("currencyFormatOptions", scope, locale);
  };
  
  return iResources;
}

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){

	dojo.provide("idx.resources");
	dojo.require("idx.string");
	dojo.require("dojo.i18n");
	dojo.require("idx.util");

	dojo.requireLocalization("idx", "base");

	factory(dojo,idx,dojo.i18n,idx.string,idx.util);
	
} else {
	define(["../../node_modules/intern-geezer/node_modules/dojo/_base/lang",
	        "idx",
	        "../../lib/dojo/i18n",
	        "./string",
	        "./util",
	        "dojo/i18n!./nls/base"],
	        factory);	
}
})();
