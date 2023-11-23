/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	IVT : İhsan V. Töre
  About		: 	TLabel.js: Tore Js TLabel control component class.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/

import { sys, i18n } from "../lib/index.js";
import { TControl } from "../ctl/index.js";

/*——————————————————————————————————————————————————————————————————————————
  CLASS: TLabel
  TASKS: TLabel is a control for displaying simple text.
——————————————————————————————————————————————————————————————————————————*/
export class TLabel extends TControl {

	static allowMemberClass = null;		// no members allowed.
    static defaultCanFocus = false;     // Not focusable by default.

    static cdta = {
        autoW: {value: 'fit'},
        autoH: {value: 'max'},
		tag: {value: null},
		text: {value: null},
		textAlign: {value: "left"},
		wrap: {value: false}
	}

    static initialStyle = {whiteSpace: "pre", textAlign: "left" };

    _autoW = 'fit'; // override
    _autoH = 'max'; // override
	_tag = null;
	_out = null;
	_wrap = false;
	_text = null;
	_textAlign = "left";

    _oO = '';       // old out
    
	/*——————————————————————————————————————————————————————————————————————————
	  CTOR: constructor.
	  TASK: Constructs a TLabel component, attaches it to its owner if any.
	  ARGS: 
		name  : string		: Name of new control :DEF: null.
							  if Sys.LOAD, construction is by deserialization.
		owner : TComponent	: Owner of the new control if any :DEF: null.
		data  : Object		: An object containing instance data :DEF: null.
	——————————————————————————————————————————————————————————————————————————*/
	constructor(name = null, owner = null, data = null) {
		super(name);
        this.initControl(name, owner, data);
		if (this._out === null)
			this.text = this._nam;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: renderContent
	  TASK: This draws the Label content. Called by render before new frame.
      INFO: To be overridden by controls manipulating the DOM. 
      WARN: After content rendering, autoAdjust() is required. 
            Call super.renderContent() or 
            if ascendant control is so different, call autoAdjust() directly.
	——————————————————————————————————————————————————————————————————————————*/
	renderContent() {
        if (this._oO === this._out)
            return;
        this._oO = this._out;
    	this._element.innerHTML = this._out;
        super.renderContent();
	}

	/*——————————————————————————————————————————————————————————————————————————
      FUNC: _maxW [protected] [override].
      TASK: This finds the maximum control width required for the content.
      RETV:     : number : maximum control width for the content.
      INFO: 
        *   Called by autoFitW or autoMaxW in TLabel. 
        *   When autoW is "fit" or "max", tries to find maximum label
            width required for contents ignoring any boundaries.
        *   This maximum is according to the content.
    ——————————————————————————————————————————————————————————————————————————*/
    _maxW() {
        return measureText(this).width + this._shellW + 1; 
        // + 1 for position: absolute.        
    }

        
    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: _autoFitW [protected] [override].
	  TASK:	Adjusts the width of control regarding its owner and its content.
	  RETV:     : boolean	: true if width change will occur.
      INFO: 
        *   This is the overridden algorithm for TLabel.
        *   This is called from private calcAutoW() method which is 
            called by t.autoAdjust() when autoW resolves to "fit".
        *   Calculations are done at rendering via setting css. 
        *   During adjusting, setting width is prioritized over height.
	——————————————————————————————————————————————————————————————————————————*/
    _autoFitW() {   
        var t = this,
            n,      // max needed width. 
            p,
            r;      // max possible width.

        if (t._caW !== "fit")
			return false;
        n = t._maxW();
        p = t.maxContainableInnerW() + t._shellW;
        r = (n > p) ? p : n;
        if (r === t._w) // && t._w === parseFloat(t._computed.width || '0'))
            return false;
        t._w = r;
        t._cvW = '' + r + 'px';
        t._cCssWait = true;
        return true;
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: _autoMaxW [protected].
	  TASK:	Adjusts the width of control regarding its content only.
	  RETV:     : boolean	: true if width change is in shadowed style.
      INFO: 
        *   This is called from private calcAutoW() method which is 
            called by t.autoAdjust() when autoW resolves to "max".
        *   This is the overridden algorithm for TLabel.
        *   Calculations are done at rendering via setting css.  
        *   During adjusting, setting width is prioritized over height.
	——————————————————————————————————————————————————————————————————————————*/
	_autoMaxW() {
        var t = this,
            r;

		if (t._caW !== 'max')
			return false;
        r = t._maxW();
        if (r === t._w) // && t._w === parseFloat(t._computed.width || '0'))
            return false;
        t._w = r;
        t._cvW = '' + r + 'px';
        t._cCssWait = true;
        return true;
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: _autoFitH [protected].
	  TASK:	Adjusts the height of TLabel regarding its owner and its content.
	  RETV:     : boolean	: true if height change will occur.
      INFO: 
        *   This is called from private calcAutoH() method which is 
            called by t.autoAdjust() when autoH resolves to "fit".
        *   This is the overridden algorithm for TLabel.
        *   Calculations are done at rendering via setting css. 
        *   During adjusting, setting width is prioritized over height.
	——————————————————————————————————————————————————————————————————————————*/
	_autoFitH() {
		var t = this;
 
		if (t._caH !== 'fit')
			return false;

        return t._calcAutoCss('height', '_h', '_cvH', '_cpH', 'fit-content');
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: _autoMaxH [protected][override].
	  TASK:	Tries to fit height of control.
	  RETV:     : boolean	: true if height change is in shadow style.
      INFO: 
        *   This is called from private calcAutoH() method which is 
            called by t.autoAdjust() when autoH resolves to "fit".
        *   This is the overridden algorithm for TLabel.
        *   Calculations are done at rendering via setting css.    
        *   During adjusting, setting width is prioritized over height.
	——————————————————————————————————————————————————————————————————————————*/
	_autoMaxH() {
		var t = this;

		if (t._caH !== 'max')
			return false;
        return t._calcAutoCss('height', '_h', '_cvH', '_cpH', 'max-content');
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC:	doLanguageChange
	  TASK:	Signals component that language has changed.
	——————————————————————————————————————————————————————————————————————————*/
	doLanguageChange() {
		if (this._tag)
			calcOut(this, i18n.find(v));
		super.doLanguageChange();
	}

	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	tag : String;
	  GET : Returns the text selector tag.
	  SET : Sets    the text selector tag.
	  INFO:
		This property is the internationalization(i18n) interface for texts.
		Tag has precedence over text property.
		If tag is set to null text value will be valid.
	————————————————————————————————————————————————————————————————————————————*/
	get tag() {
		return(this._tag);
	}

	set tag(val = null) {
		if (typeof val !== 'string') {
			if (val !== null)
				return;
		}
		if (this._tag === val)
			return;
		this._tag = val;
		calcOut(this, (val === null) ? this._text : i18n.find(val));
	}

	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	text : String or Array;
	  GET : Returns the text data.
	  SET : Sets    the text data.
	  INFO:
		This property is direct text interface for texts.
		Tag has precedence over text property.
		Text value will be shown only when tag is null.
	————————————————————————————————————————————————————————————————————————————*/
	get text() {
		return(this._text);
	}

	set text(value = null) {
		this._text = value;
		if (this._tag !== null)
			return;
		calcOut(this, value);
	}

	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	textAlign : String.
	  GET : Returns the text alignment.
	  SET : Sets    the text alignment.
	  INFO: Values can be "left", "center", "right", "justify"
	————————————————————————————————————————————————————————————————————————————*/
	get textAlign() {
		return(this._textAlign);
	}

	set textAlign(val = null) {
		if (!val || this._textAlign == val || alignVals.indexOf(val) == -1)
			return;
		this._shadowed.textAlign = val;
		this.invalidate();
	}
	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	wrap : boolean;
	  GET : Returns if wrapping is enabled or not.
	  SET : Sets    if wrapping is enabled or not.
	————————————————————————————————————————————————————————————————————————————*/
	get wrap() {
		return(this._wrap);
	}

	set wrap(val = false) {
		val = !!val;
		if (this._wrap != val)
			this._wrap = val;
		this._shadowed.whiteSpace = (this._wrap ? "pre-wrap" : "pre");
		this.invalidate();
	}

	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	output : String;
	  GET : Returns the output string.
	————————————————————————————————————————————————————————————————————————————*/
	get output() {
		return this._out;
	}
}

const alignVals = ["left","center","right","justify"];

// private methods.

function calcOut(t, data = null) {
	var o;
	while(true) {
		if (typeof data === "string") { 
			o = data;
			break;
		}
		if (Array.isArray(data)) {
			o = data.join('\n');
			break;
		}
		o = data.toString();
		break;
	}
	if (o !== t._out) {
		t._out = o;
		t.contentChanged();
	}
}

function measureText(t) {
	var ctx = textCtxt,
		sty = t._computed,
		txt = t._out;

	if (!txt || txt === "")
		return 0;
    ctx.font =  (sty.fontWeight || '400') + ' ' + 
                (sty.fontSize || '16px') + ' ' +
                (sty.fontFamily || 'system-ui'); 
	return ctx.measureText(txt);
}

function initCalc(){
	var c = document.createElement("canvas");
	c.id = 'TextCalculator';
	return c;
}

var textCalc = initCalc(),
	textCtxt = textCalc.getContext("2d");

sys.registerClass(TLabel);