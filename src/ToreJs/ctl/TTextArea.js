/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 20231228
  Author	: IVT : İhsan V. Töre
  About		: TTextArea.js: 
				Tore Js text input visual control class.
  License	: MIT.
————————————————————————————————————————————————————————————————————————————*/

import {    
        exc, 
        sys
}                       from "../lib/index.js"; 
import { TCtl }         from "./TCtlSys.js";                    
import { TBaseInput }   from "./TBaseInput.js";

/*———————————————————————————————————————————————————————————————————————————— 
  CLASS: TTextArea
  TASKS: Defines behaviours of Tore JS Textarea input control.
  USAGE: The input attribute values like maxLength, size etc. are only 
         type checked. Giving proper values is up to developers.
         TTextArea does not allow sub components.
         TTextArea does not support resize etc. Very basic.
————————————————————————————————————————————————————————————————————————————*/
// Allowed resize values.
const resizeValues = ['none', 'both', 'horizontal', 'vertical'];

export class TTextArea extends TBaseInput {

	// TTextArea does not allow sub components.
	static allowMemberClass = null;
    static canFocusDefault = true;
    static elementTag = 'textarea';

    static initialStyle = {left: "0px", top: "0px", width:"256px", height:"128px", overflow: 'auto'};

    static cdta = {
        autoW:          {value: 'fit'},         // override.
        autoH:          {value: 'max'},         // override.
        rows:           {value: 2},             // DOM default.
        cols:           {value: 20},            // DOM default.
	}
    
    _autoW = 'fit';         // override.
    _autoH = 'max';         // override.
    

	/*——————————————————————————————————————————————————————————————————————————
      CTOR: constructor.
      TASK: Constructs a TTextArea control, attaches it to its owner if any.

      ARGS: 
        name  : string    	: Name of new input :DEF: null.
                              if sys.LOAD, construction is by deserialization.
        owner : TComponent 	: Owner of the new input if any :DEF: null.
        data  : Object    	: An object containing instance data :DEF: null.
    ——————————————————————————————————————————————————————————————————————————*/
    constructor(name = null, owner = null, data = null) {
        super(name);
        this.initControl(name, owner, data);
        this.styleRoot = 'Input';
    }



	/*————————————————————————————————————————————————————————————————————————————
	  DTOR: destroy.
	  TASK: Destroys the TTextArea instance.
	————————————————————————————————————————————————————————————————————————————*/
	destroy() {
		if (!this._sta)
			return;
		super.destroy();		// inherited destroy
	}

    
    /*——————————————————————————————————————————————————————————————————————————
      FUNC: _maxW [protected] [override].
      TASK: This finds the maximum control width required for the content.
      RETV:     : number : maximum control width for the content.
      INFO: 
        *   Called by autoFitW or autoMaxW in TTextArea. 
        *   When autoW is "fit" or "max", tries to find maximum 
            width required for contents ignoring any boundaries.
        *   TTextArea auto sizes according to cols property.
    ——————————————————————————————————————————————————————————————————————————*/
    _maxW() {
        var cw = TCtl.measureText(this, this.class.inputSizeChar).width; 
        return (cw * this.cols) + this._shellW + 1; 
        // + 1 for position: absolute.        
    }

    /*————————————————————————————————————————————————————————————————————————————
      PROP: cols : Number;
      GET : Returns the number of columns.
      SET : Sets the number of columns.
      INFO: These are relevant when auto sizing.
    ———————————————————————————————————————————————————————————————————————————*/
    get cols() {
        return this._element.cols;
    }
    
    set cols(val = 20) {
        if (typeof val !== 'number') 
            exc('E_INV_ARG', 'cols');
        if (val === this._element.cols) 
            return;
        this._element.cols = val;
        this.contentChanged();
    }

    /*————————————————————————————————————————————————————————————————————————————
      PROP: rows : Number;
      GET : Returns the number of rows.
      SET : Sets the number of rows.
      INFO: These are relevant when auto sizing.
    ———————————————————————————————————————————————————————————————————————————*/
    get rows() {
        return this._element.rows;
    }
    
    set rows(val = 2) {
        if (typeof val !== 'number') 
            exc('E_INV_ARG', 'rows');
        if (val === this._element.rows) 
            return;
        this._element.rows = val;
        this.contentChanged();
    }
   	

}

sys.registerClass(TTextArea);
