/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 20231228
  Author	: IVT : İhsan V. Töre
  About		: TInputPassword.js: 
				Tore Js password input visual control class.
  License	: MIT.
————————————————————————————————————————————————————————————————————————————*/

import { sys }          from "../lib/index.js";                         
import { TInput }       from "./TInput.js";

/*———————————————————————————————————————————————————————————————————————————— 
  CLASS: TInputPassword
  TASKS: Defines behaviours of Tore JS Linear password input control.
  USAGE: TPassword instances are linear text input controls.
         The attribute values like maxLength, size etc. are only 
         type checked. Giving proper values is up to developers.
         TPassword does not allow sub components.
————————————————————————————————————————————————————————————————————————————*/
class TInputPassword extends TInput {

	static inputType = 'password';
    static inputSizeChar = '*'; // TInput calculates max size with this.		

    
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
        this.styleRoot = 'Input';
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
   	
}

sys.registerClass(TInputPassword);

export { TInputPassword }
