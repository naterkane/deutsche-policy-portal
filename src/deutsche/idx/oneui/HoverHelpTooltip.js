/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */
/**
 * @name idx.oneui.HoverHelpTooltip
 * @class HoverHelpTooltip provides pop-up information that displays when users hover the mouse pointer over an help indicator.
 * @augments dijit.Tooltip
 * @see dijit.Tooltip
 **/
define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/declare", "../../../../dist/lib/dojo/_base/fx", // fx.fadeIn fx.fadeOut
 "dojo/keys", // keys
 "dojo/_base/array", // array.forEach array.indexOf array.map
 "dojo/dom", // dom.byId
 "dojo/_base/lang", // lang.hitch lang.isArrayLike
 "dojo/_base/sniff", // has("ie")
 "dijit/focus", "dojo/_base/event", // event.stop
 "dojo/dom-geometry", // domGeometry.getMarginBox domGeometry.position
 "dijit/place", "dijit/a11y", // _getTabNavigable
 "dijit/BackgroundIframe", "dojo/dom-style", // domStyle.set, domStyle.get
 "dojo/_base/window", // win.body
 "dijit/_base/manager",	// manager.defaultDuration
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
 "dijit/Tooltip", "dojo/text!./templates/HoverHelpTooltip.html", "dijit/dijit", 
 "dojo/i18n",
	"dojo/i18n!./nls/HoverHelpTooltip"], function(declare, fx, keys, array, dom, lang, has, dijitfocus, event, domGeometry, place, a11y, BackgroundIframe, domStyle, win, manager, _Widget, _TemplatedMixin, Tooltip, template, dijit, i18n){

    var HoverHelpTooltip = declare("idx.oneui.HoverHelpTooltip", Tooltip, {
        /** @lends idx.oneui.HoverHelpTooltip.prototype */
        
        showDelay: 500,
        hideDelay: 800,
        
        /**
         * Whether to show Learn more link
         * @type Boolean
         */
        showLearnMore: false,
        
        /**
         * Learn more link value
         * @type String
         */
        learnMoreLinkValue: "#updateme",      
                
        
        showCloseIcon: true,
		
		/**
		 * Focus HoverHelpTooltip once it shown.
		 * @type Boolean
		 */
		forceFocus: false,
		
        _onHover: function(/*Event*/e){
            // summary:
            //		Despite the name of this method, it actually handles both hover and focus
            //		events on the target node, setting a timer to show the HoverHelpTooltip.
            // tags:
            //		private
            if (!this._showTimer) {
                var target = e.target;
                this._showTimer = setTimeout(lang.hitch(this, function(){
                    this.open(target)
                }), this.showDelay);
            }
            
            if (this._hideTimer) {
                clearTimeout(this._hideTimer);
                delete this._hideTimer;
            }
        },
        
        _onUnHover: function(/*Event*/ /*===== e =====*/){
            // summary:
            //		Despite the name of this method, it actually handles both mouseleave and blur
            //		events on the target node, hiding the HoverHelpTooltip.
            // tags:
            //		private
            
            // keep a HoverHelpTooltip open if the associated element still has focus (even though the
            // mouse moved away)
            if (this._focus) {
                return;
            }
            
            if (this._showTimer) {
                clearTimeout(this._showTimer);
                delete this._showTimer;
            }
            
            if (!this._hideTimer) {
                this._hideTimer = setTimeout(lang.hitch(this, function(){
                    this.close()
                }), this.hideDelay);
            }
        },
        
        
        
        /**
         * Display the HoverHelpTooltip
         * @private
         */
        open: function(/*DomNode*/target){
            // summary:
            //		
            // tags:
            //		private
            
            if (this._showTimer) {
                clearTimeout(this._showTimer);
                delete this._showTimer;
            }
            HoverHelpTooltip.show(this.label || this.domNode.innerHTML, target, this.position, 
			!this.isLeftToRight(), this.textDir, this.showLearnMore, this.learnMoreLinkValue, 
			this.showCloseIcon, this.forceFocus);
            
            this._connectNode = target;
            this.onShow(target, this.position);
        },
        close: function(){
			// summary:
			//		Hide the tooltip or cancel timer for show of tooltip
			// tags:
			//		private

			if(this._connectNode){
				// if tooltip is currently shown
				HoverHelpTooltip.hide(this._connectNode);
				delete this._connectNode;
				this.onHide();
			}
			if(this._showTimer){
				// if tooltip is scheduled to be shown (after a brief delay)
				clearTimeout(this._showTimer);
				delete this._showTimer;
			}
		},
		_setConnectIdAttr: function(/*String|String[]*/ newId){
			// summary:
			//		Connect to specified node(s)

			// Remove connections to old nodes (if there are any)
			array.forEach(this._connections || [], function(nested){
				array.forEach(nested, lang.hitch(this, "disconnect"));
			}, this);

			// Make array of id's to connect to, excluding entries for nodes that don't exist yet, see startup()
			this._connectIds = array.filter(lang.isArrayLike(newId) ? newId : (newId ? [newId] : []),
					function(id){ return dom.byId(id); });

			// Make connections
			this._connections = array.map(this._connectIds, function(id){
				var node = dom.byId(id);
				return [
					this.connect(node, "onmouseenter", "_onHover"),
					this.connect(node, "onmouseleave", "_onUnHover"),
					this.connect(node, "onclick", "_onHover"),
					//this.connect(node, "onfocus", "_onHover"),
					this.connect(node, "onblur", "_onUnHover"),
					this.connect(node, "onkeypress", "_onConnectIdKey")
				];
			}, this);

			this._set("connectId", newId);
		},
		_onConnectIdKey: function(/*Event*/evt){
            // summary:
            //		Handler for keyboard events
            // description:
            // tags:
            //		private
            var node = evt.target;
            
            if (evt.charOrCode == keys.ENTER || evt.charOrCode == keys.SPACE || evt.charOrCode == " " || evt.charOrCode == keys.F1) {
                // Use setTimeout to avoid crash on IE, see #10396.
                 this._showTimer = setTimeout(lang.hitch(this, function(){
                    this.open(node)
                }), this.showDelay);
                
                event.stop(evt);     
            }
        }
        
    });
    
    var MasterHoverHelpTooltip = declare("idx.oneui._MasterHoverHelpTooltip", [_Widget, _TemplatedMixin], {
    //lang.extend(Tooltip._MasterTooltip, {    
    	// duration: Integer
		//		Milliseconds to fade in/fade out
		duration: manager.defaultDuration,
		
        templateString: template,
        learnMoreLabel: "", 
        
        /**
         * draggable: Boolean
         *		Toggles the moveable aspect of the HoverHelpTooltip. If true, HoverHelpTooltip
         *		can be dragged by it's grippy bar. If false it will remain positioned
         *		relative to the attached node
         *		@type boolean
         **/
        draggable: true,
        
        _firstFocusItem: null,
        _lastFocusItem: null,
        
        /**
		 * Focus HoverHelpTooltip once it hovered.
		 * @type Boolean
		 */
        hoverFocus: true,
        
				postMixInProperties: function(){
					this.learnMoreLabel = i18n.getLocalization("idx.oneui", "HoverHelpTooltip", this.lang).learnMoreLabel;
				},
        postCreate: function(){
        	
        		
        		
            win.body().appendChild(this.domNode);
            
            this.bgIframe = new BackgroundIframe(this.domNode);
            
            // Setup fade-in and fade-out functions.
            this.fadeIn = fx.fadeIn({
                node: this.domNode,
                duration: this.duration,
                onEnd: lang.hitch(this, "_onShow")
            });
            this.fadeOut = fx.fadeOut({
                node: this.domNode,
                duration: this.duration,
                onEnd: lang.hitch(this, "_onHide")
            });
            this.connect(this.domNode, "onkeypress", "_onKey");
			this.connect(this.outerContainerNode, "onmouseenter", lang.hitch(this, function(e){
				if(this.hoverFocus){this.focus();}}
			));
            
        },
        show: function(innerHTML, aroundNode, position, rtl, textDir, showLearnMore, learnMoreLinkValue, showCloseIcon, forceFocus){
        	if(forceFocus){this.focus();}
			
            if (showLearnMore) {
                this.learnMoreNode.style.display = "inline";
                this.learnMoreNode.href = learnMoreLinkValue;
            }
            else{
				this.learnMoreNode.style.display = "none";
			}
            
            if (showCloseIcon || showCloseIcon == null) 
                this.closeButtonNode.style.display = "inline";
            else {
                this.closeButtonNode.style.display = "none";
            }
            //in case connectorNode was hidden on a previous call to hide
            this.connectorNode.hidden = false;
            
            if (this.aroundNode && this.aroundNode === aroundNode && this.containerNode.innerHTML == innerHTML) {
                return;
            }
            
            
            // reset width; it may have been set by orient() on a previous HoverHelpTooltip show()
            this.domNode.width = "auto";
            
            if (this.fadeOut.status() == "playing") {
                // previous HoverHelpTooltip is being hidden; wait until the hide completes then show new one
                this._onDeck = arguments;
                return;
            }
            
            this.containerNode.innerHTML = innerHTML;
            
            this.set("textDir", textDir);
            this.containerNode.align = rtl ? "right" : "left"; //fix the text alignment
            var pos = place.around(this.domNode, aroundNode, position && position.length ? position : HoverHelpTooltip.defaultPosition, !rtl, lang.hitch(this, "orient"));
            
            // Position the HoverHelpTooltip connector for middle alignment.
            // This could not have been done in orient() since the HoverHelpTooltip wasn't positioned at that time.
            var aroundNodeCoords = pos.aroundNodePos;
            if (pos.corner.charAt(0) == 'M' && pos.aroundCorner.charAt(0) == 'M') {
                this.connectorNode.style.top = aroundNodeCoords.y + ((aroundNodeCoords.h - this.connectorNode.offsetHeight) >> 1) - pos.y + "px";
                this.connectorNode.style.left = "";
            }
            else if (pos.corner.charAt(1) == 'M' && pos.aroundCorner.charAt(1) == 'M') {
                this.connectorNode.style.left = aroundNodeCoords.x + ((aroundNodeCoords.w - this.connectorNode.offsetWidth) >> 1) - pos.x + "px";
            }
            // show it
            domStyle.set(this.domNode, "opacity", 0);
            this.fadeIn.play();
            this.isShowingNow = true;
            this.aroundNode = aroundNode;
        },
        
        
        orient: function(/*DomNode*/node, /*String*/ aroundCorner, /*String*/ HoverHelpTooltipCorner, /*Object*/ spaceAvailable, /*Object*/ aroundNodeCoords){
            // summary:
            //		Private function to set CSS for HoverHelpTooltip node based on which position it's in.
            //		This is called by the dijit popup code.   It will also reduce the HoverHelpTooltip's
            //		width to whatever width is available
            // tags:
            //		protected
            this.connectorNode.style.top = ""; //reset to default
            //Adjust the spaceAvailable width, without changing the spaceAvailable object
            var HoverHelpTooltipSpaceAvaliableWidth = spaceAvailable.w - this.connectorNode.offsetWidth;
            
            node.className = "idxOneuiHoverHelpTooltip " +
            {
                "MR-ML": "idxOneuiHoverHelpTooltipRight",
                "ML-MR": "idxOneuiHoverHelpTooltipLeft",
                "TM-BM": "idxOneuiHoverHelpTooltipAbove",
                "BM-TM": "idxOneuiHoverHelpTooltipBelow",
                "BL-TL": "idxOneuiHoverHelpTooltipBelow idxOneuiHoverHelpTooltipABLeft",
                "TL-BL": "idxOneuiHoverHelpTooltipAbove idxOneuiHoverHelpTooltipABLeft",
                "BR-TR": "idxOneuiHoverHelpTooltipBelow idxOneuiHoverHelpTooltipABRight",
                "TR-BR": "idxOneuiHoverHelpTooltipAbove idxOneuiHoverHelpTooltipABRight",
                "BR-BL": "idxOneuiHoverHelpTooltipRight",
                "BL-BR": "idxOneuiHoverHelpTooltipLeft",
                "TR-TL": "idxOneuiHoverHelpTooltipRight"
            }[aroundCorner + "-" + HoverHelpTooltipCorner];
            
            // reduce HoverHelpTooltip's width to the amount of width available, so that it doesn't overflow screen
            this.domNode.style.width = "auto";
            var size = domGeometry.getContentBox(this.domNode);
            
            var width = Math.min((Math.max(HoverHelpTooltipSpaceAvaliableWidth, 1)), size.w);
            var widthWasReduced = width < size.w;
            
            this.domNode.style.width = width + "px";
            
            //Adjust width for HoverHelpTooltips that have a really long word or a nowrap setting
            if (widthWasReduced) {
                this.containerNode.style.overflow = "auto"; //temp change to overflow to detect if our HoverHelpTooltip needs to be wider to support the content
                var scrollWidth = this.containerNode.scrollWidth;
                this.containerNode.style.overflow = "visible"; //change it back
                if (scrollWidth > width) {
                    scrollWidth = scrollWidth + domStyle.get(this.domNode, "paddingLeft") + domStyle.get(this.domNode, "paddingRight");
                    this.domNode.style.width = scrollWidth + "px";
                }
            }
            
            // Reposition the HoverHelpTooltip connector.
            if (HoverHelpTooltipCorner.charAt(0) == 'B' && aroundCorner.charAt(0) == 'B') {
                var mb = domGeometry.getMarginBox(node);
                var HoverHelpTooltipConnectorHeight = this.connectorNode.offsetHeight;
                if (mb.h > spaceAvailable.h) {
                    // The HoverHelpTooltip starts at the top of the page and will extend past the aroundNode
                    var aroundNodePlacement = spaceAvailable.h - ((aroundNodeCoords.h + HoverHelpTooltipConnectorHeight) >> 1);
                    this.connectorNode.style.top = aroundNodePlacement + "px";
                    this.connectorNode.style.bottom = "";
                }
                else {
                    // Align center of connector with center of aroundNode, except don't let bottom
                    // of connector extend below bottom of HoverHelpTooltip content, or top of connector
                    // extend past top of HoverHelpTooltip content
                    this.connectorNode.style.bottom = Math.min(Math.max(aroundNodeCoords.h / 2 - HoverHelpTooltipConnectorHeight / 2, 0), mb.h - HoverHelpTooltipConnectorHeight) +
                    "px";
                    this.connectorNode.style.top = "";
                }
            }
            else {
                // reset the HoverHelpTooltip back to the defaults
                this.connectorNode.style.top = "";
                this.connectorNode.style.bottom = "";
            }
            
            return Math.max(0, size.w - HoverHelpTooltipSpaceAvaliableWidth);
        },
        
        focus: function(){
            this._getFocusItems(this.outerContainerNode);
            this._focus = true;
            dijitfocus.focus(this._firstFocusItem);            
        },
        
        _onShow: function(){
					// summary:
					//		Called at end of fade-in operation
					// tags:
					//		protected
					if(has("ie")){
						// the arrow won't show up on a node w/an opacity filter
						this.domNode.style.filter="";
					}
				},
        
        hide: function(aroundNode){
            // summary:
            //		Hide the HoverHelpTooltip
            
            if (this._onDeck && this._onDeck[1] == aroundNode || this._focus) {
            
                // this hide request is for a show() that hasn't even started yet;
                // just cancel the pending show()
                this._onDeck = null;
            }else if (this.aroundNode === aroundNode || this.isShowingNow) {
                // this hide request is for the currently displayed HoverHelpTooltip
                this.fadeIn.stop();
                this.isShowingNow = false;
                this.aroundNode = null;
                this.fadeOut.play();
            }
            else {
            // just ignore the call, it's for a HoverHelpTooltip that has already been erased
            }
        }, 
		
        hideOnClickClose: function(){
            // summary:
            //		Hide the HoverHelpTooltip
            // this hide request is for the currently displayed HoverHelpTooltip            
            dijitfocus.focus(this.aroundNode);
            this.fadeIn.stop();
            this.isShowingNow = false;
            this.aroundNode = null;
            this.fadeOut.play();            
        },
        _getFocusItems: function(){
            // summary:
            //		Finds focusable items in dialog,
            //		and sets this._firstFocusItem and this._lastFocusItem
            // tags:
            //		protected
            
            var elems = a11y._getTabNavigable(this.outerContainerNode.parentNode);
            this._firstFocusItem = elems.lowest || elems.first || this.closeButtonNode || this.domNode;
            this._lastFocusItem = elems.last || elems.highest || this._firstFocusItem;
        },
        _onKey: function(/*Event*/evt){
            // summary:
            //		Handler for keyboard events
            // description:
            // tags:
            //		private
            
            var node = evt.target;
            if (evt.charOrCode === keys.TAB) {
                this._getFocusItems(this.outerContainerNode);
            }
            var singleFocusItem = (this._firstFocusItem == this._lastFocusItem);
            if (evt.charOrCode == keys.ESCAPE) {
                // Use setTimeout to avoid crash on IE, see #10396.
                setTimeout(lang.hitch(this, "hideOnClickClose"), 0);
                event.stop(evt);
            }else if (node == this._firstFocusItem && evt.shiftKey && evt.charOrCode === keys.TAB) {
                if (!singleFocusItem) {
                    dijitfocus.focus(this._lastFocusItem); // send focus to last item in dialog
                }
                event.stop(evt);
            }else if (node == this._lastFocusItem && evt.charOrCode === keys.TAB && !evt.shiftKey) {
                if (!singleFocusItem) {
                    dijitfocus.focus(this._firstFocusItem); // send focus to first item in dialog
                }
                event.stop(evt);
            }else if (evt.charOrCode === keys.TAB) {
                // we want the browser's default tab handling to move focus
                // but we don't want the tab to propagate upwards
                evt.stopPropagation();
            }
        },
        _onHide: function(){
			// summary:
			//		Called at end of fade-out operation
			// tags:
			//		protected

			this.domNode.style.cssText="";	// to position offscreen again
			this.containerNode.innerHTML="";
			if(this._onDeck){
				// a show request has been queued up; do it now
				this.show.apply(this, this._onDeck);
				this._onDeck=null;
			}
		},
		
		_setAutoTextDir: function(/*Object*/node){
		    // summary:
		    //	    Resolve "auto" text direction for children nodes
		    // tags:
		    //		private

            this.applyTextDir(node, has("ie") ? node.outerText : node.textContent);
            array.forEach(node.children, function(child){this._setAutoTextDir(child); }, this);
		},
		
		_setTextDirAttr: function(/*String*/ textDir){
		    // summary:
		    //		Setter for textDir.
		    // description:
		    //		Users shouldn't call this function; they should be calling
		    //		set('textDir', value)
		    // tags:
		    //		private
	
            this._set("textDir", typeof textDir != 'undefined'? textDir : "");
    	    if (textDir == "auto"){
    	        this._setAutoTextDir(this.containerNode);
    	    }else{
    	        this.containerNode.dir = this.textDir;
    	    }  		             		        
        }
        
    }); //end declare

//    var MasterHoverHelpTooltip = Tooltip._MasterTooltip;
       
    HoverHelpTooltip._MasterHoverHelpTooltip = MasterHoverHelpTooltip;		// for monkey patching
    
    
    
    // summary:
    //		Static method to display HoverHelpTooltip w/specified contents in specified position.
    //		See description of idx.oneui.HoverHelpTooltip.defaultPosition for details on position parameter.
    //		If position is not specified then idx.oneui.HoverHelpTooltip.defaultPosition is used.
    // innerHTML: String
    //		Contents of the HoverHelpTooltip
    // aroundNode: dijit.__Rectangle
    //		Specifies that HoverHelpTooltip should be next to this node / area
    // position: String[]?
    //		List of positions to try to position HoverHelpTooltip (ex: ["right", "above"])
    // rtl: Boolean?
    //		Corresponds to `WidgetBase.dir` attribute, where false means "ltr" and true
    //		means "rtl"; specifies GUI direction, not text direction.
    // textDir: String?
    //		Corresponds to `WidgetBase.textdir` attribute; specifies direction of text.	
    HoverHelpTooltip.show = idx.oneui.showHoverHelpTooltip = function(innerHTML, aroundNode, position, rtl, textDir, showLearnMore, learnMoreLinkValue, showCloseIcon, forceFocus){
    
        if (!HoverHelpTooltip._masterTT) {
            idx.oneui._masterTT = HoverHelpTooltip._masterTT = new MasterHoverHelpTooltip();
        }
        return HoverHelpTooltip._masterTT.show(innerHTML, aroundNode, position, rtl, textDir, showLearnMore, learnMoreLinkValue, showCloseIcon, forceFocus);
    };
    
    // summary:
    //		Static method to hide the HoverHelpTooltip displayed via showHoverHelpTooltip()
    HoverHelpTooltip.hide = idx.oneui.hideHoverHelpTooltip = function(aroundNode){
    
        return HoverHelpTooltip._masterTT && HoverHelpTooltip._masterTT.hide(aroundNode);
    };
    
    HoverHelpTooltip.defaultPosition = ["after-centered", "before-centered", "below", "above"];
    
    
    return HoverHelpTooltip;
    
});
