/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2010, 2012 All Rights Reserved
 * US Government Users Restricted Rights - Use, duplication or 
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

(function() {
function factory(dLang, 				// (dojo/_base/lang)					
				 iMain,					// (idx)
				 dString,				// (dojo/string)
				 dDomClass,				// (dojo/dom-class) for (dDomClass.add/remove/contains)
				 dDomAttr,				// (dojo/dom-attr) for (dDomAttr.get/set)
				 dConnect,				// (dojo/_base/connect)
				 dEvent,				// (dojo/_base/event) for (dEvent.stop)
				 dButton,				// (dijit/form/Button)
				 dItemFileReadStore,	// (dojo/date/ItemFileReadStore)
				 iString,				// (../string)
				 iResources) 			// (../resources)
{
	var iButtons = dLang.getObject("form.buttons", true, iMain);
	
    /**
     * This defines the known display modes:
     *   - "labelOnly"
     *   - "iconOnly"
     *   - "iconAndLabel"
     *   
     * @private
     */
    iButtons._displayModes= {
      labelOnly: { showIcon: false, showLabel: true, cssClass: "idxButtonLabelOnly" },
      iconOnly: { showIcon: true, showLabel: false, cssClass: "idxButtonIconOnly" },
      iconAndLabel: { showIcon: true, showLabel: true, cssClass: "idxButtonIconAndLabel" }
    };
    
    var displayModes = iButtons._displayModes;
    
	/**
	 * This defines the possible button profiles with the current definition
	 * for the button profile.  The possible values include:
	 * - "standard"
	 * - "compact"
	 */
	iButtons._buttonProfiles = {
			standard: { cssClass: null },
			compact: { cssClass: "idxButtonCompact" }
	};
	var buttonProfiles = iButtons._buttonProfiles;
	
    /**
     * This defines the possible button placements with the current definition 
     * for the button placement.  The possible values include:
     * - "primary"
     * - "secondary"
     * - "toolbar"
     * - "special"
     * 
     * @private
     */
	iButtons._buttonPlacements = {
			primary: { cssClass: null, defaultDisplayMode: "iconAndLabel", defaultProfile: "standard"},
			secondary: { cssClass: "idxButtonSecondary", defaultDisplayMode: "labelOnly", defaultProfile: "standard"},
			toolbar: { cssClass: "idxButtonToolbar", defaultDisplayMode: "iconOnly", defaultProfile: "standard"},
			special: { cssClass: "idxButtonSpecial", defaultDisplayMode: "iconAndLabel", defaultProfile: "standard"}
	};
	var buttonPlacements = iButtons._buttonPlacements;	
	
    /**
     * Sets the default display mode for either all possible button placement positions
     * or for a specific one.
     * 
     * @param displayModeName A string that can be one of "labelOnly", "iconOnly", 
     *                        or "iconAndLabel"
     *                        
     * @param placementName If null then the call affects all possible button placements, otherwise
     *                      this should be one of "primary", "secondary", "special" or "toolbar".  
     * 
     */
    iButtons.setDefaultDisplayMode = function(/*String*/ displayModeName,/*String*/ placementName) {
    	var mode = displayModes[displayModeName];
    	
    	// error out if we got a bad mode
    	if (!mode) {
    		throw new Error("Invalid mode display mode name: " + displayModeName);
    	}
    	
    	if (! placementName) {
    		for (placementName in buttonPlacements) {
    			buttonPlacements[placementName].defaultDisplayMode = displayModeName;
    		}
    	} else {
    		var placement = buttonPlacements[placementName];
    		if (!placement) throw new Error("Invalid button placement name: " + placementName);
    		placement.defaultDisplayMode = displayModeName;
    	}
    };

    /**
     * Sets the default "profile" for either all possible button placement positions
     * or for a specific one.
     * 
     * @param profileName A string that can be one of "standard" or "compact".
     *                        
     * @param placementName If null then the call affects all possible button placements, otherwise
     *                      this should be one of "primary", "secondary", "special" or "toolbar".  
     * 
     */
    iButtons.setDefaultProfile = function(/*String*/ profileName,/*String?*/ placementName) {
    	var profile = buttonProfiles[profileName];
    	
    	// error out if we got a bad mode
    	if (!profile) {
    		throw new Error("Invalid mode profile name: " + profileName);
    	}
    	
    	if (! placementName) {
    		for (placementName in buttonPlacements) {
    			buttonPlacements[placementName].defaultProfile = profileName;
    		}
    	} else {
    		var placement = buttonPlacements[placementName];
    		if (!placement) throw new Error("Invalid button placement: " + placement);
    		placement.defaultProfile = profileName;
    	}
    };


    /**
     * This defines the standard button types.
     * 
	 * Possible values are:
	 *   
	 *	"close",
	 *  "configure"
	 *	"edit"
	 *	"filter"
	 *	"clearFilter"
	 *	"toggleFilter"
	 *	"help"
	 *	"info"
	 *	"minimize"
	 *	"maximize"
	 *	"print"
	 *	"refresh"
	 *	"restore"
	 *	"maxRestore"
	 *	"nextPage"
	 *	"previousPage"
	 *	"lastPage"
	 *	"firstPage"
     * 
     * @private
     */
	iButtons._stdButtonTypes = {
			close: { iconClass: "idxCloseIcon", labelKey: "closeLabel" },
			configure: { iconClass: "idxConfigureIcon", labelKey: "configureLabel" },
			edit: { iconClass: "idxEditIcon", labelKey: "editLabel" },
			filter: { iconClass: "idxFilterIcon", labelKey: "filterLabel" },
			clearFilter: { iconClass: "idxClearFilterIcon", labelKey: "clearFilterLabel"},
			toggleFilter: { toggleButtonTypes: [ "filter", "clearFilter" ] },
			help: { iconClass: "idxHelpIcon", labelKey: "helpLabel" },
			info: { iconClass: "idxInfoIcon", labelKey: "infoLabel" },
			minimize: { iconClass: "idxMinimizeIcon", labelKey: "minimizeLabel" },
			maximize: { iconClass: "idxMaximizeIcon", labelKey: "maximizeLabel" },
			print: { iconClass: "idxPrintIcon", labelKey: "printLabel" },
			refresh: { iconClass: "idxRefreshIcon", labelKey: "refreshLabel" },
			restore: { iconClass: "idxRestoreIcon", labelKey: "restoreLabel" },
			maxRestore: { toggleButtonTypes: [ "maximize", "restore" ] },
			nextPage: { iconClass: "idxNextPageIcon", labelKey: "nextPageLabel" },
			previousPage: { iconClass: "idxPreviousPageIcon", labelKey: "previousPageLabel" },
			lastPage: { iconClass: "idxLastPageIcon", labelKey: "lastPageLabel" },
			firstPage: { iconClass: "idxFirstPageIcon", labelKey: "firstPageLabel" }
	};

	/**
	 * Returns an array of strings containing the possible button type names. 
	 */
	iButtons.getButtonTypes = function() {
		var result = [ ];
		for (field in iButtons._stdButtonTypes) {
			result.push(field);
		}
		return result;
	};
	
	/**
	 * Returns an array of strings containing the possible button type names. 
	 */
	iButtons.getButtonTypeStore = function(withEmpty) {
		
		var result = { identifier: 'value', label: 'name', items: [ ] };
		
		if (withEmpty) {
			result.items.push({name: "[none]", value: " "});
		}
		for (field in iButtons._stdButtonTypes) {
			result.items.push({name: field, value: field});
		}
		return new dItemFileReadStore({data: result});
	};
	
	// 
	// Get the base functions so we can call them from our overrides
	//
    var buttonProto = dButton.prototype;	
	var setLabelFunc = buttonProto._setLabelAttr;
	var setIconClassFunc = buttonProto._setIconClassAttr;
	var setShowLabelFunc = buttonProto._setShowLabelAttr;
	
	/**
	 * Overrides _setLabelAttr from dijit.form.Button
	 */
	buttonProto._setLabelAttr = function(label) {
		// setup the explicit label if starting up
		if ((!this._started) && (! ("_explicitLabel" in this)) && (this.params) && ("label" in this.params)) {
			this._explicitLabel = this.params.label;
		}
		
		// determine the explicit value so we can revert
		var abt = this._applyingButtonType;
		this._applyingButtonType = false; // clear the flag

		if (! abt) {
			this._explicitLabel = label;
		} else {
			var el = this._explicitLabel;
			if (iString.nullTrim(el)) {
				// we have an explicit label -- ignore button type label
				this.label = el;
				label = el;
			}
		}
		
		if (setLabelFunc) {
			var current = this._setLabelAttr;
			this._setLabelAttr = setLabelFunc;
			this.set("label", label);
			this._setLabelAttr = current;
		} else {
			this.label = label;
			if (this._attrToDom && ("label" in this.attributeMap)) {
				this._attrToDom("label", label);
			}
		}
		
		if ((!abt) && (! iString.nullTrim(this.label))
			&& (this._buttonTypes)) {
			var bt = this._buttonTypes[this._toggleIndex];
			this._applyButtonTypeLabel(bt);
		}
	};
	
	/**
	 * Overrides _setIconClassAttr from dijit.form.Button
	 */
	buttonProto._setIconClassAttr = function(iconClass) {
		// setup the explicit iconClass if starting up
		if ((!this._started) && (! ("_explicitIconClass" in this)) && (this.params) 
				&& ("iconClass" in this.params) && (this.params.iconClass != "dijitNoIcon")) {
			this._explicitIconClass = this.params.iconClass;
		}
		
		// determine the explicit value so we can revert
		var abt = this._applyingButtonType;
		this._applyingButtonType = false; // clear the flag
		if (! abt) { 
			dDomClass.remove(this.domNode, "idxButtonIcon");
			if (iconClass != "dijitNoIcon") this._explicitIconClass = iconClass;
		} else {
			var eic = this._explicitIconClass;
			if (iString.nullTrim(eic)) {
				// we have an explicit icon class -- ignore button type icon class
				this.iconClass = eic;
				iconClass = eic;
				dDomClass.remove(this.domNode, "idxButtonIcon");
			} else {
				dDomClass.add(this.domNode, "idxButtonIcon");
			}
		}
		if (setIconClassFunc) {
			var current = this._setIconClassAttr;
			this._setIconClassAttr = setIconClassFunc;
			this.set("iconClass", iconClass);
			this._setIconClassAttr = current;
		} else {
			this.iconClass = iconClass;
			if (this._attrToDom && ("iconClass" in this.attributeMap)) {
				this._attrToDom("iconClass", iconClass);
			}
		}
		if ((!abt) && (! iString.nullTrim(this.iconClass))
				&& (this._buttonTypes)) {
				var bt = this._buttonTypes[this._toggleIndex];
				this._applyButtonTypeIconClass(bt);
		}
	};
	
	/**
	 * Overrides _setIconClassAttr from dijit.form.Button
	 */
	buttonProto._setShowLabelAttr = function(show) {
		// check if we need to set the explicit value
		if ((!this._started) && (this.params) && ("showLabel" in this.params) && (! ("_explicitShowLabel" in this))) {
			this._explicitShowLabel = this.params.showLabel;
		}
	
		// check if we are applying the display mode
		var adm = this._applyingDisplayMode;
		this._applyingDisplayMode = false; // clear the flag
		
		if (! adm) {
			// if not applying display mode, then store the value
			this._explicitShowLabel = show;
		} 
		if (setShowLabelFunc) {
			var current = this._setShowLabelAttr;
			this._setShowLabelAttr = setShowLabelFunc;
			this.set("showLabel", show);
			this._setShowLabelAttr = current;
		} else {
			this.showLabel = show;
		}
	};
	
	var afterBuildRendering = buttonProto.idxAfterBuildRendering;
	/**
	 * TODO: need to document 
	 */
	buttonProto.idxAfterBuildRendering = function() {
		if (afterBuildRendering) afterBuildRendering.call(this);
		
		// reapply these once we are sure we have a dom node
		if (this._displayMode) {
			this._applyDisplayMode(this._displayMode);
		}
		if (this._placement) {
			this._applyPlacement(this._placement);
		}
		if (this._profile) {
			this._applyProfile(this._profile);
		}
		if ((this.valueNode) && (this.valueNode != this.focusNode)
				&& (dDomClass.contains(this.valueNode, "dijitOffScreen"))
				&& (!iString.nullTrim(dDomAttr.get(this.valueNode, "role")))
				&& (!iString.nullTrim(dDomAttr.get(this.valueNode, "wairole")))) {
			// get the screen readers to ignore the value node
			dDomAttr.set(this.valueNode, {role: "presentation", wairole: "presentation"});
		}
	};
	
	
	dLang.extend(dButton, {	
	/**
	 * Sets the idxBaseClass so we can be aware of all button-derived widgets.
	 */
	idxBaseClass: "idxButtonDerived",
	
	/**
	 * The buttonType can be used to provide a default "iconClass" and "label" if an 
	 * explicit one is not defined.  Certain button types also provide automatic 
	 * toggling of the icon and label through a series of possibilities (usually two)
	 * with each click of the button.  This is useful for buttons that change state
	 * when clicked (e.g.: "maximize / restore" or "filter / clear filter")
	 * 
	 * Possible values are:
	 *   
	 *	"close",
	 *  "configure"
	 *	"edit"
	 *	"filter"
	 *	"clearFilter"
	 *	"toggleFilter"
	 *	"help"
	 *	"info"
	 *	"minimize"
	 *	"maximize"
	 *	"print"
	 *	"refresh"
	 *	"restore"
	 *	"maxRestore"
	 *	"nextPage"
	 *	"previousPage"
	 *	"lastPage"
	 *	"firstPage"
	 */
	buttonType: "",
	
	/**
	 * The placement can be used to indicate the location of a button to help
	 * provide a hint for styling it in some themes.  The placement can also
	 * govern the default "displayMode" and "profile" if not explicitly set 
	 * otherwise.
	 * 
	 * The possible values for placement are:
     *   - "primary"
     *   - "secondary"
     *   - "special"
     *   - "toolbar"
     *   
     */
	placement: "",
	
	/**
	 * The display mode controls whether to show the icon, label, or both.
	 * If not set then the default for the specified "placement" is used.
	 * 
	 * The possible values for displayMode are:
     *   - "labelOnly"
     *   - "iconOnly"
     *   - "iconAndLabel"
     *   
	 */
	displayMode: "",
	
	/**
	 * The profile controls the minimum size for the button in some themes.
	 * If not set then the default for the specified "placement" is used.
	 * 
	 * The possible values for profile are:
     *   - "standard"
     *   - "compact"
	 */
	profile: "",
	
	/**
	 * 
	 */
	_getIDXResources: function() {
	  if (!this._idxResources) {
		  this._idxResources = iResources.getResources("idx/form/buttons", this.lang);
	  }
	  return this._idxResources;
	},
	
	/**
	 * 
	 */
	_removeButtonType: function() {
		var iconClass = ("_explicitIconClass" in this) ? this._explicitIconClass : "";
		var label = ("_explicitLabel" in this) ? this._explicitLabel : "";
		
		this.set("iconClass", iconClass);
		this.set("label", label);
	},
	
	/**
	 * 
	 */
	_applyButtonTypeLabel: function(buttonType) {
		var res = this._getIDXResources();
		var btLabel = res[buttonType.labelKey];
		if (!btLabel) btLabel = "";
		
		this._applyingButtonType = true;
		this.set("label", btLabel);
		this._applyingButtonType = false;		
	},
	
	/**
	 * 
	 */
	_applyButtonTypeIconClass: function(buttonType) {
		var btIconClass = buttonType.iconClass;
		if (!btIconClass) btIconClass = "";
		this._applyingButtonType = true;
		this.set("iconClass", btIconClass);
		this._applyingButtonType = false;		
	},
	
	/**
	 * Sets the button type which will override the label and icon class.
	 */
	_applyButtonType: function(buttonType) {
		this._applyButtonTypeLabel(buttonType);
		this._applyButtonTypeIconClass(buttonType);		
	},
	
	/**
	 * 
	 */
	_applyDisplayModeShowLabel: function(show) {
		this._applyingDisplayMode = true;
		this.set("showLabel", show);
		this._applyingDisplayMode = false;
	},

	/**
	 * Sets the button type which will override the label and icon class.
	 */
	_applyDisplayMode: function(displayMode) {
		this._displayMode = displayMode;
		var showLabel     = displayMode.showLabel;
		var showIcon      = displayMode.showIcon;
		var cssClass      = displayMode.cssClass;
		
		if (cssClass) dDomClass.add(this.domNode, cssClass);
		if (!showIcon) dDomClass.add(this.domNode, "idxButtonHideIcon");
		
		this._applyDisplayModeShowLabel(showLabel);
	},
	
	/**
	 * 
	 */
	_removeDisplayMode: function() {
		if (! this._displayMode) return;
		
		var showLabel = this._displayMode.showLabel;
		var showIcon  = this._displayMode.showIcon;
		var cssClass  = this._displayMode.cssClass;
		
		if (cssClass) dDomClass.remove(this.domNode, cssClass);
		if (!showIcon) dDomClass.remove(this.domNode, "idxButtonHideIcon");
		
		showLabel = ("_explicitShowLabel" in this) ? this._explicitShowLabel : true;
		this.set("showLabel", showLabel);
	},

	/**
	 * 
	 */
	_applyPlacementDisplayMode: function(placement) {
		var displayMode   = placement.defaultDisplayMode;
		if (! displayMode) displayMode = "";
		
		this._applyingPlacement = true;
		this.set("displayMode", displayMode);
		this._applyingPlacement = false;
	},

	/**
	 * Sets the profile.
	 */
	_applyProfile: function(profile) {
		this._profile = profile;
		var cssClass = profile.cssClass;
		
		if (cssClass) dDomClass.add(this.domNode, cssClass);		
	},
	
	/**
	 * 
	 */
	_removeProfile: function() {
		if (! this._profile) return;
		
		var cssClass  = this._profile.cssClass;
		
		if (cssClass) dDomClass.remove(this.domNode, cssClass);
	},

	/**
	 * 
	 */
	_applyPlacementProfile: function(placement) {
		var profile   = placement.defaultProfile;
		if (! profile) profile = "";
		
		this._applyingPlacement = true;
		this.set("profile", profile);
		this._applyingPlacement = false;
	},

	/**
	 * Sets the button type which will override the label and icon class.
	 */
	_applyPlacement: function(placement) {
		this._placement   = placement;
		var cssClass      = placement.cssClass;
		
		if (cssClass) dDomClass.add(this.domNode, cssClass);
		this._applyPlacementDisplayMode(placement);
		this._applyPlacementProfile(placement);
	},
	
	/**
	 * 
	 */
	_removePlacement: function() {
		if (! this._placement) return;
		
		var cssClass  	= this._placement.cssClass;
		var displayMode	= this._placement.defaultDisplayMode;
		
		if (cssClass) dDomClass.remove(this.domNode, cssClass);
		
		var displayMode = ("_explicitDisplayMode" in this) ? this._explicitDisplayMode : "";
		
		this.set("displayMode", displayMode);
	},
	
	/**
	 * 
	 */
	_buttonTypeClick: function(e) {
		var buttonTypeState = this.buttonType;
		if (this._toggleButtonTypes && (this._toggleButtonTypes.length > 1)) {
			buttonTypeState = this._toggleButtonTypes[this._toggleIndex];
		}
		this.onButtonTypeClick(e, buttonTypeState);
		this._toggleButtonType();
	},
	
	/**
	 * 
	 */
	onButtonTypeClick: function(/*Event*/ e, /*String*/ buttonTypeState) {
		
	},
	
	/**
	 * 
	 */
	_buttonTypeDblClick: function(e) {
		var buttonTypeState = this.buttonType;
		if (this._toggleButtonTypes && (this._toggleButtonTypes.length > 1)) {
			buttonTypeState = this._toggleButtonTypes[this._toggleIndex];
		}
		this.onButtonTypeDblClick(e, buttonTypeState);
		this._toggleButtonType();
	},
	
	/**
	 * 
	 */
	onButtonTypeDblClick: function(/*Event*/ e, /*String*/ buttonTypeState) {
		
	},
	
	/**
	 * 
	 */
	_toggleButtonType: function() {
		if ((! this._buttonTypes) || (this._buttonTypes.length < 2)) return;

		// get the old button type and remove it
		var oldBT = this._buttonTypes[this._toggleIndex];
		this._removeButtonType(oldBT);
		
		// increment the index
		this._toggleIndex++;
		if (this._toggleIndex >= this._buttonTypes.length) this._toggleIndex = 0;
		
		// get the new button type and apply it
		var newBT = this._buttonTypes[this._toggleIndex];
		this._applyButtonType(newBT);
	},
	
	/**
	 * 
	 */
	_setButtonTypeAttr: function(/*String*/ buttonType) {
		// establish the connection to "onClick"
		if (!this._buttonTypeClickConnection) {
			this._buttonTypeClickConnection = dConnect.connect(this, "onClick", this, "_buttonTypeClick");
		}	
		if (!this._buttonTypeDblClickConnection) {
			this._buttonTypeDblClickConnection = dConnect.connect(this, "onDblClick", this, "_buttonTypeDblClick");
		}
		// set the button type
		this.buttonType = dString.trim(buttonType);
		var sbt = iButtons._stdButtonTypes;
	    var bt = sbt[buttonType];
		if (this._buttonTypes) {
			var currentBT = this._buttonTypes[this._toggleIndex];
		
			this._buttonTypes = null;
			this._removeButtonType(currentBT);
		}
		if (bt) {
			if (bt.toggleButtonTypes) {
				this._buttonTypes = [ ];
				var tbt = bt.toggleButtonTypes;
				for (var index = 0; index < tbt.length; index++) {
					var btName = tbt[index];
					this._buttonTypes.push(sbt[btName]);
				}
				this._toggleButtonTypes = bt.toggleButtonTypes;
			} else {
				this._buttonTypes = [ bt ];
				this._toggleButtonTypes = [ this.buttonType ]; 
			}
			
			this._toggleIndex = 0;
		 
		  var currentBT = this._buttonTypes[this._toggleIndex];
		  this._applyButtonType(currentBT);
		  
	    } else{
	    	this._buttonTypes = null;
	    }
	},
	
	/**
	 * 
	 */
	_setPlacementAttr: function(/*String*/ placement) {
		// remove the current placement if any
		this._removePlacement();
		
		// set the placement key
		this.placement = placement;
		
		// lookup the actual placement if we have a key
		if (this.placement) {
			var newPlacement = iButtons._buttonPlacements[this.placement];
			
			// if an actual display mode exists for key then apply it
			if (newPlacement) {
				this._applyPlacement(newPlacement);
			}
		}		
	},
	
	/**
	 * 
	 */
	_setDisplayModeAttr: function(/*String*/ displayMode) {
		// setup the explicit display mode if starting up
		if ((!this._started) && (! ("_explicitDisplayMode" in this)) && (this.params) && ("displayMode" in this.params)) {
			this._explicitDisplayMode = this.params.displayMode;
		}
		
		// check if we are applying the placement
		var ap = this._applyingPlacement;
		this._applyingPlacement = false; // clear the flag
		
		
		if (! ap) {
			// if not applying placement, then store the value
			this._explicitDisplayMode = displayMode;
		} else {
			var edm = this._explicitDisplayMode;
			if (iString.nullTrim(edm)) {
				// we have an explicit display mode -- ignore placement display mode
				displayMode = edm;
				this.displayMode = edm;
			}
		}

		// remove the old display mode (does nothing if none)
		this._removeDisplayMode();
		
		// set the display mode text key
		this.displayMode = displayMode;
		
		// lookup the actual display mode if we have a key
		if (this.displayMode) {
			var newDM = iButtons._displayModes[this.displayMode];
			this._displayMode = newDM;
			
			// if an actual display mode exists for key then apply it
			if (newDM) {
				this._applyDisplayMode(newDM);
			}
		}
		if ((!ap) && (! iString.nullTrim(this.displayMode))
			&& (this._placement)) {
			this._applyPlacementDisplayMode(this._placement);
		}
		
	},
	
	/**
	 * 
	 */
	_setProfileAttr: function(/*String*/ profile) {
		// setup the explicit profile if starting up
		if ((!this._started) && (! ("_explicitProfile" in this)) && (this.params) && ("profile" in this.params)) {
			this._explicitProfile = this.params.profile;
		}
		
		// check if we are applying the placement
		var ap = this._applyingPlacement;
		this._applyingPlacement = false; // clear the flag
		
		
		if (! ap) {
			// if not applying placement, then store the value
			this._explicitProfile = profile;
		} else {
			var ep = this._explicitProfile;
			if (iString.nullTrim(ep)) {
				// we have an explicit profile -- ignore placement profile
				profile = ep;
				this.profile = ep;
			}
		}

		// remove the old profile (does nothing if none)
		this._removeProfile();
		
		// set the profile text key
		this.profile = profile;
		
		// lookup the actual profile if we have a key
		if (this.profile) {
			var newProf = iButtons._buttonProfiles[this.profile];
			this._profile = newProf;
			
			// if an actual profile exists for key then apply it
			if (newProf) {
				this._applyProfile(newProf);
			}
		}
		if ((!ap) && (! iString.nullTrim(this.profile))
			&& (this._placement)) {
			this._applyPlacementProfile(this._placement);
		}
		
	},

	/**
	 * 
	 */
	_killEvent: function(e) {
		if (e) dEvent.stop(e);
	}
}); // end dojo.extend
	
	return iButtons;
	
} // end factory

var version = (window["dojo"] && dojo.version);
if(version && version.major == 1 && version.minor == 6){

	dojo.provide("idx.form.buttons");
	dojo.require("idx.ext");
	dojo.require("dojo.data.ItemFileReadStore");
	dojo.require("dijit.form.Button");
	dojo.require("idx.resources");
	dojo.require("idx.string");
	dojo.require("dojo.string");
	dojo.requireLocalization("idx","base");
	dojo.requireLocalization("idx.form","base");
	dojo.requireLocalization("idx.form","buttons");

	factory(
	dojo,							// dLang 				(dojo/_base/kernel)	
	idx,							// iMain				(idx)
	dojo.string, 					// dString 				(dojo/string)
	{add: dojo.addClass, 			// dDomClass 			(dojo/dom-class) for (dDomClass.add/remove/contains)
	 remove: dojo.removeClass,
	 contains: dojo.hasClass},
	{get: dojo.attr, 				// dDomAttr				(dojo/dom-attr) for (dDomAttr.get/set)
	 set: dojo.attr},
	dojo, 							// dConnect				(dojo/_base/connect)
	{stop: dojo.stopEvent},			// dEvent				(dojo/_base/event) for (dEvent.stop)
	dijit.form.Button,				// dButton				(dijit/form/Button)
	dojo.data.ItemFileReadStore,	// iItemFileReadStore	(dojo/data/ItemFileReadStore)
	idx.string,						// iString				(../string)
	idx.resources);					// iResouces			(../resources)

} else {
	define(["../../../node_modules/intern-geezer/node_modules/dojo/_base/lang",
	        "idx",
	        "../../../../dist/lib/dojo/string",
	        "dojo/dom-class",
	        "dojo/dom-attr",
	        "dojo/_base/connect",
	        "dojo/_base/event",
	        "dijit/form/Button",
	        "dojo/data/ItemFileReadStore",
	        "../string",
	        "../resources",
	        "dojo/i18n!../nls/base",
	        "dojo/i18n!./nls/base",
	        "dojo/i18n!./nls/buttons",
	        "../ext"], // needed for "idxBaseClass" to be properly used
			factory);
} 

})();
	
