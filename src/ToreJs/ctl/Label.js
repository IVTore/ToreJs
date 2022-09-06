/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	IVT : İhsan V. Töre
  About		: 	Label.js: Tore Js Label control component class.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/

import { is, sys } from "../lib/index.js";
import { ctl } from "../ctl/index.js";
import { Control } from "../ctl/index.js";

/*——————————————————————————————————————————————————————————————————————————
  CLASS: Label
  TASKS: Label is a control for displaying texts.
——————————————————————————————————————————————————————————————————————————*/
export class Label extends Control {

	static allowMemberClass = null;		// no members allowed.

	static cdta = {
		autosize: {value: true},
		tag: {value: null},
		text: {value: null},
		textAlign: {value: "left"},
		wrapEnabled: {value: false}
	}

	_tag = null;
	_out = null;
	_wrap = false;
	_text = null;
	_textAlign = "left";

	/*——————————————————————————————————————————————————————————————————————————
	  CTOR: constructor.
	  TASK: Constructs a Label component, attaches it to its owner if any.
	  ARGS: 
		name 	: string	: Name of new control :DEF: null.
							  if Sys.LOAD, construction is by deserialization.
		owner	: Component	: Owner of the new control if any :DEF: null.
		data	: Object	: An object containing instance data :DEF: null.
	——————————————————————————————————————————————————————————————————————————*/
	constructor(name = null, owner = null, data = null) {
		super(name);
		this._shade.whiteSpace = "pre";
		this._shade.textAlign = "left";
		this._autosize = true;
		if (name == sys.LOAD)
			return;
		this.text = this._nam;
		this._initControl(owner, data);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC:	renderContent [override].
	  TASK:	Renders the content of label.
	——————————————————————————————————————————————————————————————————————————*/
	renderContent() {
		this._element.innerHTML = this._out;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC:	doLanguageChange
	  TASK:	Signals component that language has changed.
	——————————————————————————————————————————————————————————————————————————*/
	doLanguageChange() {
		if (this._tag) {
			this._out = calcOut(core.i18n.find(v));
			this.contentChanged();
		}
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

	set tag(v = null) {
		if (!is.str(v)){
			if (v !== null)
				return;
		}
		if (this._tag == v)
			return;
		this._tag = v;
		this._out = calcOut((v == null) ? this._text : core.i18n.find(v));
		this.contentChanged();
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
		this._out = calcOut(value);
		this.contentChanged();
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

	set textAlign(value = null) {
		if (!value || this._textAlign == value || alignVals.indexOf(value) == -1)
			return;
		this._shade.textAlign = value;
		this.invalidate();
	}
	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	wrapEnabled : boolean;
	  GET : Returns if wrapping is enabled or not.
	  SET : Sets    if wrapping is enabled or not.
	————————————————————————————————————————————————————————————————————————————*/
	get wrapEnabled() {
		return(this._wrap);
	}

	set wrapEnabled(value = false) {
		value = !!value;
		if (this._wrap != value)
			this._wrap = value;
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

function calcOut(data) {
	if (is.str(data))
		return data;
	if (is.arr(data))
		return data.join('\n');
	return data.toString();
}

sys.registerClass(Label);