/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

(function(){

var factory = function(dojo_declare, dojo_declaresafe, dojo_lang, dojo_hash, dojo_query, dojo_dom, dijit_registry, dojo_connect){

/**
 * @name idx.app.HashHandlerMixin 
 * @class Class supporting dynamic URL hash management
 * Note: Actual class name is idx.app._HashHandlerMixin.
 * It monitors the url hash and updates the selection of console owned UI elements
 * (ie the context switcher and context tabs) and also notifies components of
 * any component specific hash changes.  Additionally, it provides a mechanism
 * for components to tell the console about their state changes that need to get
 * reflected in the hash. <br />
 * Since components are loaded via an hef on a ContentPane, in order to hook into
 * hash management, the expectation is that in their registry item, the component
 * specifies an onLoad function. In that function, any connection from their UI
 * elements to the context (and vice versa) should be performed:
 * <pre>
 * "onLoad": function(w) {
 *     //connect something in my UI to the context's setNavState
 *     w.connect(dijit.byId("someUIElement"), "onSomethingChanged", w.context.setNavState);
 *
 *     //connect the context's onNavStateChanged to something that will update my UI
 *     w.connect(w.context, "onNavStateChanged", function(state) {
 *         dijit.byId("someUIElement").setSomethingFromTheState(state.task || "");
 *     });
 * }
 * </pre>
 * 
 */

var HashHandlerMixin = dojo_declare("idx.app._HashHandlerMixin", [],
/**@lends idx.app.HashHandlerMixin#*/

{

	/**
	 * Default constructor
	 * @param {Object} args
	 */
	constructor: function(args) {
	},
	
    /**
     * Sets up the url hash handling such that context and tab changes are
     * reflected in the url hash and explicit url changes (e.g. bookmarks, 
     * direct url changes) get reflected back into the UI selections.
     * Since the console is responsible for the context UI switching and the
     * tabs within a context, the console needs to be responsible for ensuring
     * selections and hash are in sync.  For the actual tab contents though,
     * that is up to the product components to handle, via listening on the 
     * context's onNavStateChanged event.
     */
	_setupHashHandler: function() {
		var self = this;
        var ignoreContainerSelection = false;
		
        /**
         * Given a url hash, update the UI selections accordingly
         * @param {String} hash
         */
		function _handleHash(hash) {
			//Do not modify the hash while processing it.  Otherwise you will
            //find that you can never go back.  For ex, if hash was foo=bar and
            //you modified it to foo=asdf, there will be 2 history entries and 
            //if you try to go back to foo=bar, your processing will change it 
            //to foo=asdf again
			try {
	            hash = hash || dojo_hash();
	            if (!hash) return;
                
                //tell our container selection handlers to ignore selections (ie - not update the hash)
                //in response to us changing their selections
				ignoreContainerSelection = true;	          
                
	            var hashObj = dojo_query.queryToObject(hash);
	            var contextId = hashObj.context;
	            
	            //Ensure valid context
                if (contextId && dojo_dom.isDescendant(dojo_dom.byId(contextId), 
                    dojo_dom.byId(self.id + self.CONTAINER_ID_TOP))) {
                        dijit_registry.byId(self.id + self.CONTAINER_ID_TOP).selectChild(contextId);
                } else {
                    return;
                }
	            
                //ensure valid tab in a context
	            var tabId = hashObj.tab;
	            if (tabId && dojo_dom.isDescendant(dojo_dom.byId(tabId), 
                    dojo_dom.byId(contextId))) {
                        dijit_registry.byId(contextId).selectChild(tabId);
	            }
                
                //set any remaining state into the contents
                if (dijit_registry.byId(tabId).isLoaded == true) {
                    //first remove the parts not applicable
                    delete hashObj.context;
                    delete hashObj.tab;
                    dijit_registry.byId(tabId).context.onNavStateChanged(hashObj);
                }
                
			} finally {
				ignoreContainerSelection = false;
			}
        }
        
        /**
         * Gets the state object from the given tab
         * @param {String} tabId
         */
        function _getTabState(tabId) {
             var hObj = {};
             if (dijit_registry.byId(tabId).isLoaded == true) {
                //if this is already loaded, call getState.  If not loaded, there is no
                //state to get, it is just the default
                hObj = dijit_registry.byId(tabId).context._navState || {};
            } 
            
            return hObj;
        }
		
		//listen on context changes so we can update the url hash
        var container = dijit_registry.byId(this.id+this.CONTAINER_ID_TOP);
        this.connect(container, "selectChild", function(page) {
        	if (ignoreContainerSelection) return;
        	
            var hObj = {}; 
            hObj.context = dijit_registry.byId(page).id;
            hObj.tab = dijit_registry.byId(page).selectedChildWidget.id;
            hObj = dojo_lang.mixin(hObj, _getTabState(dijit_registry.byId(page).selectedChildWidget.id));
            
            dojo_hash(dojo_query.objectToQuery(hObj));
        });
        
        //listen on all page changes within a context, so we can update the url hash
        var contextTabs = dijit_registry.byId(self.id + self.CONTAINER_ID_TOP).getChildren();        
        for (var i = 0; i < contextTabs.length; i++) {
            (function (tabs) {
                self.connect(tabs, "selectChild", function(tab) {
                    if (ignoreContainerSelection) return;
                    
                    var h = {
                    	context: dijit_registry.getEnclosingWidget(dijit_registry.byId(tab).domNode.parentNode).id,
                    	tab: dijit_registry.byId(tab).id
                    };
                    h = dojo_lang.mixin(h, _getTabState(dijit_registry.byId(tab).id));
                    
                    dojo_hash(dojo_query.objectToQuery(h));
                });
            })(contextTabs[i]);
        }
        
		//listen on hash changes, so we can update UI selections
        dojo_connect.subscribe("/dojo/hashchange", dojo_lang.hitch(this, function(hash) {
            _handleHash(hash);
        }));
        
        //set initial state based on current hash
        //This is in a timeout to give the UI even loop the chance to complete, given
        //that this is invoked during UI construction and UI may not be fully realized yet
        setTimeout(function(){_handleHash(dojo_hash());}, 0);
	},
	
	/**
	 * Creates a context item suitable for hash management.  
	 * item._navState is the current state;
	 * item.onNavStateChanged is the context function that the console calls in response to a hash 
	 * change. Components should do something in response to update their UI.
	 * item.setNavState should be called by components to tell the framework about their new
	 * state that needs to get reflected in the hash
	 */
	_createItemForHash: function(item) {
		var hashedItem = dojo_declaresafe.safeMixin(item, {
            _navState: "",
            setNavState : dojo_lang.hitch(item, function(state) {
                this._navState = state;
                var h = {
					context: this.containerId,
					tab: this.id
				};
                h = dojo_lang.mixin(h, state);
                
                //update the hash with the latest state
                dojo_hash(dojo_query.objectToQuery(h));
            }),
            onNavStateChanged: dojo_lang.hitch(item, function(state) {
                this._navState = state;
            })
        });
		
		//if there is already a user defined onLoad, we need to hook it such that we
		//call that one and then we perform our additional hash handling.  Can't use this.inherited, 
		//since item is just an object (not using dojo.declare)
		var origItemOnLoad = item.onLoad;
		hashedItem.onLoad = function(w) {
			origItemOnLoad.call(hashedItem, w);
			
			//now that the content is loaded, if the current hash is meant for it, set the 
			//state on the loaded control's context.
			var hash = dojo_query.queryToObject(dojo_hash()) || {};
			if (hash && hash.context && hash.tab && hash.context === hashedItem.containerId &&
				hash.tab === hashedItem.id) {
				//strip out the contextId and tabId, since those aren't for the component
				//only send the component what is relevant to it
				delete hash["context"];
				delete hash["tab"];
				w.context.onNavStateChanged(hash);
			}
		};
		
		return hashedItem;
	}


});

return HashHandlerMixin;

}; // end of factory

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
   dojo.provide("idx.app._HashHandlerMixin");
   dojo.require("dojo.hash");
   factory(dojo.declare, dojo, dojo, dojo.hash, dojo, dojo, dijit, dojo);
}else{
	define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
           "../../../../dist/lib/dojo/_base/declare",
           "dojo/_base/lang",
	        "dojo/hash",
           "dojo/io-query",
           "dojo/dom",
           "dijit/registry",
           "dojo/_base/connect"
	], factory);
}
     
})();
