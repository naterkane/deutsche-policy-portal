(function(){
function factory(dRequire,dLang,dKernel,dWindow,dDomClass) {
	var iMain = dLang.getObject("idx", true);
	
	var applyDojoVersionClass = function() {
		var bodyNode = dWindow.body();
		var versionClass = "idx_dojo_" + dKernel.version.major + "_" + dKernel.version.minor;
		dDomClass.add(bodyNode, versionClass);		
	};
	
	var majorVersion = dKernel.version.major;
	var minorVersion = dKernel.version.minor;
	if ((majorVersion < 2) && (minorVersion < 7)) {
		// for dojo 1.6 we need to use "addOnLoad" to ensure the body exists first
		dojo.addOnLoad(applyDojoVersionClass);
	} else {
		// for dojo 1.7 or later we rely on the "dojo/domReady!" dependency
		dRequire(["dojo/domReady!"],applyDojoVersionClass);
	}
	
	return iMain;
}

var version = (window["dojo"] && dojo.version);
if (version && version.major == 1 && version.minor == 6) {	

	dojo.provide("idx.main");
	factory(null,
			dojo,
			dojo,
			dojo,
			{add: dojo.addClass});
	
} else {
	define(["require","../../node_modules/intern-geezer/node_modules/dojo/_base/lang","../../../dist/lib/dojo/_base/kernel","dojo/_base/window","dojo/dom-class"],
		   factory);
}

})();