/*——————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	IVT : İhsan V. Töre
  About		: 	TContainer.js: Tore Js container control component class.
  License 	:	MIT.
——————————————————————————————————————————————————————————————————————————*/

import { sys, core } from "../lib/index.js";
import { TControl } from "./TControl.js";

/*——————————————————————————————————————————————————————————————————————————
  CLASS: TContainer
  TASKS: Defines TContainer base control class. 
		 TContainer class is the anchestor of all control classes which 
		 need automatic management of focusing and tab ordering for sub 
		 controls.
——————————————————————————————————————————————————————————————————————————*/
export class TContainer extends TControl {

    /*————————————————————————————————————————————————————————————————————————————
        TContainer is focusable by default unless it is empty.         
    ————————————————————————————————————————————————————————————————————————————*/
    static defaultCanFocus = true;
	static defaultCanEmptyFocus = false;
	

    // TContainer dom tags.
    static elementTag = 'div';
    static wrapperTag = 'div';
	

	static cdta = {
		tabsLoop		: {value: false},
		focus			: {value: null},
		defaultControl	: {value: null}
	}
    
	_tabsLoop = false;		// tab looping disabled.
	_tabCache = null;		// tabs cache.
	_calcTabs = true;		// tabs recalculate flag.
	_curFocus = null;		// current focused control.
	_defFocus = null;		// default focus control.

	/*——————————————————————————————————————————————————————————————————————————
	  CTOR: constructor.
	  TASK: Constructs a TContainer component, attaches it to its owner if any.
	  ARGS: 
		name  : string	    : Name of new control :DEF: null.
							  if Sys.LOAD, construction is by deserialization.
		owner : TComponent	: Owner of the new container if any :DEF: null.
		data  : Object	    : An object containing instance data :DEF: null.
	——————————————————————————————————————————————————————————————————————————*/
	constructor(name = null, owner = null, data = null) {
		super(name, owner, data);
	}

	/*————————————————————————————————————————————————————————————————————————————
	  DTOR: destroy.
	  TASK: Destroys the container.
	————————————————————————————————————————————————————————————————————————————*/
	destroy() {
		var t = this;

		if (!t._sta)
			return;
		t._curFocus = null;
		if (t._tabCache) {
			t._tabCache.length = 0;
			t._tabCache = null;
		}
		t._defFocus = null;
		super.destroy();		// inherited destroy
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC:	attach [override].
	  TASK:	
		Attaches a member component to the container, if new component 
		is a control, invalidates tab cache.
	  ARGS:
		component		: TComponent :	new member component :DEF: null.
	  RETV: Boolean		: True on success
	——————————————————————————————————————————————————————————————————————————*/
	attach(component = null) {
		if (!super.attach(component))
			return false;
		if (component instanceof TControl)
			this._calcTabs = true;
		return true;
	}
	
	/*————————————————————————————————————————————————————————————————————————————
	  FUNC:	detach [override]
	  TASK:	
		Detaches a member component from the container, if removed 
		component is a control, invalidates tab cache.
	  ARGS:
		component : TComponent	: member component to detach [d = null].
	  RETV:			Boolean		: True on success
	  ——————————————————————————————————————————————————————————————————————————*/
	detach(component){
		if (!super.detach(component))		
			return false;	
		if (component instanceof TControl)
			this._calcTabs = true;
		return true;
	}

	
	/*——————————————————————————————————————————————————————————————————————————
		SUBSYS: Focus & Tab control	
		Automatic management of focusing, tab ordering for sub controls. 
	——————————————————————————————————————————————————————————————————————————*/
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: fetchFocusChildren
	  TASK: Finds all focusable controls in container.
	  ARGS:	tabOnly	: Boolean	: list only tab enabled :DEF: false.
	  RETV:			: Array		: focusable controls in the container or null.
	——————————————————————————————————————————————————————————————————————————*/
	fetchFocusChildren(tabOnly = false){
		var t = this,
			m,
			c,
			a = [];

		for(c of t._subCtls){
			if (!c._interact || (c._tabIndex < 0 && tabOnly))
				continue;
			if ((c instanceof TContainer) &&
                (!c.class.defaultCanEmptyFocus) && 
                (c.fetchFocusChildren() === null))
                    continue;
			a.push(c);
		}
		return (a.length === 0) ? null: a;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: nextTab
	  TASK: Finds next control to tab focus in container.
	  ARGS:	
		backward : Boolean :	Find in backwards direction.
	  RETV:
				 : TControl :	Next control to key focus in container.
								if null, container has no focusable control.
								or tabsLoop is false and focus is out.
	——————————————————————————————————————————————————————————————————————————*/
	nextTab(backward = false) {
		var l,
			i;

		if (this._calcTabs)
			this.calculateTabs();
		if (this._tabCache === null)
			return null;
		i = this._tabCache.indexOf(this._curFocus);
		l = this._tabCache.length - 1;
		i = (i === -1) ? ((backward) ? l : 0):((backward) ? i - 1 : i + 1);
		if (i < 0)
			i = (this._tabsLoop) ? ((backward) ? l : 0) : 0;
		if (i > l)
			i = (this._tabsLoop) ? ((!backward) ? 0 : l) : l;
		return this._tabCache[i];
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: calculateTabs.
	  TASK: Calculates tab order into tab cache array.
	——————————————————————————————————————————————————————————————————————————*/
	calculateTabs() {
		var t = this,
			i;

		t._calcTabs = false;
		t._tabCache = t.fetchFocusChildren(true);
		if (t._tabCache === null)
			return;
		t._tabCache.sort(function(a, b) {return a._tabIndex - b._tabIndex;});
		for(i in t._tabCache)
			t._tabCache[i]._tabIndex = i;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROC: invalidateContainerTabs
	  TASK: Invalidates current tabs cache.
	——————————————————————————————————————————————————————————————————————————*/
	invalidateContainerTabs() {
		this._calcTabs = true;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: focusable
	  TASK: Discover if a control is focusable within the container.
	  ARGS: c : TControl	: The control to check focusability.
	  RETV:		Boolean	: true if control is focusable.
	——————————————————————————————————————————————————————————————————————————*/
	focusable(c = null) {
		return (c instanceof TControl && c._interact && c.container === this);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: validFocus
	  TASK: Finds the valid focus control in container.
	  RETV:   : TControl : valid focus control, or null, if there is none.
	——————————————————————————————————————————————————————————————————————————*/
	validFocus() {
		var c;

		if (this.focusable(this._curFocus))		// if current focus is valid.
			return(this._curFocus);
		c = this.nextTab();
		if (c !== null)
			return c;
		return ((this.class.canFocusWhenEmpty) ? this : null);
	}

	/*——————————————————————————————————————————————————————————————————————————
	 	TContainer get sets
	——————————————————————————————————————————————————————————————————————————*/

    /*——————————————————————————————————————————————————————————————————————————
	  PROP:	tabsLoop : boolean.
	  GET : Returns if tabs loop for tab enabled controls in container.
	  SET : Sets the tabs loop condition for tab enabled controls in container.
	——————————————————————————————————————————————————————————————————————————*/
	get tabsLoop() {
		return(this._tabsLoop);
	}

	set tabsLoop(val = null){
		this._tabsLoop = !!val;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	focus : TControl.
	  GET : Returns current control that has focus in the container.
	  SET : Sets the focus to a control in the container.
	  WARN: 
		Setting the focus of a container will not set focus TO the container.
		To focus to a container, setFocus() method should be called.
	——————————————————————————————————————————————————————————————————————————*/
	get focus() {
		return(this._curFocus);
	}

	set focus(val = null){
		var d = core.display;

		if(!this.focusable(val))	// ignore if not focusable
			return;		  
		this._curFocus = val;
		if (d.currentContainer != this)
			return;
		if (d.currentControl != val)
			d.currentControl = val;
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	defaultControl : TControl.
	  GET : Returns the control to activate when enter key is pressed.
	  SET : Sets    the control to activate when enter key is pressed.
  ——————————————————————————————————————————————————————————————————————————*/
	get defaultControl() {
		return(this._defFocus);
	}

	set defaultControl(val = null){
		if (!val || !this.focusable(val))
			return;
		this._defFocus = val;
	}
}

sys.registerClass(TContainer);
