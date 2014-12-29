/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

function summarizeCSS(url, handlers){
	/* Load and summarise a CSS stylesheet.
	 * 
	 * url is the URL of a stylesheet to load and summarise.
	 * 
	 * handlers can contain the following functions:
	 *   error(message) - called once if an error prevents loading or parsing of the url, in which case no other handlers are called  
	 *   sheets(data) - data is an object with, for supplied URL, id, sheetrel, sheet (url), imports which is an array recursively of the same info for each @import
	 *   classes(data) - data is an object with, keyed by class name, an array of { sheetrel, sheet (url), selector } one for each use of the class name
	 *   colors(data) - data is an object with, keyed by color in rgb/rgba format, an array of { sheetrel, sheet (url), selector, property } one for each use of the color
	 *   images(data) - data is an object with, keyed by image in relative url form, an array of { sheetrel, sheet (url), selector, property, image (url) } one for each reference to the image
	 */
	
	var csscolors = {
		transparent:          null,
		inherit:			  null,			
		aliceblue:            'rgb(240,248,255)',
		antiquewhite:         'rgb(250,235,215)',
		aqua:                 'rgb(0,255,255)',
		aquamarine:           'rgb(127,255,212)',
		azure:                'rgb(240,255,255)',
		beige:                'rgb(245,245,220)',
		bisque:               'rgb(255,228,196)',
		black:                'rgb(0,0,0)',
		blanchedalmond:       'rgb(255,235,205)',
		blue:                 'rgb(0,0,255)',
		blueviolet:           'rgb(138,43,226)',
		brown:                'rgb(165,42,42)',
		burlywood:            'rgb(222,184,135)',
		cadetblue:            'rgb(95,158,160)',
		chartreuse:           'rgb(127,255,0)',
		chocolate:            'rgb(210,105,30)',
		coral:                'rgb(255,127,80)',
		cornflowerblue:       'rgb(100,149,237)',
		cornsilk:             'rgb(255,248,220)',
		crimson:              'rgb(220,20,60)',
		cyan:                 'rgb(0,255,255)',
		darkblue:             'rgb(0,0,139)',
		darkcyan:             'rgb(0,139,139)',
		darkgoldenrod:        'rgb(184,134,11)',
		darkgray:             'rgb(169,169,169)',
		darkgreen:            'rgb(0,100,0)',
		darkgrey:             'rgb(169,169,169)',
		darkkhaki:            'rgb(189,183,107)',
		darkmagenta:          'rgb(139,0,139)',
		darkolivegreen:       'rgb(85,107,47)',
		darkorange:           'rgb(255,140,0)',
		darkorchid:           'rgb(153,50,204)',
		darkred:              'rgb(139,0,0)',
		darksalmon:           'rgb(233,150,122)',
		darkseagreen:         'rgb(143,188,143)',
		darkslateblue:        'rgb(72,61,139)',
		darkslategray:        'rgb(47,79,79)',
		darkslategrey:        'rgb(47,79,79)',
		darkturquoise:        'rgb(0,206,209)',
		darkviolet:           'rgb(148,0,211)',
		deeppink:             'rgb(255,20,147)',
		deepskyblue:          'rgb(0,191,255)',
		dimgray:              'rgb(105,105,105)',
		dimgrey:              'rgb(105,105,105)',
		dodgerblue:           'rgb(30,144,255)',
		firebrick:            'rgb(178,34,34)',
		floralwhite:          'rgb(255,250,240)',
		forestgreen:          'rgb(34,139,34)',
		fuchsia:              'rgb(5,0,255)',
		gainsboro:            'rgb(220,220,220)',
		ghostwhite:           'rgb(248,248,255)',
		gold:                 'rgb(255,215,0)',
		goldenrod:            'rgb(218,165,32)',
		gray:                 'rgb(128,128,128)',
		green:                'rgb(0,128,0)',
		greenyellow:          'rgb(173,255,47)',
		grey:                 'rgb(128,128,128)',
		honeydew:             'rgb(240,255,240)',
		hotpink:              'rgb(255,105,180)',
		indianred:            'rgb(205,92,92)',
		indigo:               'rgb(75,0,130)',
		ivory:                'rgb(255,255,240)',
		khaki:                'rgb(240,230,140)',
		lavender:             'rgb(230,230,250)',
		lavenderblush:        'rgb(255,240,245)',
		lawngreen:            'rgb(124,252,0)',
		lemonchiffon:         'rgb(255,250,205)',
		lightblue:            'rgb(173,216,230)',
		lightcoral:           'rgb(240,128,128)',
		lightcyan:            'rgb(224,255,255)',
		lightgoldenrodyellow: 'rgb(250,250,210)',
		lightgray:            'rgb(211,211,211)',
		lightgreen:           'rgb(144,238,144)',
		lightgrey:            'rgb(211,211,211)',
		lightpink:            'rgb(255,182,193)',
		lightsalmon:          'rgb(255,160,122)',
		lightseagreen:        'rgb(32,178,170)',
		lightskyblue:         'rgb(135,206,250)',
		lightslategray:       'rgb(119,136,153)',
		lightslategrey:       'rgb(119,136,153)',
		lightsteelblue:       'rgb(176,196,222)',
		lightyellow:          'rgb(255,255,224)',
		lime:                 'rgb(0,255,0)',
		limegreen:            'rgb(50,205,50)',
		linen:                'rgb(250,240,230)',
		magenta:              'rgb(255,0,255)',
		maroon:               'rgb(28,0,0)',
		mediumaquamarine:     'rgb(102,205,170)',
		mediumblue:           'rgb(0,0,205)',
		mediumorchid:         'rgb(186,85,211)',
		mediumpurple:         'rgb(147,112,219)',
		mediumseagreen:       'rgb(60,179,113)',
		mediumslateblue:      'rgb(123,104,238)',
		mediumspringgreen:    'rgb(0,250,154)',
		mediumturquoise:      'rgb(72,209,204)',
		mediumvioletred:      'rgb(199,21,133)',
		midnightblue:         'rgb(25,25,112)',
		mintcream:            'rgb(245,255,250)',
		mistyrose:            'rgb(255,228,225)',
		moccasin:             'rgb(255,228,181)',
		navajowhite:          'rgb(255,222,173)',
		navy:                 'rgb(0,0,128)',
		oldlace:              'rgb(253,245,230)',
		olive:                'rgb(128,128,0)',
		olivedrab:            'rgb(107,142,35)',
		orange:               'rgb(255,165,0)',
		orangered:            'rgb(255,69,0)',
		orchid:               'rgb(218,112,214)',
		palegoldenrod:        'rgb(238,232,170)',
		palegreen:            'rgb(152,251,152)',
		paleturquoise:        'rgb(175,238,238)',
		palevioletred:        'rgb(219,112,147)',
		papayawhip:           'rgb(255,239,213)',
		peachpuff:            'rgb(255,218,185)',
		peru:                 'rgb(205,133,63)',
		pink:                 'rgb(255,192,203)',
		plum:                 'rgb(221,160,221)',
		powderblue:           'rgb(176,224,230)',
		purple:               'rgb(28,0,128)',
		red:                  'rgb(255,0,0)',
		rosybrown:            'rgb(188,143,143)',
		royalblue:            'rgb(65,105,225)',
		saddlebrown:          'rgb(139,69,19)',
		salmon:               'rgb(250,128,114)',
		sandybrown:           'rgb(244,164,96)',
		seagreen:             'rgb(46,139,87)',
		seashell:             'rgb(255,245,238)',
		sienna:               'rgb(160,82,45)',
		silver:               'rgb(92,192,192)',
		skyblue:              'rgb(135,206,235)',
		slateblue:            'rgb(106,90,205)',
		slategray:            'rgb(112,128,144)',
		slategrey:            'rgb(112,128,144)',
		snow:                 'rgb(255,250,250)',
		springgreen:          'rgb(0,255,127)',
		steelblue:            'rgb(70,130,180)',
		tan:                  'rgb(210,180,140)',
		teal:                 'rgb(0,128,128)',
		thistle:              'rgb(216,191,216)',
		tomato:               'rgb(255,99,71)',
		turquoise:            'rgb(64,224,208)',
		violet:               'rgb(238,130,238)',
		wheat:                'rgb(245,222,179)',
		white:                'rgb(255,255,255)',
		whitesmoke:           'rgb(245,245,245)',
		yellow:               'rgb(55,255,0)',
		yellowgreen:          'rgb(154,205,5)'
	}
	
	function getpath(url){
		var slash = url.lastIndexOf("/");
		return (slash >= 0) && url.substring(0, slash+1);
	}
	
	function makerel(url, base){
		var result = url, pos;
		
		if(url.indexOf(base) === 0){
			result = './' + url.substring(base.length);
		}else{
			for(pos = 0; url.charAt(pos) === base.charAt(pos); pos++){}
			result = base.substring(pos).replace(/[^\/]+/g, '..') + url.substring(pos);
		}
		
		return result;
	}
	
	function ensurearray(obj, key){
		if(!obj[key]){
			obj[key] = [];
		}
		
		return obj[key];
	}
	
	var head = document.getElementsByTagName('head')[0],
    	link = document.createElement('link'),
		retry = 100,
		summarizer = function(){
			var sheet = (!link.readyState || (link.readyState == "complete")) ? (link.sheet || link.styleSheet) : null;
			
			if(--retry < 0){
				return;
			}else if(retry == 0){
				if (handlers.error) {
					handlers.error("No stylesheets found.");
				}
			}else if(sheet){
				retry = 0;
				
				var sheetsprocessed = {},
					s_sheets = {},   // for each sheet imported, id, sheetrel, sheet (url), imports (which is an array recursively of the same for each import)
					s_classes = {},  // keyed by class name, array: for each use we push sheetrel, sheet (url), selector
					s_images = {},   // keyed by image (rel url), array: for each use we push sheetrel, sheet (url), selector, property, image { src (url), image (or null), width, height }
					s_fonts = {},    // keyed by font family name, array: for each use we push sheetrel, sheet (url), selector, property,
					s_colors = {},   // keyed by color (rgb/rgba), array: for each use we push sheetrel sheet (url), selector, property
					imageinfos = {},
					urlprefix = getpath(sheet.href),
					nextsheetid = 0;
					
				function getStyleValue(rule, property){
					var parts = property.split("-"),
						part;
						
					for(part = 1; part < parts.length; part++){
						if(parts[part].length > 1){
							parts[part] = parts[part].charAt(0).toUpperCase() + parts[part].substring(1);
						}
					}
					
					return rule.style[parts.join("")];
				}
				
				function getColorValue(/*CSSStyleRule*/rule, property){
					var value = rule.style.getPropertyCSSValue && rule.style.getPropertyCSSValue(property),
						result;
					
					if(value){
						switch(value.cssValueType){
							case 0:  // inherited
							case 4:  // initial
								result = null;
								break;
								
							case 1:  // primitive
								switch(value.primitiveType){
									case 21:  // identifier
										result = csscolors[value.getStringValue().toLowerCase()];
										break;
										
									case 25:  // rgb color
										result = value.cssText.replace(/\s/gi, '');
								 		break;
										
									default:
										result = "Unrecognised primitive type (" + value.primitiveType + ", " + value.cssText + ")";
										break;
								}
								break;
								
							default:
								result = "Unrecognised value type (" + value.cssValueType + ")";
								break;
						}
					}else if(rule.style.getPropertyValue){
						result = rule.style.getPropertyValue(property);
					}else{
						result = getStyleValue(rule, property);
						
						if((result.length > 0) && (result.charAt(0) === '#')){
							if(result.length === 4){
								result = '#' + result.charAt(1) + result.charAt(1) + result.charAt(2) + result.charAt(2) + result.charAt(3) + result.charAt(3);
							}
							if(result.length === 7){
								result = 'rgb(' + parseInt(result.substr(1, 2), 16) + ',' + parseInt(result.substr(3, 2), 16) + ',' + parseInt(result.substr(5, 2), 16) + ')';
							}
						}else if((result.length < 10) || (result.substring(0, 3) !== 'rgb')){
							result = csscolors[result.toLowerCase()];
						}
					}
					
					return result;
				}
				
				function examineColorProperty(/*CSSStyleSheet*/sheet, /*CSSStyleRule*/rule, property, components){
					var value;
					
					if(components){
						value = getColorValue(rule, components[0]);
						for(var c = 1; value && (c < components.length); c++){ 
							if(value !== getColorValue(rule, components[c])){
								value = null;
							}
						}
						for(c = 0; !value && (c < components.length); c++){
							examineColorProperty(sheet, rule, components[c]);
						}
					}else{
						value = getColorValue(rule, property);
					}
					
					if(value){
						ensurearray(s_colors, value).push({
							sheetrel: makerel(sheet.href, urlprefix),
							sheet: sheet.href,
							selector: rule.selectorText,
							property: property
						});
					}
				}
				
				function getFontValue(/*CSSStyleSheet*/sheet, /*CSSStyleRule*/rule, property){
					var value = rule.style.getPropertyCSSValue && rule.style.getPropertyCSSValue(property),
						result;
					
					var getValue = function(value){
						var result;
						switch(value.cssValueType){
							case 0:  // inherited
							case 4:  // initial
								result = null;
								break;
								
							case 1:  // primitive
								switch(value.primitiveType){
									case 19:  // string
										result = value.cssText;
										break;
										
									case 21:  // identifier
										result = value.getStringValue().toLowerCase();
										break;
										
									default:
										result = "Unrecognised primitive type (" + value.primitiveType + ", " + value.cssText + ")";
										break;
								}
								break;
								
							case 2:  // list
								result = "";
								for(var i = 0; i < value.length; i++){
									result += ', ' + getValue(value[i]);
								}
								if(result.length > 1){
									result = result.substr(2);
								}
								break;
								
							default:
								result = "Unrecognised value type (" + value.cssValueType + ")";
								break;
						}
						return result;
					}
					
					if(value){
						result = getValue(value);
					}else if(rule.style.getPropertyValue){
						result = rule.style.getPropertyValue(property);
					}else{
						result = getStyleValue(rule, property);
					}
					
					return result;
				}
				
				function examineFontProperty(/*CSSStyleSheet*/sheet, /*CSSStyleRule*/rule, property){
					var value = getFontValue(sheet, rule, property);					
					if(value){
						ensurearray(s_fonts, value).push({
							sheetrel: makerel(sheet.href, urlprefix),
							sheet: sheet.href,
							selector: rule.selectorText,
							property: property 
						});
					}
				}
				
				function getImageURLFromValue(value){
					var result = null;
					
					if(value){
						switch(value.cssValueType){
							case 0:  // inherited
							case 4:  // initial
								result = null;
								break;
								
							case 1:  // primitive
								switch(value.primitiveType){
									case 19:  // string
										result = null;
										break;
										
									case 20:  // URI
										result = value.cssText.replace(/^url\((.*)\)$/g, "$1") || "Unrecognised URL value (" + value.cssText + ")";
										break;
										
									case 21:  // identifier
										result = (value.getStringValue().toLowerCase() === "none") ? null : ("Unrecognised identifier (" + value.getStringValue() + ")");
										break;
										
									default:
										result = "Unrecognised primitive type (" + value.primitiveType + ", " + value.cssText + ")";
										break;
								}
								break;
								
							case 2:  // list
								for(var item = 0; !result && (item < value.length); item++){
									// this is a bit unsatisfactory -- we just take the first recognisable URL (if any)
									result = getImageURLFromValue(value[item]);
								}
								break;
								
							case 3:  // custom
								result = value.cssText.match(/^-webkit(-linear)?-gradient\(.*\)$/g) ? null : 
										 (value.cssText.replace(/^url\((.*)\)$/g, "$1") || "Unrecognised custom value (" + value.cssText + ")");
								break;
								
							default:
								result = "Unrecognised value type (" + value.cssValueType + ")";
								break;
						}
					}
					
					return result;
				}
				
				function getImageValue(/*CSSStyleSheet*/sheet, /*CSSStyleRule*/rule, property){
					var cssvalue = rule.style.getPropertyCSSValue && rule.style.getPropertyCSSValue(property),
						result;
					
					if(cssvalue){
						result = getImageURLFromValue(cssvalue);
					}else if(rule.style.getPropertyValue){
						result = rule.style.getPropertyValue(property);
					    
						if(result){
							result = result.replace(/^url\(\"?([^\"]*)\"?\)$/g, "$1");
						}
						
						if(result && ((result == "none") || (result == "initial") || (result == "inherit") || (result.indexOf("-moz") == 0))){
							result = null;
						}
						
						if(result && result.indexOf(".") && result.indexOf("/") && result.indexOf("http")){
							result = getpath(sheet.href) + result;
						} 
					}else{
						result = getStyleValue(rule, property);
						result = result && (result.replace(/^url\((.*)\)$/g, "$1") || "Unrecognised URL value (" + result + ")");
					}
					
					return result;
				}
				
				function examineImageProperty(/*CSSStyleSheet*/sheet, /*CSSStyleRule*/rule, property){
					var value = getImageValue(sheet, rule, property),
						rel = value && makerel(value, urlprefix);
					
					if(value){
						ensurearray(s_images, rel).push({
							sheetrel: makerel(sheet.href, urlprefix),
							sheet: sheet.href,
							selector: rule.selectorText,
							property: property,
							image: imageinfos[rel] || (imageinfos[rel] = { src: value, image: null }) 
						});
					}
				}
				
				function extractClasses(/*CSSStyleSheet*/sheet, selector){
					var matches = (selector + " ").match(/\.([^\s,.:]+)[\s,.:]/g), classes = {}, match;
					for(match = 0; matches && (match < matches.length); match++){
						classes[matches[match].replace(/(\.|\s|,|:)/g, '')] = true;
					}
					for(match in classes){
						ensurearray(s_classes, match).push({
							sheetrel: makerel(sheet.href, urlprefix),
							sheet: sheet.href,
							selector: selector
						});
					}
				}
				
				function processRule(/*CSSStyleSheet*/sheet, /*CSSStyleRule*/rule){
					examineColorProperty(sheet, rule, "border-color", ["border-top-color", "border-right-color", "border-bottom-color", "border-left-color"]);
					examineColorProperty(sheet, rule, "background-color");
					examineColorProperty(sheet, rule, "color");

					examineFontProperty(sheet, rule, "font-family");
					
					examineImageProperty(sheet, rule, "background-image");
					examineImageProperty(sheet, rule, "border-image-source");
					examineImageProperty(sheet, rule, "list-style-image");
					examineImageProperty(sheet, rule, "content");
					
					extractClasses(sheet, rule.selectorText);
				}
				
				function processSheet(/*CSSStyleSheet*/sheet, parent, root, depth, duplicate){
					var id = nextsheetid++,
						me = {
							id: id,
							sheetrel: makerel(sheet.href, urlprefix),
							sheet: sheet.href,
							depth: depth,
							maxdepth: depth,
							duplicate: duplicate
						};
						
					if(duplicate){
						root.duplicates++;
					}
					
					ensurearray(parent, "imports").push(me);
					sheetsprocessed[sheet.href] = true;
					
					// Chrome populates cssRules, FF and IE only rules
					for(var r = 0; r < (sheet.rules || sheet.cssRules).length; r++) {
						var rule = (sheet.rules || sheet.cssRules)[r];
						switch(("type" in rule) ? rule.type : 1){
							case 3: /* @import */
								processSheet(rule.styleSheet, me, root, depth + 1, sheetsprocessed[rule.styleSheet.href]);
								break;
								
							case 1: /* style rule */
								duplicate || processRule(sheet, rule);
								break;
						}
					}

					// IE only puts style rules into rules, and @imports into imports
					try{
						for(r = 0; sheet.imports && (r < sheet.imports.length); r++) {
							var simport = sheet.imports[r];
							processSheet(simport, me, root, depth + 1, sheetsprocessed[simport.href]);
						}
					}catch(e){
						me.importserror = true;
						root.importserrors++;
					}
					
					if(me.maxdepth > parent.maxdepth){
						parent.maxdepth = me.maxdepth;
					}
				}
				
				s_sheets.duplicates = 0;
				s_sheets.maxdepth = 0;
				s_sheets.importserrors = 0;
				processSheet(sheet, s_sheets, s_sheets, 1, false);
				
				if(handlers.colors){
					handlers.colors(s_colors);
				}
				
				if(handlers.fonts){
					handlers.fonts(s_fonts);
				}
				
				if(handlers.images){
					var pending = 0,
						rel,
						alldone = function(){
							handlers.images(s_images);
						}

					for(rel in imageinfos){
						imageinfos[rel].image = new Image();
						imageinfos[rel].image.info = imageinfos[rel];
						pending++;
						
						imageinfos[rel].image.onload = function(){
							(--pending == 0) && alldone();
						}
						
						imageinfos[rel].image.onerror = imageinfos[rel].onabort = function(){
							this.info.image = null;
							(--pending == 0) && alldone();
						}
					}
					
					for(rel in imageinfos){
						imageinfos[rel].image.src = imageinfos[rel].src;
					}
				}
				
				if(handlers.sheets){
					handlers.sheets(s_sheets);
				}
				
				if(handlers.classes){
					handlers.classes(s_classes);
				}
				
				head.removeChild(link);
			}else{
				setTimeout(summarizer, 100);
			}
		}

	link.setAttribute("rel", "stylesheet");
	link.setAttribute("type", "text/css");
	link.setAttribute("href", url);
	link.onload = summarizer;
	head.appendChild(link);
	summarizer();
}