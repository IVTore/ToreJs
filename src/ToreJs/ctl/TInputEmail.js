/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 20231228
  Author	: IVT : İhsan V. Töre
  About		: TInputEmail.js: 
			  Tore Js e-mail input visual control class.
  License	: MIT.
————————————————————————————————————————————————————————————————————————————*/

import {    
    TEventHandler,
        exc, 
        sys
}                       from "../lib/index.js";                         
import { TInput }       from "./TInput.js";

/*———————————————————————————————————————————————————————————————————————————— 
  CLASS: TInputEmail
  TASKS: Defines behaviours of Tore JS Linear input email control.
  USAGE: TInputEmail instances are linear text input controls.
         The browser will check for valid e-mail address. 
         The attribute values like maxLength, size etc. are only 
         type checked. Giving proper values is up to developers.
         TInputEmail does not allow sub components.
————————————————————————————————————————————————————————————————————————————*/
class TInputEmail extends TInput {

	static inputType = 'email';
    static inputSizeChar = 'W'; // TInput calculates max size with this.		

    
	/*——————————————————————————————————————————————————————————————————————————
      CTOR: constructor.
      TASK: Constructs a TInputEmail control, attaches it to its owner if any.

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
	  TASK: Destroys the TInputTel instance.
	————————————————————————————————————————————————————————————————————————————*/
	destroy() {
		if (!this._sta)
			return;
		super.destroy();		// inherited destroy
	}

    /*————————————————————————————————————————————————————————————————————————————
      PROP: isValid : Boolean;
      GET : Returns whether the input field's value is valid.
      INFO: The validity is determined based on the HTML5 validation rules.
    ————————————————————————————————————————————————————————————————————————————*/
    get isValid() {
        return this._element.validity.valid;
    }
}

sys.registerClass(TInputEmail);

export { TInputEmail }
