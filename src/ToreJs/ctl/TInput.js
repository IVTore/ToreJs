/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 20231228
  Author	: IVT : İhsan V. Töre
  About		: TInput.js: 
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
  CLASS: TInput
  TASKS: Defines behaviours of Tore JS Linear input control.
  USAGE: TInput instances are linear text input controls.
         The attribute values like maxLength, size etc. are only 
         type checked. Giving proper values is up to developers.
         TInput does not allow sub components.
————————————————————————————————————————————————————————————————————————————*/
export class TInput extends TBaseInput {

	// TInput does not allow sub components.
	static allowMemberClass = null;
    static canFocusDefault = true;
	static elementTag = 'input';

    static inputType = 'text';
    
    static cdta = {
        autoW:          {value: 'fit'},          // override.
        autoH:          {value: 'max'},          // override.
        size:           {value: 20}
	}
		
    _autoW = 'fit';     // override.    
    _autoH = 'max';     // override.

	/*——————————————————————————————————————————————————————————————————————————
      CTOR: constructor.
      TASK: Constructs a TInput control, attaches it to its owner if any.

      ARGS: 
        name  : string    	: Name of new input :DEF: null.
                              if sys.LOAD, construction is by deserialization.
        owner : TComponent 	: Owner of the new input if any :DEF: null.
        data  : Object    	: An object containing instance data :DEF: null.
    ——————————————————————————————————————————————————————————————————————————*/
    constructor(name = null, owner = null, data = null) {
        super(name);
        this.initControl(name, owner, data);
        this._element.type = this.class.inputType;
    }

	/*————————————————————————————————————————————————————————————————————————————
	  DTOR: destroy.
	  TASK: Destroys the TInput instance.
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
        *   Called by autoFitW or autoMaxW in TInput. 
        *   When autoW is "fit" or "max", tries to find maximum 
            width required for contents ignoring any boundaries.
        *   TInput auto sizes according to the size property.
    ——————————————————————————————————————————————————————————————————————————*/
    _maxW() {
        var cw = TCtl.measureText(this, this.class.inputSizeChar).width; 
        return (cw * this.size) + this._shellW + 1; 
        // + 1 for position: absolute.        
    }
   	
    /*————————————————————————————————————————————————————————————————————————————
       PROP: size : Number;
       GET : Returns the size (number of characters) allowed for input.
       SET : Sets the size (number of characters) allowed for input.
      ————————————————————————————————————————————————————————————————————————————*/
      get size() {
        return this._element.size;
      }
      
      set size(val = 20) {
          if (typeof val !== 'number') 
              exc('E_INV_ARG', 'size');
          if (val === this._element.size) 
              return;
          this._element.size = val;
          this.contentChanged();
      }
}

sys.registerClass(TInput);
