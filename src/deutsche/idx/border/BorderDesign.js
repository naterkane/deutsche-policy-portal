(function() {
	
function factory(dDeclare,dLang) {
	var _ltrLookup = {
			  leaderbar: "leftbar",
			  trailerbar: "rightbar",
			  leaderclock: "leftclock",
			  leadercounter: "leftcounter",
			  trailerclock: "rightclock",
			  trailercounter: "rightcounter"
	};

	var _rtlLookup = {
			  leaderbar: "rightbar",
			  trailerbar: "leftbar",
			  leaderclock: "rightclock",
			  leadercounter: "rightcounter",
			  trailerclock: "leftclock",
			  trailercounter: "leftcounter"
	};

	var _lookup = {
			  headline: {
			    topStyler:    {left: "0px", right: "0px", top: "0px", bottom: "auto"},
			    leftStyler:   {left: "0px", right: "auto", top: "top", bottom: "bottom"},
			    rightStyler:  {left: "auto", right: "0px", top: "top", bottom: "bottom" },
			    bottomStyler: {left: "0px", right: "0px", top: "auto", bottom: "0px"},
			    heighteners: [ ["top", "left", "bottom"],
			                   ["top", "right", "bottom"],
			                   ["center", "top", "bottom"] ],
			    wideners: [ ["top"],
			                ["bottom"],
			                ["center", "left", "right"] ] },

			  sidebar: {
			    topStyler:    {left: "left", right: "right", top: "0px", bottom: "auto"},
			    leftStyler:   {left: "0px", right: "auto", top: "0px", bottom: "0px"},
			    rightStyler:  {left: "auto", right: "0px", top: "0px", bottom: "0px" },
			    bottomStyler: {left: "left", right: "right", top: "auto", bottom: "0px"},
			    heighteners: [ ["left" ],
			                   ["right" ],
			                   ["center", "top", "bottom"] ],
			    wideners: [ ["left", "top", "right"],
			                ["left", "bottom", "right"],
			                ["center", "left", "right"] ] },

			  topline: {
			    topStyler:    {left: "0px", right: "0px", top: "0px", bottom: "auto"},
			    leftStyler:   {left: "0px", right: "auto", top: "top", bottom: "0px"},
			    rightStyler:  {left: "auto", right: "0px", top: "top", bottom: "0px" },
			    bottomStyler: {left: "left", right: "right", top: "auto", bottom: "0px"},
			    heighteners: [ ["left", "top" ],
			                   ["right", "top" ],
			                   ["center", "top", "bottom"] ],
			    wideners: [ ["top"],
			                ["left", "bottom", "right"],
			                ["center", "left", "right"] ] },

			  bottomline: {
			    topStyler:    {left: "left", right: "right", top: "0px", bottom: "auto"},
			    leftStyler:   {left: "0px", right: "auto", top: "0px", bottom: "bottom"},
			    rightStyler:  {left: "auto", right: "0px", top: "0px", bottom: "bottom" },
			    bottomStyler: {left: "0px", right: "0px", top: "auto", bottom: "0px"},
			    heighteners: [ ["left", "bottom" ],
			                   ["right", "bottom" ],
			                   ["center", "top", "bottom"] ],
			    wideners: [ ["bottom"],
			                ["left", "top", "right"],
			                ["center", "left", "right"] ] },

			  leftbar: {
			    topStyler:    {left: "left", right: "0px", top: "0px", bottom: "auto"},
			    leftStyler:   {left: "0px", right: "auto", top: "0px", bottom: "0px"},
			    rightStyler:  {left: "auto", right: "0px", top: "top", bottom: "bottom" },
			    bottomStyler: {left: "left", right: "0px", top: "auto", bottom: "0px"},
			    heighteners: [ ["left" ],
			                   ["top", "right", "bottom" ],
			                   ["center", "top", "bottom"] ],
			    wideners: [ ["left", "top"],
			                ["left", "bottom"],
			                ["center", "left", "right"] ] },

			  rightbar: {
			    topStyler:    {left: "0px", right: "right", top: "0px", bottom: "auto"},
			    leftStyler:   {left: "0px", right: "auto", top: "top", bottom: "bottom"},
			    rightStyler:  {left: "auto", right: "0px", top: "0px", bottom: "0px" },
			    bottomStyler: {left: "0px", right: "right", top: "auto", bottom: "0px"},
			    heighteners: [ ["right" ],
			                   ["top", "left", "bottom" ],
			                   ["center", "top", "bottom"] ],
			    wideners: [ ["right", "top"],
			                ["right", "bottom"],
			                ["center", "left", "right"] ] },

			  clockwise: {
			    topStyler:    {left: "left", right: "0px", top: "0px", bottom: "auto"},
			    leftStyler:   {left: "0px", right: "auto", top: "0px", bottom: "bottom"},
			    rightStyler:  {left: "auto", right: "0px", top: "top", bottom: "0px" },
			    bottomStyler: {left: "0px", right: "right", top: "auto", bottom: "0px"},
			    heighteners: [ ["left", "bottom" ],
			                   ["right", "top" ],
			                   ["center", "top", "bottom"] ],
			    wideners: [ ["right", "bottom"],
			                ["left", "top"],
			                ["center", "left", "right"] ] },

			  counterclock: {
			    topStyler:    {left: "0px", right: "right", top: "0px", bottom: "auto"},
			    leftStyler:   {left: "0px", right: "auto", top: "top", bottom: "0px"},
			    rightStyler:  {left: "auto", right: "0px", top: "0px", bottom: "bottom" },
			    bottomStyler: {left: "left", right: "0px", top: "auto", bottom: "0px"},
			    heighteners: [ ["left", "top" ],
			                   ["right", "bottom" ],
			                   ["center", "top", "bottom"] ],
			    wideners: [ ["right", "top"],
			                ["left", "bottom"],
			                ["center", "left", "right"] ] },

			  topclock: {
			    topStyler:    {left: "0px", right: "0px", top: "0px", bottom: "auto"},
			    leftStyler:   {left: "0px", right: "auto", top: "top", bottom: "bottom"},
			    rightStyler:  {left: "auto", right: "0px", top: "top", bottom: "0px" },
			    bottomStyler: {left: "0px", right: "right", top: "auto", bottom: "0px"},
			    heighteners: [ ["right", "top" ],
			                   ["left", "top", "bottom" ],
			                   ["center", "top", "bottom"] ],
			    wideners: [ ["top"],
			                ["right", "bottom"],
			                ["center", "left", "right"] ] },

			  topcounter: {
			    topStyler:    {left: "0px", right: "0px", top: "0px", bottom: "auto"},
			    leftStyler:   {left: "0px", right: "auto", top: "top", bottom: "0px"},
			    rightStyler:  {left: "auto", right: "0px", top: "top", bottom: "bottom" },
			    bottomStyler: {left: "left", right: "0px", top: "auto", bottom: "0px"},
			    heighteners: [ ["left", "top" ],
			                   ["right", "bottom", "top" ],
			                   ["center", "top", "bottom"] ],
			    wideners: [ ["top"],
			                ["left", "bottom"],
			                ["center", "left", "right"] ] },

			  bottomclock: {
			    topStyler:    {left: "left", right: "0px", top: "0px", bottom: "auto"},
			    leftStyler:   {left: "0px", right: "auto", top: "0px", bottom: "bottom"},
			    rightStyler:  {left: "auto", right: "0px", top: "top", bottom: "bottom" },
			    bottomStyler: {left: "0px", right: "0px", top: "auto", bottom: "0px"},
			    heighteners: [ ["left", "bottom" ],
			                   ["right", "bottom", "top" ],
			                   ["center", "top", "bottom"] ],
			    wideners: [ ["bottom"],
			                ["left", "top"],
			                ["center", "left", "right"] ] },

			  botttomcounter: {
			    topStyler:    {left: "0px", right: "right", top: "0px", bottom: "auto"},
			    leftStyler:   {left: "0px", right: "auto", top: "top", bottom: "bottom"},
			    rightStyler:  {left: "auto", right: "0px", top: "0px", bottom: "bottom" },
			    bottomStyler: {left: "0px", right: "0px", top: "auto", bottom: "0px"},
			    heighteners: [ ["right", "bottom" ],
			                   ["left", "bottom", "top"],
			                   ["center", "top", "bottom"] ],
			    wideners: [ ["bottom"],
			                ["right", "top"],
			                ["center", "left", "right"] ] },

			  leftclock: {
			    topStyler:    {left: "left", right: "0px", top: "0px", bottom: "auto"},
			    leftStyler:   {left: "0px", right: "auto", top: "0px", bottom: "0px"},
			    rightStyler:  {left: "auto", right: "0px", top: "top", bottom: "0px" },
			    bottomStyler: {left: "left", right: "right", top: "auto", bottom: "0px"},
			    heighteners: [ ["left" ],
			                   ["right", "top" ],
			                   ["center", "top", "bottom"] ],
			    wideners: [ ["left", "top"],
			                ["left", "right", "bottom"],
			                ["center", "left", "right"] ] },

			  leftcounter: {
			    topStyler:    {left: "left", right: "right", top: "0px", bottom: "auto"},
			    leftStyler:   {left: "0px", right: "auto", top: "0px", bottom: "0px"},
			    rightStyler:  {left: "auto", right: "0px", top: "0px", bottom: "bottom" },
			    bottomStyler: {left: "left", right: "0px", top: "auto", bottom: "0px"},
			    heighteners: [ ["left" ],
			                   ["right", "bottom" ],
			                   ["center", "top", "bottom"] ],
			    wideners: [ ["left", "bottom"],
			                ["right", "top", "right"],
			                ["center", "left", "right"] ] },

			  rightclock: {
			    topStyler:    {left: "left", right: "right", top: "0px", bottom: "auto"},
			    leftStyler:   {left: "0px", right: "auto", top: "0px", bottom: "bottom"},
			    rightStyler:  {left: "auto", right: "0px", top: "0px", bottom: "0px" },
			    bottomStyler: {left: "0px", right: "right", top: "auto", bottom: "0px"},
			    heighteners: [ ["right" ],
			                   ["left", "bottom" ],
			                   ["center", "top", "bottom"] ],
			    wideners: [ ["right", "bottom"],
			                ["right", "left", "top"],
			                ["center", "left", "right"] ] },

			  rightcounter: {
			    topStyler:    {left: "0px", right: "right", top: "0px", bottom: "auto"},
			    leftStyler:   {left: "0px", right: "auto", top: "top", bottom: "0px"},
			    rightStyler:  {left: "auto", right: "0px", top: "0px", bottom: "0px" },
			    bottomStyler: {left: "left", right: "right", top: "auto", bottom: "0px"},
			    heighteners: [ ["right" ],
			                   ["left", "top" ],
			                   ["center", "top", "bottom"] ],
			    wideners: [ ["right", "top"],
			                ["right", "left", "bottom"],
			                ["center", "left", "right"] ] }
	};
	
	/** 
	 * Encapsulates the meta-data used to render the various
	 * 	 border design modes for border layouts.  The recognized
	 *	  border designs are:
	 * - headline
     * - sidebar
     * - topline
     * - bottomline
     * - leftbar
     * - rightbar
     * - clockwise
     * - counterclock
     * - topclock
     * - topcounter
     * - bottomclock
     * - bottomcounter
     * - leftclock
     * - leftcounter
     * - rightclock
     * - rightcounter
     *
     * If the right-to-left mode is specified then the following
     *  names are also recognized:
     * - leaderbar
     * - trailerbar
     * - leaderclock
     * - leadercounter
     * - trailerclock
     * - trailercounter
	 */
	var BorderDesign = dDeclare("idx.border.BorderDesign", null,
			/**@lends idx.border.BorderDesign#*/						
{
  // topStyler:
  //      The array indicating how to style the top region,
  topStyler: null,

  // leftStyler:
  //      The array indicating how to style the left region,
  leftStyler: null,

  // rightStyler:
  //      The array indicating how to style the right region,
  rightStyler: null,

  // bottomStyler:
  //      The array indicating how to style the bottom region,
  bottomStyler: null,

  // heighteners:
  //      The array indicating which components can make the height.
  heighteners: null,

  // wideners:
  //      The array indicating which components can make the width.
  wideners: null,

  constructor: function(/*String*/ name, /*Boolean?*/ leftToRight) {
      // summary:
      //      Constructs a new instance with the specified name.
      //
      // name:
      //      The name of the border design.
      //
      // leftToRight:
      //      If specified then the specified name may use the "leader" and "trailer"
      //      variants and a lookup is performed.  If not specified then the "leader"
      //      and "trailer" names are not allowed.
    this.name = name;

    if (leftToRight != null) {
      var lookup = (leftToRight) ? _ltrLookup : _rtlLookup;
      if (name in lookup) name = lookup[name];
    }

    var args = _lookup[name];
    if (!args) {
      throw new Error(this.declaredClass + ": Unrecognized BorderDesign name: " + name);
    }
    this.topStyler    = dLang.clone(args.topStyler);
    this.leftStyler   = dLang.clone(args.leftStyler);
    this.rightStyler  = dLang.clone(args.rightStyler);
    this.bottomStyler = dLang.clone(args.bottomStyler);
    this.heighteners  = dLang.clone(args.heighteners);
    this.wideners     = dLang.clone(args.wideners);
  }
});
	
	BorderDesign._lookup = _lookup;
	BorderDesign._ltrLookup = _ltrLookup;
	BorderDesign._rtlLookup = _rtlLookup;
	
	BorderDesign.create = function(/*String*/ name,  /*Boolean?*/ leftToRight) {
		// summary:
		//      Similar to the constructor, but if a bad name
		//      is provided then null is returned.
		//	
		// name:
		//      The name of the border design.
		//
		// leftToRight:
		//      If specified then the specified name may use the "leader" and "trailer"
		//      variants and a lookup is performed.  If not specified then the "leader"
		//      and "trailer" names are not allowed.
		try {
			var bd = new BorderDesign(name, leftToRight);
			return bd;
		} catch (e) {
			return null;
		}
	};

	return BorderDesign;
}

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){

	dojo.provide("idx.border.BorderDesign");

	dojo.require("dojo.parser");

	factory(dojo.declare,dojo);

} else {
	define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	        "../../../../dist/lib/dojo/_base/lang"],
	        factory);
}

})();
