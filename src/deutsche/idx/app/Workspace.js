/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

(function()
{
function factory(dDeclare,iContentPane) {
	/**
	 * @name idx.app.Workspace
	 * @class Application content/workspace pane. 
	 * Resides in a TabMenuDock, and the visual counterpart
	 * which is a WorkspaceTab appears in the TabMenuLauncher
	 * container.
	 * @augments dojox.layout.ContentPane
	 * @see idx.app.WorkspaceTab
	 * @see idx.app.TabMenuDock
	 * @see idx.app.TabMenuLauncher
	 */
	return dDeclare("idx.app.Workspace",[iContentPane],
			/**@lends idx.app.Workspace#*/	
{
	/**
	 * ID for the workspace
	 * @type String
     * @default ""
	 */
  workspaceID: "",
  
	/**
	 * The ID of the workspace type used to create this workspace.
	 * @type String
     * @default ""
	 */
  workspaceTypeID: "",
  
	/**
	 * The arguments used to create the workspace.
	 * @type Object
     * @default null
	 */
  workspaceArgs: null,
  
	/**
	 * Indicates if the workspace is dirty or not.
	 * @type boolean
	 * @default false
	 */
  workspaceDirty: false,

	/**
	 * Indicate that initially we are not open until the launcher says otherwise
	 * @type boolean
	 * @default false
	 */
  open: false,
  
  /**
   * The base title for this instance for de-duplication of titles.
   */
  baseTitle: "",
  
  /**
   * The index for the title suffix for de-deuplication of titles.
   */
  titleSuffixIndex: 0,
  
  /**
   * 
   */
  constructor: function(args, node) {
	  // do nothing
  },
  
  /**
   * Resize method extends parent with conditional check
   * on "open" attribute before issueing resize. OTW resize
   * is pending. 
   * @param {Object} changeSize
   * @param {Object} resultSize
   */
  resize: function(changeSize, resultSize) {
     if (this.open) {
       return this.inherited(arguments);
     } else {
       this._pendingResize = { changeSize: changeSize, resultSize: resultSize };
     }
  },
  
  /**
   * Worker to set atributes and call "resize" as needed. 
   * @private 
   * @param {boolean} open
   */
  _setOpenAttr: function(/*Boolean*/ open) {
    if (open && (! this.open)) {
      this.open = true;
      if (this._pendingResize) {
        var changeSize = this._pendingResize.changeSize;
        var resultSize = this._pendingResize.resultSize;
        this._pendingResize = null;
        this.resize(changeSize, resultSize);
      }
    } else if (!open && (this.open)) {
      this.open = false;
    }
  }
});
return result;
}

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
	dojo.provide("idx.app.Workspace");

	dojo.require("idx.layout.ContentPane");

	factory(dojo.declare,idx.layout.ContentPane);
} else {
	define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/declare","idx/layout/ContentPane"],factory);
}
})();

