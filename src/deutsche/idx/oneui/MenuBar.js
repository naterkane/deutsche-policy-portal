/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
		"../../../../dist/lib/dijit/MenuBar",
    "idx/oneui/_MenuOpenOnHoverMixin"],
		function(declare,
				 MenuBar,
         _MenuOpenOnHoverMixin){
	/**
	 * Creates an idx.oneui.MenuBar
	 * @name idx.oneui.MenuBar
	 * @class The MenuBar widget provides a menu bar with open-on-hover behaviour.
	 * @augments dijit.MenuBar
	 * @augments idx.oneui._MenuOpenOnHoverMixin
	 * @borrows idx.oneui._MenuOpenOnHoverMixin#openOnHover as this.openOnHover
	 * @example &lt;div data-dojo-type="idx.oneui.MenuBar"&gt;
  &lt;div data-dojo-type="dijit.PopupMenuBarItem"&gt;
    &lt;span&gt;Edit&lt;/span&gt;
    &lt;div data-dojo-type="idx.oneui.Menu"&gt;
      &lt;div data-dojo-type="dijit.MenuItem" onclick="..."&gt;Cut&lt;/div&gt;
      &lt;div data-dojo-type="dijit.MenuItem" onclick="..."&gt;Copy&lt;/div&gt;
      &lt;div data-dojo-type="dijit.MenuItem" onclick="..."&gt;Paste&lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/div&gt;
	 */
	return declare("idx.oneui.MenuBar", [MenuBar, _MenuOpenOnHoverMixin], 
	/** @lends idx.oneui.MenuBar.prototype */
	{
	});
	
});
