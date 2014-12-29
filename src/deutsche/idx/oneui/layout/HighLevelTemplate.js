/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	"../../../../../node_modules/intern-geezer/node_modules/dojo/_base/array",
	"dojo/_base/lang",
	"dojo/dom-class",
	"dojo/dom-construct",
	"dijit/registry",
	"dijit/layout/BorderContainer",
	"dijit/layout/ContentPane",
	"dijit/_Widget",
	"idx/oneui/layout/ToggleSplitter"
], function(declare, array, lang, domClass, domConstruct, registry, BorderContainer, ContentPane, _Widget){
	/**
	* @name idx.oneui.layout.HighLevelTemplate
	* @class The HighLevelTemplate provides the standard OneUI page architecture.
	* @augments dijit.layout.BorderContainer
	*/ 
	return declare("idx.oneui.layout.HighLevelTemplate", [BorderContainer], {
	/**@lends idx.oneui.layout.HighLevelTemplate*/ 
		gutters: false,
		/**
		 * The id or the widget itself of idx.oneui.Header, The header would be the header of HighLevelTemplate container
		 * @type String | idx.oneui.Header
		 */
		header: null,
		buildRendering: function(){
			this.inherited(arguments);
			if(this.header){
				var header = registry.byId(this.header);
				if(header && (header.declaredClass == "idx.oneui.Header")){
					domConstruct.place(header.domNode, this.domNode, "first");
				}
			}		
		},
				
		startup: function(){
			if(this._started){ return; }
			// make sure there are top&center for the layout widget.
			var topRegion, centerRegion;
			
			array.some(this.getChildren(), function(child){
				if(child && child.region == "top"){
					topRegion = child;
				}else if(child && child.region == "center"){
					centerRegion = child;
				}
				if(topRegion && centerRegion){ return true; }
			});
			
			if(!topRegion){
				// Top region is required so we need to add one
				// and make some defaults
				topRegion = new ContentPane({
					region: "top",
					style: "height: 75px"
				});
				this.addChild(topRegion);
			}
			if(!centerRegion){
				// Center region is required so we need to add one
				centerRegion = new ContentPane({
					region: "center"
				});
				this.addChild(centerRegion);
			}
			
			this.inherited(arguments);
		},
		
		_setupChild: function(/*dijit._Widget*/ child){
			// Override _LayoutWidget._setupChild().
	
			var region = child.region;
			if(region){
				dijit.layout._LayoutWidget.prototype._setupChild.apply(this, arguments);
				domClass.add(child.domNode, this.baseClass+"Pane");
	
				var ltr = this.isLeftToRight();
				if(region == "leading"){ region = ltr ? "left" : "right"; }
				if(region == "trailing"){ region = ltr ? "right" : "left"; }
	
				// Create draggable splitter or toggle splitter for resizing pane,
				// or alternately if splitter=false but gutters=true then
				// insert dummy div just for spacing
				if((child.splitter || child.gutter || this.gutters) && !child._splitterWidget){
					var _Splitter = lang.getObject(
						child.splitter ? 
						(child.splitter == "toggle" ? "idx.oneui.layout.ToggleSplitter" : "dijit.layout._Splitter") :
						 "dijit.layout._Gutter");
					var splitter = new _Splitter({
						id: child.id + "_splitter",
						container: this,
						child: child,
						region: region,
						live: this.liveSplitters
					});
					splitter.isSplitter = true;
					child._splitterWidget = splitter;
	
					domConstruct.place(splitter.domNode, child.domNode, "after");
	
					// Splitters aren't added as Contained children, so we need to call startup explicitly
					splitter.startup();
				}
				child.region = region;
			}
		}
	});
	
	lang.extend(_Widget, {
		gutter: false
	});
});
