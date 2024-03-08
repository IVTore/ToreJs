/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20230302
  Author	: 	IVT : İhsan V. Töre
  About		: 	TStyler.js: Tore Js control styles singleton component class.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/

import { sys, exc, core, TComponent } from "../lib/index.js";
import { TCtl } from "./TCtlSys.js";
import { TControl } from "./TControl.js";
import { display } from "./TDisplay.js";

/*——————————————————————————————————————————————————————————————————————————
  CLASS: TStyler

  TASKS: 
	This component class makes a singleton accesible as styler or 
	core.styler	acting as a container for control styles. It works in 
	collaboration with document.styleSheets[0] and controls.
	Attaching members to styler is not allowed.

  USAGE:	
	
	Viewport dependent values :

	Browser body element is represented by display singleton.
	When the display control is initialized and whenever it is resized
	via a browser resize, styler doViewportChange method is invoked.
	display control uses browser document.documentElement.clientWidth
	to calculate the viewport name. If name changes, the viewport
	dependant values in the css are changed by styler.

	The default viewport sizes are defined in TCtlSys.js as :
	TCtl.vpInfo: = {xs: 576, sm: 768, md: 992, lg: 1200, xl: 1400, xxl:null};
	    	
	To define a viewport dependant rule, a simple object is sufficient,
	such as the padding in the rule definition below:

	styler.addRule("TButtonMedium", {
		backgroundColor: '#EEEEEE',
		color:'#000000',
		padding: {
            xs: '0.5625rem',
            df: 'calc(0.52rem + 0.12vw)',
            xxl: '0.625rem'
        }
	});

	This creates a dynamic css rule registered as TButtonMedium.padding.
	If viewport is extra small (xs) the padding will be '0.5625rem',
	If viewport is extra extra large (xxl) it will be '0.625rem',
	on other viewport states, default (df) it will be 'calc(0.52rem + 0.12vw)'.

	RULES:

	The rules are always class level, unless stated otherwise 
	(internally prepended with a '.').
	
    These values are used by TControl and not to be used in rules.
	top, left, right, bottom, width, height, zIndex, visibility, opacity.
    
    margin: is banned. 
	
	Controls assume boxSizing as borderBox and margins as 0.

	For convenience of use there are conventions for rule namings:

    control.styleRoot rule name is by default set to control class name,
    but if class name starts with a 'T', it is removed.
        TControl -> 'Control';
        TButton -> 'Button';    

	control.styleSize rule name and postfixes : 
		Tiny, Small, Medium, Big, Large, Huge

	control.styleColor rule name and postfixes : 
		First, Second, Done, Fail, Warn, Info, Link.

	control state postfixes (Defined in TCtlSys as Control state names):
		Alive: Normal		state
		Hover: Pointer Over	state
		Focus: Focused		state
		Sleep: Disabled		state

	Controls modify their style classNames according to
	their controlState.

	Example: 
    - Let btn be a normal TButton.

    The defaults will be:

        btn.styleRoot = null; // defaults to "Button".
	    btn.styleSize = "Medium";
	    btn.styleColor = "First";
	    btn.styleExtra = null;

        The btn element class names will be:

    Button ButtonAlive
    Medium MediumAlive ButtonMedium ButtonMediumAlive
    First FirstAlive ButtonFirst ButtonFirstAlive
    
	- Let btn be a TButton control with a quirk of an image and some extra 
      styling.

    if :
        btn.styleRoot = "ImgButton";
	    btn.styleSize = "Medium";
	    btn.styleColor = "Second";
	    btn.styleExtra = "Stunning";
	
    The btn element class names will be:

    ImgButton ImgButtonAlive 
    Tiny TinyAlive ImgButtonTiny ImgButtonTinyAlive
    Second SecondAlive ImgButtonSecond ImgButtonSecondAlive
    Stunning StunningAlive ImgButtonStunning ImgButtonStunningAlive
    
    If it is hovered then btn element class names will be:

    ImgButton ImgButtonHover 
    Tiny TinyHover ImgButtonTiny ImgButtonTinyHover
    Second SecondHover ImgButtonSecond ImgButtonSecondHover
    Stunning StunningHover ImgButtonStunning ImgButtonStunningHover
	
——————————————————————————————————————————————————————————————————————————*/

// TControl size style class prefixes
var sizes = {
    Tiny: 1,
    Small: 1,
    Medium: 1,
    Big: 1,
    Large: 1,
    Huge: 1
};

// TControl color style class prefixes
var colors = {
    First: 1,
    Second: 1,
    Done: 1,
    Fail: 1, 
    Warn: 1, 
    Info: 1, 
    Link: 1
};


class TStyler extends TComponent {

	static allowMemberClass = null;
	static cdta = {};

	_tmn = null;            // Current theme name.
    _thr = null;            // Current theme rules name list.
	_css = null;			// document.styleSheets[0].
	_rls = null;			// Rules list.
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
		setupStyleSheet(this);
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

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: addRule
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

		sys.str(name, 'name');
		if (!sys.isPlain(rule))
			exc('E_INV_ARG', 'rule');
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
			if (typeof r === 'string'){
				s[i] = r;
				continue;
			}
			if (!TCtl.vpCheck(r))
                exc('E_INV_RULE_VAL', name + '.' + i);
			if (!t._dyn[name])
				t._dyn[name] = {};
			t._dyn[name][i] = Object.assign({}, r);
			if (r[t._vnm]){
				s[i] = r[t._vnm];
				continue;
			}
			if (typeof r.df === 'string') 
				s[i] = r.df;
		}
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: delRule
	  TASK: Removes a rule with the given name.
	  ARGS:
		name	: String	: rule name.
		asClass	: Boolean	: if true, name is searched as a class rule
							  prepended with a "." :DEF: true.
	——————————————————————————————————————————————————————————————————————————*/
	delRule(name = null, asClass = true) {
		var i;

		sys.str(name, 'name');
		if (asClass)
			name = "."+name;
		i = this._rls.indexOf(name);
		if (i < 0)
			return;
		this._css.deleteRule(i);
		this._rls.splice(i, 1);
		delete this._dyn[name];
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: applyDynamicRules
	  TASK: Applies all viewport size dependent dynamic rules.
	——————————————————————————————————————————————————————————————————————————*/
    applyDynamicRules() {
        var sName,
            sItem,
            style,
            vpnam = display.viewportName,
            n,
            r;
        
        for(sName in this._dyn){
            sItem = this._dyn[sName];
            style = this._css.cssRules[this._rls.indexOf(sName)];
            if (!style) {
                console.log("Dynamic Rule:", sName, "not found.")
                continue;
            }
            style = style.style;
            for(n in sItem) {
                r = sItem[n];
                if (r[vpnam]){
                    style[n] = r[vpnam];
                    continue;
                }
                if (typeof r.df === 'string')
                    style[n] = r.df;
            }
        }
    }

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: isColorStyleName
	  TASK: Checks if given value is a string and it is a Color style name.
      ARGS: colorName   : string  : Color style name to check.
      RETV:             : boolean : True if a Color style name.
	——————————————————————————————————————————————————————————————————————————*/
    isColorStyleName(colorName = null) {
        return (sys.str(colorName) && colors[colorName] === 1);
    }

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: isSizeStyleName
	  TASK: Checks if given value is a string and it is a Size style name.
      ARGS: sizeName    : string  : Size style name to check.
      RETV:             : boolean : True if a Size style name.
	——————————————————————————————————————————————————————————————————————————*/
    isSizeStyleName(sizeName = null) {
        return (sys.str(sizeName) && sizes[sizeName] === 1);
    }

}

sys.registerClass(TStyler);

export const styler = new TStyler();


// Private methods

// Captures all rule selectors in document.styleSheets[0].
function captureCssRules(t) {
	var r = t._css.cssRules,
		i,
		l = r.length;

	t._rls = [];
	for(i = 0; i < l; i++)
		t._rls.push(r[i].selectorText);
}

// Sets up the base styles of ToreJS
function setupStyleSheet(t) {
	var s;

	if (!document.styleSheets[0]){
		s = document.createElement('style');
		s.type = 'text/css';
		document.head.appendChild(s);	
	}
	t._css = document.styleSheets[0];

    captureCssRules(t);
	
    // these are also Control initial values.
    t.addRule("*",{ 
		boxSizing: 'border-box',
		position: 'absolute',
		overflow: 'clip',
		border: '0px',
		margin: '0px',
		padding: '0px',
        left:"0px",                 
        top:'0px',
        width:'32px',
        height:'32px',
        resize: 'none'
	}, false);
	
	t.addRule("html",{
		display: 'block',
		backgroundColor: '#FFFFFF',
		color:'#EEEEEE',

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