/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["../../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
		"../../../../../../dist/lib/dojo/_base/Color",
		"dojo/colors"],
		function(declare, Color){
			
	function getkeys(object){
		if(Object.keys){
			return Object.keys(object);
		}else{
			var result = [];
			
			for(var prop in object){  
				if(object.hasOwnProperty(prop)){
					result.push(prop);
				}
			}
			
			return result;
		}  			
	}
	
	function trim(str){
		return str.trim ? str.trim() : str.replace(/^\s+/, '').replace(/\s+$/, '');
	}
	
	// user-readable style names keyed by CSS property names
	var styles = {
		'background-color':    'background',
		'border-color':        'border',
		'border-top-color':    'top border',
		'border-bottom-color': 'top border',
		'border-left-color':   'top border',
		'border-right-color':  'top border',
		'background-image':    'background',
		'border-image-source': 'border',
		'list-style-image':    'list style',
		'content':             'content'
	}
	
	function getStyleFromProperty(property){
		return styles[property] || property;
	}
	
	function nameColor(color){
		var result = color.toHex(), named;
		for(named in Color.named){
			if((color.r == Color.named[named][0]) && (color.g == Color.named[named][1]) && (color.b == Color.named[named][2])){
				result += " (" + named + ")";
				break;
			}
		}
		if(color.a < 1){
			result += ", alpha=" + color.a;
		}
		return result;
	}
	
	function getColorBrightness(color){
	   return Math.sqrt(
	      color.r * color.r * .241 + 
	      color.g * color.g * .691 + 
	      color.b * color.b * .068);
	}
	
	function getColorHue(color){
		return ((color.r == color.g) && (color.r == color.b))
			? -Math.PI
			: Math.atan2((2*color.r)-color.g-color.b, Math.sqrt(3)*(color.g-color.b));
	}
	
	function sortByColor(color1, color2){
		var result = 0;
		
		if((color1.r != color2.r) || (color1.g != color2.g) || (color1.b != color2.b) || (color1.a != color2.a)){
			var h1 = getColorHue(color1),
				h2 = getColorHue(color2);
				
			if(h1 < h2){
				result = -1;
			}else if(h1 > h2){
				result = 1;
			}else{
				var b1 = getColorBrightness(color1),
					b2 = getColorBrightness(color2);
					
				if(b1 < b2){
					result = -1;
				}else if(b1 > b2){
					result = 1;
				}else if(color1.a < color2.a){
					result = -1;
				}else{
					result = 1;
				}
			}
		}
		
		return result;
	}
	
	function catalogUses(tbody, uses){
		var tr, node, sheets = {};
		
		// collect up the uses by sheet
		for(var use in uses){
			sheets[uses[use].sheet] || (sheets[uses[use].sheet] = { rel: uses[use].sheetrel, properties: {} });
			sheets[uses[use].sheet].properties[uses[use].property] || (sheets[uses[use].sheet].properties[uses[use].property] = []);
			var selectors = uses[use].selector.split(","), i;
			for(i in selectors){
				sheets[uses[use].sheet].properties[uses[use].property].push(trim(selectors[i]));
			}
		}
		
		for(var sheet in sheets){
			for(var property in sheets[sheet].properties){
				tr = document.createElement("tr");
				tbody.appendChild(tr);
				
				node = document.createElement("td");
				node.innerHTML = '<a href="' + sheet + '">' + sheets[sheet].rel + '</a>';
				tr.appendChild(node);
				
				node = document.createElement("td");
				node.innerHTML = getStyleFromProperty(property);
				tr.appendChild(node);
				
				node = document.createElement("td");
				node.innerHTML = sheets[sheet].properties[property].join("<br />");
				tr.appendChild(node);
			}
		}					
	}
	
	function makeColorIndexBlock(rgb){
		var color = Color.fromString(rgb),
			hex = color ? color.toHex() : null,
			name = color ? nameColor(color) : rgb,
			div = document.createElement("div");
			
		div.style.display = "inline-block";
		div.style.marginRight = "6px";
		div.style.marginBottom = "6px";
			
		if(color){
			div.innerHTML = '<a onclick="openColorReport(\'#report-color-' + hex.substring(1) + '-' + color.a + '\'); return false;" href="#report-color-' + hex.substring(1) + '-' + color.a + '"><div title="' + name + '" class="color-swatch" style="background-color: ' + hex + ';"></div></a>';
		}
			
		return div;
	}

	function makeFontBlock(font, uses){
		var div = document.createElement("div"),
			table = document.createElement("table"),
			tbody = document.createElement("tbody"),
			tr = document.createElement("tr"),
			node,
			sheets = {};

		div.innerHTML = '<a name="report-font-' + font + '"></a>'; 
			
		table.cellPadding = 0;
		table.cellSpacing = 0;
		table.className = "report-table";
		div.appendChild(table);
		table.appendChild(tbody);
		tbody.appendChild(tr);
		
		node = document.createElement("th");
		node.setAttribute("colspan", "3");
		node.innerHTML = '<span style="float: right; margin-left: 2em; font-size: 0.85em;">(<a href="#fonts">return to index</a>)</span>'
					   + '<span class="font-name">' + font + '</span>';
		tr.appendChild(node);
					
		tr = document.createElement("tr");
		tbody.appendChild(tr);
		
		node = document.createElement("th");
		node.setAttribute("width", "220");
		node.innerHTML = "stylesheet";
		tr.appendChild(node);
		
		node = document.createElement("th");
		node.setAttribute("width", "84");
		node.innerHTML = "style";
		tr.appendChild(node);
		
		node = document.createElement("th");
		node.setAttribute("width", "500");
		node.innerHTML = "selector(s)";
		tr.appendChild(node);
		
		catalogUses(tbody, uses);
		
		return div;
	}
	
	function makeFontIndexBlock(font){
		var div = document.createElement("div");
			
		div.innerHTML = '<a class="font-swatch-box" onclick="openFontReport(\'#report-font-' + font + '\'); return false;" href="#report-font-' + font + '"><div title="' + font + '" class="font-swatch" style="font-family: ' + font + ';"></div><div class="font-swatch-label">' + font + '</div></a>';
			
		return div;
	}

	function makeColorBlock(rgb, uses){
		var color = Color.fromString(rgb),
			hex = color ? color.toHex() : null,
			name = color ? nameColor(color) : rgb,
			div = document.createElement("div"),
			table = document.createElement("table"),
			tbody = document.createElement("tbody"),
			tr = document.createElement("tr"),
			node,
			sheets = {};

		if(color){
			div.innerHTML = '<a name="report-color-' + hex.substring(1) + '-' + color.a + '"></a>'; 
		}
			
		table.cellPadding = 0;
		table.cellSpacing = 0;
		table.className = "report-table";
		div.appendChild(table);
		table.appendChild(tbody);
		tbody.appendChild(tr);
		
		node = document.createElement("th");
		node.setAttribute("colspan", "3");
		node.innerHTML = (color ? ('<div class="swatch-head"><div class="color-swatch" style="background-color: ' + hex + ';"></div></div> ') : '')
					   + '<span style="float: right; margin-left: 2em; font-size: 0.85em;">(<a href="#colors">return to index</a>)</span>'
					   + '<span class="color-name">' + name + '</span>';
		tr.appendChild(node);
					
		tr = document.createElement("tr");
		tbody.appendChild(tr);
		
		node = document.createElement("th");
		node.setAttribute("width", "220");
		node.innerHTML = "stylesheet";
		tr.appendChild(node);
		
		node = document.createElement("th");
		node.setAttribute("width", "84");
		node.innerHTML = "style";
		tr.appendChild(node);
		
		node = document.createElement("th");
		node.setAttribute("width", "500");
		node.innerHTML = "selector(s)";
		tr.appendChild(node);
		
		catalogUses(tbody, uses);
		
		return div;
	}
	
	function makeImageIndexBlock(rel, url, image){
		rel = rel.replace(/"/gi, '&quot;');
		
		var div = document.createElement("div");				
		div.style.display = "inline-block";
		div.style.marginRight = "8px";
		div.style.marginBottom = "8px";
		div.innerHTML = '<a onclick="openImageReport(\'#report-image-' + rel + '\'); return false;" href="#report-image-' + rel + '">'
					  + '<div title="' + (image ? (image.width + '&times;' + image.height) : 'image failed to load')
					  + ', ' + rel + '" class="image-swatch"><img src="' + url + '" /></div></a>';
			
		return div;
	}
	
	function makeImageBlock(rel, url, uses, image){
		var div = document.createElement("div"),
			table = document.createElement("table"),
			tbody = document.createElement("tbody"),
			tr = document.createElement("tr"),
			node,
			sheets = {};

		div.innerHTML = '<a name="report-image-' + rel + '"></a>'; 
			
		table.cellPadding = 0;
		table.cellSpacing = 0;
		table.className = "report-table";
		div.appendChild(table);
		table.appendChild(tbody);
		tbody.appendChild(tr);
		
		node = document.createElement("th");
		node.setAttribute("colspan", "3");
		node.innerHTML = '<div class="swatch-head"><div class="image-swatch"><img src="' + url + '" /></div></div>'
					   + '<span style="float: right; margin-left: 2em; font-size: 0.85em;">(<a href="#images">return to index</a>)</span>'
					   + '<span class="image-url">' + rel + '</span><br />'
					   + (image ? (image.width + '&times;' + image.height) : 'image failed to load');			
		tr.appendChild(node);
					
		tr = document.createElement("tr");
		tbody.appendChild(tr);
		
		node = document.createElement("th");
		node.setAttribute("width", "220");
		node.innerHTML = "stylesheet";
		tr.appendChild(node);
		
		node = document.createElement("th");
		node.setAttribute("width", "84");
		node.innerHTML = "style";
		tr.appendChild(node);
		
		node = document.createElement("th");
		node.setAttribute("width", "500");
		node.innerHTML = "selector(s)";
		tr.appendChild(node);
		
		catalogUses(table, uses);
		
		return div;
	}
	
	function makeClassBlock(classname, uses){
		var tr = document.createElement("tr"),
			node,
			sheets = {}, use, sheet, sheetlinks = [];

		// collect up the uses by sheet
		for(use in uses){
			sheets[uses[use].sheet] = uses[use].sheetrel;
		}
		
		for(sheet in sheets){
			sheetlinks.push('<a href="' + sheet + '">' + sheets[sheet] + '</a>');
		}
		
		node = document.createElement("td");
		node.innerHTML = classname;
		tr.appendChild(node);
		 
		node = document.createElement("td");
		node.innerHTML = sheetlinks.join('<br />');
		tr.appendChild(node);
		 
		return tr;
	}
	
	return declare("idx.oneui.demos.themeSummary.ThemeReport", null, {

		createColorReport: function(colors, indexnode, detailnode){
			var keys = getkeys(colors), color;
			
			// sort the colors by hue then brightness 
			keys.sort(function(rgb1, rgb2){
				var color1 = Color.fromString(rgb1),
					color2 = Color.fromString(rgb2);
			
				return (color1 && color2)
					 ? sortByColor(color1, color2)
					 : ((rgb1 == rgb2) ? 0 : ((rgb1 < rgb2) ? -1 : 1));
			});
	
			for(color in keys){
				indexnode.appendChild(makeColorIndexBlock(keys[color]));
				detailnode.appendChild(makeColorBlock(keys[color], colors[keys[color]]));
			}
		},
		
		createFontReport: function(fonts, indexnode, detailnode){
			var keys = getkeys(fonts), font;
			
			// sort the font names alphabetically 
			keys.sort();
	
			for(font in keys){
				indexnode.appendChild(makeFontIndexBlock(keys[font]));
				detailnode.appendChild(makeFontBlock(keys[font], fonts[keys[font]]));
			}
		},
		
		createImageReport: function(images, indexnode, detailnode){
			var keys = getkeys(images);

			// sort the images by size (height, then width), errors first
			keys.sort(function(image1, image2){
				var result = 0;
				
				if(images[image1][0].image.image == null){
					result = -1;
				}else if(images[image2][0].image.image == null){
					result = 1;
				}else if(images[image1][0].image.image.height < images[image2][0].image.image.height){
					result = -1;
				}else if(images[image1][0].image.image.height > images[image2][0].image.image.height){
					result = 1;
				}else if(images[image1][0].image.image.width < images[image2][0].image.image.width){
					result = -1;
				}else if(images[image1][0].image.image.width > images[image2][0].image.image.width){
					result = 1;
				}
				
				return result;
			});
			
			for(image in keys){
				report_images_index.appendChild(makeImageIndexBlock(keys[image], images[keys[image]][0].image.src, images[keys[image]][0].image.image));
				report_images.appendChild(makeImageBlock(keys[image], images[keys[image]][0].image.src, images[keys[image]], images[keys[image]][0].image.image));
			}
		},

		createClassReport: function(classes, dojodijitnode, idxoneuinode, othernode){
			var keys = getkeys(classes), classname, tr;
			
			// sort the class names alphabetically
			keys.sort();
			
			for(classname in keys){
				tr = makeClassBlock(keys[classname], classes[keys[classname]]);
				if(/(^claro|^dojo|^dijit|^dj_)/.test(keys[classname])){
					dojodijitnode.appendChild(tr);
					dojodijitnode.parentNode.style.display = "block";
				}else if(/(^oneui|^idx)/.test(keys[classname])){
					idxoneuinode.appendChild(tr);
					idxoneuinode.parentNode.style.display = "block";
				}else{
					othernode.appendChild(tr);
					othernode.parentNode.style.display = "block";
				}	
			}
		}
				
	});
});