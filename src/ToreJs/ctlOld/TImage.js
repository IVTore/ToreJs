/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 20220706
  Author	: IVT : İhsan V. Töre
  About		: TImage.js: 
				Tore Js image visual control class.
  License	: MIT.
————————————————————————————————————————————————————————————————————————————*/

import { exc, is, sys, resources, chkStr, TComponent } from "../lib/index.js";
import { TCtl } from "./TCtl.js";
import { TControl } from "./TControl.js";
import { imageLoaders } from "./TImageLoaders.js";

/*———————————————————————————————————————————————————————————————————————————— 
  CLASS: TImage
  TASKS: Defines behaviours of Tore JS TImage controls.
————————————————————————————————————————————————————————————————————————————*/

export class TImage extends TControl {

	// TImage allows sub components but does not support sub controls.
	static allowMemberClass = TComponent;
	static avoidMemberClass = TControl;

	static elementTag = 'img';	
	static canFocusDefault = false;	

    static cdta = {
		source:			{value: null},
        loader:         {value: "default"},
		aspectRatio:	{value: 1},
		onProgress:	    {event: true},
        onLoad:	    	{event: true},
		onError:		{event: true}
	}

	_source = null;			// source definition.
    _loader = "default";    // loader method. Default is default.
	_aspectRatio = 1;		// image default aspect ratio.
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
	  TASK: Removes image link from resources, destroys the TImage instance.
	————————————————————————————————————————————————————————————————————————————*/
	destroy() {
		if (!this._sta)
			return;
		if (this._curSrc)	
			resources.removeLink(this._curSrc, target);
		this.source = null;
		super.destroy();		// inherited destroy
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: load
	  TASK: Tries to load the image.
	  INFO: First looks up to resources if image exists,
			if so links the image form there.
			Otherwise calls TImageLoader instance this.loader refers to.
	——————————————————————————————————————————————————————————————————————————*/
	load() {
		var snm = this.nextSource,
			ldr,
			img;
			
		if (this.assign(snm))
			return;	
		ldr = imageLoaders[this._loader];
		if (ldr === null)
			exc('E_INV_LOADER', this._loader);
		ldr.load(this);
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doProgress
	  TASK: Flags the image control that image load is progressing.
	  ARGS: e   : progress event.
	  INFO: Invokes onLoad(sender, e) if defined.
	——————————————————————————————————————————————————————————————————————————*/
    doProgress(e = null) {
		var eve = this._eve.onProgress;
		console.log(this.namePath, 'progress');
		return ((eve) ? eve.dispatch([this, e]) : null);
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: doLoad
      TASK: Flags the image control that image load is completed.
	  ARGS: e   : load event.
	——————————————————————————————————————————————————————————————————————————*/
    doLoad(e = null) {
		var eve = this._eve.onLoad;
		console.log(this.namePath, 'load');
		return ((eve) ? eve.dispatch([this, e]) : null);
    }

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: doError
	  TASK: Flags the image control that image load has an error.
	  ARGS: e   : error event.
	——————————————————————————————————————————————————————————————————————————*/
    doError(e = null) {
		var eve = this._eve.onError;
		console.log(this.namePath, 'error');
		return ((eve) ? eve.dispatch([this, e]) : null);
    }


	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doResourceLinkRemoved
	  TASK: Tells image control that image link is detached by resources.
	  ARGS: name : string : image resource name.
	——————————————————————————————————————————————————————————————————————————*/
    doResourceLinkRemoved(name = null) {
		this._curSrc = null;
		this._element.src = null;
    }

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: assign
	  TASK: Assigns a named image from resources to TImage instance.
	  ARGS: name : string  : image resource name.
	  RETV: 	 : boolean : true if assignment is done.
	——————————————————————————————————————————————————————————————————————————*/
    assign(name = null) {
		var img;

		if (name === this._curSrc)
			return true;
		if (this._curSrc)	
			resources.removeLink(this._curSrc, target);
		img = resources.addLink(name, this);
		if (img) {
			this._element.src = img.src;
			this._curSrc = name;
			this.contentChanged();
			return true;
		}
		return false;
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
        this._setAutoValue(val, '_source', 'source', false);
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

	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	aspectRatio : null, int > 0.
	  GET : Gets the current aspect ratio of image.
	  SET : Sets the current aspect ratio of image.
	  INFO: 
		image height is calculated as height * aspectRatio.
	————————————————————————————————————————————————————————————————————————————*/


	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	naturalWidth : int.
	  GET : Gets the natural width of image.
	  INFO: If image is not loaded returns 0.
	————————————————————————————————————————————————————————————————————————————*/
	get naturalWidth() {
		const w = this._element.naturalWidth;
		return (w === 'undefined' ? 0 : w);
	}

	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	naturalHeight : int.
	  GET : Gets the natural height of image.
	  INFO: If image is not loaded returns 0.
	————————————————————————————————————————————————————————————————————————————*/
	get naturalHeight() {
		const h = this._element.naturalWidth;
		return (h === 'undefined' ? 0 : h);
	}

}

sys.registerClass(TImage);