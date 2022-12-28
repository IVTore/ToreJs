/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 20220706
  Author	: IVT : İhsan V. Töre
  About		: TImage.js: 
				Tore Js image visual control class.
  License	: MIT.
————————————————————————————————————————————————————————————————————————————*/

import { exc, is, sys, resources } from "../lib/index.js";

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

function defaultImageLoader(image, forceViewport = null) {

}


/*————————————————————————————————————————————————————————————————————————————
  CLASS: TImageLoader [static]
  TASKS: Manages image loader methods. 
————————————————————————————————————————————————————————————————————————————*/
export const TImageLoader = {

	register: function(loaderName = null, loaderFunc = null) {
		if (!is.ident(loaderName))
			exc('E_INV_ARG', 'loaderName');
		if (loaderName === 'default')
			exc('E_INV_ARG', 'loaderName');
		if (typeof loaderFunc !== 'function')
			exc('E_INV_ARG', 'loaderFunc');
		imageLoaders[loaderName] = loaderFunc;
	},

	remove: function(loaderName = null) {
		if (!is.ident(loaderName))
			exc('E_INV_ARG', 'loaderName');
		if (loaderName === 'default')
			exc('E_INV_ARG', 'loaderName');
		delete imageLoaders[loaderName];
	},

	fetch: function(loaderName = null) {
		var f;

		if (!is.ident(loaderName))
			return defaultImageLoader;
		f = imageLoaders[loaderName];
		if (typeof f !== 'function')
			f = defaultImageLoader;
		return f;
	},

	has: function(loaderName = null) {
		return is.ident(loaderName) && imageLoaders[loaderName] !== undefined;
	} 

}

// This is where the loader methods are kept by TImageLoader privately.
const imageLoaders = {default: defaultImageLoader};

Object.freeze(TImageLoader);

sys.registerClass(TImage);