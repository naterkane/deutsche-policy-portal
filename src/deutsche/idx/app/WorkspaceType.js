/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

(function() 
{
function factory(dDeclare,		// (dojo/_base/declare)
				 dWidget,		// (dijit/_Widget)
				 dLang,			// (dojo/_base/lang)
				 dString,		// (dojo/string)
				 dIOQuery,		// (dojo/io-query)
				 iResources)	// (../resources)
{
	/**
	 * @name idx.app.WorkspaceType
	 * @class WorkspaceType widget describes how any Launcher widget may create a Workspace
	 * (which is analogous to a Dojo ContentPane). WorkspaceType's are used within the
	 * TabMenuLauncher to create the tabs (and possibly create Open menu options in the future).
	 * Each WorkspaceType references an external URL in order to obtain content, and thus eases
	 * development of different workspaces by different developers. Additionally, the referenced URLs
	 * need only provide the page fragment for their content (including any dojo.require() calls for
	 * specific modules that may be required by that workspace).
	 * @see idx.app.TabMenuLauncher
	 * @see idx.app.TabMenuDock
	 * @augments dijit._Widget
	 * @augments idx._ArgumentMixer
	 * @example
	   Example usage:
	   &lt;div dojoType="idx.app.TabMenuLauncher" 
			 defaultWorkspaceTypeID="HOME" 
			 stateCookieName="idx.app.launcher">
	   			<b>&lt;div dojoType="idx.app.WorkspaceType"</b>
	   				 workspaceTypeID="HOME" 
	   				 urlTemplate="tests/home.html" 
	   				 mixinArgs="{workspaceTypeName: 
	   				 resources.homeTabTitle}"/>
	   &lt;/div>
	 */
	return dDeclare("idx.app.WorkspaceType", [dWidget], 
			/**@lends idx.app.WorkspaceType#*/			
{  
	/**
	 * The unique key for identifying workspaces of this type.  
	 * This can be used with the launcher to create a new workspace.
	 * @type String
	 */
    workspaceTypeID: "", 
    
    /** 
     * The name of the workspace type.  This should come from an 
     * application-defined resource bundle as a displayable name for the
     * workspace type.
     * @type String
     * @default ""
     */
    workspaceTypeName: "",

    /**
     * The optional URL for the icon to associate with this workspace type.
     * @type String 
     * @default ""
     */
    icon: "",

    /**
     * The URL template for obtaining the content for workspaces of this type.
     * This is a "template" because a future enhancement may provide for 
     * specifying query-parameter substititution values.  This would be useful
     * for workspace types that are initially hidden but later openned 
     * programmatically.
     * @type String
     * @default ""
     */
    urlTemplate: "",
            
    /**
     * The flag indicating if the user can directly launch workspaces of this 
     * type type independant of other workspaes.  If true, then the user is 
     * typically provided with a means to directly create a new workspace of 
     * this type, if false then the means to create this workspace depends on 
     * another workpace programmatically triggering the event to open it 
     * (usually with some sort context provided).
     * @type boolean
     * @default true
     * 
     * --> would be used to hide from open menu and only programmatically opening is possible
     * --> i'm sure this is not be used in practice (i don't think this is fully implemented) 
     */
    directOpen: true,
    
    /**
     * The number of workspaces of this type that should be initially opened.
     * Currently values of 0 and 1 make sense for this.  Specifying a value
     * higher than 1 would seem to indicate the need for parameterizing the
     * URL template on construction.
     * @type int
     * @default 1
     * 
     * --> believe this is ALWAYS 1 in practice currently (0 is possible in ConsoleFrame)
     */
    initialOpen: 1,
    
    /**
     * The maximum number of workspaces of this type that can be open at any 
     * time.  If set to zero (0) then the it is effectively unlimited.  If set 
     * to one (1) then any attempt to open a workspace of this type beyond the 
     * first, should simply bring focus to the one that was originally opened, 
     * if greater than one (1) then any attempt to open workspaces of this type 
     * beyond the first should result in an error displayed to the user.
     * @type int
     * @default 1
	 *
     * --> believe this is ALWAYS 1 in practice currently
     */
    maxOpen: 1,
    
    /**
     * Indiciates if workspaces of this type can be closed.  Typically, this is 
     * only set to false in the case of permanently-displayed workspaces.
     * @type boolean
     * @default false
     * 
     * --> never implemented, but needs to be
     */
    closeable: false,

    /**
     * Indicates whether or not workspaces of this type should ask the user
     * for confirmation before closing whether or not the workspace has been
     * marked as dirty.  If the workspace has been marked as dirty then
     * confirmation will always be asked for before closing the workspace.
     * @type boolean
     * @default false
     * 
     * --> not implemented, may need to be
     */
    confirmClose: false,

    /**
     * The workspace arguments to use when constructing the workspace.
     * @type Object    
     * @default null
     * 
     */
    workspaceArgs: null,

    /**
     * The text resources to use with workspaces of this type.  
     * If not provided then the default resources are used.
     * type Object
     * @default null
     */
    resources: null,
    
	/**
	 * Constructor - Currently does nothing
	 * @param {Object} args
	 * @param {Object} node
	 */
    constructor: function(args, node) {
      // currently does nothing
    },

    /**
     * Overrides dijit._Widget.postMixInProperties() to 
     * handle the loading/overriding of resources.
     * @see dijit._Widget.postMixInProperties
     */
    postMixInProperties: function() {
      this.inherited(arguments);

      // get the default resources
      var defaultResources = iResources.getResources("idx/app/WorkspaceType", 
                                                         this.lang)

                                                         // determine if custom resources were specified and if so override 
      // the defaults as needed, otherwise use the defaults as-is
      if (this.resources) {
        var combinedResources = new Object();
        dLang.mixin(combinedResources, defaultResources);
        dLang.mixin(combinedResources, this.resources);
        this.resources = combinedResources;
      } else {
        this.resources = defaultResources;
      }
    },

    /**
     * Formats the title for workspaces of this type.  This uses the 
     * "templateTitle" resources along with the properties of this widget
     * and the specified arguments.  The default template title is 
     * "${workspaceTypeName}" and using this widget to format that yields
     * a title that is equivalent to the workspace type name.
     * @param {Object} args
     * @returns {String} title
     */
    formatTitle: function(args) {
      var titleTemplate = this.resources.workspaceTitle;
      if (! titleTemplate) titleTemplate = "${workspaceTypeName}";
      var title = dString.substitute(titleTemplate, this);
      if (args) title = dString.substitute(title, args);
      return title;
    },

    /**
     * Formats the message to display while loading a workspace of this type.
     * @param {String} title
     * @param {Object} args
     * @returns {String} msg
     */
    formatLoadingMessage: function(title, args) {
      var msgTemplate = this.resources.loadingMessage;
      if ((! msgTemplate) || (msgTemplate.length == 0)) return null;
      var msg = dString.substitute(msgTemplate, { workspaceTitle: title });
      if (args) msg = dString.substitute(msg, args);
      return msg;
    },

    /**
     * Formats the message for a failed load of a workspace of this type.
     * @param {String} title
     * @param {Object} args
     * @returns {String} msg 
     */
    formatFailedLoadMessage: function(title, args) {
      var msgTemplate = this.resources.failedLoadMessage;
      if ((! msgTemplate) || (msgTemplate.length == 0)) return null;
      var msg = dString.substitute(msgTemplate, { workspaceTitle: title });
      if (args) msg = dString.substitute(msg, args);
      return msg;
    },

    /**
     * Formats the message for confirming the closing of the workspace with the
     * user.  This can be overridden by workspace type via the specified
     * resources or by overriding this method.
     * @param {Workspace} workspace
     * @returns {String} msg 
     */
    formatConfirmCloseMessage: function(/*Workspace*/ workspace) { 
      var dirty = workspace.get("dirty");

      var msgTemplate = null;
      if (dirty) msgTemplate = this.resources.confirmDirtyCloseMessage; 
      if ((!msgTemplate) || (msgTemplate.length == 0)) {
        msgTemplate = this.resources.confirmCloseMessage;
      }
      return dString.substitute(msgTemplate, workspace);
    },

    /**
     * Formats the URL for workspaces of this type using the specified 
     * URL template.  The specified arguments can be used to pass parameters
     * to the URL.  If the urlTemplate ends in "?*" then all of the arguments
     * are tacked on at the end as query parameters.
     * @param {Object} args
     * @returns {String} url
     */
    formatURL: function(args) {
      if (! this.urlTemplate) return null;
      var url = dString.substitute(this.urlTemplate, args);
      if (url.substring(url.length-2) == "?*") {
          url = url.substring(0, url.length-2);
          if (args) {
            url = url + "?" + dIOQuery.objectToQuery(args);
          }
      }
      return url;
    }
});
}

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
	dojo.provide("idx.app.WorkspaceType");

	dojo.require("idx.ext");
	dojo.require("dijit._Widget");

	dojo.require("idx.resources");
	dojo.requireLocalization("idx","base");
	dojo.requireLocalization("idx.app","base");
	dojo.requireLocalization("idx.app","WorkspaceType");

	factory(dojo.declare,		// dDeclare		(dojo/_base/declare)
			dijit._Widget,		// dWidget		(dijit/_Widget)
			dojo,				// dLang		(dojo/_base/lang)
			dojo.string,		// dString		(dojo/string)
			dojo,				// dIOQuery		(dojo/io-query)
			idx.resources);		// iResources	(../resources)

} else {
	define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	        "../../../lib/dijit/_Widget",
	        "dojo/_base/lang",
	        "dojo/string",
	        "dojo/io-query",
	        "../resources",
	        "dojo/i18n!../nls/base",
	        "dojo/i18n!./nls/base",
	        "dojo/i18n!./nls/WorkspaceType"],
	        factory);
}
	    
})();
