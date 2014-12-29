/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

/**
 * @name idx.app.registry
 * @class Class that wraps all the JSON UI
 * registry. Most often, this registry is a
 * file that resides inside the war (registry.json).
 */
(function()
/**@idx.app.registry#*/	
{
function factory(idx_app_registry,dojo_lang,dojox_rpc_rest,dojox_data_jsonreststore){

	/**
   	 * URL for JSON registry of all remote UI metadata including URLs	
   	 * @type {String}
   	 * @default "./data/registry.json"
   	 */
	idx_app_registry.href = "./data/registry.json";
	
	/**
   	 * Data from JSON registry of all remote UI metadata including URLs	
   	 * @type Object
   	 * @default null
   	 */
	idx_app_registry.data = null; 
	/**
	 * Data accessor. Returns data. If not loaded, the first
	 * loads it synchronously.
	 * @returns {Object} data
	 */
	idx_app_registry.getData = function() {
		if( idx_app_registry.data == null )
			idx_app_registry.load();
		return idx_app_registry.data;		
	};
	
	/**
	 * Load method
	 * Fetches registry data synchronously
	 * from well known location specified
	 * in idx_app_registry.href, which caller can set.
	 */
	idx_app_registry.load = function() { 
    	
    	var MN = "idx.app.registry.load";

		var svc = dojox_rpc_rest( idx_app_registry.href,true);
		var storeArgs = { service : svc, allowNoTrailingSlash: true, syncMode: true } ;// synchronous
		var store = new dojox_data_jsonreststore(storeArgs);
		
		store.fetch({	
			onComplete: function (data) {
				idx_app_registry.data = data;
				//console.info(MN,"Read success!","data:",idx_app_registry.data); //tmp
			},
			onError: function(errData, request) {				
				console.error(MN+" "+errData.message);
				console.dir(errData);
				alert(MN+" "+errData.message);
			}
		});
	};

	// return the object
	return idx_app_registry;
}

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
   dojo.provide("idx.app.registry");        
   dojo.require("dojox.rpc.Rest");          
   dojo.require("dojox.data.JsonRestStore");
   factory(idx.app.registry, dojo,dojox.rpc.Rest, dojox.data.JsonRestStore);
} else {
	define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/lang",
           "../../../../dist/lib/dojox/rpc/Rest",
           "dojox/data/JsonRestStore"
          ], 
          function(dojo_lang,dojox_rpc_rest,dojox_data_jsonreststore) {
		       var idx_app_registry = dojo_lang.getObject("idx.app.registry", true);
		       return factory(idx_app_registry,dojo_lang, dojox_rpc_rest, dojox_data_jsonreststore);
	       }
   );
}

})();
