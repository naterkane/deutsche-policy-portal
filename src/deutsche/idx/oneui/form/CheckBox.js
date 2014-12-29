/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	"../../../../lib/dijit/form/CheckBox",
	"../_CssStateMixin",
	"./_CompositeMixin",
	"./_ValidationMixin",
	"dojo/text!./templates/CheckBox.html"
], function(declare, CheckBox, _CssStateMixin, _CompositeMixin, _ValidationMixin, template){
	/**
	 * @name idx.oneui.form.CheckBox
	 * @class One UI version CheckBox
	 * @augments dijit.form.CheckBox
	 * @augments idx.oneui._CssStateMixin
	 * @augments idx.oneui.form._CompositeMixin
	 * @augments idx.oneui.form._ValidationMixin
	 */
	return declare("idx.oneui.form.CheckBox", [CheckBox, _CssStateMixin, _CompositeMixin, _ValidationMixin],
	/**@lends idx.oneui.form.CheckBox.prototype*/
	{
		// summary:
		// 		One UI version CheckBox
		
		instantValidate: true,
		
		baseClass: "idxCheckBoxWrap",
		
		oneuiBaseClass: "dijitCheckBox",
		
		labelAlignment: "horizontal",
		
		templateString: template,
		
		postCreate: function(){
			this.extension = {
				"input" : "onChange",
				"blur" 	: "_onBlur",
				"focus" : "_onFocus"
			}
			if(this.instantValidate){
				this.connect(this.focusNode, "onfocus", function(){
					if(this.message == ""){
						return;
					}
					this.displayMessage(this.message);
				});
			}
			this.inherited(arguments);
		},
		
		_isEmpty: function(){
			return !this.get("checked");
		},
		_onBlur: function(evt){
			this.mouseFocus = false;
			this.inherited(arguments);
		},
		
		_setLabelAlignmentAttr: null,
		_setFieldWidthAttr: null,
		_setLabelWidthAttr: null
	});
});