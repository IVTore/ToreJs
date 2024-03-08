/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20240301
  Author	: 	IVT : İhsan V. Töre
  About		: 	TBaseCssControl.js: Tore Js class for Controls with CSS 
                                    calculated sizes. 
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/
import {    
    exc, 
    sys
}                   from "../lib/index.js";   
import { TControl } from "./TControl.js";

/*———————————————————————————————————————————————————————————————————————————— 
  CLASS: TBaseCssControl
  TASKS: Defines routines for Tore JS controls which sizes are CSS calculated.
  USAGE:
        * Contains Overrides for 'fit' and 'max' auto sizing.
        * TBaseCssControl is abstract. Subclasses must be used. 
        * Do not forget to override _maxW and _maxH when needed.    
————————————————————————————————————————————————————————————————————————————*/
export class TBaseCssControl extends TControl {
    

    /*——————————————————————————————————————————————————————————————————————————
      CTOR: constructor.
      TASK: Constructs a TBaseCssControl, actually a bypass to TControl ctor.

      ARGS: 
        name  : string    	: Name of new control :DEF: null.
                              if sys.LOAD, construction is by deserialization.
        owner : TComponent 	: Owner of the new control if any :DEF: null.
        data  : Object    	: An object containing instance data :DEF: null.
    ——————————————————————————————————————————————————————————————————————————*/
    constructor(name = null, owner = null, data = null) {
        super(name, owner, data);
        if (this.class.name === 'TBaseCssControl')
            exc('E_ABSTRACT','TBaseCssControl'+ (name ? ': '+ name : ''));
    }

	/*————————————————————————————————————————————————————————————————————————————
	  DTOR: destroy.
	  TASK: Destroys the TBaseCssControl instance.
	————————————————————————————————————————————————————————————————————————————*/
	destroy() {
		if (!this._sta)
			return;
		super.destroy();		// inherited destroy
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: _autoFitW [protected] [override].
	  TASK:	Adjusts the width of control regarding its owner and its content.
	  RETV:     : boolean	: true if width change will occur.
      INFO: 
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
        if (r === t._w) 
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
        *   Calculations are done at rendering via setting css.  
        *   During adjusting, setting width is prioritized over height.
	——————————————————————————————————————————————————————————————————————————*/
	_autoMaxW() {
        var t = this,
            r;

		if (t._caW !== 'max')
			return false;
        r = t._maxW();
        if (r === t._w)
            return false;
        t._w = r;
        t._cvW = '' + r + 'px';
        t._cCssWait = true;
        return true;
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: _autoFitH [protected].
	  TASK:	Adjusts the height of control regarding its owner and its content.
	  RETV:     : boolean	: true if height change will occur.
      INFO: 
        *   This is called from private calcAutoH() method which is 
            called by t.autoAdjust() when autoH resolves to "fit".
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
        *   Calculations are done at rendering via setting css.    
        *   During adjusting, setting width is prioritized over height.
	——————————————————————————————————————————————————————————————————————————*/
	_autoMaxH() {
		var t = this;

		if (t._caH !== 'max')
			return false;
        return t._calcAutoCss('height', '_h', '_cvH', '_cpH', 'max-content');
	}

}

sys.registerClass(TBaseCssControl);
