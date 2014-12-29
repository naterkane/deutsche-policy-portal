
(function() {
function factory(dDeclare,		// (dojo/_base/declare)
				 dDomStyle,		// (dojo/dom-style) for (dDomStyle.set)
				 dDomGeo,		// (dojo/dom-geometry) for (dDomGeo.getMarginBox)
				 iUtil,			// (../util)
				 iBorderDesign)	// (./BorderDesign) 
{
	/**
	 * Utility module for helping widgets that wish to use a border-container layout.
	 * This module allows you to create an instance and set the nodes that represent
	 * the various regions.  It also provides more border layout options that the 
	 * standard border container (see idx.border.BorderDesign)
	 */
return dDeclare("idx.border.BorderLayout", null, 
		/**@lends idx.border.BorderDesign#*/								
{
  // summary:
  //        Encapsulates the logic for laying out a border-style widget.

  // design:
  //        The idx.border.BorderDesign describing the type of
  //        border layout being employed.
  design: null,

  // frameNode:
  //        The node representing the outer frame of the border.
  frameNode: null,

  // topNode:
  //        The node representing the top region of the border.
  topNode: null,

  // bottomNode:
  //        The node representing the bottom region of the border.
  bottomNode: null,

  // leftNode:
  //        The node representing the left region of the border.
  leftNode: null,

  // rightNode:
  //        The node representing the right region of the border.
  rightNode: null,

  // centerNode:
  //        The node representing the center region of the border.
  centerNode: null,

  constructor: function(args) {
    // summary:
    //      Constructs with the specified arguments.
    //
    this.design = (args.design instanceof iBorderDesign)
                  ? args.design
                  : new iBorderDesign(args.design, args.leftToRight);

    this.frameNode  = args.frameNode;
    this.topNode    = args.topNode;
    this.bottomNode = args.bottomNode;
    this.leftNode   = args.leftNode;
    this.rightNode  = args.rightNode;
    this.centerNode = args.centerNode;

    // apply the base styling
    var borderStyle = { position: "absolute", margin: "0px" };
    this.style(this.topNode,    borderStyle);
    this.style(this.bottomNode, borderStyle);
    this.style(this.leftNode,   borderStyle);
    this.style(this.rightNode,  borderStyle);

    // require the center node and frame node
    dDomStyle.set(this.centerNode, borderStyle);

    this._nodeLookup = {
      header: this.topNode,
      top: this.topNode,
      left: this.leftNode,
      center: this.centerNode,
      right: this.rightNode,
      footer: this.bottomNode,
      bottom: this.bottomNode
    };

    if (args.leftToRight != null) {
      this._nodeLookup.leader = (args.leftToRight) ? this.leftNode : this.rightNode;
      this._nodeLookup.trailer = (args.leftToRight) ? this.rightNode : this.leftNode;
    }
  },

  style: function(node, style) {
    if (! node) return;
    dDomStyle.set(node, style);
  },

  marginBox: function(node) {
    if (! node) return {w:0,h:0};
    return dDomGeo.getMarginBox(node);
  },

  layout: function() {
    // summary:
    //      Handles layout of the border regions.
    //
    var tbox   = this.marginBox(this.topNode);
    var lbox   = this.marginBox(this.leftNode);
    var rbox   = this.marginBox(this.rightNode);
    var bbox   = this.marginBox(this.bottomNode);

    var cstyle = { left: lbox.w + "px",
                   right: rbox.w + "px",
                   top: tbox.h + "px",
                   bottom: bbox.h + "px" };

    this.style(this.centerNode, cstyle);

    for (edge in cstyle) {
      var styling = { };
      var node    = this._nodeLookup[edge];

      var styler  = this.design[edge + "Styler"];

      for (side in styler) {      
        var offset = styler[side];
        if (cstyle[offset]) offset = cstyle[offset];
        styling[side] = offset;
      }

      this.style(node, styling);
    }
  },

  setOptimalWidth: function(/*Boolean*/ excludeCenter) {
    var width = this.computeOptimalWidth(excludeCenter);
    dDomStyle.set(this.centerNode, {width: ""});
    dDomStyle.set(this.frameNode, {width: width + "px"});
    this.layout();
  },

  computeOptimalWidth: function(/*Boolean*/ excludeCenter) {
    var wideners = this.design.wideners;
    var idx1     = 0;
    var maxWidth = 0;
    for (idx1 = 0; idx1 < wideners.length; idx1++) {
      var idx2 = 0;
      var regions = wideners[idx1];
      if (excludeCenter && (regions.length > 0)
          && (regions[0] == "center")) {
        continue;
      }
      var width = 0;
      for (idx2 = 0; idx2 < regions.length; idx2++) {
        var node = this._nodeLookup[regions[idx2]];
        if (! node) continue;
        var dim = iUtil.getStaticSize(node);
        width += dim.w;
      }
      if (width > maxWidth) maxWidth = width;
    }
    return maxWidth;
  },

  setOptimalHeight: function(/*Boolean*/ excludeCenter) {
    var height = this.computeOptimalHeight(excludeCenter);
    dDomStyle.set(this.centerNode, {height: ""});
    dDomStyle.set(this.frameNode, {height: height + "px"});
    this.layout();
  },

  computeOptimalHeight: function(/*Boolean*/ excludeCenter) {
    var heighteners = this.design.heighteners;
    var idx1     = 0;
    var maxHeight = 0;
    for (idx1 = 0; idx1 < heighteners.length; idx1++) {
      var idx2 = 0;
      var regions = heighteners[idx1];
      if (excludeCenter && (regions.length > 0)
          && (regions[0] == "center")) {
        continue;
      }
      var height = 0;
      for (idx2 = 0; idx2 < regions.length; idx2++) {
        var node = this._nodeLookup[regions[idx2]];
        if (! node) continue;
        var dim = iUtil.getStaticSize(node);
        height += dim.h;
      }
      if (height > maxHeight) maxHeight = height;
    }
    return height;
  },

  setOptimalSize: function() {
    var width  = this.computeOptimalWidth();
    var height = this.computeOptimalHeight();
    dDomStyle.set(this.centerNode, {height: "", width: ""});
    dDomStyle.set(this.frameNode, {width: width + "px", height: height + "px"});
    this.layout();
  }
});
}

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){

	dojo.provide("idx.border.BorderLayout");

	dojo.require("idx.border.BorderDesign");

	dojo.require("dojo.parser");
	dojo.require("dijit._Widget");

	factory(dojo.declare,{set:dojo.style},{getMarginBox: dojo.marginBox},idx.util,idx.border.BorderDesign);
	
} else {
	define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/declare","../../../../node_modules/intern-geezer/node_modules/dojo/dom-style","dojo/dom-geometry","../util","./BorderDesign"],
			factory);
}

})();