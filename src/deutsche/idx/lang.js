(function(){
function factory(dLang, iMain) {
	var iLang = dLang.getObject("lang", true, iMain);
	
	iMain.startsWith = iLang.startsWith = function(/*string*/ all, /*string*/ part){
		//	summary:
		//		Return true if string "all" starts with "part"
		return (dLang.isString(all) && dLang.isString(part) && all.indexOf(part) === 0); // Boolean
	};
	
	iMain.endsWith = iLang.endsWith = function(/*string*/ all, /*string*/ part){
		//	summary:
		//		Return true if string "all" ends with "part"
		return (dLang.isString(all) && dLang.isString(part) && all.indexOf(part) === all.length - part.length); // Boolean
	};
	
	iMain.equalsIgnoreCase = iLang.equalsIgnoreCase = function(/*string*/ s1, /*string*/ s2){
		//	summary:
		//		Return true if string "s1" equals to "ss" with ignoring case
		return (dLang.isString(s1) && dLang.isString(s2) && s1.toLowerCase() === s2.toLowerCase()); // Boolean
	};
	
	iMain.isNumber = iLang.isNumber = function(/*number*/ n){
		//	summary:
		//		Return true if it it a Number
		return (typeof n == "number" && isFinite(n)); // Boolean
	};
	
	iMain.getByteLengthInUTF8 = iLang.getByteLengthInUTF8 = function(/*string*/ s){
		// summary:
		//		Return byte length for UTF-8 encoded string
		if(!s){
			return null;
		}
		var encoded = encodeURIComponent(s); // "abc%E3%81%82%E3%81%84%E3%81%86" for "abcあいう"
		encoded = encoded.replace(/%[0-9A-F][0-9A-F]/g, "*"); // abc********* (%FF -> *)
		return encoded.length;
	};
	
	return iLang;
}

var version = (window["dojo"] && dojo.version);
if (version && version.major == 1 && version.minor == 6) {	
	dojo.provide("idx.lang");
	dojo.require("idx.main");
	
	factory(dojo, idx);
	
} else {
	define(["../../node_modules/intern-geezer/node_modules/dojo/_base/lang","idx"], function(dLang,iMain) {
		return factory(dLang, iMain);
	});
}

})();