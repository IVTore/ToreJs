/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 20220706
  Author	: IVT : İhsan V. Töre
  About		: TImage.js: 
				Tore Js image visual control class.
  License	: MIT.
————————————————————————————————————————————————————————————————————————————*/

import { exc, sys } from "../lib/index.js";

/*———————————————————————————————————————————————————————————————————————————— 
  CLASS: TImage
  TASKS: Defines behaviours of Tore JS TImage controls.
————————————————————————————————————————————————————————————————————————————*/

export class TImage extends TControl {

    static elementTag = 'image';	
	static canFocusDefault = false;	

    static cdta = {
		source:			{value: null},
        loader:         {value: "default"},
		onProgress:	    {event: true},
        onLoaded:	    {event: true},
		onError:		{event: true}
	}

	_source = null;			// source definition.
    _loader = "default";    // loader method. Default is default.
    _active = false;    	// loading in progress.
	
	
	/*——————————————————————————————————————————————————————————————————————————
      CTOR: constructor.
      TASK: Constructs an TImage component, attaches it to its owner if any.
      ARGS: 
        name    : string    : Name of new panel :DEF: null.
                              if sys.LOAD, construction is by deserialization.
        owner   : TComponent : Owner of the new button if any :DEF: null.
        data    : Object    : An object containing instance data :DEF: null.
		init	: boolean	: If true, initialize control here. 
    ——————————————————————————————————————————————————————————————————————————*/
    constructor(name = null, owner = null, data = null, init = true) {
        super(name, null, null, false);
        this._initControl(name, owner, data, init);
    }

	/*————————————————————————————————————————————————————————————————————————————
	  DTOR: destroy.
	  TASK: Destroys the TImage instance.
	————————————————————————————————————————————————————————————————————————————*/
	destroy() {
		if (!this._sta)
			return;
		this.source = null;
		super.destroy();		// inherited destroy
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: doProgress
	  TASK: Flags the image control that image load is progressing.
	  ARGS: e   : progress event.
	——————————————————————————————————————————————————————————————————————————*/
    doProgress(e = null) {

    }

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: doLoaded
      TASK: Flags the image control that image load is completed.
	  ARGS: e   : loaded event.
	——————————————————————————————————————————————————————————————————————————*/
    doLoaded(e = null) {

    }

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: doError
	  TASK: Flags the image control that image load has an error.
	  ARGS: e   : error event.
	——————————————————————————————————————————————————————————————————————————*/
    doError(e = null) {

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
		return this._source;
	}

	set source(val = null) {
        if (this._setAutoValue(val, '_source', 'source', false) || val === null)
        	this.contentChanged();
	}
	




}

export const imageLoaders = {
	
	defaultImageLoader: function(img = null) {
    	if (!(img instanceof TImage))
        	exc('E_INV_ARG', 'img !TImage');
	}

}

sys.registerClass(TImage);