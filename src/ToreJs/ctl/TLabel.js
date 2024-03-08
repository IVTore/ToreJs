/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	IVT : İhsan V. Töre
  About		: 	TLabel.js: Tore Js TLabel control component class.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/

import { sys, i18n } from "../lib/index.js";
import { TControl, TCtl } from "../ctl/index.js";
import { TBaseCssControl } from "./TBaseCssControl.js";


// Text Alignment values.
const alignVals = ["left","center","right","justify"];

/*——————————————————————————————————————————————————————————————————————————
  CLASS: TLabel
  TASKS: TLabel is a control for displaying text.
——————————————————————————————————————————————————————————————————————————*/
export class TLabel extends TBaseCssControl {

    static elementTag = 'label';
	static allowMemberClass = null;		// no members allowed.
    static defaultCanFocus = false;     // Not focusable by default.

    static cdta = {
        autoW: {value: 'fit'},          // override.
        autoH: {value: 'max'},          // override.
		text: {value: null},
		textAlign: {value: "left"},
		wrap: {value: false}
	}

    static initialStyle = {whiteSpace: "pre", textAlign: "left", ...TControl.initialStyle}; 

    _autoW = 'fit';                     // override.
    _autoH = 'max';                     // override.
	_selector = null;
	_out = null;
	_wrap = false;
	_text = null;
	_textAlign = "left";

    _oldOut = '';       // old out
    
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
        if (this._oldOut === this._out)
            return;
        this._oldOut = this._out;
    	this._element.textContent = this._out;
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
        return TCtl.measureText(this, this._out).width + this._shellW + 1; 
        // + 1 for position: absolute.        
    }

    /*——————————————————————————————————————————————————————————————————————————
      FUNC: _calcOut [protected].
      TASK: This calculates the output text.
    ——————————————————————————————————————————————————————————————————————————*/
    _calcOut() {
        var t = this,
            v = t._text,
            o;

        while(true) {
            if (typeof v === "string") { 
                o = v;
                break;
            }
            if (Array.isArray(v)) {
                o = v.join('\n');
                break;
            }
            o = v.toString();
            break;
        }
        if (o !== t._out) {
            t._out = o;
            t.contentChanged();
        }
    }
    /*——————————————————————————————————————————————————————————————————————————
	  FUNC:	doLanguageChange
	  TASK:	Signals component that language has changed.
	——————————————————————————————————————————————————————————————————————————*/
	doLanguageChange() {
		if (this._selector) {
			this._text = i18n.find(this._selector);
            this._calcOut();
        }
		super.doLanguageChange();
	}


   	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	selector : String;
	  GET : Returns the text selector if any.
	————————————————————————————————————————————————————————————————————————————*/
	get selector() {
		return this._selector;
	}

	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	text : String or Array;
	  GET : Returns the text data.
	  SET : Sets    the text data.
	  INFO:
		If a selector is given, selector will be stored and
        value found in i18n will be displayed. 
	————————————————————————————————————————————————————————————————————————————*/
	get text() {
        if (this._sta === sys.SAVE && this._selector !== null)
            return this._selector;
		return this._text;
	}

	set text(val = '') {
        if (typeof val !== 'string') 
            exc('E_INV_ARG', 'text');
        if (val === this._text || (this._selector && val === this._selector))
            return;
        this._text = i18n.findSet(val, this, '_selector') || val;
 		this._calcOut();
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
		if (!val || this._textAlign === val || alignVals.indexOf(val) === -1)
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

}

sys.registerClass(TLabel);
