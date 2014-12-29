/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */
(function(){

var factory = function(dojo_declare, dojo_lang, dojo_array, dojo_json, dojo_html, dojo_connect, dojo_xhr, dojo_window, dojo_query, dojo_keys, dijit_popup, dijit_Widget, dijit_Templated, idx_util, idx_resources){

var TypeAheadPopup;

/**
 * @name idx.widget.TypeAhead
 * @class This widget provides type ahead feature to input element.
 * @augments dijit._Widget
 */
var TypeAhead = dojo_declare("idx.widget.TypeAhead", [dijit_Widget],
/**@lends idx.widget.TypeAhead#*/
{

	/**
	 * input element ID or node.
	 * @type String|Object
	 * @default ""
	 */
	connectedNode: "", // id or input element
	isShowing: false,

	/**
	 * Response type. One of "store", "json" and "dom".
	 * @type String
	 * @default "store"
	 */
	type: "store", // response type can be 'store', 'json' or 'dom'
			   // xhr response example for dom:
			   // 	<table class="typeAheadTable">
			   //		<tbody>
			   // 			<tr class="typeAheadTableRow"><td class="typeAheadCell" value="value1">value1</td></tr>
			   //			<tr class="typeAheadTableRow typeAheadTableRowOdd"><td class="typeAheadCell" value="value2">value2</td></tr>
			   //		</tbody>
			   //	</table>
			   //
			   // xhr respose example for json:
			   // 	[
			   // 		{value: "value1", label: "label1"},
			   // 		{value: "value2", label: "label2"}
			   // 	]
			   //

	/**
	 * Data store.
	 * @type Object
	 * @default null
	 */
	store: null,

	/**
	 * Attribute name for label string.
	 * @type String
	 * @default "name"
	 */
	labelAttr: "name",

	/**
	 * Attribute name for value.
	 * @type String
	 * @default "value"
	 */
	valueAttr: "value",

	/**
	 * Query options for fetching from data store.
	 * @type Object
	 * @default {ignoreCase: true}
	 */
	queryOptions: {ignoreCase: true},

	/**
	 * URL for AJAX request for JSON or HTML.
	 * @type String
	 * @default ""
	 */
	url: "", // ajax request url 

	/**
	 * Specifies whether to encode request keyword.
	 * @type boolean
	 * @default false
	 */
	encode: false, // encode request keyword

	/**
	 * Specifies whether to use polling for typing with IME.
	 * @type boolean
	 * @default true
	 */
	polling: true, // for typing with IME
	_pollingTimer: null,

	/**
	 * Interval of polling.
	 * @type Number
	 * @default 500
	 */
	pollingInterval: 500,

	_lastValue: "",
	_popupWidget: null,

	/**
	 * Shows a close button, if true.
	 * @type Boolean
	 * @default false
	 */
	closable: false, // show close button

	/**
	 * Keeps showing the results even after loosing focus, if true.
	 * @type Boolean
	 * @default false
	 */
	persist: false, // keep showing when the blur occurs
	
	_previousRequest: null,

	/**
	 * Timeout for AJAX request.
	 * @type Number
	 * @default 3000
	 */
	timeout: 3000,

	/**
	 * Caches the results as an array, if true.
	 * @type Boolean
	 * @default true
	 */
	cacheEnabled: true, // cache the results as an array
	_cachedMap: [],
	
	_blurTimer: null,

	/**
	 * Interval to handle losing focus.
	 * @type Number
	 * @default 300
	 */
	blurInterval: 300,

	_handlers: [],
	/**
	 * HTTP method for AJAX request.
	 * "POST" or "GET".
	 * @type String
	 * @default "POST"
	 */
	method: "POST",

	/**
	 * Initializes internal properties.
	 */
	constructor: function(){
	  	this._handlers = [];
	  	this._cachedMap = [];
  	},
  
  	/**
  	 * Creates a popup widget.
  	 */
	buildRendering: function(){
    	this.inherited(arguments);
    	// create popup widget
		this._popupWidget = new TypeAheadPopup({
			onClick: dojo_lang.hitch(this, this._onClick),
			onClose: dojo_lang.hitch(this, this._onClose),
			id: this.id + "_popup",
			closable: this.closable,
			dir: this.dir
		}); 		
  	},

  	/**
  	 * Sets up event handlers.
  	 */
    postCreate: function(){
    	this.inherited(arguments);
    	// attach handlers
    	var node = this.connectedNode = this.getNodeById(this.connectedNode);
    	this.attachHandlers(node);
    },
   
    /**
     * Starts up the popup widget.
     */
    startup: function(){
    	if(this._started){
    		return;
    	}
    	this.inherited(arguments);
    	this._popupWidget.startup();
    },
    
    // for reuse the widget
    /**
     * Connects to a new node.
     * @param {String|Object} id
     */
    attach: function(id/*id or node*/){
    	var node = this.getNodeById(id);
    	if(!node || (this.connectedNode == node)){
    		// do nothing when attach to the same node
    		return;
    	}
		this.detach();
   		// attach handlers
   		this.attachHandlers(node);
   		this.connectedNode = node;
    },

    /**
     * Sets up event handlers for the connected node.
     */
    attachHandlers: function(node){
    	if(node){
			this._handlers.push(dojo_connect.connect(node, "onkeyup", this, "_onInputKeyup"));
			this._handlers.push(dojo_connect.connect(node, "onblur", this, "_onBlur"));
			this._handlers.push(dojo_connect.connect(node, "onkeydown", this, "_onInputKeyDown"));
			this._handlers.push(dojo_connect.connect(window, "onresize", this, "hideResults"));
			// IE or webkit call blur when the scrollbar of the popup node is clicked
	    	if(!idx_util.isFF){
				this._handlers.push(dojo_connect.connect(this._popupWidget.domNode, "onmousedown", this, function(){
					this._popupScrollbarClicked = true;
				}));
			}			
    	}    	
    },

    /**
     * Obtains element node from ID.
     * @param {String|Object} id
     * @returns {Object}
     */
    getNodeById: function(id /*id or node*/){
    	if(!id){
    		return null;
    	}
    	return (id.nodeName && (id.nodeType==1)) ? id : dojo_html.byId(id);
    },

    /**
     * Disconnects from the connected node.
     */
	detach: function() {
		this.clearResults();
		this._lastValue = "";
		// disconnect handlers
		dojo_array.forEach(this._handlers, dojo_connect.disconnect);
		this.clearCache();
		this.clearPollingTimer();
		this.connectedNode = null;
	},

	/**
	 * Handles key up event.
	 * @param {Object} e
	 * @private
	 */
    _onInputKeyup: function(e){
    	var key = e.keyCode;
    	var dk = dojo_keys;
    	var isChar = !((key == dk.UP_ARROW)||(key == dk.DOWN_ARROW)||(key == dk.LEFT_ARROW)||(key == dk.RIGHT_ARROW));
    	var value = e.target.value;
		if(!this.polling && isChar && (value != this._lastValue)){
			this.loadSuggestions(value);
		}
    },

    /**
     * Handles key down event.
     * @param {Object} e
     * @private
     */
	_onInputKeyDown: function(e){
		var key = e.keyCode;
		var dk = dojo_keys;
		switch(key){
			case dk.ENTER:
				this.abortRequest();
				this._onExecute();
				this._lastValue = e.target.value;
				break;
			case dk.PAGE_UP:
			case dk.UP_ARROW:
				this.clearPollingTimer();
				this._onKeyUpArrow();				
				break;
			case dk.PAGE_DOWN:
			case dk.DOWN_ARROW:
				this.clearPollingTimer();
				this._onKeyDownArrow();				
				break;
			case dk.LEFT_ARROW:
			case dk.RIGHT_ARROW:
				this.clearPollingTimer();
				break;
			case dk.ESCAPE:
				this.setDisplayedValue(this._lastValue);
				this.hideResults();			
				break;
			default:
				if(this.polling && (this._pollingTimer == null)){
					this._onStartPolling(true/*isFirst*/);
				}
				break;
		}
	},

	/**
	 * Starts polling.
	 * @param {Boolean} isFirst
	 * @private
	 */
	_onStartPolling: function(isFirst){
		var _this = this;
		if(!isFirst && (_this._pollingTimer==null)){
			return;
		}
		_this._pollingTimer = setTimeout(function(){
			var value = _this.connectedNode.value;
			if(_this._lastValue != value){
				_this.loadSuggestions(value);
			}
			_this._onStartPolling(false/*isFirst*/);			
		}, isFirst ? 0 : _this.pollingInterval);
	},	

	/**
	 * Loads suggestions.
	 * @param {String} value
	 */
    loadSuggestions: function(value){
    	this._lastValue = value; 
    	if(dojo_lang.trim(value) == ""){
    		this.abortRequest();
    		this.clearResults();
    		this._lastValue = "";
    		return;
    	}
    	// load from cache
    	if(this.cacheEnabled){
	    	var cachedResults = this.loadFromCache(value);
	    	if(cachedResults){
	    		this.renderResults(cachedResults, true/*from cache*/);
	    		return;
	    	}
    	}
    	if(this.store){
    		this.loadStoreSuggestions(value);
    	}else{
    		this.remoteLoadSuggestions(value);
    	}
    },

    /**
     * Loads suggestions using AJAX request.
     * @param {String} value
     */
    remoteLoadSuggestions: function(value){
		if(this.encode){
			value = encodeURIComponent(value);
		}
		var content = this.getContentParam(value);
    	var param = {
    			url: this.url,
    			content: content,
    			load: dojo_lang.hitch(this, function(response) {
					this.renderResults(response, false/*from cache*/);
				}),
    			timeout: this.timeout
    		};
		this.abortRequest();
	    this._previousRequest = (this.method.toLowerCase()=="post") ? dojo_xhr("POST", param) : dojo_xhr("GET", param);
    },

    /**
     * Loads suggestions from data store.
     * @param {String} value
     */
    loadStoreSuggestions: function(value){
    	var _this = this, store = this.store, labelAttr = this.labelAttr, valueAttr = this.valueAttr;
    	var list = [], query = {};
    	query[labelAttr] = value + "*";
    	var args = {
    		query: query,
    		queryOptions: this.queryOptions,
    		onItem: function(item, request) {
            	var obj = {
            		label: item[labelAttr][0],
            		value: item[valueAttr][0]
            	}; 
            	list.push(obj);
    		},
    		onComplete: function(items, request){
    			var html = _this.jsonToHtml(list);
    			_this.renderResults(html, false/*from cache*/);
    		}
    	};
    	var items = this.store.fetch(args);
    },
    
    //for override to create parameter for sending
    /**
     * Generates AJAX request content.
     * Caller or sub-class may override this method.
     * @param {String} value
     * @returns {Object}
     */
    getContentParam: function(value){
    	return {"prefix": value};
    },
    
	// cancel if the previous request is loading
    /**
     * Aborts AJAX request.
     */
    abortRequest: function(){
		var deferred = this._previousRequest;
		if(deferred){
			deferred.canceled = true;
			deferred.ioArgs.xhr.abort();
		}	
    },

    /**
     * Loads suggestions from the cache.
     * @param {String} value
     */
    loadFromCache: function(value){
    	var cachedMap = this._cachedMap;
    	for(var i = cachedMap.length - 1; i >= 0; i--){
    		var cachedKey = cachedMap[i][0];
    		if(cachedKey == value){
    			return cachedMap[i][1];
    		}
    	}
    	return false;
    },

    /**
     * Renders the results.
     * @param {Object} data
     * @param {Boolean} fromCache
     */
    renderResults: function(data, fromCache/*boolean*/){
    	this.clearResults();
    	// render table from html or json
    	var html = (this.type.toLowerCase() == "json") ? this._jsonToHtml(data) : data;
    	var rendered = this._popupWidget.render(html);
    	if(rendered){
    		this.showResults();
    		this._popupWidget.attachHandlers();
    	}
		// save cached map
		if(this.cacheEnabled && !fromCache){
			this._cachedMap.push([this._lastValue, data]);
		}
    },

    /**
     * Converts JSON string to HTML.
     * @param {String} jsonText
     * @returns {String}
     * @private
     */
    _jsonToHtml: function(jsonText){
    	var json = null;
    	try{
	    	json = dojo_json.fromJson(jsonText);
   		} catch (e) {
	       	return;
		}
		return this.jsonToHtml(json);
    },
    
	// override me for custom rendering
    /**
     * Converts JSON to HTML.
     * Caller or sub-class may override this method for custom rendering.
     * @param {Array} suggestions
     * @returns {String}
     */
    jsonToHtml: function(suggestions){
    	var html = ["<table class='typeAheadTable'><tbody>"];
    	for(var i=0, len=suggestions.length; i<len; i++){
    		html.push("<tr class='");
    		html.push((i % 2 == 0) ? "typeAheadTableRow": "typeAheadTableRow typeAheadTableRowOdd");
    		html.push("'><td class='typeAheadTableCell' value='");
    		html.push(suggestions[i].value);
    		html.push("'>");
    		html.push(suggestions[i].label);
    		html.push("</td></tr>");
    	}
    	html.push("</tbody></table>");
    	return html.join("");
    },

    /**
     * Clears the cache.
     */
    clearCache: function(){
    	this._cachedMap = [];
    },

    /**
     * Clears the results.
     */
    clearResults: function(){
    	this.hideResults();
    	this._popupWidget.clearList();
    },

    /**
     * Hides the results.
     */
    hideResults: function(){
    	dijit_popup.close(this._popupWidget);
		this.isShowing = false;
    	dojo_html.style(this.domNode, "display", "none");
    },

    /**
     * Shows the results.
     */
    showResults: function(){
    	if(this._popupWidget.domNode.firstChild){
	    	var best = dijit_popup.open({
				popup: this._popupWidget,
				around: this.connectedNode
			});
			this.isShowing = true;
			this._popupWidget.setWidth(dojo_html.marginBox(this.connectedNode).w);
			this._popupWidget.adjustScrollBar();
    	}
    },

    /**
     * Handles up arrow key.
     * @private
     */
	_onKeyUpArrow: function(){
		this._onKeyUpDownArrow(-1);
	},

	/**
	 * Handles down arrow key.
	 * @private
	 */
	_onKeyDownArrow: function(){
		this._onKeyUpDownArrow(1);
	},

	/**
	 * Handles up or down arrow key.
	 * @private
	 */
	_onKeyUpDownArrow: function(direction){
		if(!this.isShowing){
			this.showResults();
		}else{
			var pw = this._popupWidget;
			pw.selectNextNode(direction);
			var sn = pw._selectedNode;
			var snf = sn ? sn.firstChild : null;
			if(sn && snf && dojo_html.attr(snf, "value")){
				this.setDisplayedValue(dojo_html.attr(snf, "value"));
			}else{
				this.setDisplayedValue(this._lastValue);
			}
		}		
	},

	/**
	 * Handles loosing focus.
	 * @private
	 */
	_onBlur: function(){
   		if(this.isShowing){
			//activate onclick handler on the table 
			this._blurTimer = setTimeout(dojo_lang.hitch(this, function() {
				 this._blurTimer = null;
				 if(this.persist){
					 return;
				 }
				 if(!this._popupScrollbarClicked){
					this.hideResults();
				 }else{
				 	// re-focus the popup node when scrollbar is clicked
				    this.connectedNode.focus();
				 }
				 this._popupScrollbarClicked = false;
			}), this.blurInterval);
		}
   		this.clearPollingTimer();
    	this.onBlur();
    },
    
    // for override

    /**
     * Callback for loosing focus.
     */
    onBlur: function(){
    },

    /**
     * Clears polling.
     */
    clearPollingTimer: function(){
		if(this._pollingTimer != null){
			clearTimeout(this._pollingTimer);
			this._pollingTimer = null;
		}
    },

    /**
     * Handles click.
     * @param {Object} e
     * @private
     */
	_onClick: function(e){
		var sn = this._popupWidget._selectedNode;
		if(sn && sn.firstChild){
			this.setDisplayedValue(dojo_html.attr(sn.firstChild, "value"));
		}
		this.hideResults();
		this.onClick(e);
	},
	
	// for override
	/**
	 * Callback for click.
	 * @param {Object} e
	 */
	onClick: function(e){
	},
	
	// call by enter key
	/**
	 * Handles ENTER key.
	 * @private
	 */
	_onExecute: function(){
		this.hideResults();
		setTimeout(dojo_lang.hitch(this, this.onExecute));
	},
	
	// for override
	/**
	 * Callback for enter.
	 */
	onExecute: function(){
	},

	/**
	 * Closes the results.
	 * @private
	 */
	_onClose: function(){
		this.hideResults();
	},

	/**
	 * Sets text to display for value.
	 * @param {String} value
	 */
	setDisplayedValue: function(value){
		this.connectedNode.value = value;
	},

	/**
	 * Retrieves displayed text.
	 * @returns {String}
	 */
	getDisplayedValue: function(){
		return this.connectedNode.value;
	},	

	/**
	 * Clears timer for loosing focus.
	 */
	clearBlurTimer: function(){
		if (this._blurTimer != null){
			clearTimeout(this._blurTimer);
		}
	},

	/**
	 * Sets a new URL.
	 * @param {String} url
	 * @private
	 */
	_setUrlAttr: function(url){
		// url would be change for the same input node
		if(this.url != url){
			this.detach();
	   		// attach handlers
	   		this.attachHandlers(this.connectedNode);
		}
		this.url = url;
	},

	/**
	 * Sets a new data store.
	 * @param {Object} store
	 */
	setStore: function(store){
		this.store = store;
	},

	/**
	 * Destroys the popoup widget and removes event handlers.
	 */
    destroy: function(){
		this._popupWidget.destroy();
		dojo_array.forEach(this._handlers, dojo_connect.disconnect);
    	this.inherited(arguments);
    }
});

/**
 * @name idx.widget._TypeAheadPopup
 * @class Popup widget for type ahead.
 * @augments dijit._Widget
 * @augments dijit._Templated
 */
TypeAheadPopup = dojo_declare("idx.widget._TypeAheadPopup", [dijit_Widget, dijit_Templated],
/**@lends idx.widget._TypeAheadPopup#*/
{
	
	templateString: "<div class='idxTypeAhead'></div>",
	
	_selectedNode: null,
	
	res: null,
	_handlers: [],

	/**
	 * Initializes internal properties.
	 */
	constructor: function(){
		this._handlers = [];
	},

	/**
	 * Initializes globalization resource.
	 */
	postMixInProperties: function() {
		this.inherited(arguments);
	    this.res = idx_resources.getResources("idx/widget/TypeAhead", this.lang);
	},  

	/**
	 * Sets up event handlers.
	 */
	postCreate: function(){
		this.inherited(arguments);
		this.connect(this.domNode, "onfocus", "_onFocus");
	},

	/**
	 * Renders HTML.
	 * @param {String} html
	 * @returns {Boolean}
	 */
	render: function(html){
		this.domNode.innerHTML = html;
		var table = this.domNode.firstChild;
		if(!(table && table.tagName == "TABLE")){
			return false;
		}
		var trs = dojo_query("tr", table);
		if(trs.length > 0){
			this._showList();
			return true;
		}
		return false;
	},

	/**
	 * Sets up event handlers.
	 */
	attachHandlers: function(){
		var trs = dojo_query("tr", this.domNode.firstChild);
		var len = trs.length;
    	// connect handlers
		dojo_array.forEach(trs, function(tr){
			this._handlers.push(dojo_connect.connect(tr, "onmouseover", this, function(e){
				this._onMouseOver(e, tr);
			}));
			this._handlers.push(dojo_connect.connect(tr, "onclick", this, function(e){
				this._onClick(e, tr);
			}));
		}, this);
		// add close button
		if(this.closable && len > 0){
			var closeTr = dojo_html.create("tr", {className: (len % 2 == 0) ? "typeAheadTableRow" : "typeAheadTableRow typeAheadTableRowOdd"}, trs[len - 1], "after");
	    	var closeTd = dojo_html.create("td", {className: "typeAheadTableCell typeAheadCloseNode"}, closeTr);
	    	var a = dojo_html.create("a", {href: "javascript:;", title: this.res.idxTypeAhead_close, innerHTML: this.res.idxTypeAhead_close}, closeTd);
			a.onclick = this.onClose;
		}
	},

	/**
	 * Shows the results.
	 * @private
	 */
	_showList: function(){
		dojo_html.style(this.domNode, "display", "");
	},

	/**
	 * Selects the next node.
	 * @param {Number} direction
	 */
	selectNextNode: function(direction){
		if(this.domNode.firstChild){
			var sn = this._selectedNode;
			if(!sn){
				this._selectFirstOrLastNode(direction);
			}else{
				var nn = this._getNextNode(direction);
				this._removeSelectedClass();
				if(!nn){
					// nextNode == null means input node was selected
					this._selectedNode = null;
				}else{
					this._selectNode(nn);
				}
			}
		}
	},

	/**
	 * Obtains the next node.
	 * @param {Number} direction
	 */
	_getNextNode: function(direction){
		var tableNode = this.domNode.firstChild;
		if(tableNode!=null){
			var nodes = dojo_query("tr", tableNode);
			for(var i=0, len = nodes.length; i < len; i++){
				if(this._selectedNode == nodes[i]){
					return (direction < 0) ? nodes[i-1] : nodes[i+1];
				}
			}	
		}
		return null;
	},

	/**
	 * Selects the first or last node.
	 * @param {Number} direction
	 */
	_selectFirstOrLastNode: function(direction){
		var tableNode = this.domNode.firstChild;
		if(tableNode!=null){
			var nodes = dojo_query("tr", tableNode);
			var len = nodes.length;
			if(len > 0){
				this._selectNode(nodes[(direction < 0) ? len - 1 : 0]);
			}
		}		
	},

	/**
	 * Selects a node.
	 * @param {Object} node
	 * @private
	 */
	_selectNode: function(node){
		if(node && (node.tagName == "TR")){
			dojo_html.addClass(node, "typeAheadTableRowSelected");
			this._selectedNode = node;
			this.adjustScrollBar();
		}
	},

	/**
	 * Handles mouse over event.
	 * @param {Object} e
	 * @param {Object} tr
	 * @private
	 */
	_onMouseOver: function(e, tr){
		this._removeSelectedClass();
		this._selectNode(tr);
	},

	/**
	 * Handles click.
	 * @param {Object} e
	 * @param {Object} tr
	 * @private
	 */
	_onClick: function(e, tr){
		this._removeSelectedClass();
		this._selectNode(tr);
		this.onClick(e);
	},
	
	// for override
	/**
	 * Callback for click.
	 * @param {Object} e
	 */
	onClick: function(e){
	},
	
	// for override
	/**
	 * Callback to be called when closed.
	 * @param {Object} e
	 */
	onClose: function(e){
	},

	_onFocus: function(e){
	},

	/**
	 * Removes CSS class for selected node.
	 * @private
	 */
	_removeSelectedClass: function(){
		var sn = this._selectedNode;
		if(sn){
			dojo_html.removeClass(sn, "typeAheadTableRowSelected");
		}
	},

	/**
	 * Clears the results.
	 */
	clearList: function(){
		this._selectedNode = null;
		// disconnect handlers
		dojo_array.forEach(this._handlers, dojo_connect.disconnect);	
    	dojo_html.empty(this.domNode);
	},

	/**
	 * Sets the widget of the popup.
	 * @param {Number} width
	 */
	setWidth: function(width){
		dojo_html.marginBox(this.domNode, {w: width});
	},

	/**
	 * Adjusts scroll bar.
	 */
	adjustScrollBar: function(){
		var tableNode = this.domNode.firstChild;
		if(tableNode){
			if(dojo_html.contentBox(this.domNode).h < dojo_html.contentBox(tableNode).h){
				var sn = this._selectedNode;
				if(sn != null){
					dojo_window.scrollIntoView(sn);
				}
			}
		}
	},

	/**
	 * Removes event handlers.
	 */
	destroy: function(){
		dojo_array.forEach(this._handlers, dojo_connect.disconnect);			
		this.inherited(arguments);
	}
});

return TypeAhead;

}; // end of factory

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
	dojo.provide("idx.widget.TypeAhead");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.require("idx.util");
	dojo.require("idx.resources");
	dojo.requireLocalization("idx","base");
	dojo.requireLocalization("idx.widget","base");
	dojo.requireLocalization("idx.widget","TypeAhead");
	factory(dojo.declare, dojo, dojo, dojo, dojo, dojo, dojo.xhr, dojo.window, dojo.query, dojo.keys, dijit.popup, dijit._Widget, dijit._Templated, idx.util, idx.resources);
}else{
	define([
		"../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
		"../../../../dist/lib/dojo/_base/lang",
		"dojo/_base/array",
		"dojo/_base/json",
		"dojo/_base/html",
		"dojo/_base/connect",
		"dojo/_base/xhr",
		"dojo/window",
		"dojo/query",
		"dojo/keys",
		"dijit/popup",
		"dijit/_Widget",
		"dijit/_Templated",
		"idx/util",
		"idx/resources",
		"dojo/i18n!../nls/base",
		"dojo/i18n!./nls/base",
		"dojo/i18n!./nls/TypeAhead"
	], factory);
}

})();
