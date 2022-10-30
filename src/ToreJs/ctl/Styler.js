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
	Attaching members to styler is not allowed.

  USAGE:	
	
	The rules are always class level, unless stated otherwise 
	(internally prepended with a '.').
	
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

	Various rules may be set directly on element style by the control: 
	top, left, right, bottom, width, height, zIndex, visibility, opacity.
	
	Controls assume boxSizing as borderBox and margins as 0.
——————————————————————————————————————————————————————————————————————————*/

class Styler extends Component {

	static allowMemberClass = null;
	static cdta = {};
	
	// Less than 576 is xs, 768 is sm, 992 is md etc.
	_vpSizes = [ 576, 768, 992, 1200, 1400];
	_vpNames = ['xs','sm','md','lg','xl','xxl'];
	_css = null;			// document.styleSheets[0].
	_rls = null;			// Rules list.
	_pxr = 0;				// Pixels in 1rem.
	_vnm = 'md';			// Viewport size name.
	_dyn = {};				// Dynamic values bank.
	
	/*——————————————————————————————————————————————————————————————————————————
	  CTOR: constructor.
	  TASK: Constructs styler singleton component, attaches it to core.
	——————————————————————————————————————————————————————————————————————————*/
	constructor(){
		var s;

		if (core["styler"])
			exc("E_SINGLETON", "core.styler");
		super("styler", core);
		s = window.getComputedStyle(document.documentElement);
		this._pxr = parseInt(s.fontSize, 10);
		this._vnm = this.calculateViewportName(document.documentElement.clientWidth);
		setupStyleSheet(this);
		captureCssRules(this);
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  DTOR: destructor.
	  TASK: Destroys component.
	  INFO: Do not destroy styler.
	  		If you are completely getting rid of ToreJs use core.destroy();
	——————————————————————————————————————————————————————————————————————————*/
	destroy() {
		this._css = null;			//	Uncouple.
		this._rls = null;
		super.destroy();
	}

	get viewportName() {
		return this._vnm;
	}

	/*—————————————————————————————————————————————————————————————————————————
	  FUNC: calculateMediaSizeName
	  TASK: Returns the viewport size name.
	  RETV:		: String	: viewport size name.
	—————————————————————————————————————————————————————————————————————————*/
	calculateViewportName() {
		var s = this._vpSizes,
			w = document.documentElement.clientWidth,
			i,
			l = s.length;
	
		for(i = 0; i < l; i++) {
			if (w < s[i])
				return this._vpNames[i];
		}
		return this._vpNames[l];
	}

	/*—————————————————————————————————————————————————————————————————————————
	  FUNC: doViewportChange
	  TASK: Applies a media change to css.
	  INFO: Called from Display.
	—————————————————————————————————————————————————————————————————————————*/
	doViewportChange() {
		var n = this.calculateViewportName();

		if (n == this._vnm)
			return;
		this._vnm = n;
		applyDynamicRules(this);
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
		var t = this,
			i,
			s,
			r;

		if (!is.str(name) || !is.plain(rule))
			return;
		if (asClass)
			name = "." + name;
		i = t._rls.indexOf(name);
		if (i > -1)
			t.delRule(name, false); // we already added '.' if asClass.		
		i = t._css.insertRule(name + " {}", t._css.cssRules.length);
		t._rls.splice(i, 0, name);
		s = t._css.cssRules[i].style;
		for(i in rule){
			r = rule[i];
			if (!r)
				continue;
			if (is.str(r)){
				s[i] = r;
				continue;
			}
			if (!is.plain(r))
				continue;
			if (!t._dyn[name])
				t._dyn[name] = {};
			t._dyn[name][i] = r;
			if (r[t._vnm]){
				s[i] = r[t._vnm];
				continue;
			}
			if (is.str(r.df)){
				s[i] = r.df;
				continue;
			}
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
		var i;

		if (asClass)
			name = "."+name;
		i = this._rls.indexOf(name);
		if (i < 0)
			return;
		this._css.deleteRule(i);
		this._rls.splice(i, 1);
		delete this._dyn[name];
	}

	get viewportSizeName() {
		return this._vnm;
	}
}

export const styler = new Styler();


// Private methods

// Captures all rule selectors in document.styleSheets[0].
function captureCssRules(t) {
	var lst = t._css.cssRules,
		i,
		l = lst.length;

	t._rls = [];
	for(i = 0; i < l; i++)
		t._rls.push(lst[i].selectorText);
}

// Applies all media size dependent dynamic rules.
function applyDynamicRules(t) {
	var sName,
		sItem,
		style,
		n,
		r;
	
	for(sName in t._dyn){
		sItem = t._dyn[sName];
		style = t._css.cssRules[t._rls.indexOf(sName)];
		if (!style) {
			console.log("Dynamic Rule:", sName, "not found.")
			continue;
		}
		style = style.style;
		for(n in sItem) {
			r = sItem[n];
			if (r[t._vnm]){
				style[n] = r[t._vnm];
				continue;
			}
			if (is.str(r.df)){
				style[n] = r.df;
				continue;
			}
		}
	}
}

// Sets up the base styles of ToreJS
function setupStyleSheet(t) {
	var s;

	t._rls = [];
	if (!document.styleSheets[0]){
		s = document.createElement('style');
		s.type = 'text/css';
		document.head.appendChild(s);	
	}
	t._css = document.styleSheets[0];

	t.addRule("*",{ 
		boxSizing: 'border-box',
		position: 'absolute',
		overflow: 'hidden',
		border: '0px',
		margin: '0px',
		padding: '0px'
	}, false);
	
	t.addRule("html",{
		display: 'block',
		backgroundColor: '#EEEEEE',
		color:'#000000',

		fontFamily: "'system-ui', sans-serif",	/* Text defaults */
		fontSize: '1rem',
		lineHeight: '1.4',
		textDecoration: 'none',
										/* 3d defaults */
		transformStyle: 'preserve-3d',
		backfaceVisibility: 'hidden',
		perspective: '1000px',		
										/* Disable touch auto pan zoom */
		WebkitTouchCallout: 'none',
		touchAction: 'none',
										/* Disable text selection. */
		WebkitUserSelect: 'none',
		userSelect: 'none',
	}, false);


}