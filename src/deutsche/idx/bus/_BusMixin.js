/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

(function()
{
	/**
	 * @name idx.bus._BusMixin
	 * @class This class acts as a mixin for a widget that produces instances of 
	 * UserMessage through the Convergence application framework.
	 */
function factory(dDeclare) {
	return dDeclare("idx.bus._BusMixin", [], 
			/**@lends idx.bus._BusMixin#*/		
{
	/**
	 * Constructor
	 */
  constructor: function() {
    // do nothing for now
  },

  /**
   * Sets the bus topic for this widget.
   */
  postCreate: function() {
     // get the widget ID
     var widgetID = this.get("id");
    
     // create a unique topic name
     this._busTopic = "idx.widget." + widgetID;
  },

  /**
   * @returns {Object} Returns an object containing the user message topic to use for this
   * instance as well as the widget that specifically defines it.  If none has
   * been explicitly specified (i.e.: if empty-string is detected) then we
   * searched the parent widget to see if one has been specified.  If none is
   * found then the default user message topic of "idx.bus" is used and the
   * defining widget is set to null.  The return fields of the result are:
   *   -- topic: the message topic name
   *   -- widget: the widget that defines the topic, or null
   */
  _idx_getBusTopic: function() {
    return this._busTopic;
  }
});
}

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){

	dojo.provide("idx.bus._BusMixin");
	factory(dojo.declare);

} else {
	define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/declare"], factory);
}

})();
