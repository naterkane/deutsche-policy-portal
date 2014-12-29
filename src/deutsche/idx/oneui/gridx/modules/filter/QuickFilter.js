define([
	"../../../../../../node_modules/intern-geezer/node_modules/dojo/_base/declare",
	"../../../../../../lib/dojo/_base/connect",
	"dojo/_base/lang",
	"dojo/on",
	"../../../../gridx/core/_Module",
	'dojo/_base/html',
	'dijit/form/TextBox',
	'dijit/form/Button',
	'dijit/form/DropDownButton',
	'../../../../gridx/modules/filter/Filter',
	'dojo/i18n!../../nls/QuickFilter'
], function(declare, connect, lang, on, _Module, html, TextBox, Button, DropDownButton, Filter, nls){
	return _Module.register(declare(_Module, {
		name: 'quickFilter',
		forced: ['filter', 'toolBar'],
		autoApply: true,
		delay: 700,
		getAPIPath: function(){
			return {
				quickFilter: this
			};
		},
		
		load: function(args, startup){
			this.textBox = new TextBox({value: nls.filter});
			this.button = new Button({
				label: '',
				title: nls.apply,
				iconClass: 'gridxQuickFilterIcon'
			});
//			this.dropDownButton = new DropDownButton({
//				label: ''
//			});
			html.addClass(this.textBox.domNode, 'gridxQuickFilterTextBox');
			html.addClass(this.textBox.domNode, 'gridxQuickFilterTextBoxEmpty');
			html.addClass(this.button.domNode, 'gridxQuickFilterButton');
//			html.addClass(this.dropDownButton.domNode, 'gridxQuickFilterDropDownButton');
			//this.grid.toolBar.widget.addChild(this.dropDownButton);
			this.grid.toolBar.widget.addChild(this.button);
			this.grid.toolBar.widget.addChild(this.textBox);
			
			this._initWidgets();
			this.loaded.callback();
		},
		
		apply: function(){
			if(html.hasClass(this.textBox.domNode, 'gridxQuickFilterTextBoxEmpty')){
				this.grid.filter.setFilter();
				return;
			}
			var key = this.textBox.get('value');
			var arr = [], F = Filter;
			dojo.forEach(this.grid.columns(), function(col){
				if(col.isFilterable && !col.isFilterable()){return;}
				arr.push(Filter.contain(F.column(col.id, 'string'), F.value(key, 'string')));
			}, this);
			this.grid.filter.setFilter(F.or.apply(F, arr));
		},
		clear: function(e){
			this.textBox.set('value', '');
			this.textBox.textbox.blur();
			html.addClass(this.textBox.domNode, 'gridxQuickFilterTextBoxEmpty');
			this.grid.filter.setFilter();
		},
		_autoApply: function(){
			var self = this;
			if(this._timer){
				window.clearTimeout(this._timer);
			}
			this._timer = window.setTimeout(function(){
				self.apply();
				this._timer = null;
			}, this.delay);
		},
		
		_initWidgets: function(){
			var tb = this.textBox;
			var btn = this.button;
			//var ddb = this.dropDownButton;
			var self = this, g = this.grid, fb = g.filterBar;
			//ddb.domNode.style.display = 'none';
			if(fb){
				var menu = new dijit.Menu({ });
	            menu.domNode.style.display="none";
				var mi1 = new dijit.MenuItem({
	                label: "Filter",
	                onClick: function(){
	                	self.apply();
	                }
	            });
	            menu.addChild(mi1);
	            
	            var mi2 = new dijit.MenuItem({
	                label: "Build filter...",
	                onClick: function(){
	                	if(fb){
	                		fb.show();
	                		fb.showFilterDialog();
	                	}
	                }
	            });
	            menu.addChild(mi2);
//				ddb.dropDown = menu;
				connect.connect(fb, 'load', function(){
					fb.domNode.style.display = 'none';
				});
//				connect.connect(fb, 'onHide', function(){
//					ddb.domNode.style.display = 'inline';
//				});
				
			}
			
			on(tb, 'keyup', function(){
				html.toggleClass(tb.domNode, 'gridxQuickFilterTextBoxEmpty', !tb.get('value'));
				self._autoApply();
			});
			on(tb, 'focus', function(){
				if(html.hasClass(tb.domNode, 'gridxQuickFilterTextBoxEmpty')){
					tb.set('value', '');
				}
			});
			on(tb, 'blur', function(){
				if(!tb.get('value')){
					tb.set('value', nls.filter);
					html.addClass(tb.domNode, 'gridxQuickFilterTextBoxEmpty');
				}
			});
			on(btn, 'click', lang.hitch(this, 'apply'));
			
			var clearIcon = html.create('span', {
				className: 'gridxQuickFilterClearIcon', title: nls.clear
			}, tb.domNode, 'last');
			this.connect(clearIcon, 'click', 'clear');
		}
	}));
});
