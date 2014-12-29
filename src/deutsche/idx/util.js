/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */
(function() {
function factory(dLang,				// dojo/_base/lang
				 iMain,				// idx
   			     dKernel, 			// dojo/_base/kernel
   			     dHas,				// dojo/has
   			     dXhr,				// dojo/_base/xhr
   			     dWindow,			// dojo/_base/window
   			     dURL,				// dojo/_base/url
   			     dDateStamp,		// dojo/date/stamp
   			     dJson,				// dojo/_base/json
				 dDomClass,			// dojo/dom-class (for dDomClass.add)
				 dDomStyle,			// dojo/dom-style (for dDomStyle.getComputedStyle/set)
				 dDomAttr,			// dojo/dom-attr
				 dDomConstruct,		// dojo/dom-construct
				 dDomGeo,			// dojo/dom-geometry (for dDomGeo.getMarginBox)
				 dIOQuery,			// dojo/io-query
				 dQuery,			// dojo/query
				 dNodeList,			// dojo/NodeList-dom
				 dRegistry,			// dijit/registry
				 dFormWidget,		// dijit/form/_FormWidget
				 dWidget)			// dijit/_WidgetBase
{
	var iUtil = dLang.getObject("util", true, iMain);
	
	iUtil.getVersion = function(full) {
		var params = {
			url: dKernel.moduleUrl("idx", "version.txt"),
			showProgress: false,
			handleAs: "json",
			load: function(response, ioArgs) {
				var msg = response.version;
				if(full) {
					msg += "-";
					msg += response.revision;
				}
				console.debug(msg);
			},
			error: function(response, ioArgs) {
				console.debug(response);
				return;
			}
		};
		dXhr.xhrGet(params);
	};
	
	iUtil.getOffsetPosition = function(node, root) {
		root = root || dWindow.body();
		var n = node;
		
		var l = 0;
		var t = 0;
		
		while (n != root) {
			l += n.offsetLeft;
			t += n.offsetTop;
			n = n.offsetParent;
		}
		return {l: l, t: t};
	};

        //
        // Copy of the "val2type" function from the "dojo.parser" scope since it
        // could not be called directly.
        //
	iUtil.typeOfObject = function(/*Object*/ value){
		// summary:
		//		Returns name of type of given value.

		if(dLang.isString(value)){ return "string"; }
		if(typeof value == "undefined") { return "undefined"; }
		if(typeof value == "number"){ return "number"; }
		if(typeof value == "boolean"){ return "boolean"; }
		if(dLang.isFunction(value)){ return "function"; }
		if(dLang.isArray(value)){ return "array"; } // typeof [] == "object"
		if(value instanceof Date) { return "date"; } // assume timestamp
		if(value instanceof dURL){ return "url"; }
		return "object";
	};

        //
        // Copy of the "str2obj" function from the "dojo.parser" scope since it
        // could not be called directly.
        //
	iUtil.parseObject = function(/*Object*/ value, /*String*/ type){
		// summary:
		//		Convert given string value to given type
		switch(type){
			case "string":
				return "" + value;
			case "number":
				if (typeof value == "number") return value;
				return value.length ? Number(value) : NaN;
			case "boolean":
				// for checked/disabled value might be "" or "checked".  interpret as true.
				return (typeof value == "boolean") ? value : !(value.toLowerCase()=="false");
			case "function":
				if(dLang.isFunction(value)){
					// IE gives us a function, even when we say something like onClick="foo"
					// (in which case it gives us an invalid function "function(){ foo }"). 
					//  Therefore, convert to string
					value=value.toString();
					value=dLang.trim(value.substring(value.indexOf('{')+1, value.length-1));
				}
				try{
					if(value === "" || value.search(/[^\w\.]+/i) != -1){
						// The user has specified some text for a function like "return x+5"
						return new Function(value);
					}else{
						// The user has specified the name of a function like "myOnClick"
						// or a single word function "return"
						return dLang.getObject(value, false) || new Function(value);
					}
				}catch(e){ return new Function(); }
			case "array":
				if (dLang.isArray(value)) return value;
				return value ? value.split(/\s*,\s*/) : [];
			case "date":
				if (value instanceof Date) return value;
				switch(value){
					case "": return new Date("");	// the NaN of dates
					case "now": return new Date();	// current date
					default: {
						return dDateStamp.fromISOString(value);
					}
				}
			case "url":
				if(value instanceof dURL){ return value; }
				return dKernel.baseUrl + value;
			default:
				if (iUtil.typeOfObject(value) == "string") {
					return dJson.fromJson(value);
				} else {
					return value;
				}
		}
	};

        iUtil.getCSSOptions = function(/*String*/  className,
                                          /*Node?*/   parentNode,
                                          /*Object?*/ guide) {
            if ((! parentNode) || (("canHaveHTML" in parentNode) && (! parentNode.canHaveHTML))) {
                parentNode = dWindow.body();
            }
            var optionElem = dDomConstruct.create("div", null, parentNode);
        	dDomClass.add(optionElem, className);
        	var myStyle = dDomStyle.getComputedStyle(optionElem);
        	var bgImage = null;
        	if (myStyle) {
        		bgImage = "" + myStyle.backgroundImage;
        	}
        	dDomConstruct.destroy(optionElem);
            
        	if (! bgImage) return null;
            if (bgImage.length < 5) return null;
            if (bgImage.toLowerCase().substring(0, 4) != "url(") return null;
            if (bgImage.charAt(bgImage.length - 1) != ")") return null;
            
            // remove the "url(" prefix and ")" suffix
            bgImage = bgImage.substring(4, bgImage.length - 1);
            
        	// check if our URL is quoted
            if (bgImage.charAt(0) == "\"") {
                // if not properly quoted then we don't parse it
                if (bgImage.length < 2) return null;
                if (bgImage.charAt(bgImage.length - 1) != "\"") return null;
                
                // otherwise remove the quotes
                bgImage = bgImage.substring(1, bgImage.length - 1);
            }
            
        	// find the query string
            var queryIdx = bgImage.lastIndexOf("?");
            var slashIdx = bgImage.lastIndexOf("/");
            if (queryIdx < 0) return null;
            if (queryIdx < slashIdx) return null;
            
        	// get just the query string from the URL
            var cssOpts = bgImage.substring(queryIdx + 1, bgImage.length);
            if (cssOpts == null) return null;
            if (cssOpts.length == 0) return null;
            
        	// parse the query string and return the result
            var queryParams = dIOQuery.queryToObject(cssOpts);
            return (guide) ? iUtil.mixin({}, queryParams, guide) : queryParams;
        };
        
        //
        //
        //
        iUtil.mixinCSSDefaults = function(/*Object*/ target,
                                             /*String*/ className,
                                             /*Node?*/  parentNode) {
            if (!target) return null;
            var opts = iUtil.getCSSOptions(className, parentNode);

            if (!opts) return null;
            
            iUtil.mixin(target, opts);
            
            return opts;
        };

        //
        //
        //
        iUtil.mixin = function(/*Object*/  target,
                                  /*Object*/  source,
                                  /*Object?*/ guide) {
            if (!target) return null;
            if (!source) return target;
            if (!guide) guide = target;
            var logFields = false;
            var src = { };
            // if we have the class info, then parse the fields of the options
            for (var field in source) {
            	if (! (field in guide)) continue;
                var attrType = iUtil.typeOfObject(guide[field]);
                src[field] = iUtil.parseObject(source[field], attrType);
            }
            
            // mixin the options
            dLang.mixin(target, src);
            return target;
        };
        
        /**
         * 
         * @param first
         * @param second
         * @param options (includes "clone", "controlField" and "controlValue")
         */
        iUtil.recursiveMixin = function(first, second, options) {
        	var clone = null;
        	var controlField = null;
        	var controlValue = null;
        	if (options) {
        		clone = options.clone;
        		controlField = options.controlField;
        		if ("controlValue" in options) {
        			controlValue = options.controlValue;
        		} else {
        			controlValue = true;
        		}
        	}
        	
        	for (field in second) {
        		if (field in first) {
        			// get the field values
        			var firstValue = first[field];
        			var secondValue = second[field];
        			
        			// get the types for the values
        			var firstType = iUtil.typeOfObject(firstValue);
        			var secondType = iUtil.typeOfObject(secondValue);

        			// check if they are not the same type
        			if ((firstType == secondType) && (firstType == "object")
        				&& ((!controlField) || (firstValue[controlField] == controlValue))) {
        				// if both are objects then mix the second into the first
        				iUtil.recursiveMixin(firstValue, secondValue, options);
        				
        			} else {
        				// otherwise overwrite the second with the first 
        				first[field] = (clone) ? dojo.clone(secondValue) : secondValue;
        			}
        		} else {
        			first[field] = (clone) ? dojo.clone(second[field]) : second[field];
        		}
        	}
        };
        
        
        //
        // summary: 
        //        Accepts a target object, an object that represents arguments passed
        //        to construct the target object (usually via mixin). and an
        //        and an array of property names for which the value should be null if
        //        not otherwise specified.  For each of the specified properties, if 
        //        the construction arguments does not specify a value for that property, 
        //        then the same property is set to null on the target object.  If a 
        //        property name is found not to exist in the target object then it is 
        //        ignored.
        //
        // target:
        //        Usually the object being constructed.
        //
        // ctorArgs: 
        //        The objects that would specify attributes on the target.
        //
        // props:
        //        The array of property names for properties to be set to null if none 
        //        of the objects in the argsArray specify them.
        //
        iUtil.nullify = function(target,ctorArgs,props) {
            var index = 0;
            for (index = 0; index < props.length; index++) {
                var prop = props[index];
                if (! (prop in target)) continue;
                if ((ctorArgs) && (prop in ctorArgs)) continue;
                target[prop] = null;
            }
        };
        
        /**
         * Internal method to get the node's style as an object.  This method does not
         * normalize the style fields so it will need to be extended to make it more
         * robust for the general case.  idx.util only needs this for things like "position",
         * "width" and "height" in order to reset values on a node after changing them.
         */
        iUtil._getNodeStyle = function(node) {
        	var nodeStyle = dDomAttr.get(node, "style");
        	if (!nodeStyle) return null;
        	var result = null;
       		if (iUtil.typeOfObject(nodeStyle) == "string") {
       			result = {};
       			var tokens = nodeStyle.split(";");
       			for (var index = 0; index < tokens.length; index++) {
       				var token = tokens[index];
       				var colonIndex = token.indexOf(":");
       				if (colonIndex < 0) continue;
       				var field = token.substring(0, colonIndex);
       				var value = "";
       				if (colonIndex < token.length - 1) {
       					value = token.substring(colonIndex+1);
       				}
       				result[field] = value;
       			}
     		} else {
     			result = nodeStyle;
     		}
       		return result;
        };

        /**
         * Internal method to get the node's specific position and detect when none is specifically
         * assigned to the node.
         */
        iUtil._getNodePosition = function(node) {
        	var style = iUtil._getNodeStyle(node);
        	if (! style) return "";
        	if (! style.position) return "";
        	return style.position;
        };
        
        iUtil.fitToWidth = function(/*Node*/ parent, /*Node*/ child) {
            //	summary:
            //		Sizes a parent to fit the child node as if the child 
            //              node's positioning was NOT absolute.  Absolutely   
            //              positioned elements due not "reserve" space, so this
            //              method will temporarily position the element as  
            //              "static", then determine the result size of the parent,
            //              set the parent's width explicitly, and then return the
            //              child to the default previously set positioning.  This
            //              is especially handy in that it allows the parent to
            //              define padding which will be respected.
            //
            //	parent:
            //		The parent node -- no checking is done to ensure this
            //              node is actually a parent of the specified child.
            //
            //	child:
            //		The child node -- no checking is done to ensure this
            //              node is actually a child of the specified parent.
        	var pos = iUtil._getNodePosition(child);
            dDomStyle.set(parent, {width: "auto"});
            dDomStyle.set(child, {position: "static"});
            var dim = dDomGeo.getMarginBox(parent);
            dDomStyle.set(parent, {width: dim.w + "px"});
            dDomStyle.set(child, {position: pos});  
            return dim;
        };
        
        iUtil.fitToHeight = function(/*Node*/ parent, /*Node*/ child) {
            //	summary:
            //		Sizes a parent to fit the child node as if the child 
            //              node's positioning was NOT absolute.  Absolutely   
            //              positioned elements due not "reserve" space, so this
            //              method will temporarily position the element as  
            //              "static", then determine the result size of the parent,
            //              set the parent's height explicitly, and then return the
            //              child to the default previously set positioning.  This
            //              is especially handy in that it allows the parent to
            //              define padding which will be respected.
            //
            //	parent:
            //		The parent node -- no checking is done to ensure this
            //              node is actually a parent of the specified child.
            //
            //	child:
            //		The child node -- no checking is done to ensure this
            //              node is actually a child of the specified parent.
        	var pos = iUtil._getNodePosition(child);
            dDomStyle.set(parent, {height: "auto"});
            dDomStyle.set(child, {position: "static"});
            var dim = dDomGeo.getMarginBox(parent);
            dDomStyle.set(parent, {height: dim.h + "px"});
            dDomStyle.set(child, {position: pos});  
            return dim;
        };
        
        iUtil.fitToSize = function(/*Node*/ parent, /*Node*/ child) {
            //	summary:
            //		Sizes a parent to fit the child node as if the child 
            //              node's positioning was NOT absolute.  Absolutely   
            //              positioned elements due not "reserve" space, so this
            //              method will temporarily position the element as  
            //              "static", then determine the result size of the parent,
            //              set the parent's size explicitly, and then return the
            //              child to the default previously set positioning.  This
            //              is especially handy in that it allows the parent to
            //              define padding which will be respected.
            //
            //	parent:
            //		The parent node -- no checking is done to ensure this
            //              node is actually a parent of the specified child.
            //
            //	child:
            //		The child node -- no checking is done to ensure this
            //              node is actually a child of the specified parent.
        	var pos = iUtil._getNodePosition(child);
            dDomStyle.set(parent, {width: "auto", height: "auto"});
            dDomStyle.set(child, {position: "static"});
            var dim = dDomGeo.getMarginBox(parent);
            dDomStyle.set(parent, {width: dim.w + "px", height: dim.h + "px"});
            dDomStyle.set(child, {position: pos});
            return dim;
        };
        
        iUtil.getStaticSize = function(/*Node*/ node) {
            //	summary:
            //		Determines the  dimensions of the specified node if it
            //              were to use static positioning.
            //
            //	node:
            //		The node to work with.
        	var style = iUtil._getNodeStyle(node);
        	var pos = (style && style.position) ? style.position: "";
            var width  = (style && style.width) ? style.width : "";
            var height = (style && style.height) ? style.height : "";
            dDomStyle.set(node, {position: "static", width: "auto", height: "auto"});
            var dim = dDomGeo.getMarginBox(node);
            dDomStyle.set(node, {position: pos, width: width, height: height});
            return dim;
        };
        
        iUtil.reposition = function(/*Node*/ node, /*String*/ position) {
            //	summary:
            //		Determines the  dimensions of the specified node if it
            //              were to use static positioning.
            //
            //	node:
            //		The node to work with.
        	var oldpos = iUtil._getNodePosition(node);
            dDomStyle.set(node, {position: position});
            return oldpos;
        };
        
        iUtil.getParentWidget = function(/*Node|Widget*/ child,
        									/*Type*/        widgetType) {
            //	summary:
            //		Determines the widget that is the parent of the 
            //              specified widget or node.  This is determined by
            //              obtaining the parent node for the specified node
            //              or "widget.domNode" and then calling 
            //              dijit.getEnclosingWidget().  This method may return
            //              null if no widget parent exists.
            //
            //	child:
            //		The dijit._Widget or node to work with.

            // get the widget node
            var childNode = (child instanceof dWidget) ? child.domNode : child;
            
            // get the parent node of the DOM node
            var parentNode = childNode.parentNode;
            
            // check the parent node
            if (parentNode == null) return null;
            
            // get the widget for the node
            var parent = dRegistry.getEnclosingWidget(parentNode);
            
            // check if looking for a specific widget type
            while ((widgetType) && (parent) && (! (parent instanceof widgetType))) {
            	parentNode = parent.domNode.parentNode;
            	parent = null;
            	if (parentNode) {
            		parent = dRegistry.getEnclosingWidget(parentNode);
            	}
            } 
            
            // return the parent
            return parent;
        };

        iUtil.getSiblingWidget = function(/*Node|Widget*/ target, 
        									 /*Boolean*/     previous,
        									 /*Type*/        widgetType) {
            //	summary:
            //		Determines the widget that is the first next or previous
        	//              sibling of the specified widget or node that is a 
        	//              widget (optionally of a specific type).  This 
        	//              is determined by obtaining the parent node for the 
        	//              specified node or "widget.domNode", finding the first
        	//              next or previous sibling node that is the domNode for
        	//              a widget, and if not moving on to the next.  This 
        	//              method may return null if no widget sibling exists.
            //
            //	target:
            //		The dijit._Widget or node to work with.
        	//
        	//  previous:
        	//       true if we want the previous sibling, and false if the next is desired
            //
        	//  widgeType:
        	//       Provided if a specific type of widget is desired (other types will be ignored)
        	//
        	
            // get the widget node
            var widgetNode = (target instanceof dWidget) ? target.domNode : target;
            
            // get the parent node of the DOM node
            var parentNode = widgetNode.parentNode;
            
            // check the parent node
            if (parentNode == null) return null;
            
            // get the children of the parent
            var children = parentNode.childNodes;
            if (! children) return null;
            
            // find the index for the child
            var index = 0;
            for (index = 0; index < children.length; index++) {
            	if (children[index] == widgetNode) break;
            }
            
            if (index == children.length) return null;
            
            // work forward are backward from the index
            var step = (previous) ? -1: 1;
            var limit = (previous) ? -1 : children.length;
            var sibindex = 0;
            var sibling  = null;
            for (sibindex = (index + step); sibindex != limit; (sibindex += step)) {
            	var sibnode = children[sibindex];
            	
            	// get the widget for the node
                var sibwidget = dRegistry.getEnclosingWidget(sibnode);
                if (! sibwidget) continue;
                if (sibwidget.domNode == sibnode) {
                	if ((!widgetType) || (sibwidget instanceof widgetType)) {
                		sibling = sibwidget;
                		break;
                	}
                }
            }
            
            // return the sibling
            return sibling;
        };
        

        iUtil.getChildWidget = function(/*Node|Widget*/ parent, 
        								   /*Boolean*/     last,
        								   /*Type*/        widgetType) {
            //	summary:
            //		Determines the widget that is the first or last 
        	//              child of the specified widget or node that is a
        	//              a widget (optionally of a specified type).  This 
        	//              is determined by obtaining the widget for the specified
        	//              parent, obtaining the children widgets and returning either
        	//              the first or last that is optionally of a specified type.
        	//              This method may return null if no widget child exists.
            //
            //	parent:
            //		The dijit._Widget or node to work with.
        	//
        	//  last:
        	//       true if we want the last child, and false if the first is desired.
        	//
        	//  widgeType:
        	//       Provided if a specific type of widget is desired (other types will be ignored)
        	//
        	
            // get the widget node
        	if (! (parent instanceof dWidget)) {
            	var widget = dRegistry.getEnclosingWidget(parent);
            	if (widget) parent = widget;
            }

            var children = null;
            if (parent instanceof dWidget) {
            	children = parent.getChildren();
            } else {
                children = parent.childNodes;
            }
            
            // check the children
            if (! children) return null;
            if (children.length == 0) return null;

            // setup the looping variables
            var start = (last) ? (children.length - 1) : 0;
            var step  = (last) ? -1 : 1;
            var limit = (last) ? -1 : children.length;

            // work forward are backward from the index
            var childIndex = 0;
            var child      = null;
            for (childIndex = start; childIndex != limit; (childIndex += step)) {
            	var widget = children[childIndex];
            	if (! (widget instanceof dWidget)) {
                	// get the widget for the node
                    var node = widget;
                    widget = dRegistry.getEnclosingWidget(node);
                    if (! widget) continue;
                    if (widget.domNode != node) continue;
            	}
            	if ((!widgetType) || (widget instanceof widgetType)) {
            		child = widget;
            		break;
            	}
            }
            
            // return the child
            return child;
        };

        iUtil.getFormWidget = function(/*String*/ 		formFieldName,
        							   /*Node|Widget?*/	parent) {
        	//	summary:
        	//				Determines the widget (derived from dijit.form._FormWidget)
        	//              that is a child of the specified node or widget (usually a
        	//              dijit.form.Form) that has the specified form field name.  If 
        	//              the found form field is found to be an instance of dijit.form._FormWidget
        	//              then it is returned, otherwise null is returned.
        	//
        	//  formFieldName:
        	//       The name of the form field that is desired.
        	//
        	//	parent:
        	//		Optional root node or root widget under which to look for the form widgets.
        	//      If not specified then the entire document body is searched.
        	//
        	// get the widget node
        	var rootNode = null;
        	if (!parent) {
        		parent = dWindow.body();
        	} else if (parent instanceof dWidget) {
        		rootNode = parent.domNode;
        	} else {
        		rootNode = form;
        	}
        			
        	var formWidget = null;
        	var nodeList = dQuery("[name='" + formFieldName + "']", rootNode);
        	for (var index = 0; (!formWidget) && (index < nodeList.length);index++) {
        		var node = nodeList[index];
        		var widget = dRegistry.getEnclosingWidget(node);
        		if (!widget) continue;
        		if (! (widget instanceof dFormWidget)) {
        			continue;
        		}
        		var name = widget.get("name");
        		if (name != formFieldName) {
        			continue;
        		}
        		formWidget = widget;
        	}
        	return formWidget;
        };
        
        
        iUtil.isNodeOrElement = function(/*Object*/ obj) {
            //	summary:
            //		Attempts to determine if the specified object is a DOM node.
            //          This is needed since IE does not recognize the "Node" type,
            //          and only IE-8 recognizes the "Element" type.
            //	obj:
            //		The object to check.

            return ((obj.parentNode) && (obj.childNodes) && (obj.attributes)) ? true : false;
        };

        iUtil.debugObject = function(/*Object*/ obj) {
        	return iUtil._debugObject(obj, "/", [ ]);
        };
        
        iUtil._debugObject = function(/*Object*/ obj, /*String*/ path, /*Array*/ seen) {
           if (obj === null) return "null";
           var objType = iUtil.typeOfObject(obj);
           switch (objType) {
           case 'object':
        	   for (var index = 0; index < seen.length; index++) {
        		   if (seen[index].obj == obj) {
        			   return "CIRCULAR_REFERENCE[ " + seen[index].path + " ]";
        		   }
        	   }
        	   seen.push({obj: obj, path: path});
        	   var result = "{ ";
        	   var prefix = "";
        	   for (field in obj) {
        	     result = (result + prefix + '"' + field + '": ' 
        	    		   + iUtil._debugObject(obj[field], 
        	    				   				   path + '/"' + field + '"', 
        	    				   				   seen));
        	     prefix = ", ";
        	   }
        	   result = result + " }";
        	   return result;
           case 'date':
        	   return "DATE[ " + dDateStamp.toISOString(obj) + " ]";
           default:
        	   return dJson.toJson(obj);
           }
        };
     
        // browser sniffing normalization
        var version = (window["dojo"] && dojo.version);
        if(version && version.major == 1 && version.minor == 6){
        	iUtil.isBrowser	= dojo.isBrowser;	
        	iUtil.isIE 		= dojo.isIE; 		
        	iUtil.isFF 		= dojo.isFF; 		
        	iUtil.isSafari	= dojo.isSafri;		
        	iUtil.isChrome	= dojo.isChrome;	
        	iUtil.isMozilla	= dojo.isMozilla;	
        	iUtil.isOpera	= dojo.isOpera;		
        	iUtil.isKhtml	= dojo.isKhtml;		
        	iUtil.isAIR		= dojo.isAIR;		
        	iUtil.isQuirks	= dojo.isQuirks;	
        	iUtil.isWebKit	= dojo.isWebKit;	
        } else {
            iUtil.isBrowser	= dHas("host-browser");
            iUtil.isIE 		= dHas("ie");
            iUtil.isFF 		= dHas("ff");
            iUtil.isSafari	= dHas("safari");
            iUtil.isChrome	= dHas("chrome");
            iUtil.isMozilla	= dHas("mozilla");
            iUtil.isOpera	= dHas("opera");
            iUtil.isKhtml	= dHas("khtml");
            iUtil.isAIR		= dHas("air");
            iUtil.isQuirks	= dHas("quirks");
            iUtil.isWebKit	= dHas("webkit");
        }
        return iUtil;
}

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
	dojo.provide("idx.util");
	dojo.require("dojo.date.stamp");
	dojo.require("dijit._WidgetBase");
	dojo.require("dijit.form._FormWidget");
	
	factory(dojo,							// dLang			(dojo/_base/lang)
			idx,							// iMain			(idx)
			dojo, 							// dKernel 			(dojo/_base/kernel)
			null,							// dHas				(dojo/has)
			dojo,							// dXhr	   			(dojo/_base/xhr)
			dojo,							// dWindow			(dojo/_base/window)
			dojo._Url,						// dURL				(dojo/_base/url)
			dojo.date.stamp,				// dDateStamp  		(dojo/date/stamp)
			dojo,							// dJson			(dojo/_base/json)
			{add: dojo.addClass},			// dDomClass		(dojo/dom-class) for (dDomClass.add)
			{set: dojo.style,				// dDomStyle		(dojo/dom-style)
			 get: dojo.style,
			 getComputedStyle: 
				 dojo.getComputedStyle},
			{set: dojo.attr,				// dDomAttr			(dojo/dom-attr) 
			 get: dojo.attr
			},
			dojo,							// dDomConstruct 	(dojo/dom-construct)
			{getMarginBox: dojo.marginBox},	// dDomGeo 			(dojo/dom-geometry) for (dDomGeo.getMarginBox)
			dojo,							// dIOQuery		 	(dojo/io-query)
			dojo.query,						// dQuery			(dojo/query)
			dojo.NodeList,					// dNodeList		(dojo/NodeList-dom)
			dijit,							// dRegistry		(dijit/registry)
			dijit.form._FormWidget,			// dFormWidget		(dijit/form/_FormWidget)
			dijit._WidgetBase);				// dWidget			(dijit/_WidgetBase)
} else {
	define(["../../node_modules/intern-geezer/node_modules/dojo/_base/lang",
	        "idx",
	        "../../../dist/lib/dojo/_base/kernel",
	        "dojo/has",
	        "dojo/_base/xhr",
	        "dojo/_base/window",
	        "dojo/_base/url",
	        "dojo/date/stamp",
	        "dojo/_base/json",
	        "dojo/dom-class",
	        "dojo/dom-style",
	        "dojo/dom-attr",
	        "dojo/dom-construct",
	        "dojo/dom-geometry",
	        "dojo/io-query",
	        "dojo/query",
	        "dojo/NodeList-dom",
	        "dijit/registry",
	        "dijit/form/_FormWidget",
	        "dijit/_WidgetBase",
	        "dojo/_base/sniff"], 
			factory);
}	

})();