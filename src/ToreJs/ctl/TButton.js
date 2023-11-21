/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 20220706
  Author	: IVT : İhsan V. Töre
  About		: TButton.js: Tore Js TButton control component class.
  License : MIT.
————————————————————————————————————————————————————————————————————————————*/

import { sys } from "../lib/TSystem.js";
import { TControl } from "./TControl.js";
import { TPanel } from "./TPanel.js";


/*————————————————————————————————————————————————————————————————————————————
  CLASS: TButton
  TASKS: Defines base control for button classes.
————————————————————————————————————————————————————————————————————————————*/
export class TButton extends TPanel {

    static defaultCanEmptyFocus = true;
    static defaultCanFocus = true;

    static cdta = {
        toggleMode  : {value: false},
        allowAllUp	: {value: true},
        selected	: {value: false},
        group       : {value: 0},
        layout		: {value: 'horizontal'},
        contentAlign: {value: 'center'},
        wrap        : {value: false},
        handCursor	: {value: true},
        tabsLoop	: {value: false}
    }

    _layout = "horizontal";     // * overridden default ...
    _contentAlign = "center";   // * overridden default ...
    _wrap = false;              // * overridden default ...
    _toggleMode = false;
    _allowAllUp = true;
    _handCursor = true;
    _selected = false;
    _group = 0;

    /*——————————————————————————————————————————————————————————————————————————
      CTOR: constructor.
      TASK: Constructs a TButton component, attaches it to its owner if any.
      ARGS: 
        name    : string    : Name of new panel :DEF: null.
                              if Sys.LOAD, construction is by deserialization.
        owner   : TComponent : Owner of the new button if any :DEF: null.
        data    : Object    : An object containing instance data :DEF: null.
    ——————————————————————————————————————————————————————————————————————————*/
    constructor(name = null, owner = null, data = null) {
        super(name);
        this.initControl(name, owner, data);
    }

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC:	attach [override].
	  TASK:	
		Attaches a member component to the button.
		If new component is a control, 
			makes it unfocusable, 
			yielding focus to the button,
			adds it to layout sequence.
	  ARGS:
		component		: TComponent :	new member component :DEF: null.
	  RETV: Boolean		: True on success
	——————————————————————————————————————————————————————————————————————————*/
	attach(component = null) {
		if (!super.attach(component, true))
			return false;
		if (!(component instanceof TControl))
			return true;
		component.canFocus = false;
        component.yieldFocus = true;
		return true;
	}
    /*——————————————————————————————————————————————————————————————————————————
      FUNC: doHit
      TASK: Flags the control that mouse is clicking or touch tapping on it.
    ——————————————————————————————————————————————————————————————————————————*/
    doHit(x, y, e){
        var l,
            c;

        if (this._toggleMode || this._group){
            if (this._group) {
                if (!this._selected){
                    l = this._own.members(TButton, {group: this._group});
                    for(c in l)
                        l[c].selected = !!(l[c] === this);
                } else {
                    if (this._allowAllUp)
                        this.selected = false;
                }
            } else
                this.selected = !this._selected;
        }
        super.doHit(x, y, e)
    }

    /*————————————————————————————————————————————————————————————————————————————
      TButton get sets
    ————————————————————————————————————————————————————————————————————————————*/
    /*——————————————————————————————————————————————————————————————————————————
      PROP:	controlState : int [override]
      SET : Sets the button control state and propagates it to sub 
            components which can not focus.
    ——————————————————————————————————————————————————————————————————————————*/
    set controlState(val) {
        var i = this._ctlState,
            l;
        
        super.controlState = val;
        if (i === this._ctlState)
            return;
        l = this.members(TControl, {canFocus: false});
        for(i in l)
            l[i].controlState = val;
    }

    /*————————————————————————————————————————————————————————————————————————————
      PROP:	selected : Boolean;
      GET : Returns true if toggle button is selected.
      SET : Sets            toggle button is selected or not.
      INFO: Valid only if toggleMode = true.
    ————————————————————————————————————————————————————————————————————————————*/
    get selected() {
        return(this._selected);
    }

    set selected(value) {
        value = !!value;
        if (value === this._selected)
            return;
        this._selected = v;
        this._sRoot = selected ? 'On' : '';
        this.calcAllClassNames();
    }

    /*————————————————————————————————————————————————————————————————————————————
      PROP:	group : int;
      GET : Returns  button group id.
      SET : Sets the button group id.
      INFO: 
        *   Setting group id of a button to 0 will remove button from the group.
        *   Setting group id of a button to nonzero will also set the 
            allowAllUp status of the button to that of the group.
    ————————————————————————————————————————————————————————————————————————————*/
    get group() {
        return(this._group);
    }

    set group(value = 0){
        var l;

        if (this._group === value)
            return;
        this._group = value;
        if (!this._own)
            return;
        l = this._own.members(TButton, {group: value});
        if (l.length > 0)		// set allowAllUp
            this._allowAllUp = l[0]._allowAllUp;
    }

    /*————————————————————————————————————————————————————————————————————————————
      PROP:	allowAllUp : Boolean;
      GET : Returns true if all buttons in group can be unselected.
      SET : Sets         if all buttons in group can be unselected.
    ————————————————————————————————————————————————————————————————————————————*/
    get allowAllUp() {
        return(this._allowAllUp);
    }

    set allowAllUp(val){
        var l,
            c;

        val = !!val;
        if (val === this._allowAllUp)
            return;
        this._allowAllUp = val;
        if (!this._own)
            return;
        l = this._own.members(TButton, {group: t._group});
        for(c in l)
            l[c]._allowAllUp = val;
    }
} 

sys.registerClass(TButton);