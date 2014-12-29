/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

/**
 * @name idx.bus
 * @class Provides a set of constants for the message bus 
 */
(function() {
function factory(dLang,		// (dojo/_base/lang)
				 iMain,		// (idx)
				 dJson,		// (dojo/_base/json)
				 dConnect,  // (dojo/_base/connect)
				 dString,	// (dojo/string)
				 dWidget,   // (dijit/_WidgetBase)
				 dijitMgr,  // (dijit/_base/manager)
				 iBusMsg,   // (idx/bus/BussMessage)
				 iString,	// (idx/string)
				 iUtil)     // (idx/util) 
/**@idx.bus#*/	
{
  var iBus = dLang.getObject("bus", true, iMain);
  
  /**
   * The default bus topic to use when none is found.
   * @constant
   * @type String
   * @default "idx.bus"
   */
  iBus.DEFAULT_BUS_TOPIC = "idx.bus";

  /**
   * The message scope to use for all notification messages.  Widgets that wish 
   * to receive these should subscribe without filtering out this scope.
   * @constant
   * @type String
   * @default "idx.bus.notifications"
   */
  iBus.NOTIFICATIONS = "idx.bus.notifications";
 
  /**
   * The message scope to use when a widget requires more information from the
   * application or from the user.  Widgets that wish to receive these should
   * subscribe without filtering out this scope.
   * @constant
   * @type String
   * @default "idx.bus.queries"
   */
  iBus.QUERIES = "idx.bus.queries";

  /**
   * The message types for the NOTIFICATION_SCOPE messages that are sent
   * via the "debug", "info", "warning", "userError", and "systemError" methods.
   * @constant
   * @type String
   * @default "DEBUG"
   */
  iBus.DEBUG        = "DEBUG";
  /**
   * @constant
   * @type String
   * @default "INFO"
   */
  iBus.INFO         = "INFO";
  /**
   * @constant
   * @type String
   * @default "WARNING"
   */
  iBus.WARNING      = "WARNING";
  /**
   * @constant
   * @type String
   * @default "USER_ERROR"
   */
  iBus.USER_ERROR   = "USER_ERROR";
  /**
   * @constant
   * @type String
   * @default "SYSTEM_ERROR"
   */
  iBus.SYSTEM_ERROR = "SYSTEM_ERROR";

  /**
   * The various query types for the QUERIES scope messages that are sent via
   * the "ok", "confirm", "choose", and "prompt" methods.  TODO(bcaceres) - 
   * write the supporting methods
   * @constant
   * @type String
   * @default "ALERT"
   */
  iBus.ALERT   = "ALERT";
  /**
   * @constant
   * @type String
   * @default "CONFIRM"
   */
  iBus.CONFIRM = "CONFIRM";
  /**
   * @constant
   * @type String
   * @default "CHOOSE"
   */
  iBus.CHOOSE  = "CHOOSE";
  /**
   * @constant
   * @type String
   * @default "PROMPT"
   */
  iBus.PROMPT  = "PROMPT";
  
  /**
   * Publishes a BusMessage on the appropriate topic, propagating the message
   * upstream if not handled by a subscriber on the first topic or if explicitly
   * instructed to broadcast it upstream regardless of whether or not it has 
   * been handled.
   * @param {String} scope The scope for the message to help subscribers filter messages.
   * @param {String} messageType  The type of the message to help subscribers determien if
   *                or how to handle the message.
   * @param {Widget | Node} source The source widget or node for the message.
   * @param {Boolean} broadcast Set to true to propagate the message upstream even if it has
   *              already been handled by at least one subscriber.
   * @param {Object} args Any arguments to be used by the subscriber in handling the message.
   * @param {String} explicitTopic The explicit topic to send the message on, otherwise
   *                  null if the topic should be determined automatically. 
   */
  iBus.publish = function(/*String*/      scope, 
                             /*String*/      messageType,
                             /*Widget|Node*/ source,
                             /*Boolean*/     broadcast,
                             /*Object*/      args,
                             /*String?*/     explicitTopic) {
     // get the topic result
     explicitTopic = iString.nullTrim(explicitTopic);
     var topicResult = null;
     if (explicitTopic != null) {
       topicResult = {topic: explicitTopic, widget: null};
     } else {
       topicResult = iBus._getBusTopic(source);
     }

     // create the action
     var msg = new iBusMsg({
         scope: scope, 
         messageType: messageType,
         source: source, 
         broadcast: broadcast,
         args: args });

     // call the internal version of the function
     return iBus._publish(topicResult, msg);
  };

  /**
   * Internal version of publish for when the message and topic result have 
   * already been obtained.
   * @private
   * @param {Object} topicResult
   * @param {String} msg
   */
  iBus._publish = function(topicResult, msg) {
     var visited = [ ];
     var seqVisited = [ ];

     while (topicResult != null) {
       // track which topics we have visited to ensure bugs elsewhere don't
       // trigger an infinite loop on circular topic propagation
       if (visited[topicResult.topic] == true) {
         console.log("ERROR: Unexpected circular topic propagation.  topic=[ "
                     + topicResult.topic + " ], visited=[ " 
                     + dJson.toJson(seqVisited) + " ]");
         break;
       }
       visited[topicResult.topic] = true;
       seqVisited.push(topicResult.topic);

       // publish it
       dConnect.publish(topicResult.topic, [msg]);


       // check if anybody has handled the message
       var handled   = msg.isHandled();

       // if nobody has handled it or the message wants to be broadcast upstream
       // then attempt to get the propagation topic to propagate it
       if ((!handled) || (broadcast)) {
         topicResult = iBus._getPropagateBusTopic(topicResult);
       } else {
         topicResult = null;
       }
     }

     // return the message as a result
     return msg;
  };

  /**
   * Sends a DEBUG notification on the appropriate topic using the NOTIFICATIONS 
   * message scope.
   * @param {Widget} source The node or widget that is the source of the message. 
   * @param {String} messageTemplate The message template for formatting the message for the
   *                    user.  This may be used as a key to look up the template
   *                    by some applications.
   * @param {Object} messageArgs The arguments to use while formatting the message.
   * @param {String} messageID The internal message ID assigned to this message (if any)
   * @param {String} internalMsg The internal message to log for technical support (if any)
   * @param {Boolean} throwError Set to true if an error should be raised/thrown after the
   *               the message is published.
   * @param {String} explicitTopic The explicit topic to send the message on, otherwise
   *                  null if the topic should be determined automatically. 
   */
  iBus.debug = function(/*Widget|Node*/ source,
                           /*String*/      messageTemplate,
                           /*Object*/      messageArgs,
                           /*String*/      messageID,
                           /*String*/      internalMsg,
                           /*Boolean?*/    throwError,
                           /*String?*/     explicitTopic) {
    return iBus.notify(source, 
                          iBus.DEBUG, 
                          messageTemplate,
                          messageArgs,
                          messageID,
                          internalMsg,
                          throwError,
                          explicitTopic);
  };

  /**
   * Sends a INFO notification on the appropriate topic using the NOTIFICATIONS 
   * message scope.
   * @param {Widget} source The node or widget that is the source of the message. 
   * @param {String} messageTemplate The message template for formatting the message for the
   *                    user.  This may be used as a key to look up the template
   *                    by some applications.
   * @param {Object} messageArgs The arguments to use while formatting the message.
   * @param {String} messageID The internal message ID assigned to this message (if any)
   * @param {String} internalMsg The internal message to log for technical support (if any)
   * @param {Boolean} throwError Set to true if an error should be raised/thrown after the
   *               the message is published.
   * @param {String} explicitTopic The explicit topic to send the message on, otherwise
   *                  null if the topic should be determined automatically. . 
   */
  iBus.info = function(/*Widget|Node*/ source,
                          /*String*/      messageTemplate,
                          /*Object*/      messageArgs,
                          /*String*/      messageID,
                          /*String*/      internalMsg,
                          /*Boolean?*/    throwError,
                          /*String?*/     explicitTopic) {
    return iBus.notify(source, 
                          iBus.INFO, 
                          messageTemplate,
                          messageArgs,
                          messageID,
                          internalMsg,
                          throwError,
                          explicitTopic);
  };

  /**
   * Sends a WARNING notification on the appropriate topic using the
   * NOTIFICATIONS message scope.
   * @param {Widget} source The node or widget that is the source of the message. 
   * @param {String} messageTemplate The message template for formatting the message for the
   *                    user.  This may be used as a key to look up the template
   *                    by some applications.
   * @param {Object} messageArgs The arguments to use while formatting the message.
   * @param {String} messageID The internal message ID assigned to this message (if any)
   * @param {String} internalMsg The internal message to log for technical support (if any)
   * @param {Boolean} throwError Set to true if an error should be raised/thrown after the
   *               the message is published.
   * @param {String} explicitTopic The explicit topic to send the message on, otherwise
   *                  null if the topic should be determined automatically. 
   */
  iBus.warning = function(/*Widget|Node*/ source,
                             /*String*/      messageTemplate,
                             /*Object*/      messageArgs,
                             /*String*/      messageID,
                             /*String*/      internalMsg,
                             /*Boolean?*/    throwError,
                             /*String?*/     explicitTopic) {
    return iBus.notify(source, 
                          iBus.WARNING, 
                          messageTemplate,
                          messageArgs,
                          messageID,
                          internalMsg,
                          throwError,
                          explicitTopic);
  };

  /**
   * Sends a USER_ERROR notification on the appropriate topic using the
   * NOTIFICATIONS message scope.
   * @param {Widget} source The node or widget that is the source of the message. 
   * @param {String} messageTemplate The message template for formatting the message for the
   *                    user.  This may be used as a key to look up the template
   *                    by some applications.
   * @param {Object} messageArgs The arguments to use while formatting the message.
   * @param {String} messageID The internal message ID assigned to this message (if any)
   * @param {String} internalMsg The internal message to log for technical support (if any)
   * @param {Boolean} throwError Set to true if an error should be raised/thrown after the
   *               the message is published.
   * @param {String} explicitTopic The explicit topic to send the message on, otherwise
   *                  null if the topic should be determined automatically. 
   */
  iBus.userError = function(/*Widget|Node*/ source,
                               /*String*/      messageTemplate,
                               /*Object*/      messageArgs,
                               /*String*/      messageID,
                               /*String*/      internalMsg,
                               /*Boolean?*/    throwError,
                               /*String?*/     explicitTopic) {
    return iBus.notify(source, 
                          iBus.USER_ERROR, 
                          messageTemplate,
                          messageArgs,
                          messageID,
                          internalMsg,
                          throwError,
                          explicitTopic);
  };

  /**
   * Sends a SYSTEM_ERROR notification on the appropriate topic using the
   * NOTIFICATIONS message scope.
   * @param {Widget} source The node or widget that is the source of the message. 
   * @param {String} messageTemplate The message template for formatting the message for the
   *                    user.  This may be used as a key to look up the template
   *                    by some applications.
   * @param {Object} messageArgs The arguments to use while formatting the message.
   * @param {String} messageID The internal message ID assigned to this message (if any)
   * @param {String} internalMsg The internal message to log for technical support (if any)
   * @param {Boolean} throwError Set to true if an error should be raised/thrown after the
   *               the message is published.
   * @param {String} explicitTopic The explicit topic to send the message on, otherwise
   *                  null if the topic should be determined automatically. 
   */
  iBus.systemError = function(/*Widget|Node*/ source,
                                 /*String*/      messageTemplate,
                                 /*Object*/      messageArgs,
                                 /*String*/      messageID,
                                 /*String*/      internalMsg,
                                 /*Boolean?*/    throwError,
                                 /*String?*/     explicitTopic) {
    return iBus.notify(source, 
                          iBus.SYSTEM_ERROR, 
                          messageTemplate,
                          messageArgs,
                          messageID,
                          internalMsg,
                          throwError,
                          explicitTopic);
  };

  /**
   * Sends a notification on the appropriate topic using the NOTIFICATIONS
   * message scope.
   * @param {Widget} source The node or widget that is the source of the message. 
   * @param {String} messageTemplate The message template for formatting the message for the
   *                    user.  This may be used as a key to look up the template
   *                    by some applications.
   * @param {Object} messageArgs The arguments to use while formatting the message.
   * @param {String} messageID The internal message ID assigned to this message (if any)
   * @param {String} internalMsg The internal message to log for technical support (if any)
   * @param {Boolean} throwError Set to true if an error should be raised/thrown after the
   *               the message is published.
   * @param {String} explicitTopic The explicit topic to send the message on, otherwise
   *                  null if the topic should be determined automatically. 
   */
  iBus.notify = function(/*Widget|Node*/ source,
                            /*String*/      messageType,
                            /*String*/      messageTemplate,
                            /*Object*/      messageArgs,
                            /*String*/      messageID,
                            /*String*/      internalMsg,
                            /*Boolean?*/    throwError,
                            /*String?*/     explicitTopic) {

    // publish the message to any who are listening for notifications
    var result = iBus.publish(iBus.NOTIFICATIONS, 
                                 messageType,
                                 source,
                                 true,
                                 { messageTemplate: messageTemplate,
                                   messageArgs: messageArgs,
                                   messageID: messageID,
                                   internalMessage: internalMsg
                                 },
                                 explicitTopic);
    if (throwError) {
        var msg = (((messageType) ? (messageType + ": ") : "")
                   + ((messageID) ? (messageID + ": ") : "")
                   + ((internalMsg) 
                      ? internalMsg 
                      : dString.substitute(messageTemplate, messageArgs)));
        throw new Error(msg);
    }
  };

  /**
   * Returns an object containing the user message topic to use for this
   * instance as well as the widget that specifically defines it.  If none has
   * been explicitly specified (i.e.: if empty-string is detected) then we
   * searched the parent widget to see if one has been specified.  If none is
   * found then the default user message topic of "idx.bus" is used and the
   * defining widget is set to null.  The return fields of the result are:
   * @param {Widget} source
   * @param {Object} result
   */
 iBus._getBusTopic = function(/*Node|Widget*/ source, 
                                 /*Object?*/     tempResult) {
    // use the temporary result to avoid unneeded memory allocation
    var result = tempResult;
    if (result == null) {
       result = { topic: null, widget: null };
    } else {
       result.topic = null;
       result.widget = null;
    }
    
    // check our source and find the widget
    if (source instanceof dWidget) {
       result.widget = source;
    } else if (iUtil.isNodeOrElement(source)) {
       result.widget = dijitMgr.getEnclosingWidget(source);
    } else {
       result.widget = null;
    }

    // check if the specified widget defines a topic
    if ((result.widget != null) && (result.widget._idx_getBusTopic)) {
      result.topic = iString.nullTrim(result.widget._idx_getBusTopic());
    }

    // check if we have a good answer or if we need to proceed upstream
    while ((result.topic == null) && (result.widget != null)) {

      // find the first parent that is a bus widget
      result.widget = iBus._getParentBusWidget(result.widget);

      if (result.widget) {
         // if we have a parent bus widget then then rely on the parent's topic
         result.topic = iString.nullTrim(result.widget._idx_getBusTopic());
      }
    }

    // if no topic was found then use the default
    if (result.topic == null) {
      result.topic  = iBus.DEFAULT_BUS_TOPIC;
      result.widget = null;
    }

    // return the result
    return result;
  };

  /**
   * Attempts to find the first parent bus topic that differs from the
   * bus topic assigned to the specified widget for the purpose of propagating 
   * messages.  If no parent has a different topic, then null is returned.  If a 
   * propogation topic is found then an object is returned with two fields:
   * @param {Widget} source The widget that defines the topic (or null if default topic)
   * @private
   */
  iBus._getPropagateBusTopic = function(/*Widget|Object*/ source) {
    var result = null;
    if (source instanceof dWidget) {
      result = iBus._getBusTopic(source);
    } else {
      result = source;
    }

    var result = baseResult;

    var baseTopic = result.topic;

    result.topic = null;
    if (result.widget == null) return null;  // no more parents

    // otherwise get the parent
    result.widget = iBus._getParentBusWidget(result.widget);

    while ((result.widget != null) && (result.topic == null)) {
      // get the parent's topic
      result = iBus._getBusTopic(result.widget, result);

      // check the parent's topic
      if (result.topic == baseTopic) {
        // clear the result topic since we cannot use it
        result.topic = null;

        // we have the same topic so we have to go higher
        if (result.widget != null) {
           result.widget = iBus._getParentBusWidget(result.widget);
        }
      }
    }

    // if we failed to find a topic then return null
    if ((result.topic == null) || (result.topic == baseTopic)) return null;

    // otherwise return the result
    return result;
  };

  /**
   * Attempts to locate the parent/enclosing widget for the specified widget in 
   * order to find the UserMessenger that defines the topic to be used.
   * @param {Widget} widget
   * @private
   */
  iBus._getParentBusWidget = function(/*Node|Widget*/ widget) {
    var parent = iUtil.getParentWidget(widget);
    while ((parent != null) && ((!parent._idx_getBusTopic) 
                                || (!parent._idx_getPropogateBusTopic))) {
      parent = iUtil.getParentWidget(parent);
    }
    return parent;
  };

  return iBus;
}

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){

	dojo.provide("idx.bus");

	dojo.require("dijit._WidgetBase");
	dojo.require("dojo.string");
	dojo.require("idx.bus.BusMessage");
	dojo.require("idx.string");
	dojo.require("idx.util");

	factory(dojo,				// dLang		(dojo/_base/lang)
			idx,				// iMain		(idx)
			dojo,				// dJson		(dojo/_base/json)
			dojo,				// dConnect		(dojo/_base/connect)
			dojo.string,		// dString		(dojo/string)
			dijit._WidgetBase,	// dWidget	 	(dijit/_WidgetBase)
			dijit,				// dijitMgr		(dijit/_base/manager)
			idx.bus.BusMessage,	// iBusMsg		(./bus/BusMessage)
			idx.string,			// iString		(./string)
			idx.util);			// iUtil		(./util)
} else {
	define(["../../node_modules/intern-geezer/node_modules/dojo/_base/lang",
	        "idx",
	        "../../../node_modules/intern-geezer/node_modules/dojo/_base/json",
	        "dojo/_base/connect",
	        "dojo/string",
	        "dijit/_WidgetBase",
	        "dijit/_base/manager",
	        "idx/bus/BusMessage",
	        "idx/string",
	        "idx/util"],
	        factory);
}	

})();
