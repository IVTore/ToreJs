/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 20220706
  Author	: IVT : İhsan V. Töre
  About		: TImage.js: 
				Tore Js image visual control class.
  License	: MIT.
————————————————————————————————————————————————————————————————————————————*/

import { exc, is, sys, resources } from "../lib/index.js";
import { TCtl } from "./TCtl.js";
import { TControl } from "./TControl.js";
import { imageLoaders } from "./TImageLoaders.js";

/*———————————————————————————————————————————————————————————————————————————— 
  CLASS: TImage
  TASKS: Defines behaviours of Tore JS TImage controls.
————————————————————————————————————————————————————————————————————————————*/

export class TImage extends TControl {

	static elementTag = 'img';	
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
	_curSrc = null;			// current source.
	
	
	/*——————————————————————————————————————————————————————————————————————————
      CTOR: constructor.
      TASK: Constructs an TImage component, attaches it to its owner if any.
      ARGS: 
        name  : string    	: Name of new panel :DEF: null.
                              if sys.LOAD, construction is by deserialization.
        owner : TComponent 	: Owner of the new button if any :DEF: null.
        data  : Object    	: An object containing instance data :DEF: null.
		init  : boolean		: If true, initialize control here. 
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
	  FUNC: load
	  TASK: Tries to load the image.
	——————————————————————————————————————————————————————————————————————————*/
	load() {
		var snm = this.nextSource,
			ldr,
			img;
			
		if (this._curSrc === snm)
			return;	
		img = resources.addLink(snm, this);
		if (img !== null) {
			this._element.src = img.src;
			return;
		}
		ldr = imageLoaders[this._loader];
		if (ldr === null)
			exc('E_INV_LOADER', this._loader);
		ldr.load(this);
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doProgress
	  TASK: Flags the image control that image load is progressing.
	  ARGS: e   : progress event.
	——————————————————————————————————————————————————————————————————————————*/
    doProgress(e = null) {
		console.log(this.namePath, 'progress');
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: doLoad
      TASK: Flags the image control that image load is completed.
	  ARGS: e   : load event.
	——————————————————————————————————————————————————————————————————————————*/
    doLoad(e = null) {
		console.log(this.namePath, 'load');
    }

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: doError
	  TASK: Flags the image control that image load has an error.
	  ARGS: e   : error event.
	——————————————————————————————————————————————————————————————————————————*/
    doError(e = null) {
		console.log(this.namePath, 'error');
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
	
	/*——————————————————————————————————————————————————————————————————————————
	  PROP: nextSource : string.
	  GET : Returns the name of source that must be loaded.
	  INFO: current source name can change according to source definition and
	  		viewport size. This returns the name of the source that *must*
			be current.
	——————————————————————————————————————————————————————————————————————————*/
	get nextSource() {
		if (this._source === null)
			return null;
		if (typeof this._source === 'string')
			return this._source;
		return TCtl.viewportValue(this, this._source, 'source', null);
	}
}

sys.registerClass(TImage);