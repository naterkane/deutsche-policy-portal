/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

(function() {
	/**
	 * @name idx.app._Dock
	 * @class Class that docks (houses) Workspaces.
	 * It contains arrays of Workspace instances
	 * and management methods for Workspaces. 
	 * Workspaces reside in a tab-like container.
	 * Implemented by TabMenuDock.
	 * @augments dijit._Widget
	 * @see idx.app.TabMenuDock 
	 * @see idx.app.Workspace
	 */
function factory(dDeclare,dWidget,dArray,iWorkspace) {
return dDeclare("idx.app._Dock", [dWidget], 
		/**@lends idx.app._Dock#*/
{
	/**
	 * @constructor
	 * @private
	 * Creates object instance data:
	 * 	_workspacesByID
	 * 	_workspaces
	 */
  constructor: function(args, node) {
    this._workspacesByID = new Array();
    this._workspaces = new Array();
  },

	/**
	 * startup method - noop
	 */
  startup: function() {

  },

	/**
	 * Provides the basic functionality of tracking the specified workspace,
	 * doing nothing if the workspace has already been added, calling the
	 * "_doAddWorkspace" function, and then notifying of the add via the
	 * "onWorkspaceAdded" method.
	 * Updates following object instance data fields:
	 * 	_workspacesByID
	 * 	_worksapces
	 * @param {idx.app.Workspace} workspace
	 */
  addWorkspace: function(/*Workspace*/ workspace) {
    if (this._workspacesByID[workspace.workspaceID]) return;
    var result = this._doAddWorkspace(workspace);
    if (result == false) return;
    this._workspacesByID[workspace.workspaceID] = workspace;
    this._workspaces.push(workspace);
    this.onWorkspaceAdded(workspace);
  },

	/**
	 * Override this in sub-classes to handle actually adding the workspace.
	 * If this function returns false then it is assumed that the workspace
	 * could not be added.  The default implementation returns false, so you
	 * must override to return true at the very least.
	 * @param {idx.app.Workspace} workspace
	 * @returns {Boolean} false
	 */
  _doAddWorkspace: function(/*Workspace*/ workspace) {
    // leave for derived class
    return false;
  },

	/**
	 * This is called to notify whenever a workspace is added.
	 * Currently empty.
	 * @param {idx.app.Workspace} workspace
	 */ 
  onWorkspaceAdded: function(/*Workspace*/ workspace) {

  },

	/**
	 * Provides the basic functionality of tracking which workspace is selected
	 * doing nothing if the workspace to select is already selected, calling the
	 * "_doSelectWorkspace" function, and then notifying of the selection via
	 * the "onWorkspaceSelected" function.
	 * Updates following object instance data fields:
	 * 	_selectedWorkspace
	 * @param {idx.app.Workspace} workspace
	 */ 
  selectWorkspace: function(/*Workspace*/ workspace) {
    if (this._selectedWorkspace == workspace) return;
    var previous = this._selectedWorkspace;
    var result = this._doSelectWorkspace(workspace, previous);
    if (result == false) return;
    this._selectedWorkspace = workspace;
    this.onWorkspaceSelected(workspace, previous);
  },

  /**
  * Override this in sub-classes to handle actually selecting the workspace.
  * If this function returns false then it is assumed that the workspace
  * could not be selected.  The default implementation returns false, so you
  * must override to return true at the very least.
  * @param {idx.app.Workspace} toBeSelected - workspace to be selected
  * @param {idx.app.Workspace} previouslySelected - workspace previously selected
  * @returns {Boolean} false
  */
  _doSelectWorkspace: function(/*Workspace*/ toBeSelected, 
                               /*Workspace*/ previouslySelected) {
    return false;
  },

  /**
  * This is called after the workspace has been selected.
  * Currently a NO-OP.
  * @param {idx.app.Workspace} current  workspace 
  * @param {idx.app.Workspace} previous workspace 
  */
  onWorkspaceSelected: function(/*Workspace*/ current, /*Workspace*/ previous) {

  },

  /**
   * Called to remove the specified workspace.
   * Calls "_doPostRemoveWorkspace" to handle any post removal steps
   * and calls "onWorkspaceRemoved" to notify any listeners 
   * @param {idx.app.Workspace} workspace to remove 
   */  
  removeWorkspace: function(/*Workspace*/ workspace) {
    if (! this._workspacesByID[workspace.workspaceID]) return;
    var selected = (workspace == this._selectedWorkspace);
    var result = this._doRemoveWorkspace(workspace, selected);
    if (result == false) return;
    if (workspace == this._selectedWorkspace) {
      this._selectedWorkspace = null;
    }
    var index = dArray.indexOf(this._workspaces, workspace);
    this._workspaces.splice(index, 1);
    delete this._workspacesByID[workspace.workspaceID];

    // handle any post-removal steps
    this._doPostRemoveWorkspace(workspace, selected, result);

    // notify for event handling
    this.onWorkspaceRemoved(workspace, selected);
  },

  /**
  * Override this in sub-classes to handle actually removing the workspace.
  * If this function returns false then it is assumed that the workspace
  * could not be removed.  The default implementation returns false, so you
  * must override to return true at the very least.
  * @param {idx.app.Workspace} workspace to remove 
  * @param {boolean} selected indicator (true if selected, OTW false) 
  * @returns {boolean} false
  */
  _doRemoveWorkspace: function(/*Workspace*/ workspace, /*boolean*/ selected) {
    return false;
  },

  /**
  * Called after the the workspace has been removed but prior to any event
  * handlers firing.  This allows any cleanup after the base class has
  * removed any reference to the removed workspace.  The sub-class may 
  * override this to handle specific behavior.
  * @param {idx.app.Workspace} workspace to remove 
  * @param {boolean} selected indicator (true if selected, OTW false) 
  * @returns {Object} removalResult
  */
  _doPostRemoveWorkspace: function(/*Workspace*/ workspace,
                                   /*boolean*/   selected,
                                   /*?*/         removalResult) {

  },

  /**
  * This is called after the workspace has been removed.
  * Currently a NO-OP.
  * @param {idx.app.Workspace} workspace to remove 
  * @param {boolean} selected indicator (true if selected, OTW false) 
  */
  onWorkspaceRemoved: function(/*Workspace*/ workspace, /*boolean*/ selected) {

  }
  });
}  

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){

	dojo.provide("idx.app._Dock");
	dojo.require("idx.app.Workspace");
	dojo.require("dijit._Widget");

	factory(dojo.declare,dijit._Widget,dojo,idx.app.Workspace);

} else {
	define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/declare","../../../lib/dijit/_Widget","dojo/_base/array","./Workspace"],factory);
}

})();

