/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 20220706
  Author	: IVT : İhsan V. Töre
  About		: Image.js: 
				Tore Js image visual control class.
  License	: MIT.
————————————————————————————————————————————————————————————————————————————*/

import { exc } from "../lib";

/*———————————————————————————————————————————————————————————————————————————— 
  CLASS: Image
  TASKS: Defines behaviours of Tore JS Image controls.
————————————————————————————————————————————————————————————————————————————*/

export class ResControl extends Control {

	static cdta = {
		source:			{value: null},
		onResLoaded:	{event: true},
		onResProgress:	{event: true},
		onResError:		{event: true}
	}

	_src = null;		// source definition.
	
	
	/*——————————————————————————————————————————————————————————————————————————
      CTOR: constructor.
      TASK: Constructs an Image component, attaches it to its owner if any.
      ARGS: 
        name    : string    : Name of new panel :DEF: null.
                              if sys.LOAD, construction is by deserialization.
        owner   : Component : Owner of the new button if any :DEF: null.
        data    : Object    : An object containing instance data :DEF: null.
		init	: boolean	: If true, initialize control here. 
    ——————————————————————————————————————————————————————————————————————————*/
    constructor(name = null, owner = null, data = null, init = true) {
        super(name, null, null, false);
        this._initControl(name, owner, data, init);
    }

	/*————————————————————————————————————————————————————————————————————————————
	  DTOR: destroy.
	  TASK: Destroys the ResControl instance.
	————————————————————————————————————————————————————————————————————————————*/
	destroy() {
		if (!this._sta)
			return;
		this.source = null;
		super.destroy();		// inherited destroy
	}

	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	source : null, string or Object.
	  GET : Gets the source url data.
	  SET : Sets the source url data.
	  INFO: 
		* It can be a string like : "myImages/theImage.png".
		* It can be a viewport sources object like :
			{
				xs: "myImages/extraSmallImage.png", // for extra small viewport.
				sm: "myImages/smallImage.png",		// for small viewport.
				md: "myImages/mediumImage.png",		// for medium viewport.
				df: "myImages/largeImage.png"		// for other viewports (default).
			}
	————————————————————————————————————————————————————————————————————————————*/
	get source() {
		return this._src;
	}

	set source(val = null) {
		if (typeof val === 'string') {
			this._src = val;
			return;
		}
		if (is.plain(val))
			this._src = Object.assign({}, r);
	}
	




}