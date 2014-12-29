/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
		"../../../../dist/lib/dijit/MenuSeparator",
		"dojo/text!../oneui/templates/MenuHeading.html"],
		function(declare,
				 MenuSeparator,
				 template){
	/**
	 * Creates a new idx.oneui.MenuHeading
	 * @name idx.oneui.MenuHeading
	 * @class The MenuHeading widget provides a non-selectable, full-width menu entry
	 * suitable for labelling groups of menu items.
	 * @augments dijit.MenuSeparator
	 * @example &lt;div data-dojo-type="idx.oneui.Menu"&gt;
  &lt;div data-dojo-type="idx.oneui.MenuHeading"
       data-dojo-props="column:'0',<span class="highlitCode">label:'Column #0'</span>"&gt;
  &lt;/div&gt;
    ...
&lt;/div&gt;
	 */
	return declare("idx.oneui.MenuHeading", [MenuSeparator], 
	/** @lends idx.oneui.MenuHeading.prototype */
	{
		/**
		 * The text and markup to display in the item.
		 * @type string
		 */		
		label: '',
		
		/**
		 * Standard Dojo setter config for handling the 'label' property via calls to 
		 * set().
		 * @constant
		 * @type Object
		 */
		_setLabelAttr: { node: "containerNode", type: "innerHTML" },

		/**
	 	 * The template HTML for the widget.
		 * @constant
		 * @type string
		 * @private
		 * @default Loaded from idx/oneui/templates/MenuHeading.html.
		 */
		templateString: template

	});
});
