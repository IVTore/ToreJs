/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 20220706
  Author	: IVT : İhsan V. Töre
  About		: Button.js: Tore Js Button control component class.
  License : MIT.
————————————————————————————————————————————————————————————————————————————*/

import { sys } from "../lib/system.js";
import { Panel } from "./Panel.js";


/*————————————————————————————————————————————————————————————————————————————
  CLASS: Button
  TASKS: Defines base control for button classes.
————————————————————————————————————————————————————————————————————————————*/
export class Button extends Panel {

    static canFocusWhenEmpty = true;
    static canFocusDefault = true;

    static cdta = {
        toggleMode  : {value: false},
        allowAllUp	: {value: true},
        selected	: {value: false},
        group       : {value: 0},
        layout		: {value: 'horizontal'},
        autosize	: {value: true},
        handCursor	: {value: true},
        tabsLoop	: {value: false}
    }

    _toggleMode = false;
    _allowAllUp = true;
    _handCursor = true;
    _selected = false;
    _group = 0;

    /*——————————————————————————————————————————————————————————————————————————
      CTOR: constructor.
      TASK: Constructs a Button component, attaches it to its owner if any.
      ARGS: 
        name    : string    : Name of new panel :DEF: null.
                              if Sys.LOAD, construction is by deserialization.
        owner   : Component : Owner of the new button if any :DEF: null.
        data    : Object    : An object containing instance data :DEF: null.
    ——————————————————————————————————————————————————————————————————————————*/
    constructor(name = null, owner = null, data = null) {
        super(name);
        this._autosize = true;
        this._layout = "horizontal";
        this._tabsLoop = false;
        if (name == sys.LOAD)
            return;
        this._initControl(owner, data);
    }

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC:	attach [override].
	  TASK:	
		Attaches a member component to the button, if new component 
		is a control, makes it unfocusable, and yielding focus to the button.
	  ARGS:
		component		: Component :	new member component :DEF: null.
	  RETV: Boolean		: True on success
	——————————————————————————————————————————————————————————————————————————*/
	attach(component = null) {
		if (!super.attach(component))
			return false;
		if (!is.control(component))
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
                    l = this._own.members(Button, {group: this._group});
                    for(c in l)
                        l[c].selected = Boolean(l[c] === this);
                } else {
                    if (this._allowAllUp)
                        this.selected = false;
                }
            } else 
                this.selected = Boolean(!this._selected);
        }
        super.doHit(x, y, e)
    }

    /*————————————————————————————————————————————————————————————————————————————
      Button get sets
    ————————————————————————————————————————————————————————————————————————————*/
    /*——————————————————————————————————————————————————————————————————————————
      PROP:	controlState : int [override]
      SET : Sets the button control state and propagates it to sub 
            components which can not focus.
    ——————————————————————————————————————————————————————————————————————————*/
    set controlState(value) {
        var i = this._ctlState,
            l;
        
        super.controlState = value;
        if (i == this._ctlState)
            return;
        l = this.members(Control, {canFocus: false});
        for(i in l)
            l[i].controlState = v;
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
        this._styleRoot = selected ? 'Down' : '';
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

        if (this._group == value)
            return;
        this._group = value;
        if (!this._own)
            return;
        l = this._own.members(Button, {group: value});
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

    set allowAllUp(value){
        var l,
            c;

        value = !!value;
        if (value == this._allowAllUp)
            return;
        this._allowAllUp = value;
        if (!this._own)
            return;
        l = this._own.members(Button, {group: t._group});
        for(c in l)
            l[c]._allowAllUp = value;
    }
} 

sys.registerClass(Button);