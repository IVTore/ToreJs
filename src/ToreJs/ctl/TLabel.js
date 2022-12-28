/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	IVT : İhsan V. Töre
  About		: 	TLabel.js: Tore Js TLabel control component class.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/

import { core, is, sys } from "../lib/index.js";
import { TControl } from "../ctl/index.js";

/*——————————————————————————————————————————————————————————————————————————
  CLASS: TLabel
  TASKS: TLabel is a control for displaying texts.
——————————————————————————————————————————————————————————————————————————*/
export class TLabel extends TControl {

	static allowMemberClass = null;		// no members allowed.

	static cdta = {
		tag: {value: null},
		text: {value: null},
		textAlign: {value: "left"},
		wrap: {value: false}
	}

	_tag = null;
	_out = null;
	_wrap = false;
	_text = null;
	_textAlign = "left";

	/*——————————————————————————————————————————————————————————————————————————
	  CTOR: constructor.
	  TASK: Constructs a TLabel component, attaches it to its owner if any.
	  ARGS: 
		name 	: string	: Name of new control :DEF: null.
							  if Sys.LOAD, construction is by deserialization.
		owner	: TComponent	: Owner of the new control if any :DEF: null.
		data	: Object	: An object containing instance data :DEF: null.
	——————————————————————————————————————————————————————————————————————————*/
	constructor(name = null, owner = null, data = null, init = true) {
		super(name, null, null, false);
		this._shade.whiteSpace = "pre";
		this._shade.textAlign = "left";
		this._autosize = true;
		if (name !== sys.LOAD)
			this.text = this._nam;
		this._initControl(name, owner, data, init);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC:	renderContent [override].
	  TASK:	Renders the content of label.
	——————————————————————————————————————————————————————————————————————————*/
	renderContent() {
		this._element.innerHTML = this._out;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: recalculate [override].
	  TASK: Called by display, this calculates the necessary values for
			the control after rendering.
	——————————————————————————————————————————————————————————————————————————*/
	recalculate() {
		super.recalculate();
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: widthToFit
	  TASK: Sets width to fit the content.
	  RETV: 	: Boolean : True if width changed.
	  INFO: This is called when autoWidth = "fit".
	  		Active at recalculation frame, causes reflow. 
	——————————————————————————————————————————————————————————————————————————*/
	widthToFit() {
		var s = this._element.style,
			w = this.maxAllowedInnerWidth() + this._shellW,
			m;
		
		s.width = 'max-content';
		m = parseFloat(this._computed.width || '0');
		if (m <= w)
			w = m; 
		if (w === this._width) {
			s.width = '' + this._width + 'px';
			return false;
		}
		return this._setW(w);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: heightToFit
	  TASK: Sets height to fit the content.
	  RETV: 	: Boolean : True if height changed.
	  INFO: This is called when autoHeight = "fit".
	  		Active at recalculation frame, causes reflow. 
	——————————————————————————————————————————————————————————————————————————*/
	/*
	heightToFit() {
		var s = this._element.style,
			h = this.maxAllowedInnerHeight() + this._shellH,
			m;
		
		s.height = 'max-content';
		m = parseFloat(this._computed.height || '0');
		if (m <= h)
			h = m; 
		if (h === this._height) {
			s.height = '' + this._height + 'px';
			return false;
		}
		return this._setH(h);
	}
	*/
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC:	doLanguageChange
	  TASK:	Signals component that language has changed.
	——————————————————————————————————————————————————————————————————————————*/
	doLanguageChange() {
		if (this._tag)
			calcOut(this, core.i18n.find(v));
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
		if (!is.str(val)){
			if (val !== null)
				return;
		}
		if (this._tag == val)
			return;
		this._tag = val;
		calcOut(this, (val == null) ? this._text : core.i18n.find(val));
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
		this._shade.textAlign = val;
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
		this._shade.whiteSpace = (this._wrap ? "pre-wrap" : "pre");
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

function calcTextWidth(t) {
	var ctx = textCtxt,
		sty = t._computed,
		txt = t._out,
		wid;

	if (!txt || txt === "")
		return 0;
	wid = (txt.length * (parseFloat(sty.fontSize) || 12) * 0.5);
	if (wid > screen.availWidth)		// very long text, will always need calculation.
		return screen.availWidth;		// so no need to calculate actual width.
	ctx.font = (sty.fontWeight || '400') + ' ' + (sty.fontSize || '16px') + ' ' +	(sty.fontFamily || 'system-ui'); 
	return ctx.measureText(txt).width;
}

function initCalc(){
	var c = document.createElement("canvas");
	c.id = 'TextCalculator';
	c.style = "visibility:hidden;"
	//core.display._element.appendChild(c);
	return c;
}

var textCalc = initCalc(),
	textCtxt = textCalc.getContext("2d");

sys.registerClass(TLabel);