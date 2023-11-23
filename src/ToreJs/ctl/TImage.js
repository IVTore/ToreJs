/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 20220706
  Author	: IVT : İhsan V. Töre
  About		: TImage.js: 
				Tore Js image visual control class.
  License	: MIT.
————————————————————————————————————————————————————————————————————————————*/

import { exc, sys, resources, send, TComponent } from "../lib/index.js";                         
import { TCtl }     from "./TCtlSys.js";
import { TControl } from "./TControl.js";

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
		src:			{value: null},
        loader:         {value: null}, // = imageLoader()
		aspectRatio:	{value: 1},
        onProgress:	    {event: true},
        onLoad:	    	{event: true},
		onError:		{event: true}
	}

	_src = null;			// source definition.
    _cur = null;			// current source.
    _ldr = null;            // loader method, null binds imageLoader().
	_asp = 1;		        // image aspect ratio.
    _active = false;    	// loading in progress.
	
	
	
	/*——————————————————————————————————————————————————————————————————————————
      CTOR: constructor.
      TASK: Constructs an TImage component, attaches it to its owner if any.
      ARGS: 
        name  : string    	: Name of new image :DEF: null.
                              if sys.LOAD, construction is by deserialization.
        owner : TComponent 	: Owner of the new image if any :DEF: null.
        data  : Object    	: An object containing instance data :DEF: null.
    ——————————————————————————————————————————————————————————————————————————*/
    constructor(name = null, owner = null, data = null) {
        super(name);
        this.initControl(name, owner, data);
    }

	/*————————————————————————————————————————————————————————————————————————————
	  DTOR: destroy.
	  TASK: Removes image link from resources, destroys the TImage instance.
	————————————————————————————————————————————————————————————————————————————*/
	destroy() {
		if (!this._sta)
			return;
		if (this._cur)	
			resources.removeLink(this._cur, target);
		this._src = null;
		super.destroy();		// inherited destroy
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: load
	  TASK: Tries to load the image.
	  INFO: First looks up to resources if image exists,
			if so links the image form there.
			Otherwise calls TLoader instance this.loader refers to.
	——————————————————————————————————————————————————————————————————————————*/
	load() {
		var snm = this.nextSrc;
					
		if (this.assign(snm))
			return;	
		
		this.loader.apply(null, [this]);
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doProgress
	  TASK: Flags the image control that image load is progressing.
	  ARGS: e   : progress event.
	  INFO: Invokes onLoad(sender, e) if defined.
	——————————————————————————————————————————————————————————————————————————*/
    doProgress(e = null) {
		console.log(this.namePath, 'progress');
		return this.dispatch(this._eve.onProgress, e);
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: doLoad
      TASK: Flags the image control that image load is completed.
	  ARGS: e   : load event.
	——————————————————————————————————————————————————————————————————————————*/
    doLoad(e = null) {
		console.log(this.namePath, 'load');
		return this.dispatch(this._eve.onLoad, e);
    }

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: doError
	  TASK: Flags the image control that image load has an error.
	  ARGS: e   : error event.
	——————————————————————————————————————————————————————————————————————————*/
    doError(e = null) {
		console.log(this.namePath, 'error');
		return this.dispatch(this._eve.onError, e);
    }


	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doResourceLinkRemoved
	  TASK: Tells image control that image link is detached by resources.
	  ARGS: name : string : image resource name.
	——————————————————————————————————————————————————————————————————————————*/
    doResourceLinkRemoved(name = null) {
		this._cur = null;
		this._element.src = null;
    }

    /*——————————————————————————————————————————————————————————————————————————
      FUNC: _maxW [protected][override].
      TASK: This finds the maximum control width required for the image.
      RETV:     : number : maximum control width for the image.
      INFO: 
        *   This is TImage override version. 
        *   When autoW is "fit" or "max", tries to find maximum control
            width required for contents ignoring any boundaries.
        *   maxW is aspectRatioW * naturalWidth.
    ——————————————————————————————————————————————————————————————————————————*/
    _maxW() {
    	return this._asp * this.naturalWidth;         
    }

    /*——————————————————————————————————————————————————————————————————————————
      FUNC: _maxH [protected].
      TASK: This finds the maximum control height required for the image.
      RETV:     : number : maximum control height required for the image.
      INFO: 
        *   This is TImage override version. 
        *   When autoH is "fit" or "max", tries to find maximum control
            height required for contents ignoring any boundaries.
        *   maxW is aspectRatioH * naturalHeight.
    ——————————————————————————————————————————————————————————————————————————*/
    _maxH() {
    	return this._asp * this.naturalHeight;         
    }

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: assign
	  TASK: Assigns a named image from resources to TImage instance.
	  ARGS: name : string  : image resource name.
	  RETV: 	 : boolean : true if assignment is done.
	——————————————————————————————————————————————————————————————————————————*/
    assign(name = null) {
		var img;

		if (name === this._cur)
			return true;
		if (this._cur)	
			resources.removeLink(this._cur, target);
		img = resources.addLink(name, this);
		if (img) {
			this._element.src = img.src;
			this._cur = name;
			this.contentChanged();
			return true;
		}
		return false;
    }

	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	src : null, string or Object.
	  GET : Gets the source url data.
	  SET : Sets the source url data.
	  INFO: 
		* It can be a string like : "myImages/theImage.png".
		* It can be a viewport object like :
        {
            xs: "myImages/extraSmallImage.png", // for extra small viewport.
            sm: "myImages/smallImage.png",		// for small viewport.
            md: "myImages/mediumImage.png",		// for medium viewport.
            df: "myImages/largeImage.png"		// for other viewports (default).
        }
	————————————————————————————————————————————————————————————————————————————*/
	get src() {
		return this._src;
	}

	set src(val = null) {
        this._setAutoValue(val, '_src', 'src', false, true);
	}
	
    /*————————————————————————————————————————————————————————————————————————————
	  PROP:	loader : function.
	  GET : Gets the loader function.
	  SET : Sets the loader function.
	  INFO: 
		* At set and get if invalid, it will default to imageLoader(). 
	————————————————————————————————————————————————————————————————————————————*/
	get loader() {
		return (typeof this._ldr  === 'function') ? this._ldr : imageLoader;
	}

	set loader(val = null) {
        this._ldr = (typeof val  === 'function') ? val : imageLoader;
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP: nextSrc : string.
	  GET : Returns the name of source that must be loaded.
	  INFO: current source name can change according to source definition and
	  		viewport size. This returns the name of the source that *must*
			be current.
	——————————————————————————————————————————————————————————————————————————*/
	get nextSrc() {
		return TCtl.autoValue(this._src);
	}

	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	aspectRatio : null, int > 0.
	  GET : Gets the current aspect ratio of image.
	  SET : Sets the current aspect ratio of image.
	  INFO: 
		image height is calculated as height * aspectRatio.
	————————————————————————————————————————————————————————————————————————————*/
    get aspectRatio() {
        return 
    }

	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	naturalWidth : int.
	  GET : Gets the natural width of image.
	  INFO: If image is not loaded returns 0. 
      
      NOT WORKING
      
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

function imageLoader(image = null) {
	var src,
		img;

	if (!(image instanceof TImage))
		exc ('E_INV_ARG', 'image');
	src = image.nextSrc;
	send(image, 'GET', src, null, 'blob').then(
		(xhr) => {
			img = new Image();
			img.src = URL.createObjectURL(xhr.response);
			resources.add(src, img);
			image.assign(src);
		},
		(error) => {
			console.log('promise error', error, image.namePath, src);
		}
	);
}

sys.registerClass(TImage);