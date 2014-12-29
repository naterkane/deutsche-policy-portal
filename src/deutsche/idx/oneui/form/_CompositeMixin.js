/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

define([
	"../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	"../../../../../dist/lib/dojo/_base/lang",
	"dojo/dom-attr",
	"dojo/dom",
	"dojo/i18n", 
	"dojo/query", 
	"dojo/dom-class", 
	"dojo/dom-style", 
	"dijit/_base/wai", 
	"idx/oneui/HoverHelpTooltip",
	"../common",
	"./_FocusManager"
], function(declare, lang, domAttr, dom, i18n, query, domClass, domStyle, wai, HoverHelpTooltip, common, _focusManager) {
	// module:
	//		idx/oneui/form/_CompositeWidgetMixin
	// summary:
	//		A mixin class that provides customized label, hint, unit.
	//		It takes the assumption that a composite widget will follow the dom structure below
	//		<div class="idxComposite oneCompRequired">
	//			<div class="idxLabel">
	//				<span>*</span><label dojotAttachPoint="compLabelNode">Label Text</label>
	//			</div>
	//			<div>other dom structure...</div><div dojoAttachPoint="compUnitNode" class="dijitInline">unit text</div>
	//			<div dojoAttachPoint="compHintNode" class="idxHint dijitHidden">hint text</div>
	//		</div>
	lang.extend(HoverHelpTooltip._MasterHoverHelpTooltip, {hoverFocus: false});

	return declare("idx.oneui.form._CompositeMixin", null, {
		// summary:
		//		A mixin class that provides customized label, hint, unit.
		
		// labelAlignment: String
		//		Position of the label. horizontal or vertical
		labelAlignment: "horizontal",
		
		// labelText: String
		//		The label text.
		label: "",
		
		labelWidth: "",
		
		fieldWidth: "",
		
		// hintPosition: String
		//		Textbox based widgets only. The position of the hint text: "inside" / "outside"
		hintPosition: "inside",
		
		// hint: String
		//		Textbox based widgets only. The hint text.
		hint: "",
		
		// required: Boolean
		//		Indicate whether this is a required field or not. A required field will have a red asterisk.
		required: false,
		
		unit: "",
		
		_focusManager: _focusManager,
		
		_setLabelAlignmentAttr: function(/*String*/ alignment){
			// summary:
			//		Set position of the label. Update the style of the label node to make it be
			//		at the right place.
			// alignment:
			//		The position of the label. Can be "vertical" or "horizontal".
			//		If "vertical" is used, the label is put above the TextBox.
			//		If "horizontal" is used, the label is put on the left of the TextBox (on
			//		the right of the TextBox if RTL language is used).
			var h = alignment == "horizontal";
			query(".idxLabel", this.domNode).toggleClass("dijitInline", h);
			query(".idxCompContainer", this.domNode).toggleClass("dijitInline", h);
			this._set("labelAlignment", alignment);
		},
		
		_setLabelAttr: function(/*String*/ label){
			// summary:
			//		Set the label text. Update the content of the label node.
			// label:
			//		The text will be displayed as the content of the label. If text is null or
			//		empty string, nothing would be displayed.
			this.compLabelNode.innerHTML = label;
			query(".idxLabel", this.domNode).toggleClass("dijitHidden", /^\s*$/.test(label));
			this._set("label", label);
		},
		
		_setRequiredAttr: function(/*Boolean*/ required){
			// summary:
			//		Set this field as a required field or not. If this field is required,
			//		a red asterisk will be shown
			wai.setWaiState(this.focusNode, "required", required + "");
			this._set("required", required);
		},
		
		_setHintPositionAttr: function(/*String*/ position){
			// summary:
			//		Set position of the hint text. If position is "outside", update the content
			//		of the hint node. If position is "inside" and the value of the TextBox is
			//		null, set the value of the TextBox to the hintText
			// position:
			//		The position of the label. Can be "outside" or "inside".
			//		If "outside" is used, the hint text is put below the TextBox.
			//		If "inside" is used and the TextBox has a value, display the value in the TextBox. Once
			//		the value of the TextBox is null, display the hint text inside the TextBox in a specified
			//		color (e.g: gray).
			if(!this.compHintNode){ return; }
			domClass.toggle(this.compHintNode, "dijitVisible", position != "inside");
			this._set("hintPosition", position);
			this.set("hint", this.hint);
		},
		
		_setHintAttr: function(/*String*/ hint){
			// summary:
			//		Set the hint text.
			// text:
			//		The text will be displayed inside or below the TextBox per the "position" attribute.
			if(!this.compHintNode){ return; }
			this.set("placeHolder", this.hintPosition == "inside" ? hint : "");
			this.compHintNode.innerHTML = this.hintPosition == "inside" ? "" : hint;
			
			if(this.hintPosition == "outside"){
				domAttr.set(this.compHintNode, "id", this.id + "_hint_outside");
			}
			dijit.setWaiState(this.focusNode, "describedby", this.id + "_hint_" + this.hintPosition);
			this._set("hint", hint);
		},
		_setPlaceHolderAttr: function(v){
			this._set("placeHolder", v);
			if(!this._phspan){
				this._attachPoints.push('_phspan');
				this._phspan = dojo.create('span',{
					className:'dijitPlaceHolder dijitInputField',
					id: this.id + "_hint_inside"
				},this.focusNode,'after');
			}
			this._phspan.innerHTML="";
			this._phspan.appendChild(document.createTextNode(v));
			
			this._updatePlaceHolder();
		},
	
		_setUnitAttr: function(/*String*/ unit){
			// summary:
			//		Set the unit.
			// unit:
			//		The unit will be displayed on the right of the input box(on the left of the input
			//		box if RTL language is used).
			if(!this.compUnitNode){ return; }
			this.compUnitNode.innerHTML = unit;
			domClass.toggle(this.compUnitNode, "dijitHidden", /^\s*$/.test(unit));
			this._set("unit", unit);
		},
		
		_setLabelWidthAttr: function(/*String | Integer*/width){
			if(!width){ return; }
			var widthInPx = common.normalizedLength(width);
			query(".idxLabel", this.domNode).style("width", widthInPx + "px");
		},
		
		_setFieldWidthAttr: function(/*String | Integer*/width){
			if(!width){ return; }
			var widthInPx = common.normalizedLength(width);
			domStyle.set(this.oneuiBaseNode, "width", widthInPx + "px");
		},
		_isValidFocusNode: function(mousedownNode){
			if((!dom.isDescendant(mousedownNode, this.oneuiBaseNode)) && 
				dom.isDescendant(mousedownNode, this.domNode)){
				return false;
			}else{
				return true;
			}
		}
	});
});
