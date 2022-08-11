/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	IVT : İhsan V. Töre
  About		: 	Styler.js: Tore Js control styles singleton component class.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/

import { sys, is, exc, core, Component } from "../lib/index.js";

/*——————————————————————————————————————————————————————————————————————————
  CLASS: Styler

  TASKS: 
	This component class makes a singleton accesible as styler or 
	core.styler	acting as a container for control styles. It works in 
	collaboration with document.styleSheets[0] and controls.

  USAGE:	
	The styler object is a Component just to make it bindable to core.
	Attaching members to styler is not allowed.
	The rules are always class level, internally prepended with a '.'.
		
	Some rules may be set directly on element style by the control: 
	top, left, right, bottom, width, height, zIndex, visibility, clip.	
	
	Controls assume boxSizing as borderBox and margins as 0.
	
	For convenience of use there are predefined sub-rule names:

	control.styleSize rule names : 
		Tiny, Small, Medium, Big, Large, Huge

	control.styleColor rule names : 
		First, Second, Done, Fail, Warn, Info, Light, Dark, Link.

	control state postfixes :
		Alive: Normal		state
		Hover: Pointer Over	state
		Focus: Focused		state
		Sleep: Disabled		state

	Controls modify their style className (element className) according to
	their controlState.

	Example: 
	- Let panel1 a Panel control.
	- panel1.styleSize = "Tiny"
	- panel1.styleColor = "Second"
	- panel1.styleName = "Extra"
	- panel1.controlState = ctl.ALIVE.
	- panel1 element class names will be:
	
		Panel PanelAlive
		Tiny TinyAlive PanelTiny PanelTinyAlive
		Second SecondAlive PanelSecond PanelSecondAlive
		Extra ExtraAlive PanelExtra PanelExtraAlive
		
	- If panel1 is hovered then panel1 element class names will be:

		Panel PanelHover
		Tiny TinyHover PanelTiny PanelTinyHover
		Second SecondHover PanelSecond PanelSecondHover
		Extra ExtraHover PanelExtra PanelExtraHover

——————————————————————————————————————————————————————————————————————————*/

class Styler extends Component {

	static allowMemberClass = null;

	_css = null;
	_rls = null;
	
	/*——————————————————————————————————————————————————————————————————————————
	  CTOR: constructor.
	  TASK: Constructs styler singleton component, attaches it to core.
	——————————————————————————————————————————————————————————————————————————*/
	constructor(){
		if (core["styler"])
			exc("E_SINGLETON", "core.styler");
		super("styler", core);
		this._css = document.styleSheets[0];
		setupStyles(this);
		captureCssRules(this);
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  DTOR: destructor.
	  TASK: Destroys styler singleton component.
	——————————————————————————————————————————————————————————————————————————*/
	destroy(){
		this._css = null;			//	Uncouple.
		this._rls = null;
		super.destroy();
	}

	/*—————————————————————————————————————————————————————————————————————————
	  FUNC: indexOf
	  TASK: Returns the index of a rule with the given name.
	  ARGS:
		name	: String	: rule name.
		asClass	: Boolean	: if true, name is searched as a class rule
							  prepended with a "." :DEF: true.
	  RETV:
				: int		: index of rule or if not found, -1.
	—————————————————————————————————————————————————————————————————————————*/
	indexOf(name = null, asClass = true) {
		if (!is.str(name))
			return -1;
		if (asClass)
			name = '.' + name;		// our rules (class) start with '.'
		return this._rls.indexOf(name);	// find index
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROC: addRule
	  TASK: Sets the contents of a rule with the given name and properties.
	  ARGS:
		name	: String	: rule name.
		rule	: Object	: Object containing style properties of rule.
		asClass	: Boolean	: if true, name is searched as a class rule
							  prepended with a "." :DEF: true.
	  INFO: If a rule with same name exists, old rule is deleted first. 
	——————————————————————————————————————————————————————————————————————————*/
	addRule(name = null, rule = null, asClass = true) {
		var i,
			p,
			s;

		if (!is.str(name) || rule == null)
			return;
		i = this.indexOf(name, asClass);
		if (i > -1)
			this.delRule(name, asClass);
		if (asClass)
			name = "." + name;
		p = this._css.insertRule(name + " {}", this._css.cssRules.length);
		t._rls.push(name);
		s = this._css.cssRules[p].style;
		for(i in rule){
			if (is.str(rule[i]))
				s[i] = rule[i];
		}
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROC: delRule
	  TASK: Removes a rule with the given name.
	  ARGS:
		name	: String	: rule name.
		asClass	: Boolean	: if true, name is searched as a class rule
							  prepended with a "." :DEF: true.
	——————————————————————————————————————————————————————————————————————————*/
	delRule(name = null, asClass = true) {
		var i = this.indexOf(name, asClass);

		if (i < 0)
			return;
		this._css.deleteRule(i);
		this._rls.splice(i, 1);
	}
}


// Private.
// Sets up the base styles of ToreJS
function setupStyles(t) {
	t.addRule("*",{boxSizing: 'border-box'}, false)

}



// Private.
// Captures all rule selectors in document.styleSheets[0].
function captureCssRules(t) {
	var lst = t._css.cssRules,
		i,
		l = lst.length;

	t._rls = [];
	for(i = 0; i < l; i++)
		t._rls.push(lst[i].selectorText);
}

sys.registerClass(Styler);

export const styler = new Styler();