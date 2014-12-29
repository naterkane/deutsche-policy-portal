/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

/**
 * @name idx.context
 * @class Provides global context methods
 */
(function()
/**@idx.context#*/	
{
function factory(dLang,iMain,iUtil) {
  var iContext = dLang.getObject("context", true, iMain);
  
  //
  // The global scope 
  //
  iContext._globalContext = [ ];

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
  iContext.get = function(/*Node|Widget*/ source, /*String*/ name) {
    var scope = iContext._getContextScope(source, name);
    if (! scope) {
      if (!name) return null;
      return iContext._globalContext[name];
    } else {
      if (!name) return scope;
      return scope._idx_getContextAttribute(name);
    }
  };

  /**
   * Sets the value of an attribute within the scope closest (most local) to the
   * the specified source node or widget.  The return value is a reference to 
   * the widget representing the scope that was used, or null if the global 
   * scope was used.
   * @param {Widget} source The widget or node for finding which scope to set the value in.
   * @param {String} name The name of the attribute to set.
   * @param {Object} value The value to set for the attribute.
   */
  iContext.set = function(/*Node|Widget*/ source, 
                             /*String*/      name,
                             /*Object*/      value) {
    var scope = iContext._getContextScope(source);
    if (! scope) {
       iContext._globalContext[name] = value;
       
    } else {
       scope._idx_setContextAttribute(name, value);
    }
    return scope;
  };

  /**
   * Attempts to locate the parent/enclosing widget for the specified widget in 
   * order to find the ContextScope to use.  If the name is specified then the 
   * returned scope is guaranteed to be the first that defines the attribute
   * with the specified name.
   * @param {Widget} source The starting point for finding the context scope
   * @param {String} name The optional attribute name that the context scope must have.
   */
  iContext._getContextScope = function(/*Node|Widget*/ source,
                                          /*String?*/     name) {
    if (source == null) return null;

    // check if the specified widget defines a topic
    if ((source != null) && (source._idx_hasContextAttribute)) {
      if ((!name) || (source._idx_hasContextAttribute(name))) return source;
    }

    var parent = iUtil.getParentWidget(source);
    while ((parent != null) 
           && ((!parent._idx_hasContextAttribute)
               || ((name) && (!parent._idx_hasContextAttribute(name))))) {
      
      parent = iUtil.getParentWidget(parent);
    }

    return parent;
  };
  
  return iContext;
}

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){

	dojo.provide("idx.context");

	dojo.require("dijit._Widget");
	dojo.require("idx.util");
	dojo.require("idx.widget.ContextScope");

	factory(dojo,idx,idx.util);
} else {
	define(["../../node_modules/intern-geezer/node_modules/dojo/_base/lang","idx","./util"], factory);
}

})();
