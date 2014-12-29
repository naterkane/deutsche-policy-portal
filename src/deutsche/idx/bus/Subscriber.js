/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

(function() 
{
	/**
	 * @name idx.bus.Subscriber
	 * @class Message Bus Subscriber
	 */
function factory(dDeclare,iString) {
	return dDeclare("idx.bus.Subscriber",null, 
	 		/**@lends idx.bus.Subscriber#*/				
{
  /**
   * The optional scope for filtering the messages that are seen by the 
   * Subscriber's "handleAction" method.  By default this is interpretted
   * as an exact string match on the message's scope (i.e.: only messages
   * with this exact scope are passed on).  However, the filter can be 
   * interpretted as a regular expression if subscriberScopeRegexp field
   * is set to true. 
   * @type String
   * @default ""
   */
  subscriberScopeFilter: "",

  /**
   * Set this to true to interpret the 'subscriberScopeFilter' as a regular
   * expression.  By default it is set to false to indicate that an exact
   * string match is required by subscribers.
   * @type Boolean
   * @default false
   */
  subscriberScopeRegexp: false,

	/**
	 * Constructor
	 * Initializes the subscription bus topic and handle
	 */
  constructor: function() {
    // do nothing for now
    this._subscriptionBusTopic = null;
    this._subscriptionBusHandle = null;
  },

  /**
   * During startup, subscribes this instance to the bus.
   */
  startup: function() {
    this.subscriberStartup();
  },

  /**
   * Custom setter for when changing the subscriber scope filter.
   * @param {String} filter
   * @private
   */
  _setSubscriberScopeFilterAttr: function(filter) {
    this.setSubscriberScopeFilter(filter, this.subscriberScopeRegexp);
  },

  /**
   * Custom setter for when changing the subscriber scope filter interpretation.
   * @param {Boolean} isRegexp
   * @private
   */
  _setSubscriberScopeRegexpAttr: function(isRegexp) {
    this.setSubscriberScopeFilter(this.subscriberScopeRegexp, isRegexp);
  },

  /**
   * Convenience method for resetting the subscriber scope filter and its
   * intepretation in one call.
   * @param {String} filter
   * @param {Boolean} isRegexp
   */
  setSubscriberScopeFilter: function(/*String*/ filter, /*Boolean?*/ isRegexp) {
    this.subscriberScopeFilter = idx.string.nullTrim(filter);
    this.subscriberScopeRegexp = isRegexp;
    if ((filter != null) && (isRegexp)) {
      this._subscriberScopeRegexp = new RegExp(filter, "g");
    } else {
      this._subscriberScopeRegexp = null;
    }
  },

  /**
   * Actually ends subscribing to to the bus as the implementing widget may 
   * have its own startup() function.  This should be called during startup.
   */
  subscriberStartup: function() {
    this.setSubscriberScopeFilter(this.subscriberScopeFilter, 
                                  this.subscriberScopeRegexp);
    this.subscribeToBus();
  },

  /**
   * Subscribes this instance to the bus if not already subscribed.
   */
  subscribeToBus: function() {
    // check if already subscribed
    if (this._subscriptionBusHandle) return;

    // get the bus topic
    var result = idx.bus._getBusTopic(this);
    this._subscriptionBusTopic = result.topic;

    // subscribe to the bus topic
    this._subscriptionBusHandle
        = dojo.subscribe(result.topic, this, this._handleAction); 
  },

  /**
   * Unsubscribes this instance from the bus if subscribed.
   */
  unsubscribeFromBus: function() {
    if (! this._subscriptionBusHandle) return;
    dojo.unsubscribe(this._subscriptionBusHandle);
    this._subscriptionBusHandle = null;
    this._subscriptionBusTopic = null;
  },

  /**
   * Utility method for retreiving the currently subscribed topic.
   * @private
   */
  _getSubscribedTopic: function() {
    return this._subscriptionBusTopic;
  },

  /*
   * Internal method that is called whenever there is a
   * @private 
   */
  _handleBusMessage: function(/*idx.bus.BusMessage*/ msg) {
    // check if we need to filter the action
    if (this.subscriberScopeFilter) {
      // ignore messages that are not scoped
      if (! msg.scope) return;

      if (this._subscriberScopeRegexp) {
        if (msg.scope.match(this._subscriberScopeRegexp) != msg.scope) return;
      } else {
         if (msg.scope != this.subscriberScope) return;
      }
    }

    // if we get here then handle the action
    this.handleBusMessage(msg);
  },

  /**
   * This method is called with whatever messages are received on the bus after
   * having filtered them according to the scope filter.
   * @param {Object} msg 
   */
  handleBusMessage: function(/*Object*/ msg) {
    // do nothing for now -- allow sub-class to override
  }
});
}

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){

	dojo.provide("idx.bus.Subscriber");

	dojo.require("idx.string");

	factory(dojo.declare,idx.string);

} else {
	define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/declare","../string"], factory);
}

}); 