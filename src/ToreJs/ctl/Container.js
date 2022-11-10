/*——————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	IVT : İhsan V. Töre
  About		: 	Container.js: Tore Js container control component class.
  License 	:	MIT.
——————————————————————————————————————————————————————————————————————————*/

import { is, sys, core } from "../lib/system.js";
import { Control } from "./Control.js";

/*——————————————————————————————————————————————————————————————————————————
  CLASS: Container
  TASKS: Defines Container base control class. 
		 Container class is the anchestor of all control classes which 
		 need automatic management of focusing and tab ordering for sub 
		 controls.
——————————————————————————————————————————————————————————————————————————*/
export class Container extends Control {

	static canFocusWhenEmpty = false;
	static canFocusDefault = true;

	static cdta = {
		tabsLoop		: {value: false},
		focus			: {value: null},
		defaultControl	: {value: null}
	}
	_tabsLoop = true;		// tab enabled.
	_tabCache = null;		// tabs cache.
	_calcTabs = true;		// tabs recalculate flag.
	_curFocus = null;		// current focused control.
	_defFocus = null;		// default focus control.

	/*——————————————————————————————————————————————————————————————————————————
	  CTOR: constructor.
	  TASK: Constructs a Container component, attaches it to its owner if any.
	  ARGS: 
		name 	: string	: Name of new control :DEF: null.
							  if Sys.LOAD, construction is by deserialization.
		owner	: Component	: Owner of the new container if any :DEF: null.
		data	: Object	: An object containing instance data :DEF: null.
	——————————————————————————————————————————————————————————————————————————*/
	constructor(name = null, owner = null, data = null, init = true) {
		super(name, null, null, false);
		this._initControl(name, owner, data, init);
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
	  FUNC: makeElement [override].
	  TASK: Builds and binds a document object model element to control.
			Containers are made of two divs.
			Outer div is absolute positioned.
			Inner div is relative positioned and is a wrapper.
			This way the coordinate consistency is preserved.
	——————————————————————————————————————————————————————————————————————————*/
	makeElement() {
		var s;

		super.makeElement();
		if (this._wrapper !== this._element)
			return;
		this._wrapper = document.createElement('div');
		this._wrapper.ToreJS_Control = this;
		this._element.appendChild(this._wrapper);	
		s = this._wrapper.style;
		s.position = "relative";
		s.width = "auto";
		s.height = "auto";
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: killElement [override].
	  TASK: Frees container from its DOM elements.
	——————————————————————————————————————————————————————————————————————————*/
	killElement() {
		var e = this._wrapper;

		if (!e)
			return;
		if (is.asg(e.ToreJS_Control))
			delete(e.ToreJS_Control);	
		if (e.parentNode)
			e.parentNode.removeChild(e);
		super.killElement();
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC:	attach [override].
	  TASK:	
		Attaches a member component to the container, if new component 
		is a control, invalidates tab cache.
	  ARGS:
		component		: Component :	new member component :DEF: null.
	  RETV: Boolean		: True on success
	——————————————————————————————————————————————————————————————————————————*/
	attach(component = null) {
		if (!super.attach(component))
			return false;
		if (component instanceof Control)
			this._calcTabs = true;
		return true;
	}
	
	/*————————————————————————————————————————————————————————————————————————————
	  FUNC:	detach [override]
	  TASK:	
		Detaches a member component from the container, if removed 
		component is a control, invalidates tab cache.
	  ARGS:
		component : Component	: member component to detach [d = null].
	  RETV:			Boolean		: True on success
	  ——————————————————————————————————————————————————————————————————————————*/
	detach(component){
		if (!super.detach(component))		
			return false;	
		if (component instanceof Control)
			this._calcTabs = true;
		return true;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: render [override].
	  TASK: This draws the control. Called by display before new frame.
	  INFO: Containers have an inner wrapper div, this override avoids
			inconsistencies among element div and wrapper div inside it.
	——————————————————————————————————————————————————————————————————————————*/
	render() {
		var shade = this._shade,
			style = this._wrapper.style;

		if (shade.height)
			style.height = shade.height;
		if (shade.width)
			style.width = shade.width;
		if (shade.visibility)
			style.visibility = shade.visibility;
		super.render();
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

		for(c of t._ctl){
			if (!c._interact || (c._tabIndex < 0 && tabonly))
				continue;
			if (c instanceof Container && 
				!c.class.canFocusWhenEmpty && 
				c.fetchFocusChildren() === null) 
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
				 : Control :	Next control to key focus in container.
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
	  ARGS: c : Control	: The control to check focusability.
	  RETV:		Boolean	: true if control is focusable.
	——————————————————————————————————————————————————————————————————————————*/
	focusable(c = null) {
		return (c instanceof Control && c._interact && c.container === this);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: validFocus
	  TASK: Finds the valid focus control in container.
	  RETV:   : Control : valid focus control, or null, if there is none.
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
	 	Container get sets
	——————————————————————————————————————————————————————————————————————————*/

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	focus : Control.
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
	  PROP:	defaultControl : Control.
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
// Control class needs this, to avoid disrupting module hierarchy.
is.container = function(x) {return(x instanceof Container);} 

sys.registerClass(Container);
