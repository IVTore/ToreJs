/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 20231228
  Author	: IVT : İhsan V. Töre
  About		: TInput.js: 
				Tore Js input visual control class.
  License	: MIT.
————————————————————————————————————————————————————————————————————————————*/

import {    
        exc, 
        sys, 
        log, 
        resources
}                   from "../lib/index.js";                         
import { TCtl }     from "./TCtlSys.js";
import { TControl } from "./TControl.js";

/*———————————————————————————————————————————————————————————————————————————— 
  CLASS: TInput
  TASKS: Defines behaviours of Tore JS TInput controls.

  * UNDER CONSTRUCTION *
————————————————————————————————————————————————————————————————————————————*/
class TInput extends TControl {

	// TInput does not allow sub components.
	static allowMemberClass = null;

	static elementTag = 'input';	
	static canFocusDefault = true;	

    static cdta = {
		type:			{value: 'text'},
        onInput:        {event: true}
	}

	_type = null;			// input type.
    _text = '';             // input text.
        	
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

sys.registerClass(TInput);

export { TInput }
