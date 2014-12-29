(function(){

var factory = function(dojo_declare, dojo_array, dijit_Widget, dijit_Container, dijit_Templated, dijit_form_DropDownButton, dijit_form_Button, dijit_Menu, dijit_MenuItem, templateString){

/**
 * @name idx.widget.Banner
 * @class Application banner with built-in and custom links.
 * @augments dijit._Widget
 * @augments dijit._Container
 * @augments dijit._Templated
 */
return dojo_declare("idx.widget.Banner", [ dijit_Widget, dijit_Container, dijit_Templated ],
/** @lends idx.widget.Banner# */
{

	templateString: templateString,

	widgetsInTemplate: true,

	/**
	 * Label string for username.
	 * 
	 * @type String
	 * @default ""
	 */
	usernameLabel: "",

	/**
	 * Username.
	 * 
	 * @type String
	 * @default ""
	 */
	username: "",

	/**
	 * Label string for log out link.
	 * 
	 * @type String
	 * @default "Log Out"
	 */
	logoutLabel: "Log Out",

	/**
	 * Function to call when the user clicks the log out menu item.
	 * 
	 * @type function
	 * @default null
	 */
	logoutFunc: null,

	/**
	 * Label string for help link.
	 * 
	 * @type String
	 * @default "Help"
	 */
	helpLabel: "Help",

	/**
	 * Function to call when the user clicks the help button.
	 * 
	 * @type function
	 * @default null
	 */
	helpFunc: null,

	/**
	 * Label string for about link.
	 * 
	 * @type String
	 * @default "About"
	 */
	aboutLabel: "About",

	/**
	 * Function to call when the user clicks the about menu item.
	 * 
	 * @type function
	 * @default null
	 */
	aboutFunc: null,

	/**
	 * Creates a trailer section.
	 */
	buildRendering: function() {
		this.inherited(arguments);
		this._createMenu();
	},

	/**
	 * Creates a trailer section.
	 * 
	 * @private
	 */
	_createMenu: function() {
		if (this.username) {
			var self = this;

			if (this.logoutFunc) {
				var actionMenuItem = new dijit_MenuItem({
					label: this.logoutLabel,
					onClick: this.logoutFunc
				});
				this.actionsMenu.addChild(actionMenuItem);
			}

			if (this.aboutFunc) {
				var actionMenuItem = new dijit_MenuItem({
					label: this.aboutLabel,
					onClick: this.aboutFunc
				});
				this.actionsMenu.addChild(actionMenuItem);
			}

			if (this.helpFunc) {
				this.helpButton.onClick = this.helpFunc;
			}
		}
	},

	/**
	 * Adds items to the action menu drop-down.
	 * 
	 * @param actionMenusItems 
	 *				An array of dijit.MenuItem objects to add to the action menu drop-down.
	 */
	addMenuItems: function(actionMenusItems) {
		if (actionMenusItems && actionMenusItems.length > 0) {
			var self = this;

			dojo_array.forEach(actionMenusItems, function(actionMenuItem) {
				self.actionsMenu.addChild(actionMenuItem);
			});
		}
	}
});

}; // end of factory

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
	dojo.provide("idx.widget.Banner");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Container");
	dojo.require("dijit._Templated");
	dojo.require("dijit.form.DropDownButton");
	dojo.require("dijit.form.Button");
	dojo.require("dijit.Menu");
	dojo.require("dijit.MenuItem");
	var templateString = dojo.cache("idx.widget", "templates/Banner.html");
	factory(dojo.declare, dojo, dijit._Widget, dijit._Container, dijit._Templated, dijit.form.DropDownButton, dijit.form.Button, dijit.Menu, dijit.MenuItem, templateString);
}else{
	define([
		"../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
		"../../../../node_modules/intern-geezer/node_modules/dojo/_base/array",
		"dijit/_Widget",
		"dijit/_Container",
		"dijit/_Templated",
		"dijit/form/DropDownButton",
		"dijit/form/Button",
		"dijit/Menu",
		"dijit/MenuItem",
		"dojo/text!./templates/Banner.html"
	], factory);
}

})();
