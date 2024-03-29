define([
"../../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
'../../../../../lib/dijit/form/_ComboBoxMenu'
], function(declare, _ComboBoxMenu){
	return declare(_ComboBoxMenu, {
		createOptions: function(results, options, labelFunc){
			var hash = {};
			arguments[0] = results.filter(function(item){
				var label = labelFunc(item).label;
				if(hash[label]){return false;}
				else{return hash[label] = true;}
			});
			this.inherited(arguments);
		}
	});
});