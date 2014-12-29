/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */
(function()
{
function factory(dDeclare,		// (dojo/_base/declare)
				 dLang,			// (dojo/_base/lang)
		         dWidget,		// (dijit/_Widget)
		         dTemplated,	// (dijit/_Templated)
		         dQuery,		// (dojo/query)
		         dDomStyle,		// (dojo/dom-style) for (dDomStyle.set)
		         templateText)	// (dojo/text!./templates/LoginFrame.html) 
{
	/**
	 * @name idx.app.LoginFrame
	 * @class The LoginFrame provides the standard login screen.
	 * @augments dijit._Widget
	 * @augments dijit._Templated
	 * 
	 */
return dDeclare("idx.app.LoginFrame", [dWidget,dTemplated],
		  /**@lends idx.app.LoginFrame#*/		
{
  baseClass: "idxLoginFrame",

  /**
   * The path to the widget template for the dijit._Templated base class.
   * 
   * @private
   * @constant
   * @type String
   */
  templateString: templateText,

 
  widgetsInTemplate: true,
  
  /** 
   * Allow users to add other components (e.g. hidden fields) under password field
   * 
   * @private
   */
  isContainer: true,

  /**
   * Title to be displayed above the login form.
   * 
   * @type String
   */
  loginTitle: "Login",
  
  /**
   * Subtitle to be displayed immediately beneath {@link idx.app.LoginFrame#loginTitle}
   * 
   * @type String
   */
  loginSubTitle: "Please enter your information",
  
  /**
   * The character sequence to use as a label separator.  Typically a colon (":") in the en_us locale. 
   */
  labelSeparator: ":",
  
  /**
   * 
   */
  _setLabelSeparatorAttr: function(value) {
	this.labelSeparator = value;
	var separator = this.labelSeparator;
	if (this.domNode) {
		dQuery(".idxLoginSeparator", this.domNode).forEach(function (node,index,nodeList) {
			node.innerHTML = separator;
		});
	}
  },
  
  /**
   * Label that corresponds to the first text field in the form.
   * 
   * @type String
   * @default User name:
   */
  labelUserName: "User name",
  
  /**
   * Label that corresponds to the second text field in the form.
   * 
   * @type String
   * @default Password:
   */
  labelPassword: "Password",
  
  /**
   * Map the label attributes.
   */
  attributeMap: dLang.delegate(dWidget.prototype.attributeMap, {
	    labelUserName: {node: "userNameLabelNode", type: "innerHTML"},
		labelPassword: {node: "passwordLabelNode", type: "innerHTML"},
		inactivityMessage: {node: "inactivityMessageNode", type: "innerHTML"},
		loginTitle: {node: "loginTitleNode", type: "innerHTML"},
		loginSubTitle: {node: "loginSubtitleNode", type: "innerHTML"},
		loginCopyright: {node: "copyrightNode", type: "innerHTML"},
		invalidMessage: {node: "invalidMessageNode", type: "innerHTML"}
  }),
  
  /**
   * Informational message to be displayed directly above the form's buttons.
   * 
   * @type String
   * @default Please note, after some time of inactivity, the system will sign you out automatically and ask you to sign in again.
   */
  inactivityMessage: "Please note, after some time of inactivity, the system will sign you out automatically and ask you to sign in again.",
  
  /**
   * Copyright statement to be displayed below the form.
   * 
   * @type String
   */
  loginCopyright: "Licensed Materials - Property of IBM Corp, IBM Corporation and other(s) 2011. IBM is a registered trademark of IBM Corporation, in the United States, other countries, or both.",
  
  /**
   * Label to be displayed on the submission/login button.
   * 
   * @type String
   * @default Login
   */
  labelSubmitButton: "Login",
  
  /**
   * 
   */
  _setLabelSubmitButtonAttr: function(value) {
	  this.labelSubmitButton = value;
	  this.loginButton.set("label", this.labelSubmitButton);
  },
  
  /**
   * Error message to be displayed when required input
   * user name or password is empty or blank.
   * @type String
   * @default A valid value has not been entered in both required fields."
   */
  invalidMessage: "A valid value has not been entered in both required fields.",
  
  /**
   * Error message dialog title when login button clicked 
   * with invalid username or password.
   * @type String
   * @default Invalid Login Attempt."
   */
  invalidMessageTitle: "Invalid Login Attempt",
  
  /**
   * 
   */
  _setInvalidMessageTitleAttr: function(value) {
	  this.invalidMessageTitle = value;
	  this.invalidLoginDialog.set("title", this.invalidMessageTitle);	  
  },
  
  /**
   * Error dialog OK button label
   * @type String
   * @default "OK" 
   */
  labelOkButton: "OK",
  
  /**
   * 
   */
  _setLabelOkButtonAttr: function(value) {
	  this.labelOkButton = value;
	  this.dialogOKButton.set("label", value);
  },
  
  /**
   * Regular expression for user name and password 
   * validation that user can override.
   * @type String
   * @default  ".*" 
   */
  regExp: ".*", // to restrict to numbers,letters and underscore, use "[\w]+"
  
  /**
   * Message to be displayed on the cancel button.
   * 
   * @type String
   * @default Cancel
   */
  labelCancelButton: "Cancel",
  
  /**
   * 
   */
  _setLabelCancelButtonAttr: function(value) {
	  this.labelCancelButton = value;
	  this.cancelButton.set("label", this.labelCancelButton);
  },
  
  /**
   * Specifies whether this LoginFrame should include a Cancel button
   * @type boolean
   * @default false
   */
  showCancelButton: false,

  _setShowCancelButtonAttr: function(b)
  {
      if(b)
      {
          dDomStyle.set(this.cancelButton.domNode,{visibility:"visible",display:"inline"});
      }
      else
      {
          dDomStyle.set(this.cancelButton.domNode,{visibility:"hidden",display:"none"});
      }
  },
  
  /**
   * Called when login button pressed
   * Calls user 'onSubmit' method after
   * trimming fields. Displays error message
   * if fields invalid.
   * @param {Event} e
   */
  _onSubmitClick: function(/*Event*/ e)
  {
	  // Do some validation here before continuing 
	  // Trim fields and display error dialog if invalid
	  // Caller could have specified their own regExp for additional validation
	  var name = this.loginUserName.value;
	  if(name && name != "") {
		  name = name.replace(/^\s+|\s+$/g, '');
		  this.loginUserName.set("value",name) ; // remove leading/trailing blanks
	  }
	  var pwd  = this.loginPassword.value;
	  if(pwd && pwd != "") {
		  pwd = pwd.replace(/^\s+|\s+$/g, '');
		  this.loginPassword.set("value",pwd) ; // remove leading/trailing blanks
	  }
  
	  //force validation to show error icon if invalid (in case user hasn't already clicked in and out of field defect #5876)
	  var isPasswordValid = this.loginPassword.isValid();
	  if( !isPasswordValid )
	  {
	    //note: validate() wouldn't update styling if field was not in focus, so forcing focus to field first
	      this.loginPassword.focus();
	      this.loginPassword.validate(true);
	  }
      
	  var isUserNameValid = this.loginUserName.isValid();
	  if( !isUserNameValid )
      {
	      this.loginUserName.focus();
	      this.loginUserName.validate(true);
      }
	  
	  if( !isUserNameValid || !isPasswordValid ) this.invalidLoginDialog.show();
	  else return this.onSubmit(this.loginUserName.value,this.loginPassword.value,this.loginForm);
  },

  /**
   *  Callback function when the end-user clicks the submit/login button. Users of this class
   *  should override this function to provide intended submission behavior
   *
   * @param {String} username The username that was entered
   * @param {String} password The password that was entered
   */
  onSubmit: function(/*String*/ username, /*String*/ password)
  {
  },
  
  _onCancelClick: function(/*Event*/ e)
  {	  
	  return this.onCancel();
  },
  
  /**
   *  Callback function when the end-user clicks the cancel button.  Users of this class should
   *  override this function to provide intended cancel behavior
   */
  onCancel: function()
  {

  }
});
}

var version = (window["dojo"] && dojo.version);
if (version && version.major == 1 && version.minor == 6) {
	dojo.provide("idx.app.LoginFrame");
	dojo.require("dijit._Widget");
	dojo.require("dijit._Templated");
	dojo.require("dijit.form.Form");
	dojo.require("dijit.form.Button");
	dojo.require("dijit.form.ValidationTextBox");
	dojo.require("dijit.Dialog");

	var templateTxt = dojo.cache("idx", "app/templates/LoginFrame.html"); 

	factory(dojo.declare,dojo,dijit._Widget,dijit._Templated,dojo.query,{set:dojo.style},templateTxt);					

} else {
	define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	        "../../../../dist/lib/dojo/_base/lang",
	        "dijit/_Widget",
	        "dijit/_Templated",
	        "dojo/query",
	        "dojo/dom-style",
	        "dojo/text!./templates/LoginFrame.html",
	        "dijit/form/Form",
	        "dijit/form/Button",
	        "dijit/form/ValidationTextBox",
	        "dijit/Dialog"],
	        factory);
}
})();
