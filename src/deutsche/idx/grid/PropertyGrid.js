/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

(function() 
{
function factory(dDeclare,				// (dojo/_base/declare)
		         dWidget,				// (dijit/_Widget)
		         dTemplated,			// (dijit/_Templated)
		         dContainer,			// (dijit/_Container)
		         dLang,					// (dojo/_base/lang)
				 dArray,				// (dojo/_base/array)
				 dConnect,				// (dojo/_base/connect)
				 dString,				// (dojo/string)
				 dDomConstruct,			// (dojo/dom-construct),
				 dQuery,				// (dojo/query.NodeList) + (dojo/NodeList-dom)
				 iString,				// (../string)
				 iUtil,					// (../util)
				 iResources,			// (../resources)
				 iPropertyFormatter,	// (./PropertyFormatter)
				 templateText,			// (dojo/text!./templates/PropertyGrid.html)
				 rowTemplateText) {		// (dojo/text!./templates/PropertyRow.html)
	
	var dNodeList = dQuery.NodeList;
	
	/**
	 * @name idx.grid._PropertyRow
	 * @class Property row widget.
	 * Internal widget class used by idx.grid.PropertyGrid to manage its rows.
	 * @private
	 * @augments dijit._Widget
	 * @augments dijit._Templated
	 */
	var PropertyRow = dDeclare("idx.grid._PropertyRow",[dWidget,dTemplated],
		/**@lends idx.grid._PropertyRow#*/ 
	{
		  /**
		   * The property name for this instance.
		   * @type String
		   * @default ""
		   */
		  propertyName: "",

		  /**
		   * The property type for this instance.
		   * @type String
		   * @default ""   
		   */
		  propertyType: "",

		  /**
		   * The formatter for this instance.
		   * @type Function
		   * @default null
		   */
		  formatter: null,

		  /**
		   * the parent property grid for this instance
		   * @type Object
		   * @default null   
		   */
		  propertyGrid: null,

		  /**
		   * The label for this property.
		   * @type String
		   * @default ""   
		   */
		  label: "",

		  /*
		   * The index for this row in the grid.
		   * @type int
		   * @default 0   
		   */
		  rowIndex: 0,

		  /**
		   * The total number of rows in the grid.
		   * @type int
		   * @default 1   
		   */
		  rowCount: 1,

		  /**
		   * The attribute map for mapping content to the template.
		   * @type Object
		   * @default { title: { node: "titleNode", type: "innerHTML" } }  
		   */
		  attributeMap: dLang.delegate(dijit._Widget.prototype.attributeMap, {
		    title: { node: "titleNode", type: "innerHTML" }
		  }),

			/**
		 	 * Overrides of the base CSS class.
		 	 * This string is used by the template, and gets inserted into
		 	 * template to create the CSS class names for this widget.
		 	 * @private
		 	 * @constant
		 	 * @type String
		 	 * @default "idxPropertyRow"
		 	 */
		  baseClass: "idxPropertyRow",

		  /**
		   * This will be set to "Solo", "First, "Last" or "Middle" depending on the
		   * rowCount and the rowIndex.  "Solo" is only used if there is only one row
		   * in the entire grid.
		   * @type String
		   * @default "Solo"
		   */
		  posClassSuffix: "Solo",

		  /**
		   * This will be set to "Even" or "Odd" for applying additional CSS classes
		   * to the elements in the template.
		   * @type String
		   * @default "Solo"
		   */
		  altClassSuffix: "Even",
		  
			/**
			 * The path to the widget template for the dijit._Templated base class.
			 * @constant
			 * @type String
			 * @private
			 * @default "grid/templates/_PropertyRow.html"
			 */
		  templateString: rowTemplateText,
		  
			/**
			 * Constructor
			 * Handles the reading any attributes passed via markup.
			 * @param {Object} args
			 * @param {Object} node
			 */
		  constructor: function(args, node) {
		    this._started = false;
		  },

		  /**
		   * Sets the row index attribute.  This method would normally not be needed since
		   * it only serves to set the member variable, HOWEVER, without this function in 
		   * place this module fails to function properly on IE7 when running under the 
		   * Dojo AMD loader.  The cause of the IE7 failure was not determined, only that
		   * the failure of "Object Error" would occur while setting "rowIndex" from the
		   * _WidgetBase.applyAttributes function.  Adding this function seems to workaround
		   * the issue.
		   * 
		   * @param value
		   */
		  _setRowIndexAttr: function(value) {
			this.rowIndex = value;
		  },
		  
		  /**
		   * Overrides dijit._Widget.postMixInProperties() to set
		   * properties, formatter and class variables.
		   * @see dijit._Widget.postMixInProperties
		   */
		  postMixInProperties: function() {
		    this.inherited(arguments);
		    var propType = iString.nullTrim(this.propertyType);
		    var properties = this.propertyName;
		    if (propType) {
		      properties = properties + "(" + propType + ")";
		    }
		    if (this.formatter == null) {
		       this._ownsFormatter = true;
		       this.formatter = new iPropertyFormatter({
		              properties: properties,
		              propertyName: this.propertyName,
		              propertyContainer: this.propertyGrid});
		    }
		    this.altClassSuffix = ((this.rowIndex % 2) == 0) ? "Even" : "Odd";
		    this.posClassSuffix = ((this.rowCount == 1) ? "Solo"
		                           : ((this.rowIndex == 0) ? "First"
		                              : ((this.rowIndex == (this.rowCount - 1)) ? "Last"
		                                 : "Middle")));
		  },

		  /**
		   * Handles building out the markup and placing the formatter in the proper
		   * location.  If the formatter is custom, then it orphans it from the 
		   * grid's hidden location.
		   * @see dijit._Widget.buildRendering
		   */ 
		  buildRendering: function() {
		    this.inherited(arguments);
		  },

		  /**
		   * Called at startup to set state, setup children
		   * and rebuild rows.
		   * @see dijit._Widget.startup
		   */
		  startup: function() {
		    if (this._started) return;
		    if (!this._ownsFormatter) {
		       var nodeList = new dNodeList(this.formatter.domNode);
		       nodeList.orphan();
		    }

		    dDomConstruct.place(this.formatter.domNode, this.valueNode, "last");
		    
		    if (this._ownsFormatter) {
		       this.formatter.startup();
		    }
		    this.inherited(arguments);
		    this._changeConnection = dConnect.connect(this.formatter, "onChange", this.propertyGrid, "_onChange");
		  },
		  
		  /**
		   * Checks if this instance has any defined editors (i.e.: if the formatter has children)
		   * This returns true if editors are found, otherwise false. 
		   */
		  hasEditors: function() {
			return (this.formatter.getChildren().length > 0);  
		  },

		  /**
		   * Method provided for focusing the proper element on the row
		   * when editing.
		   */
		  focus: function() {
			  this.formatter.focus();
		  },
		  
		  /**
		   * Cleans up any loose connections.
		   */
		  destroy: function() {
			  if (this._editConnection) dConnect.disconnect(this._editConnection);
			  this._editConnection = null;
			  if (this._changeConnection) dConnect.disconnect(this._changeConnection);
			  this._changeConnection = null;
			  if (this._preSaveConnection) dConnect.disconnect(this._preSaveConnection);
			  this._preSaveConnection = null;
			  if (this._postSaveConnection) dConnect.disconnect(this._postSaveConnection);
			  this._postSaveConnection = null;
		  },
		  
		  /**
		   * Calls the contained formatter's 'reformat' method.
		   */
		  reformat: function() {
			var title = null;
			var label = this.propertyGrid._getLabel(this.propertyName);
		    this.set("title", label);
		    this.formatter.refresh();
		  }
	});

	var PropertyGrid = dDeclare("idx.grid.PropertyGrid", [dWidget,dTemplated,dContainer],
			/**@lends idx.grid.PropertyGrid#*/						
{
  /**
   * The data object for this instance.
   * @type Object
   * @default null
   */
  data: null,

  /**
   * A comma separated list of property names from the data object to be 
   * formatted by this instance.  This can be a single property name, a
   * simple list of property names, or a property name with type name in
   * parentheses following it. 
   * @type String
   * @default ""     
   * @example
     For example:
       EXAMPLE 1 (single property name): "givenName"
       EXAMPLE 2 (list of property names):  "givenName,surname,age,birthDate"
       EXAMPLE 3 (property with type): "startTime(time)"
       EXAMPLE 4 (assorted list):  "givenName,surname,age(int),birthDate(date)"
       
       The legal format types are:
          - txt:      assumes literal text (default for string properties)   
          - dat:      uses date formatting (default for date properties)
          - tim:      uses time formatting
          - dtm:      uses date-time formatting
          - dec:      uses decimal formatting (default for numeric properties)
          - int:      uses integer formatting
          - pct:      uses percentage formatting
          - cur:      uses currency formatting
 
   */
  properties: "",

  /*
   * The resources to use for obtaining the labels for each of the properties.
   * The resources that are used by this include:
   *   - labelKeyPrefix: the default prefix for the key used to lookup labels
   *   - labelKeySuffix: the default suffix for the key used to lookup labels
   *   - emptyFormat: for formatting empty values
   *   - dateFormatOptions: for formatting "dat" properties
   *   - timeFormatOptions: for formatting "tim" properties
   *   - dateTimeFormatOptions: for formatting "dtm" properties
   *   - decimalFormatOptions: for formatting "dec" properties
   *   - integerFormatOptions: for formatting "int" properties
   *   - percentFormatOptions: for formatting "pct" properties
   *   - currencyFormatOptions: for formatting "cur" properties
   *   - labelFieldSeparator: for separating labels from their fields
   * @type String
   * @default null
   */
  resources: null,

  /**
   * Indicates whether or not the property grid should use the property
   * names directly as labels rather than trying to lookup them in 
   * resources or format them nicely.
   * @type Boolean
   * @default false 
   */
  rawLabels: false,
  
  /*
   * The prefix to attach to the property names when looking up the label
   * for that field in the resources.  If not specified the value is taken
   * from the resources using the "labelKeyPrefix" key.  The default value
   * is empty string.
   * @type String
   * @default ""   
   */
  labelKeyPrefix: "",

  /*
   * The suffix to attach to the property names when looking up the label
   * for that field in the resources.  If not specified the value is taken
   * from the resources using the "labelKeyPrefix" key.  The default value
   * is empty string.
   * @type String
   * @default ""   
   */
  labelKeySuffix: "",

  /*
   * Overrides the "format" attribute by providing a function to call to 
   * format the data object directly.  The property name and the data object 
   * itself are passed as parameters to this function and it is expected to
   * return a string.  If this function returns null, then the default formatting
   * for the property is used.
   * @type String
   * @default null
   */
  formatFunc: null,

  /*
   * A reference to or the string ID of the idx.widget.EditController to be used
   * for this instance.  If none is specified the the contained PropertyFormatter
   * instance may create their own EditController to accomodate contained editors. 
   * See idx.widget.EditController.
   * @type Object
   * @default null
   */
  editController: null,

	/**
 	 * Overrides of the base CSS class.
 	 * This string is used by the template, and gets inserted into
 	 * template to create the CSS class names for this widget.
 	 * @private
 	 * @constant
 	 * @type String
 	 * @default "idxPropertyGrid"
 	 */
  baseClass: "idxPropertyGrid",

	/**
	 * The path to the widget template for the dijit._Templated base class.
	 * @constant
	 * @type String
	 * @private
	 * @default "grid/templates/PropertyGrid.html"
	 */
  templateString: templateText,
  
	/**
	 * Constructor
	 * Handles the reading any attributes passed via markup.
	 * @param {Object} args
	 * @param {Object} node
	 */
  constructor: function(args, node) {
    this._started    = false;
    this._formatters = [ ];
    this._rows       = [ ];
  },

  /**
   * Overrides dijit._Widget.postMixInProperties() to ensure
   * that the resources are reset.
   * @see dijit._Widget.postMixInProperties
   */
  postMixInProperties: function() {
    iUtil.nullify(this, this.params, ["labelKeyPrefix", "labelKeySuffix"]);
    this.inherited(arguments);
    if (! this._rawResources) {
      this._rawResources = null;
      this._resetResources();
    }
 },

  /**
   * @see dijit._Container.buildRendering
   */
  buildRendering: function() {
    this.inherited(arguments);
  },
  
  /**
   * @see dijit._Container.postCreate
   */
  postCreate: function() {
    this.inherited(arguments);
  },
  
  /**
   * Called at startup to set state, setup children
   * and rebuild rows.
   * @see dijit._Container.startup
   */
  startup: function() {
    if(this._started){ return; }

    dArray.forEach(this.getChildren(), this._setupChild, this);

    // build out the rows
    this.inherited(arguments);

    this._started = true;
    this._rebuildRows();
    this._registerEditController();    
  },
  
  /**
   * Extends parent method by setting up child
   * widgets and rebuilding rows.
   * @param {Object} child
   * @param {int} index
   * @see dijit._Container.addChild
   */
  addChild: function(/*dijit._Widget*/ widget, /*int?*/ insertIndex) {
      this.inherited(arguments);
      if (this._started) {
         this._setupChild(widget);
         this._rebuildRows();
      }
  },

  /**
   * Extends parent method by setting up child
   * widgets and rebuilding rows.
   * @param {Object} child
   * @param {int} index
   * @see dijit._Container.addChild
   */
  removeChild: function(/*Widget or int*/ widget) {
     this.inherited(arguments);

     if (this._started) {
       if (typeof widget == "number" && widget > 0) {
          widget = this.getChildren()[widget];
       }
       if (widget instanceof iPropertyFormatter) {
         var propName  = widget.get("propertyName");
         this._formatters[propName] = null;
         widget.set("propertyContainer", null);      
       }
       this._rebuildRows();
     }
  },
  
  /**
   * Worker method to set up the added child
   * @param {Widget} child
   */
  _setupChild: function(/*Widget*/ child) {
    this.inherited(arguments);

    var nodeList  = new dNodeList(child.domNode);

    nodeList.orphan();
    dDomConstruct.place(child.domNode, this.hiddenNode, "last");

    if (child instanceof iPropertyFormatter) {
      var propName  = child.get("propertyName");
      this._formatters[propName] = child;
      child.set("propertyContainer", this);
    }
  },


  /**
   * Private method that sets the data attribute with the
   * specified value and if the state is started, calls
   * the reformat method.
   * @param {Object} value
   * @private
   */
  _setDataAttr: function(/*Object*/ value) {
    this.data = value;
    if (this._started) this._reformat();
  },

  /**
   * Private method that sets the format function attribute with the
   * specified value and if the state is started, calls
   * the reformat method.
   * @param {Function} value
   * @private
   */
  _setFormatFuncAttr: function(/*Function*/ value) {
    this.formatFunc = value;
    if (this._started) this._reformat();
  },

  /**
   * Sets the label key prefix and reformats the labels.
   */
  _setLabelKeyPrefixAttr: function(/*String*/ prefix) {
	  this.labelKeyPrefix = prefix;
	  this._reformat();
  },
  
  /**
   * Sets the label key suffix and reformats the labels.
   */
  _setLabelKeySuffixAttr: function(/*String*/ suffix) {
	  this.labelKeySuffix = suffix;
	  this._reformat();
  },
  
  /**
   * Private method that sets the lang attribute with the
   * specified value and if the state is started, calls
   * the reset resources method.
   * @param {Object} value
   * @private
   */
  _setLangAttr: function(/*Object*/ value) {
    this.inherited(arguments);
    this.lang = value;
    this._resetResources();
  },

  /**
   * Private method that sets the resources attribute with the
   * specified value and if the state is started, calls
   * the reset resources method.
   * @param {Object} value
   * @private
   */
  _setResourcesAttr: function(/*Object*/ value) {
    this.resources = value;
    this._resetResources();
  },

  /**
   * Private method to get the resources attribute w
   * @returns {Object} value
   * @private
   */
  _getResourcesAttr: function() {
    return this._resources;
  },

  /**
   * Private method that sets the edit controller attribute with the
   * specified value and calls the on edit controller changed callback.
   * @param {Object} value
   * @private
   */
  _setEditControllerAttr: function(value) {
    this.editController = dijit.byId(value);
    if (this._preSaveConnection) {
    	dConnect.disconnect(this._preSaveConnection);
    	this._preSaveConnection = null;
    }
    if (this._postSaveConnection) {
    	dConnect.disconnect(this._postSaveConnection);
    	this._postSaveConnection = null;
    }
    if (this.editController) {
    	this._preSaveConnection = dConnect.connect(this.editController, "onPreSave", this, "_onPreSave");
    	this._postSaveConnection = dConnect.connect(this.editController, "onPostSave", this, "_onPostSave");
    }
    if (! this._started) return;
    this.onEditControllerChanged(value);
  },

  /**
   * 
   */
  _registerEditController: function() {
	  if (!this._started) return;
	  if (this._editConnection) {
		  var c = this._editConnection;
		  this._editConnection = null;
		  dConnect.disconnect(c);
	  }
	  if (this.editController) {
		  this._editConnection = dConnect.connect(this.editController, "onEdit", this, "_onEdit");
	  }	  
  },
  
  /**
   * Called whenever the edit controller changed
   * @param {Object} controller
   */
  onEditControllerChanged: function(controller) {
	 this._registerEditController(); 
  },

  /**
   * Internal method alled when the edit controller activates edit mode.  This ensures
   * that the appropriate element is focused.
   * @private 
   */
  _onEdit: function() {
	  for (var index = 0; index < this._rows.length; index++) {
		  var row = this._rows[index];
	      if (row.hasEditors()) {
	    	  row.focus();
	    	  break;
	      }
	  }	  
  },
  
  /**
   * Private method that is called whenever one of
   * the property formatters changes a value.
   * @param {Object} data
   * @private
   */
  _onChange: function(data, formatter) {
    this._reformat();
    
    // if we are currently saving multiple properties then we defer onChange() until complete
    if (! this._saving) this.onChange(this.get("data"), this, formatter);
  },

  /**
   * Called whenever the fields of the existing data object are modified,
   * but not when the data object itself is changed.  That is to say that
   * set("data", someValue) will not trigger this method.  If multiple
   * fields are changed with a single click of the "save" button from the
   * PropertyGrid's EditController, then this method is designed to be called
   * only once for the change to avoid multiple round trips to the server.
   * 
   * @param {Object} data  The data that was changed.
   *       
   * @param {PropertyGrid} grid The property grid that fired the event.
   * 
   * @param {PropertyFormatter} formatter The property formatter that triggered the event.
   * 
   */
  onChange: function(data, grid, formatter) {
    
  },
  
  /**
   * Internal method is called whenever the "onPreSave()" event fires
   * from the associated EditController.   
   */
  _onPreSave: function() {
     this._saving = true;
  },
  
  /**
   * Internal method is called whenever the "onPostSave()" event fires
   * from the associated EditController.   
   */
  _onPostSave: function(data, grid) {
     this._saving = false;
     this.onChange(this.get("data"), this);
  },
  
  /**
   * Private method that sets the default resources
   * and if the state is started, calls reformat.
   * @private
   */
  _resetResources: function() {
    var defaultResources 
      = iResources.getResources("idx/grid/PropertyGrid", this.lang);

    // determine if custom resources were specified and if so override 
    // the defaults as needed, otherwise use the defaults as-is
    if (this.resources) {
      var combinedResources = new Object();
      dLang.mixin(combinedResources, defaultResources);
      dLang.mixin(combinedResources, this.resources);
      this._resources = combinedResources;

    } else {
      this._resources = defaultResources;
    }
    if (this._started) this._reformat();
  },

  /**
   * Private method that sets the 'properties' attribute with the
   * specified value and calls rebuild rows.
   * @param {String} properties
   * @private
   */
  _setPropertiesAttr: function(/*String*/ properties) {
    this.properties     = properties;
    this._properties    = [ ];
    var index = 0;

    if (iString.nullTrim(this.properties)) {
       var props = this.properties.split(",");
       var index = 0;

       for (index = 0; index < props.length; index++) {
         var propName = dString.trim(props[index]);
         var propType = null;
         var openParen  = propName.indexOf("(");
         var closeParen = propName.indexOf(")");
 
         if ((openParen >= 0) && (closeParen == (propName.length-1))) {
           propType = propName.substring(openParen + 1, closeParen);
           propType = dString.trim(propType);
           propName = dString.trim(propName.substring(0, openParen));
         }
         
         this._properties.push({propName: propName, propType: propType});
      }
    }
    this._rebuildRows();
  },

  /**
   * Private method that rebuilds the rows in the grid.
   * @private
   */
  _rebuildRows: function() {
    if (! this._started) return;
    var index = 0;
    // move all the formatters up and out of the way
    for (var propName in this._formatters) {
      var formatter = this._formatters[propName];
      if (formatter.domNode.parentNode == this.hiddenNode) continue;
      var nodeList = new dNodeList(formatter.domNode);
      nodeList.orphan();
      dDomConstruct.place(formatter.domNode, this.hiddenNode, "last");
    }

    // remove all existing rows
    for (index = 0; index < this._rows.length; index++) {
      this._rows[index].destroyRecursive();
      dDomConstruct.destroy( this._rows[index].domNode );//since added 1-1, need to remove from dom that way
    }
    this._rows = [ ];//reset rows after they have been destroyed

    // create the new rows
    for (index = 0; index < this._properties.length; index++) {
      var prop      = this._properties[index];
      var propName  = prop.propName;
      var propType  = prop.propType;

      var label = null;
      var formatter = this._formatters[propName];
      if (formatter) label = formatter.get("title");
      if (!iString.nullTrim(label)) label = this._getLabel(propName);

      this._rows[index] = new PropertyRow({
           propertyName: propName,
           propertyType: propType,
           formatter: formatter,
           propertyGrid: this,
           title: label,
           rowIndex: index,
           rowCount: this._properties.length});

      this._rows[index].startup();
      this._rows[index].placeAt(this.bodyNode, "last");      
    }
  },

  /**
   * Gets the prefix to use when building the label key.
   * @private
   * @returns {int} prefix
   */
  _getLabelKeyPrefix : function() {
    if (this.labelKeyPrefix) return this.labelKeyPrefix;
    var prefix = this._resources["labelKeyPrefix"];
    return (prefix) ? prefix : "";
  },

  /**
   * Gets the suffix to use when building the label key.
   * @private
   * @returns {int} suffix
   */
  _getLabelKeySuffix : function() {
    if (this.labelKeySuffix) return this.labelKeySuffix;
    var suffix = this._resources["labelKeySuffix"];
    return (suffix) ? suffix : "";
  },

  /**
   * Attempts to lookup a label for the property name or
   * construct one if it cannot find the lookup value.
   * @private
   * @returns {int} suffix
   */
  _getLabel: function(/*String*/ propName) {
	  if (this.rawLabels) return propName;
     // attempt to lookup the label
     var result = null;
     var prefix = this._getLabelKeyPrefix();
     var suffix = this._getLabelKeySuffix();
     var labelKey = (prefix + propName + suffix);
     result = this._resources[labelKey];
     if (result && iUtil.typeOfObject(result) != "string") result = null;
     
     // if we don't have a label from resources, check the title of the formatter
     if (!result) {
    	 var formatter = this._formatters[propName];
     
    	 if (formatter) {
    		 result = formatter.get("title");
    		 result = iString.nullTrim(result);
    	 }
     }
     
     // check if we don't have a label, and if not try to make one
     if (!result) {
        // split the property name at any case switches or underscores
        propName = dString.trim(propName);
        var upperProp = propName.toUpperCase();
        var lowerProp = propName.toLowerCase();
        var index = 0;
        var result = "";
        var prevResult = "";
        var prevUpper = false;
        var prevLower = false;

        for (index = 0; index < propName.length; index++) {
           var upperChar = upperProp.charAt(index);
           var lowerChar = lowerProp.charAt(index);
           var origChar  = propName.charAt(index);

           var upper = ((upperChar == origChar) && (lowerChar != origChar));
           var lower = ((lowerChar == origChar) && (upperChar != origChar));

           // check for spaces or underscores
           if ((origChar == "_") || (origChar == " ")) {
             if (prevResult == " ") continue;
             prevResult = " ";
             prevUpper  = upper;
             prevLower  = lower;
             result = result + prevResult;
             continue;
           }
           
           // check for dot notation
           if (origChar == ".") {
        	   prevResult = "/";
        	   prevUpper = upper;
        	   prevLower = lower;
        	   result = result + " " + prevResult + " ";
        	   continue;
           }

           // check if this is the first character
           if ((index == 0) || (prevResult == " ")) {
              prevResult = upperChar; 
              prevUpper  = upper;
              prevLower  = lower;
              result = result + prevResult;
              continue;
           }

           if ((!upper) && (!lower)) {
             if (prevUpper || prevLower) {
               result = result + " ";
             }

             // the character is not alphabetic, and neither is this one
             prevUpper = upper;
             prevLower = lower;
             prevResult = origChar;

             result = result + prevResult;
             continue;
           }

           if ((!prevUpper) && (!prevLower)) {
             // previous character was non-alpha, but this one is alpha
        	 var prevSlash = (prevResult == "/");
             prevUpper = upper;
             prevLower = lower;
             prevResult = upperChar;
             if (prevSlash) {
            	 result = result + prevResult;
             } else {
            	 result = result + " " + prevResult;
             }
             continue;
           }

           // if we get here then both the previous and current character are
           // alphabetic characters so we need to detect shifts in case
           if (upper && prevLower) {
              // we have switched cases
              prevResult = upperChar;
              prevUpper  = upper;
              prevLower = lower;
              result = result + " " + prevResult;
              continue;
           }

           // if we get here then we simply use the lower-case version
           prevResult = lowerChar;
           prevUpper  = upper;
           prevLower  = lower;
           result = result + prevResult;
        }
     }

     return result;
  },

  /**
   * Exposes reformat method for public access.  Call this method
   * when the underlying data values have changed for the referenced
   * data object in order to notify the PropertyGrid to reformat its
   * displayed values with the new values.
   * 
   * This method need not be called when changing the resources or
   * the properties or the label prefix or suffix as these methods
   * will automatically trigger the appropriate refresh.  This method
   * exists solely for when the data object referenced is shred by 
   * multiple objects and one object has changed the values, but this
   * PropertyGrid may be unaware of that change.
   */
  refresh: function() {
	  this._reformat();
  },

  /**
   * Private method that reformats the rows
   * @private
   */
  _reformat: function() {
    var index = 0;
    for (index = 0; index < this._rows.length; index++) {
       this._rows[index].reformat();
    }
  }
});

	PropertyGrid.PropertyRow = PropertyRow;
	
	return PropertyGrid;
}

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
	dojo.provide("idx.grid.PropertyGrid");

	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.require("dijit._Container");
	dojo.require("idx.resources");
	dojo.require("idx.util");
	dojo.require("idx.string");
	dojo.require("dojo.date.locale");
	dojo.require("dojo.number");
	dojo.require("idx.grid.PropertyFormatter");
	dojo.requireLocalization("idx","base");
	dojo.requireLocalization("idx.grid","base");
	dojo.requireLocalization("idx.grid","PropertyGrid");

	var templateTxt = dojo.cache("idx", "grid/templates/PropertyGrid.html");
	var rowTemplateTxt = dojo.cache("idx", "grid/templates/_PropertyRow.html");

	factory(dojo.declare,					// dDeclare				(dojo/_base/declare)
            dijit._Widget,					// dWidget 				(dijit/_Widget)
            dijit._Templated,				// dTemplated			(dijit/_Templated)
            dijit._Container,				// dContainer			(dijit/_Container)
            dojo,							// dLang				(dojo/_base/lang)
			dojo,							// dArray				(dojo/_base/array)
			dojo,							// dConnect				(dojo/_base/connect)
			dojo.string,					// dString				(dojo/string)
			dojo,							// dDomConstruct		(dojo/dom-construct)
			dojo,							// dQuery    			(dojo/query.NodeList) + (dojo/NodeList-dom)
			idx.string,						// iString				(../string)	
			idx.util,						// iUtil				(../util)									
			idx.resources,					// iResources			(../resources)
			idx.grid.PropertyFormatter,		// iPropertyFormatter	(./PropertyFormatter)
			templateTxt,					// templateText			(dojo/text!./templates/PropertyGrid.html)
			rowTemplateTxt);				// rowTemplateText		(dojo/text!./templates/PropertyRow.html)
} else {
	define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	        "../../../lib/dijit/_Widget",
	        "dijit/_Templated",
	        "dijit/_Container",
	        "dojo/_base/lang",
	        "dojo/_base/array",
	        "dojo/_base/connect",
	        "dojo/string",
	        "dojo/dom-construct",
	        "dojo/query",
	        "../string",
	        "../util",
	        "../resources",
	        "./PropertyFormatter",
	        "dojo/text!./templates/PropertyGrid.html",
	        "dojo/text!./templates/_PropertyRow.html",
	        "dojo/NodeList-dom"],
	        factory);
}
})();


