(function(){

var factory = function(dojo_declare, dojo_html, dojo_event, dojo_keys, dijit_focus, dijit_form_FilteringSelect){

/**
 * @name idx.form.Select
 * @class Link with own action and a drop-down menu.
 * @augments dijit.form.FilteringSelect
 */
return dojo_declare("idx.form.Select", dijit_form_FilteringSelect,
/**@lends idx.form.Select#*/
{

	required: false,

	/**
	 * Sets up attributes and event handlers.
	 */
	buildRendering: function(){
		this.inherited(arguments);
  
		// do not focus on input element
		dojo_html.attr(this.textbox, "readonly", true);
		dojo_html.attr(this.textbox.parentNode, "tabIndex", 0);

		this.connect(this.textbox.parentNode, "onmousedown", this._onParentMouseDown);
		this.connect(this.textbox.parentNode, "onkeypress", this._onKeyPress);
	},

	/**
	 * Handles focus.
	 */
	focus: function(){
		dijit_focus.focus(this.textbox.parentNode);
	},

	/**
	 * Updates place holder on value set.
	 * @param {String} value
	 * @private
	 */
	_setValueAttr: function(value){
		this.inherited(arguments);

		this._updatePlaceHolder();
	},

	/**
	 * Sets "tabIndex" attribute.
	 * @param {Boolean} value
	 * @private
	 */
	_setDisabledAttr: function(value){
		this.inherited(arguments);

		dojo_html.attr(this.textbox.parentNode, "tabIndex", (value ? -1 : 0));
	},

	/**
	 * Updates place holder text.
	 * @private
	 */
	_updatePlaceHolder: function(){
		if(this._phspan){
			var value = dojo_html.attr(this.textbox, "value");
			var display = ((!value && this.placeHolder) ? "" : "none");
			dojo_html.style(this._phspan, "display", display);
		}
	},

	/**
	 * Resets focus.
	 * @private
	 */
	_setCaretPos: function(){
		this.inherited(arguments);

		dijit_focus.focus(this.textbox.parentNode);
	},

	/**
	 * Handles mouse down for drop down.
	 * @private
	 */
	_onParentMouseDown: function(){
		if(this._onDropDownMouseDown){ // dojo 1.6
			this._onDropDownMouseDown.apply(this, arguments);
		}else if(this._onArrowMouseDown){ // dojo 1.5
			this._onArrowMouseDown.apply(this, arguments);
		}
	},

	/**
	 * Handles key press for drop down.
	 * @private
	 */
	_onKeyPress: function(event){
		var c = event.charOrCode;
		if(c == dojo_keys.DOWN_ARROW || c == " "){
			if(this.toggleDropDown){ // dojo 1.6
				if(!this._opened){
					this.toggleDropDown();
					dojo_event.stop(event);
					return;
				}else if(c == " "){
					dojo_event.stop(event);
					return;
				}
			}else if(this._onArrowMouseDown){ // dojo 1.5
				if(!this._isShowingNow){
					this._onArrowMouseDown.apply(this, arguments);
					return;
				}else if(c == " "){
					dojo_event.stop(event);
					return;
				}
			}
		}

		if(this._onKey){ // dojo 1.6
			this._onKey.apply(this, arguments);
		}else{ // dojo 1.5
			this.inherited(arguments);
		}
	},

	/**
	 * Highlights the selected option.
	 * @private
	 */
	_openResultList: function(){
		this.inherited(arguments);

		var dropDown = (this.dropDown || this._popupWidget);
		if(dropDown && dropDown.domNode){
			try{
				var store = this.store;
				var value = this.value;
				var node = dropDown.domNode.firstChild;
				while(node){
					var item = node.item;
					if(item && store.isItem(item)){
						var id = store.getIdentity(item)
						if(id == value){
							dropDown._focusOptionNode(node);
							window.scrollIntoView(node);
							break;
						}
					}
					node = node.nextSibling;
				}
			}catch(ex){
			}
		}
	},

	_startSearchFromInput: function(){
		// noop to disable search
	}

});

}; // end of factory

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){
	dojo.provide("idx.form.Select");
	dojo.require("dijit.form.FilteringSelect");
	var dojo_event = {stop: dojo.stopEvent};
	factory(dojo.declare, dojo, dojo_event, dojo.keys, dijit, dijit.form.FilteringSelect);
}else{
	define([
		"../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
		"../../../lib/dojo/_base/html",
		"dojo/_base/event",
		"dojo/keys",
		"dijit/focus",
		"dijit/form/FilteringSelect"
	], factory);
}

})();
