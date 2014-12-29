/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */
/**
 * @name idx.string
 * @class Provides a set of string functions 
 */
(function()
{
function factory(dLang,iMain,dString)
	/**@idx.string#*/
{
	var iString = dLang.getObject("string", true, iMain);
	
	/**
	 * @param {String} all
	 * @param {String} part
	 * @returns {Boolean} Return true if string "all" starts with "part"
	 */
	iString.startsWith = function(/*string*/ all, /*string*/ part){
		return (dLang.isString(all) && dLang.isString(part) && all.indexOf(part) === 0); // Boolean
	};
	
	/**
	 * @param {String} all
	 * @param {String} part
	 * @returns {Boolean} Return true if string "all" ends with "part"
	 */
	iString.endsWith = function(/*string*/ all, /*string*/ part){
		return (dLang.isString(all) && dLang.isString(part) && all.indexOf(part) === all.length - part.length); // Boolean
	};
	
	/**
	 * @param {String} s1
	 * @param {String} s2
	 * @returns {Boolean} Return true if string "s1" equals to "ss" with ignoring case
	 */
	iString.equalsIgnoreCase = function(/*string*/ s1, /*string*/ s2){
		return (dLang.isString(s1) && dLang.isString(s2) && s1.toLowerCase() === s2.toLowerCase()); // Boolean
	};
	
	/**
	 * @param {Number} n
	 * @returns {Boolean} Return true if 'n' is a Number
	 */
	iString.isNumber = function(/*number*/ n){
		return (typeof n == "number" && isFinite(n)); // Boolean
	};
	
	/**
	 * Trims the specified string, and if it is empty after
	 * trimming, returns null.  If the specified string is
	 * null, then null is returned.
	 * @param {String} str the string to trim
	 * @returns {String} Trimmed string or null if nothing left
	 */
    iString.nullTrim = function(/*String*/ str) {
            if (! str) return null;
            var result = dString.trim(str);
            return (result.length == 0) ? null : result;
        };
        
     return iString;
}

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){

	dojo.provide("idx.string");
	dojo.require("dojo.string");
	dojo.require("dojo._base.lang");

	factory(dojo,idx,dojo.string);
} else {
	define(["../../node_modules/intern-geezer/node_modules/dojo/_base/lang","idx","../../../dist/lib/dojo/string"], factory);
}

})();