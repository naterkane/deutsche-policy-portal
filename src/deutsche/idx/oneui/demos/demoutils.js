/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

/* utility JavaScript for the demo pages */

function sizeIframeToContent(ifnode){
	// NB this will not work cross-domain
	// include 10px fudge factor in case of stray borders/frames
	// NB scrollWidth comes out as "1" on FF, so use parentNode.scrollWidth which, curiously, is set OK
	ifnode.style.width = "100%";//((ifnode.contentDocument || ifnode.contentWindow.document).body.parentNode.scrollWidth + 10) + "px";
	ifnode.style.height = ((ifnode.contentDocument || ifnode.contentWindow.document).body.parentNode.scrollHeight + 10) + "px";
}

require(["../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
		 "../../../../../dist/lib/dojo/_base/lang",
		 "dojo/_base/xhr",
		 "dijit/layout/ContentPane",
		 "dijit/form/TextBox"],
		 function(declare, lang, xhr, ContentPane, TextBox){
				 	
		 	declare("pageProxyContentPane", [ContentPane], {
				// pageProxyContentPane is a ContentPane with an extra property, iframesrc,
				// which is the URL which will be loaded into an IFRAME and used as the
				// pane content. Loading is lazy, begun on first show. The IFRAME is sized
				// to the content size (NB this will not work cross-domain).
			 	_onShow: function(){
					this.inherited(arguments);
					
					if(this.iframesrc){
						var src = this.iframesrc;
						delete this.iframesrc;
						
						this._setContent(this.onDownloadStart(), true);
						
						var ifrm = document.createElement("IFRAME"); 
						ifrm.setAttribute("frameBorder", "0"); // Attribute name is case-sensitive in ie7! 
						ifrm.setAttribute("scrolling", "no"); 
						ifrm.setAttribute("src", src); 
						ifrm.style.width = "1px"; 
						ifrm.style.height = "1px";
						
						var onLoadHandler = dojo.hitch(this, function(event){
							// when loading is complete, remove all but the last
							// child node (which will be our IFRAME) and then
							// resize the iframe to the content
							while (this.containerNode.firstChild.nextSibling) {
								this.containerNode.removeChild(this.containerNode.firstChild);
							}
							sizeIframeToContent(event.target || event.srcElement);
						});
						if(ifrm.addEventListener){
							ifrm.addEventListener("load", onLoadHandler, false);
						}else{
							ifrm.attachEvent("onload", onLoadHandler);
						}
						
						this.containerNode.appendChild(ifrm);								
					}
												
					if(this.textsrc){
						var src = this.textsrc;
						delete this.textsrc;
						
						this._setContent(this.onDownloadStart(), true);

						var dfd = xhr.get({
							url: src,
							handleAs: "text"
						});
						
						dfd.addCallback(dojo.hitch(this, function(data){
							this.destroyDescendants();
							
							var pre = document.createElement("PRE");
							pre.className = "codePage";
							pre.appendChild(document.createTextNode(data));
							this.containerNode.appendChild(pre);
						}));
					}							
				}
			});
					
		 });