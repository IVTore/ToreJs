/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 20231228
  Author	: IVT : İhsan V. Töre
  About		: TBaseInput.js: 
				Tore Js input base visual control class.
  License	: MIT.
————————————————————————————————————————————————————————————————————————————*/

import {    
        exc, 
        sys,
        i18n
}                   from "../lib/index.js";                         
import { TBaseCssControl } from "./TBaseCssControl.js";


/*———————————————————————————————————————————————————————————————————————————— 
  CLASS: TBaseInput
  TASKS: Defines behaviours of Tore JS Linear input controls.
  USAGE: 
        * TBaseInput is abstract. Subclasses must be used. 
        * TBaseInput properties are common for text inputs like
          TInput, TTextArea, TInputPassword, TInputEmail.
        * Browser approach is not SOLID.
        * The input attribute values like size, maxLength, etc. are only 
          type checked. Giving proper values is up to developers.
        * TBaseInput does not allow sub components.
————————————————————————————————————————————————————————————————————————————*/
export class TBaseInput extends TBaseCssControl {

	// TBaseInput does not allow sub components.
	static allowMemberClass = null;
    static defaultCanFocus = true;    
	static elementTag = 'input';	

    static inputSizeChar = 'W'; // Sub controls calculate sizes with this.

    static cdta = {        
        value:          {value: ''},
        placeholder:    {value: ''},
        pattern:        {value: ''},
        dir:            {value: 'auto'},
        maxLength:      {value: 0},
        minLength:      {value: 0},
        readOnly:       {value: false},
        selectionStart: {value: 0},
        selectionEnd:   {value: 0},
        onInput:        {event: true},
        onChange:       {event: true},
	}

    
    _doInp = null;
    _doChg = null;
    _pholdSel = null;
    _patrnSel = null;

	/*——————————————————————————————————————————————————————————————————————————
      CTOR: constructor.
      TASK: Constructs a TBaseInput control, attaches it to its owner if any.

      ARGS: 
        name  : string    	: Name of new input :DEF: null.
                              if sys.LOAD, construction is by deserialization.
        owner : TComponent 	: Owner of the new input if any :DEF: null.
        data  : Object    	: An object containing instance data :DEF: null.
    ——————————————————————————————————————————————————————————————————————————*/
    constructor(name = null, owner = null, data = null) {
        super(name);
        this.initControl(name, owner, data);
        if (this.class.name === 'TBaseInput')
            exc('E_ABSTRACT','TBaseInput'+ (name ? ': '+ name : ''));
        this._focusTarget = this._element;
        this._doInp = sys.bindHandler(this, 'doInput');
        this._doChg = sys.bindHandler(this, 'doChange');
        this._element.addEventListener('input', this._doInp, true);
        this._element.addEventListener('change', this._doChg);
    }

	/*————————————————————————————————————————————————————————————————————————————
	  DTOR: destroy.
	  TASK: Destroys the TBaseInput instance.
	————————————————————————————————————————————————————————————————————————————*/
	destroy() {
		if (!this._sta)
			return;
        this._element.removeEventListener('input', this._doInp);
        this._element.removeEventListener('change', this._doChg); 
        this._doInp = null;
        this._doChg = null;
        this._focusTarget = null;
		super.destroy();		// inherited destroy
	}
   	
    /*——————————————————————————————————————————————————————————————————————————
      FUNC: doInput [override].
      TASK: This is here for extra input handling on tricky input controls.
      RETV:     : * : Whatever event handler returns.
      INFO: 
        Normally ToreJs TComponent event structure can handle native events
        directly if they are defined as 
        onInput: {event: true, typ:"input", src: "_element"}.
        in static cdta of the class.
    ——————————————————————————————————————————————————————————————————————————*/
    doInput(e) {
        return this.dispatch(this._eve.onInput);
    }

    /*——————————————————————————————————————————————————————————————————————————
      FUNC: doChange [override].
      TASK: This is here for extra input handling on tricky input controls.
      RETV:     : * : Whatever event handler returns.
      INFO: 
        Normally ToreJs TComponent event structure can handle native events
        directly like 
        onChange: {event: true, typ:"change", src: "_element"}.
    ——————————————————————————————————————————————————————————————————————————*/
    doChange(e) {
        return this.dispatch(this._eve.onChange);
    }
    
    
    /*————————————————————————————————————————————————————————————————————————————
      PROP: dir : String;
      GET : Returns the input's directory name.
      SET : Sets the input's directory name. :DEF: 'ltr'.
      INFO: Accepts "ltr","rtl" or "auto".
    ———————————————————————————————————————————————————————————————————————————*/
    get dir() {
      return this._element.dir;
    }
    
    set dir(val = 'ltr') {
      if (val !== 'ltr' && val !== 'rtl' && val !== 'auto') 
          exc('E_INV_ARG', 'val');
      this._element.dir = val;
    }

    /*————————————————————————————————————————————————————————————————————————————
      PROP: readOnly : Boolean;
      GET : Returns whether the input field is read-only.
      SET : Sets    whether the input field is read-only.
      INFO: Read-only input is not focusable.
    ————————————————————————————————————————————————————————————————————————————*/
    get readOnly() {
        return this._element.readOnly;
    }
    
    set readOnly(val = false) {
        if (typeof val !== 'boolean') 
            exc('E_INV_ARG', 'readOnly');
        if (val === this._element.readOnly)
            return;
        this._element.readOnly = val;
        this._canFocus = !val;
        this.checkEvents()
    }

    /*————————————————————————————————————————————————————————————————————————————
	  PROP:	value : String;
	  GET : Returns the input value.
	  SET : Sets    the input value.
	————————————————————————————————————————————————————————————————————————————*/
    get value() {
        return this._element.value;
    }

    set value(val = '') {
        if (typeof val !== 'string') 
            exc('E_INV_ARG', 'value');
        if (val === this._element.value)
            return;
        this._element.value = val;
    }
    
    /*————————————————————————————————————————————————————————————————————————————
	  PROP:	maxlength : String;
	  GET : Returns the maximum length allowed for input.
	  SET : Sets    the maximum length allowed for input.
	————————————————————————————————————————————————————————————————————————————*/
    get maxLength() {
        return this._element.maxLength;
    }
    
    set maxLength(val = -1) {
        if (typeof val !== 'number') 
            exc('E_INV_ARG', 'maxLength');
        if (val === this._element.maxLength)
            return;
        this._element.maxLength = val;
    }

    /*————————————————————————————————————————————————————————————————————————————
      PROP: minlength : String;
      GET : Returns the minimum length allowed for input.
      SET : Sets    the minimum length allowed for input.
    ————————————————————————————————————————————————————————————————————————————*/
    get minLength() {
        return this._element.minLength;
    }
    
    set minLength(val = -1) {
        if (typeof val !== 'number') 
            exc('E_INV_ARG', 'minLength');
        if (val === this._element.minLength)
            return;
        this._element.minLength = val;
    }

    /*————————————————————————————————————————————————————————————————————————————
      PROP: placeholder : String;
      GET : Returns the placeholder text for the input field.
      SET : Sets    the placeholder text for the input field.
      INFO: i18n selector supported.
    ————————————————————————————————————————————————————————————————————————————*/
    get placeholder() {
        if (this._sta === sys.SAVE && this._pholdSel !== null)
            return this._pholdSel;
        return this._element.placeholder;
    }
    
    set placeholder(val = '') {
        if (typeof val !== 'string') 
            exc('E_INV_ARG', 'placeholder');
        if (val === this._element.placeholder || (this._pholdSel && val === this._pholdSel))
            return;
        this._element.placeholder = i18n.findSet(val, this, '_pholdSel') || val;
    }

    /*————————————————————————————————————————————————————————————————————————————
      PROP: pattern : String;
      GET : Returns the regexp pattern that the input's value is checked against.
      SET : Sets    the regexp pattern that the input's value is checked against.
      INFO: i18n selector supported.
    ————————————————————————————————————————————————————————————————————————————*/
    get pattern() {
        if (this._sta === sys.SAVE && this._patrnSel !== null)
            return this._patrnSel;
        return this._element.pattern;
    }
    
    set pattern(val = null) {
        if (typeof val !== 'string') 
            exc('E_INV_ARG', 'pattern');
        if (val === this._element.pattern || (this._patrnSel && val === this._patrnSel))
            return;
        this._element.pattern = i18n.findSet(val, this, '_patrnSel') || val;
    }

    /*————————————————————————————————————————————————————————————————————————————
      PROP: selectionStart : number (uint);
      GET : Returns the selection start character position (inclusive).
      SET : Sets    the selection start character position (inclusive).
      INFO: DOM auto corrects this values, when out of range.
    ————————————————————————————————————————————————————————————————————————————*/
    get selectionStart() {
        return this._element.selectionStart;
    }

    set selectionStart(val = 0) {
        if (typeof val !== 'number' || val < 0)
            exc('E_INV_ARG', 'selectionStart');
        if (val === this._element.selectionStart)
            return;
        this._element.selectionStart = val;
    }

    /*————————————————————————————————————————————————————————————————————————————
      PROP: selectionEnd : number (uint);
      GET : Returns the selection end character position (exclusive).
      SET : Sets    the selection end character position (exclusive).
      INFO: DOM auto corrects this values, when out of range.
    ————————————————————————————————————————————————————————————————————————————*/
    get selectionEnd() {
        return this._element.selectionEnd;
    }

    set selectionEnd(val = 0) {
        if (typeof val !== 'number' || val < 0)
            exc('E_INV_ARG', 'selectionEnd');
        if (val === this._element.selectionEnd)
            return;
        this._element.selectionEnd = val;
    }

    

    /*————————————————————————————————————————————————————————————————————————————
      PROP: selection : String;
      GET : Returns the selected string if any or ''.
    ————————————————————————————————————————————————————————————————————————————*/
    get selection() {
        return this.value.substring(this.selectionStart, this.selectionEnd);
    }

}

sys.registerClass(TBaseInput);
