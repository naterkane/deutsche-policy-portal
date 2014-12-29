/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/declare"],
        function(declare){
    
	// Ensure we're not relying on the old globals, ready for 2.0.
	var dojo = {}, dijit = {};

  
	/**
	 * Creates a new idx.oneui._MenuOpenOnHoverMixin
	 * @name idx.oneui._MenuOpenOnHoverMixin
	 * @class This mix-in can be mixed into menus and menu bars to make them
	 * permanently active so that their drop down and cascade menus are
	 * activated by mouse hover without the need for the menu or menu bar to
	 * be clicked on first.
	 */
	return declare("idx.oneui._MenuOpenOnHoverMixin", null,
	/** @lends idx.oneui._MenuOpenOnHoverMixin.prototype */
	{
		/**
		 * If true, this menu / menu bar will open popup menu items when they
		 * are hovered over at any time. This is in addition to the usual
		 * mouse-click and key activations, which continue to work as
		 * usual. If false, the menu / menu bar will still open popup menu
		 * items on hover when it is "active" (ie, when the user is in the
		 * process of interacting with it), but will NOT open popup menu
		 * items on hover when the menu is inactive: only mouse-click and
		 * key activations work in this case. The default value is true,
		 * enabling menus to be activated by hover.
		 * @type boolean
		 */
		openOnHover: true,

		/**
		 * Used internally to track our true activation state, because when
		 * openOnHover is on we never allow ourselves to become inactive even
		 * when we normally would.
		 * @type boolean
		 */
		_isActuallyActive: false,

		/**
		 * Standard Dojo setter for handling the 'opnOnHover' property via calls to 
		 * set().
		 * @param {Object} newvalue
		 */
		_setOpenOnHoverAttr: function(newvalue){
			this.openOnHover = newvalue;
			if(newvalue){
				this._forceActive();
			}else{
				this._restoreActive();
			}
		},
			
		/**
		 * Keep track of our 'actual' active state.
		 */
		_markActive: function(){
			this.inherited(arguments);
			this._isActuallyActive = true;
		},

		/**
		 * Keep track of our 'actual' active state, but when open-on-hover
		 * is enabled prevent us becoming inactive even when we normally would.
		 */		
		_markInactive: function(){
			if(!this.openOnHover){
				this.inherited(arguments);
			}
			this._isActuallyActive = false;
		},
		
		/**
		 * Mark the menubar as active regardless of whether it 'actually' is,
		 * but preserve our memory of our 'actual' active state.
		 */
		_forceActive: function(){
			var actual = this._isActuallyActive;
			this._markActive();
			this._isActuallyActive = actual;
		},
		
		/**
		 * Return to our 'actual' active state after a force.
		 */
		_restoreActive: function(){
			if(this._isActuallyActive){
				this._markActive();
			}else{
				this._markInactive();
			}
		}

	});
});