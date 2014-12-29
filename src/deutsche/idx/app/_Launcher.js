/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

(function() {
function factory(dDeclare,				// (dojo/_base/declare)
			     dLayoutWidget,			// (dijit/layout/_LayoutWidget)
			     iA11yAreaProvider,		// (./_A11yAreaProvider
			     dLang,					// (dojo/_base/lang)
			     dArray,				// (dojo/_base/array)
			     dQuery,				// (dojo/query) + (dojo/NodeList-dom) (for dQuery.NodeList)
			     dDomConstruct,			// (dojo/dom-construct)
			     dDomClass,				// (dojo/dom-class.add)
			     dDomStyle,				// (dojo/dom-style.style)
			     dConnect,				// (dojo/_base/connect)
			     dCookie,				// (dojo/cookie)
			     iResources,			// (../resources)
			     iString,				// (../string)
			     iUtil,					// (../util)
			     iBus,					// (../bus)
			     iWorkspace,			// (./Workspace)
			     iWorkspaceType)		// (./WorkspaceType)   			 			  
{	
	// get the node list type
	var dNodeList = dQuery.NodeList;
	
	/**
	 * @name idx.app._Launcher
	 * @class This is an abstract base class for all launchers
	 * that handle creating Workspaces from WorkspaceType widgets
	 * @augments dijit.layout._LayoutWidget
	 * @augments idx.app._A11yAreaProvider
	 * @private
	 */
	return dDeclare("idx.app._Launcher", [dLayoutWidget, iA11yAreaProvider],
	    	/**@lends idx.app._Launcher#*/		
{
  /**
   * The workspace type ID of the default selected workspace after
   * initialization.  If no workspace for the WorkspaceType associated
   * with the ID is created on initialization then the first workspace 
   * of the first WorkspaceType is selected.  If multiple workspaces for
   * the associated WorkspaceType are created on initialization (no 
   * currently known use cases) then the first for that type will be 
   * selected. 
   * @type String
   */
  defaultWorkspaceTypeID: "",

  /**
   * The name of the HTTP cookie to automatically save the launcher state to.
   * If this is not set then no state will be saved.  If set, then the cookie
   * will be used upon initialization to attempt to restore the launcher to 
   * whatever state it was previously in.  The simpleist implementation of this
   * is simply to attempt to reselect the same workspace as was last selected,
   * however some implementations may actually provide a means to dynamically
   * reopen workspaces that were previously open.
   * @type String
   */
  stateCookieName: "",

  /**
   * The text resources to use with workspaces of this type.  
   * If not provided then the default resources are used.
   * @type Object
   */
  resources: null,


  /**
	* Constructor provides basic setup of internal data structures.
	* @param {Object} args
	* @param {Object} node
	*/
  constructor: function(args, node) {
    this._workspaceTypes = new Array();
    this._workspacesByType = new Array();
    this._workspacesByID = new Array();
    this._workspaceTypesByID = new Array();
    this._nextWorkspaceID = 0;
    this._launcherStarted = false;
    this._workspaceCount = 0;
    this._selectedWorkspace = null;
    this.subscriberScopeFilter = "idx.app.launcher";
    this.subscriberScopeRegexp = false;
  },

  /**
   * Overrides Overridden to handle the loading/overriding of resources.
   * The launcher topic is not subscribed to until after startup.
   * @see dijit._Widget.postMixInProperties
   */
  postMixInProperties: function() {
    // get the default resources
    var defaultResources = iResources.getResources("idx/app/_Launcher", this.lang);

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

    // setup the initial default workspace type
    this._initialWSTypeIDs = new Array();
    var initID = null;
    this.stateCookieName = iString.nullTrim(this.stateCookieName);
    if (this.stateCookieName != null) {
      initID = iString.nullTrim(dCookie(this.stateCookieName));
      if (initID != null) this._initialWSTypeIDs.push(initID);
    }
    initID = iString.nullTrim(this.defaultWorkspaceTypeID);
    if (initID != null) this._initialWSTypeIDs.push(initID);
  },

  /**
   * Opens a new workspaces of the specified type with the specified arguments.
   * @param {String} typeID
   * @param {Object} args
   * @returns {String} workspace ID for the workspace that was created.
   */
  openWorkspace: function(typeID /*String*/, args /*?Object?*/) {
     var wsType = this._workspaceTypesByID[typeID];
     if (wsType == null) {
       iBus.systemError(
         this,
         this.resources.unknownWorkspaceTypeError,
         { workspaceTypeID: typeID },
         null, /* TODO: maybe get an assigned error message ID */
         "Unknown workspace type: " + typeID,
         true); // throw an error
     }
     
     // check the open workspace count
     var openCount = this.getOpenWorkspaceCount(typeID);
    
     // check how many are allowed open
     var maxOpen = wsType.get("maxOpen");

     // check if we have a singleton
     if ((maxOpen == 1) && (openCount == 1)) {
       // get the workspace
       var workspaces = this._workspacesByType[typeID];
       var workspace = workspaces[0];
       this.selectWorkspace(workspace);
       return workspace;
     }

     // check the maximum open versus the open count
     if ((maxOpen > 0) && (openCount >= maxOpen)) {
       iBus.userError(
          this,
          this.resources.tooManyOpenWorkspaces,
          { maxOpen: maxOpen, workspaceTypeName: wsType.workspaceTypeName },
          null, /* TODO: mayber get an assigned error message ID */
          "Exceeded maximum open workspaces for workspace type: opened=[ "
          + openCount + " ], maxOpen=[ " + maxOpen + " ], typeID=[ "
          + typeID + " ], typeName=[ " + wsType.workspaceTypeName + " ]" );
       return null;
     }

     // get the workspace title
     var wsTitle = wsType.formatTitle(args);
     var titleSuffix = "";
     var maxSuffixIndex = -1;
     
     // compare the title to other workspaces
     var prevWorkspaces = this.getWorkspaces();
     for (var index = 0; index < prevWorkspaces.length; index++) {
    	 var pw = prevWorkspaces[index];
    	 var prevTitle = pw.get("baseTitle");
    	 if (wsTitle == prevTitle) {
    		 var suffixIndex = pw.get("titleSuffixIndex");
    		 if (suffixIndex > maxSuffixIndex) maxSuffixIndex = suffixIndex;
    	 }
     }
     
     // check the suffix index
     if (maxSuffixIndex >= 0) {
    	 var titleSuffixIndex = maxSuffixIndex + 1;
    	 var titleSuffix = " (" + titleSuffixIndex + ") ";
    	 wsTitle = {baseTitle: wsTitle, title: (wsTitle+titleSuffix), titleSuffixIndex: titleSuffixIndex};
     }
     // open the workspace
     return this._doOpenWorkspace(wsType, wsTitle, args);
  },

  /**
   * Handles creation of the content and registration of a workspace.  
   * This calls "_workspaceCreated" function to allow the sub-class to
   * do something with the created content.
   * @private
   * @param {idx.app.WorkspaceType} wsType
   * @param {String} wsTitle
   * @param {Object} args
   * @returns {idx.app.Workspace} workspace
   */
  _doOpenWorkspace: function(wsType  		/*WorkspaceType*/, 
                             wsTitle 		/*String*/,
                             args    		/*?Object?*/) {
    // create the workspace ID
    var wsID = wsType.workspaceTypeID + ":" + (this._nextWorkspaceID++) + "-" 
               + (100000 + Math.floor(Math.random()*900000));

    // create the content
    var workspace = this._createWorkspace(wsType, wsID, wsTitle, args);
    dDomClass.add(workspace.domNode, this.getWorkspaceStyleClass());
    // record the workspace
    this._workspacesByID[wsID] = workspace;
    this._workspacesByType[wsType.workspaceTypeID].push(workspace);    

    dConnect.connect(workspace, "onDownloadEnd", this, "resize");
    
    // let the sub-class know we created a workspace so it can be displayed
    this._workspaceCreated(workspace);

    // start the workspace
    workspace.startup();

    // increment the workspace count
    this._workspaceCount++;

    // return the workspace ID
    return workspace;
  },
  
  /**
   * Creates the content pane to hold the content for a workspace.  
   * The actual content is loaded via a URL.
   * @param{idx.app.WorkspaceType}  wsType
   * @param {String} workspaceID
   * @param {String} title
   * @param {Object} args
   * @returns {idx.app.Workspace} workspace
   */
  _createWorkspace: function(wsType        /*WorkspaceType*/,
                             workspaceID   /*String*/, 
                             title         /*String*/,
                             args          /*?Object?*/) 
  {
    var wsArgs = this._createWorkspaceArgs(wsType, workspaceID, title, args);
    var workspace = new iWorkspace(wsArgs);

    var caller = {
       launcher: this,
       workspace: workspace,
       loaded: function(data) {
          this.launcher.workspaceLoaded(this.workspace, data);
       }
    };

     var connection = dConnect.connect(workspace, "onLoad", caller, caller.loaded);

     return workspace;
  },

  /**
   * Creates the arguments to be used by the workspace
   * @private
   * @param{idx.app.WorkspaceType}  wsType
   * @param {String} workspaceID
   * @param {String} title
   * @param {Object} args
   * @param wsType
   * @returns {Object} wsArgs
   */
  _createWorkspaceArgs: function(wsType        /*WorkspaceType*/,
                             workspaceID   /*String*/, 
                             title         /*String*/,
                             args          /*?Object?*/) 
  {
	// attempt to inherit the "lang" and "dir" properties
	// default to launcher values, but prefer those from WorkspaceType
	// ultimately the explicit args from the WorkspaceArgs.workspaceArgs win out
	var defaults = { };
	if (iString.nullTrim(this.lang)) defaults.lang = this.lang;
	if (iString.nullTrim(this.dir)) defaults.dir = this.dir;
	var wstLang = wsType.get("lang");
	var wstDir  = wsType.get("dir");
	if (iString.nullTrim(wstLang)) defaults.lang = wstLang;
	if (iString.nullTrim(wstDir)) defaults.dir = wstDir;
	
	// create the base arguments
    var wsArgs = { 
        workspaceID: workspaceID,
        workspaceTypeID: wsType.workspaceTypeID,
        workspaceArgs: args,
        loadingMessage: this.getLoadingMessage(wsType, title, args),
        errorMessage: this.getFailedLoadMessage(wsType, title, args),
        href: wsType.formatURL(args),
        preventCache: true,
        refreshOnShow: false,
        parseOnLoad: true
      };

    if (iUtil.typeOfObject(title) == "string") {
    	wsArgs.title = title;
    	wsArgs.baseTitle = title;
    } else {
    	wsArgs.title = title.title;
    	wsArgs.baseTitle = title.baseTitle;
    	wsArgs.titleSuffixIndex = title.titleSuffixIndex;
    }
    
    // get the explicit arguments from the WorkspaceType
	var explicitArgs = wsType.get("workspaceArgs");
	
	// default the "lang" and "dir" properties if not explicitly given
	if (explicitArgs) {
		for (field in defaults) {
			if (! (field in explicitArgs)) wsArgs[field] = defaults[field];
		}
	}
	
	// mixin the explicit arguments
    dLang.mixin(wsArgs, explicitArgs);
    
    // return the arguments
    return wsArgs;
  },

  /**
  * Workspace selection method. Must be overridden to do something
  * @param {idx.app.Workspace} workspace
  */
  selectWorkspace: function(workspace) {

  },

  /**
   * This function is called when a work space is selected
   * Currently does nothing.
   * @param {idx.app.Workspace} selectedWorkspace 
   * @param {idx.app.Workspace} previousWorkspace 
   */
  onWorkspaceSelected: function(selectedWorkspace, previousWorkspace) {
    // do nothing for now
  },

  /**
   * This should be connected to any control that changes the selected
   * workspace (typically the contained dock).  This function also calls
   * the "onWorkspaceSelected" function.
   * Calls '_saveStateToCookie' and 'onWorkspaceSelected'.
   * @private
   * @param {idx.app.Workspace} selectedWorkspace 
   * @param {idx.app.Workspace} previousWorkspace 
   */
  _onWorkspaceSelected: function(workspace, previous) {
    if ((previous != null) && (workspace != null)
        && (workspace.workspaceTypeID == previous.workspaceTypeID)) return;
    this._selectedWorkspace = workspace;
    this._saveStateToCookie();
    this.onWorkspaceSelected(workspace, previous);
  },

  /**
   * Actually performs the work of saving the selected workspace -- this is
   * likely to change in the future to save more than that.
   * @private
   */
  _saveStateToCookie: function() {
    if (iString.nullTrim(this.stateCookieName) == null) return;
    if (this._selectedWorkspace == null) {
        // delete the cookie
        dCookie(this.stateCookieName, null, {expires: -1});
    } else {
        // update the cookie
        dCookie(this.stateCookieName, 
                    this._selectedWorkspace.get("workspaceTypeID"),
                    { expires: 365 });
    }
  },

  /**
   * Implemented to find the default workspace and select it.  This first
   * tries to find the first workspace of the _initialWorkspaceTypeID (set
   * from a valid defaultWorkspaceTypeID value), and if no such workspace 
   * is found, simply selects the first Workspace of the first WorkspaceType 
   * that has an open Workspace.
   * @private
   */
  _selectDefaultWorkspace: function() {
    var index = 0;
    var defaultWorkspace = null;
    var wsTypeID = this._initialWorkspaceTypeID;

    // attempt to get the first open workspace from the default
    // workspace type
    if ((wsTypeID != null) && (wsTypeID.length > 0)
        && (this.getOpenWorkspaceCount(wsTypeID) > 0)) {
        var workspaces = this._workspacesByType[wsTypeID];
        defaultWorkspace = workspaces[0];
    }

    // if no default has been found then find the first workspace from
    // the first workspace type has an open workspace
    for (index = 0; 
         ((index < this._workspaceTypes.length) 
          && (defaultWorkspace == null)); 
         index++) {

        var workspaceType = this._workspaceTypes[index];
        wsTypeID = workspaceType.get("workspaceTypeID");

        if ((! defaultWorkspace)
            && (this.getOpenWorkspaceCount(wsTypeID) > 0)) {
          var workspaces = this._workspacesByType[wsTypeID];
          defaultWorkspace = workspaces[0];
        }
    }
    if (defaultWorkspace) {
        this.selectWorkspace(defaultWorkspace);
        this._selectedWorkspace = defaultWorkspace;
        this._saveStateToCookie();
    }
  },

/**
 * Called when workspace loaded. Currently does nothing
 * @param {idx.app.Workspace} workspace
 * @param {Object} data
 */
  workspaceLoaded: function(workspace, data) {
    // do nothing
  },
    

  /**
   * Returns the CSS class to apply to the workspace content.  
   * This method is meant to be overridden.
   * @param {idx.app.WorkspaceType} wsType
   * @param {Object} args
   * @returns {String} CSS class.
   */
  getWorkspaceStyleClass : function(wsType, args) {
    return this.baseClass + "_Workspace";
  },

  /**
   * This method is called whenever a workspace is created.
   * This base class rendition does nothing, subclassers should override.
   * @private
   * @param {idx.app.Workspace} workspace
   */
  _workspaceCreated: function(workspace       /*Workspace*/) {
     // do nothing for now -- subclass should override this
  },

  /**
   * Gets the messge to display if the workspace 
   * failed to load its content.
   * @param {idx.app.WorkspaceType} wsType
   * @param {String} wsTitle
   * @param {Object} args
   * @returns {String} failed to load message
   */
  getFailedLoadMessage: function(wsType   /*WorkspaceType*/, 
                              wsTitle /*String*/,
                              args    /*?Object?*/) {
	  var msg = this._getFailedLoadMessage(wsType, wsTitle, args);
	  return "<div class='dijitContentPaneError'>" + msg + "</div>";
  },
  
  /**
   * 
   */
  _getFailedLoadMessage: function(wsType   /*WorkspaceType*/, 
          wsTitle /*String*/,
          args    /*?Object?*/) {
 
	var msg = wsType.formatFailedLoadMessage(wsTitle, args);
    if ((msg != null) && (msg.length > 0)) return msg;
    var msgTemplate = this.resources.failedLoadMessageTemplate;
    if ((!msgTemplate) || (msgTemplate.length == 0)) return "";
    msg = dString.substitute(msgTemplate, {workspaceTitle: wsTitle});
    if (args) msg = dString.substitute(msg, args);
    return msg;
  },

  /**
   * Gets the message to display while the workspace is loading its content.
   * @param {idx.app.WorkspaceType} wsType
   * @param {String} wsTitle
   * @param {Object} args
   * @returns {String} loading message
   */
  getLoadingMessage: function(wsType   /*WorkspaceType*/, 
                              wsTitle /*String*/,
                              args    /*?Object?*/) {
    var msg = this._getLoadingMessage(wsType, wsTitle, args);
    return "<div class='dijitContentPaneLoading'>" + msg + "</div>";    
  },

  /**
   * Gets the message to display while the workspace is loading its content.
   * @param {idx.app.WorkspaceType} wsType
   * @param {String} wsTitle
   * @param {Object} args
   * @returns {String} loading message
   */
  _getLoadingMessage: function(wsType   /*WorkspaceType*/, 
                              wsTitle /*String*/,
                              args    /*?Object?*/) {
    var msg = wsType.formatLoadingMessage(wsTitle, args);
    if ((msg != null) && (msg.length > 0)) return msg;
    var msgTemplate = this.resources.failedLoadMessageTemplate;
    if ((!msgTemplate) || (msgTemplate.length == 0)) return "";
    var msg = dString.substitute(msgTemplate, {workspaceTitle: wsTitle});
    if (args) msg = dString.substitute(msg, args);
    return msg;
  },

  /**
   * This method is called to close a workspace via its workspace ID.
   * @param {String} workspaceID
   * @returns {String} workspaceID
   */
  closeWorkspace: function(workspaceID) {
     // get the workspace
     var workspace = this._workspacesByID[workspaceID];
     if (! workspace) return null;

     // get the workspace type ID
     var wsTypeID = workspace.get("workspaceTypeID");

     // get the workspace type
     var workspaceType = this._workspaceTypesByID[wsTypeID];
     if (!workspaceType) {
        iBus.systemError(
           this,
           this.resources.unknownWorkspaceTypeError,
           { workspaceTypeID: wsTypeID },
           null, /* TODO: maybe get an assigned error message ID */
           "Unknown workspace type: " + wsTypeID,
           true); // throw an error
      }

     // check to see if the workspace is dirty
     var workspaceDirty = workspace.get("workspaceDirty");
     
     // check if we need to confirm closing of the workspace
     var closeConfirmation = workspaceType.getCloseConfirmation(workspace);
     if (closeConfirmation != null) {
       // TODO -- need to ask the user if they are sure they want to close
       // we need a good API for this without having to constant use callbacks
       // i.e.: we want something synchronous rather than asynchronous
       //var confirmation  = new idx.bus.Confirmation(
       var cancelled = false;
  
       // check if cancelled
       if (cancelled) return false;
     }

     // if we get here then we need to close the workspace
     var preserve = this._workspaceClosing(workspace);
     if (! preserve) workspace.destroyRecursively();
     this._workspaceClosed(workspace);
     return wsTypeID;
  },

  /**
   * Called to do cleanup when workspace closing
   * Subclassers implement.
   * @private
   * @param {idx.app.Workspace} workspace
   * @returns {Boolean} false
   */
  _workspaceClosing: function(workspace /*Workspace*/) {
    return false;
  },

  /**
   * Called after workspace closed
   * Decrements workspace count.
   * @private
   * @param {idx.app.Workspace} workspace
   */
  _workspaceClosed: function(workspace /*Workspace*/) {
    // decrement the workspace count
    this._workspaceCount--;
  },

  /**
   * Overridden to handle registering all workspace types as well as handle
   * subscribing to the launcher topic.
   */
  startup: function() {
    // check if already started2
    if (this._launcherStarted) { return; }
    
    // defer to the inherited implementation
    this.inherited(arguments);

    // setup the children
    dArray.forEach(this.getChildren(), this._setupChild, this);

    // choose the initial workspace according to the priority ws-type array
    this._initialWorkspaceTypeID = null;
    var index = 0;
    for (index = 0; 
         ((index < this._initialWSTypeIDs.length)
          && (this._initialWorkspaceTypeID == null)); 
         index++) {
       // get the next worksace type ID
       var wsTypeID = this._initialWSTypeIDs[index];

       // get the associated workspace type (if one exists)
       var wsType = this._workspaceTypesByID[wsTypeID];

       // check if it exists, and if so then check if we can use it
       if (wsType != null) {
         // get the number of initially open workspaces
         var initOpen = wsType.get("initialOpen");

         // if the number of initially open workspaces is positive, then use it
         if (initOpen > 0) {
             this._initialWorkspaceTypeID = wsTypeID;
         }
       }
    }
    // open the initial workspaces
    var index1 = 0;
    for (index1 = 0; index1 < this._workspaceTypes.length; index1++) {
      var wsType = this._workspaceTypes[index1];
      var initOpen = wsType.get("initialOpen");
      var index2 = 0;
      for (index2 = 0; index2 < initOpen; index2++) {
        // TODO(bcaceres): consider allowing the workspace types to define
        // arguments to pass to each of the initially open workspaces
        this.openWorkspace(wsType.workspaceTypeID, null); 
      }
    }

    // subscribe to the launcher topic
    if ((this.launcherTopic) && (this.launcherTopic.length > 0)) {
      dConnect.subscribe(this.launcherTopic, this, this.handleRequest);

    }
    this._selectDefaultWorkspace();
    this._launcherStarted = true;
  },

  /**
   * Attempts to select and return the first workspace of a given workspace type.
   * If no such workspace is found then the selection is not changed and null
   * is returned.  Otherwise, the workspace is selected and it is returned.
   */
  selectFirstWorkspaceOfType: function(workspaceTypeID) {
	  var workspaces = this.getWorkspaces(workspaceTypeID);
	  if (! workspaces) return null;
	  if (workspaces.length == 0) return null;
	  var workspace = workspaces[0];
	  this.selectWorkspace(workspace);
	  return workspace;
  },
  
  /**
   * Returns an array of workspace type IDs known to this launcher.
   */
  getWorkspaceTypeIDs: function() {
	  var result = new Array();
	  for (var index = 0; index < this._workspaceTypes.length; index++) {
		  workspaceType = this._workspaceTypes[index];
		  result.push(workspaceType.get("workspaceTypeID"));
	  }
	  return result;
  },
  
  /**
   * If the specified workspace type ID is provided, then this
   * method returns an array of all workspace IDs for that workspace
   * type.  If not provided, this returns an array of all workspace
   * IDs in order of how they appear.
   */
  getWorkspaces: function(workspaceTypeID) {
	  var result = new Array();
	  if (workspaceTypeID) {
		  var workspaces = this._workspacesByType[workspaceTypeID];
		  if (!workspaces) return result;
		  for (var index = 0; index < workspaces.length; index++) {
			  result.push(workspaces[index]);
		  }
		  return result;;
	  } else {
		  var children = this.getChildren();
		  for (var index = 0; index < children.length; index++) {
			  var child = children[index];
			  if (! (child instanceof iWorkspace)) continue;
			  var workspaceID = child.get("workspaceID");
			  if (this._workspacesByID[workspaceID] != child) continue;
			  result.push(child);
		  }
		  return result;
	  }  
  },
  
  /**
   * Returns the idx.app.Workspace for the specified workspace ID. 
   */
  getWorkspace: function(workspaceID) {
	  return this._workspacesByID[workspaceID];
  },
    
  /**
   * Overridden to handle the adding of children that are of specific types
   * so they can be registered with this instance.
   * @private
   * @param {Widget} child
   * @param {int} insertIndex
   */
  _setupChild: function(/*Widget*/ child, /*Integer?*/ insertIndex) {
    this.inherited(arguments);
    if (child instanceof iWorkspaceType) {
      var wsTypeID = child.get("workspaceTypeID");
      // check if we have seen this workspace type before
      if (this._workspaceTypesByID[wsTypeID]) {
        iBus.systemError(
          this,
          this.resources.duplicateWorkspaceTypeError,
          { workspaceTypeID: child.workspaceTypeID },
          null, /* TODO: maybe get an assigned error message ID */
          "Duplicate workspace type key: " + child.workspaceTypeID,
          true); // throws an error
      }

      // so we have a workspace type -- let's set it up
      this._workspaceTypes.push(child);
      this._workspaceTypesByID[wsTypeID] = child;
      this._workspacesByType[wsTypeID] = new Array();
      this._workspaceTypeRegistered(child);

      // move the child to the container node
      this._relocateWorkspaceType(child, insertIndex);
    }
  },


  /**
   * Private worker to relocate a workspace
   * @private
   * @param {Widget} child
   * @param {int} insertIndex
   */
  _relocateWorkspaceType: function(/*Widget*/ child, /*Integer?*/ insertIndex) {
    var nodeList = new dNodeList(child.domNode);
    nodeList.orphan();
    dDomConstruct.place(child.domNode, this.containerNode, "last");
    dDomStyle.set(child.domNode, {visibility: "hidden", display: "none"});
  },

  /**
   * This method is called whenever a new workspace type is registered so
   * the launcher can react by possibly adding controls associated with
   * that workspace type (e.g.: providing a way for users to open workspaces
   * of that type).  The default implementation does nothing.
   * @private
   * @
   */
  _workspaceTypeRegistered: function(wsType /*WorkspaceType*/) {
    // do nothing
  },

  //
  // Gets the number of workspaces currently opened for the workspace type with
  // the specified name.
  //
  getOpenWorkspaceCount: function(typeID) {
    var arr = this._workspacesByType[typeID];
    if (!arr) return 0;
    return arr.length;
  },

  // 
  // Gets the maximum number of workspaces that are allowed to be open for the
  // workspace type with the specified name.  If the type name is not 
  // recognized by this launcher then negative one (-1) is returned.  If no 
  // maximum has been specified for the workspace type then zero (0) is 
  // returned.
  //
  getMaxOpenWorkspaceCount: function(typeID) {
    var wsType = this._workspaceTypesByName[typeID];
    if (! wsType) return -1;
    return wsType.get("maxOpen");
  }
});
}
	
var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){

	dojo.provide("idx.app._Launcher");

	dojo.require("dojo.cookie");
	dojo.require("dijit._Widget");
	dojo.require("dijit.layout._LayoutWidget");

	dojo.require("idx.string");
	dojo.require("idx.app.Workspace");
	dojo.require("idx.app.WorkspaceType");
	dojo.require("idx.resources");
	dojo.require("idx.app._A11yAreaProvider");
	dojo.require("idx.bus");
	dojo.requireLocalization("idx","base");
	dojo.requireLocalization("idx.app","base");
	dojo.requireLocalization("idx.app","_Launcher");

	factory(dojo.declare,				// dDeclare				(dojo/_base/declare)
			dijit.layout._LayoutWidget, // dLayoutWidget		(dijit/layout/_LayoutWidget)
			idx.app._A11yAreaProvider,	// iA11yAreaProvider	(./_A11yAreaProvider)
			dojo,						// dLang 	 	 		(dojo/_base/lang)
			dojo,						// dArray	 			(dojo/_base/array)
			dojo,						// dQuery 				(dojo/query) + (dojo/NodeList-dom) (for dQuery.NodeList)
			dojo,						// dDomConstruct 		(dojo/dom-construct)
			{add: dojo.addClass},		// dDomClass 		 	(dojo/dom-class (for dDomClass.add)
			{set: dojo.style},			// dDomStyle 	 		(dojo/dom-style) (for dDomStyle.set)
			dojo,						// dConnect	  	 		(dojo/_base/connect)
			dojo.cookie,				// dCookie	  	 		(dojo/cookie)
			idx.resources,				// iResources		 	(../resources)
			idx.string,					// iString,				(../string)
			idx.util,					// iUtil			 	(../util)
			idx.bus,					// iBus				 	(../bus)
			idx.app.Workspace,			// iWorkspace		 	(./Workspace)
			idx.app.WorkspaceType);		// iWorkspaceType		(./WorkspaceType)
} else {
	define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	        "../../../../dist/lib/dijit/layout/_LayoutWidget",
	        "./_A11yAreaProvider",
	        "dojo/_base/lang",
	        "dojo/_base/array",
	        "dojo/query",
	        "dojo/dom-construct",
	        "dojo/dom-class",
	        "dojo/dom-style",
	        "dojo/_base/connect",
	        "dojo/cookie",
	        "../resources",
	        "../string",
	        "../util",
	        "../bus",
	        "./Workspace",
	        "./WorkspaceType",
	        "dojo/NodeList-dom",
	        "dojo/i18n!../nls/base",
	        "dojo/i18n!./nls/base",
	        "dojo/i18n!./nls/_Launcher"],
	        factory);
}

})();
