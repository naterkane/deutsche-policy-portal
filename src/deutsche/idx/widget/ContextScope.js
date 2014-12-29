/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

(function() {
function factory(dDeclare,dWidget) {
return dDeclare("idx.widget.ContextScope",[dWidget],
{
  //
  // Constructor simply creates the array of values.
  //
  constructor: function(args, node) {
     this._idx_scopedVariables = [ ];
     this._idx_scopedValues    = [ ];
  },

  //
  // Checks if the specified variable is recognized by this instance.  Once a 
  // variable has been declared and added it cannot be removed and will 
  // mask anything from the parent scope.
  //
  _idx_hasContextAttribute: function(/*String*/ name) {
    if (name == null) return true;
    var key = "" + name;
    return (this._idx_scopedVariables[key]);
  },

  //
  // Obtains the scoped reference by the specified name.  If the specified 
  // name is null, then a reference to this pane is returned.
  //
  _idx_getContextAttribute: function(/*String*/ name) {
    if (name == null) return this;
    var key = "" + name;
    return this._idx_scopedValues[key];
  },

  //
  // Sets the value of the variable with the specified name to the specified 
  // value.  If the specified value is null, then this method takes no action.
  // This will overwrite any previous value.
  //
  _idx_setContextAttribute: function(/*String*/ name, /*Object*/ value) {
    if (name == null) return;
    var key = "" + name;
    this._idx_scopedVariables[key] = true;
    this._idx_scopedValues[key]    = value;
  }
});
}

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){

	dojo.provide("idx.widget.ContextScope");

	dojo.require("dijit._Widget");

	factory(dojo.declare,dijit._Widget);

} else {
	define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/declare", "../../../lib/dijit/_Widget"], factory);
}

})();

