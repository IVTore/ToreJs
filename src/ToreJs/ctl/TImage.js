/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 20220706
  Author	: IVT : İhsan V. Töre
  About		: TImage.js: 
				Tore Js image visual control class.
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
  CLASS: TImage
  TASKS: Defines behaviours of Tore JS TImage controls.
————————————————————————————————————————————————————————————————————————————*/
class TImage extends TControl {

	// TImage does not allow sub components for now.
	static allowMemberClass = null;

	static elementTag = 'img';	
	static canFocusDefault = false;	

    static cdta = {
		src:			{value: null},
        loader:         {value: null}, // = imageLoader()
        strategy:       {value: 'auto'},
        onLoadStart:    {event: true},
        onLoad:         {event: true},
        onLoadEnd:      {event: true},
        onProgress:	    {event: true},
        onTimeout:      {event: true},
        onAbort:        {event: true},
		onError:		{event: true}
	}

	_src = null;			// source definition.
    _curImg = null;			// current image.
    _nxtImg = null;         // next image (avoids race conditions).
    _loader = null;         // loader method, null binds imageLoader().
    _alt    = null;         // Image alternate text.
    _title  = null;         // Image title text.
    _strategy = 'auto';     // loading strategy,
                            // 'auto' = auto manage.
                            // 'manual' = programmer manages by commands.
                            // 'agressive' = load all viewport images a.s.a.p.
    _loading = [];          // images that are currently loading. 
    	
	/*——————————————————————————————————————————————————————————————————————————
      CTOR: constructor.
      TASK: Constructs a TImage control, attaches it to its owner if any.
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
	  TASK: Destroys the TImage instance.
      INFO: Resources (images) used are unlinked at inherited destroy.
	————————————————————————————————————————————————————————————————————————————*/
	destroy() {
		if (!this._sta)
			return;
		this._src = null;
		super.destroy();		// inherited destroy
	}
   
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: load
	  TASK: Tries to load the image or images according to strategy.
	——————————————————————————————————————————————————————————————————————————*/
	load() {
		var t = this,
            s = TCtl.autoValue(t._src),
            v;

        if (!sys.str(s))
            return;
        innerLoader(true);
        if (t._strategy === 'agressive' && t._src instanceof Object) {
            for(v in t._src) {
                s = t._src[v];
                innerLoader(false);
            }
        }
        
        function innerLoader(assign = false) {
            if (assign)  
                t._nxtImg = s;
            if (resources.hasAsset(s)) {
                if (assign)
                    t.doLoad(s, null);
                return;
            }    
            setTimeout(t.loader, null, s, assign ? t : null);
        }
	}
	
    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: doLoadStart
      TASK: Flags the image control that image loading is started.
      ARGS: src : string : source url.
            e   : event  : progress event.
      INFO: Invokes onLoadStart(sender, src, e) if defined.
	——————————————————————————————————————————————————————————————————————————*/
    doLoadStart(src, e) {
        log(this.namePath, 'loadStart');
		return this.dispatch(this._eve.onLoadStart, src, e);
    }

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: doLoad
      TASK: Flags the image control that image is loaded.
      ARGS: src : string : source url.
            e   : event  : progress event.
      INFO: This is sent after image is loaded and in resources.
            Invokes onLoad(sender, src, e) if defined.
	——————————————————————————————————————————————————————————————————————————*/
    doLoad(src, e) {
        var t = this, // really helpful in closure.
            img;

		if (src === t._curImg || src !== t._nxtImg)
            return false;
		img = resources.addLink(src, t);
		if (img) {
            t._element.onload = innerOnLoad;
			t._element.src = img.src;
		}
        return (img !== null);

        function innerOnLoad() {
            t._curImg = src;
            t._element.onload = null;
            log(t.namePath, 'load');
            t.contentChanged();
            t.dispatch(t._eve.onLoad, src, e);
        }		 
    }

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: doLoadEnd
      TASK: Flags the image control that image loading is finalized.
      ARGS: src : string : source url.
            e   : event  : progress event.
      INFO: Invokes onLoadEnd(sender, src, e) if defined.
	——————————————————————————————————————————————————————————————————————————*/
    doLoadEnd(src, e) {
        log(this.namePath, 'loadEnd');
		return this.dispatch(this._eve.onLoadEnd, src, e);
    }

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doProgress
	  TASK: Flags the image control that image load is progressing.
	  ARGS: src : string : source url.
            e   : event  : progress event.
	  INFO: Invokes onProgress(sender, src, e) if defined.
	——————————————————————————————————————————————————————————————————————————*/
    doProgress(src, e = null) {
		log(this.namePath, 'progress');
		return this.dispatch(this._eve.onProgress, src, e);
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: doTimeout
	  TASK: Flags the image control that image load is timed out.
	  ARGS: src : string : source url.
            e   : event  : timeout event.
	  INFO: Invokes onTimeout(sender, src, e) if defined.
	——————————————————————————————————————————————————————————————————————————*/
    doTimeout(src, e = null) {
		log(this.namePath, 'timeout');
		return this.dispatch(this._eve.onTimeout, src, e);
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: doAbort
	  TASK: Flags the image control that image load is aborted.
	  ARGS: src : string : src (url).
            e   : event  : progress event.
	  INFO: Invokes onAbort(sender, e) if defined.
	——————————————————————————————————————————————————————————————————————————*/
    doAbort(src, e = null) {
		log(this.namePath, 'abort');
		return this.dispatch(this._eve.onAbort, src, e);
	}
    
    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: doError
	  TASK: Flags the image control that image load has an error.
	  ARGS: src : string : src (url).
            e   : event  : progress event.ARGS: e   : error event.
	——————————————————————————————————————————————————————————————————————————*/
    doError(src, e = null) {
		log(this.namePath, 'error');
		return this.dispatch(this._eve.onError, src, e);
    }

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doResourceLinkRemoved
	  TASK: Tells image control that image link is detached by resources.
	  ARGS: name : string : image resource name.
	——————————————————————————————————————————————————————————————————————————*/
    doResourceLinkRemoved(name = null) {
        if (name === this._curImg)
            this._curImg = null;
    }

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC:	doLoadComplete.
	  TASK:	Signals control that loading (deserialization) is complete.
	——————————————————————————————————————————————————————————————————————————*/
	async doDeserializeEnd(dispatchEvent = true) {
        super.doDeserializeEnd(false);
        if (this._strategy !== 'manual') 
            this.load();
        if (!!dispatchEvent)
            this.dispatch(this.onDeserializeEnd)
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: doViewportResize
	  TASK: Flags the image that viewport is resized.
	  INFO: This is a global dispatch from display control.
	——————————————————————————————————————————————————————————————————————————*/
	doViewportResize(newViewport = null) {
	
        if (newViewport) {
            this.load();
        }
		super.doViewportResize(newViewport);
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
    	return this.naturalWidth;         
    }

    /*——————————————————————————————————————————————————————————————————————————
      FUNC: _maxH [protected].
      TASK: This finds the maximum control height required for the image.
      RETV:     : number : maximum control height required for the image.
      INFO: 
        *   This is TImage override version. 
        *   When autoH is "fit" or "max", tries to find maximum control
            height required for contents ignoring any boundaries.
    ——————————————————————————————————————————————————————————————————————————*/
    _maxH() {
    	return (this._w / this.naturalWidth) * this.naturalHeight;         
    }

	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	src : null, string or Object.
	  GET : Gets the source url data.
	  SET : Sets the source url data.
	  INFO: 
		* It can be a string like : "images/theImage.png".
		* It can be a viewport object like :
        {
            xs: "images/extraSmallImage.png",   // for extra small viewport.
            sm: "images/smallImage.png",		// for small viewport.
            md: "images/mediumImage.png",		// for medium viewport.
            df: "images/largeImage.png"		    // for other viewports (default).
        }
	————————————————————————————————————————————————————————————————————————————*/
	get src() {
		return this._src;
	}

	set src(val = null) {
        this._setAutoValue(val, '_src', 'src', false, true);
        if (this._sta === sys.LOAD || this._strategy === 'manual')
            return;
        this.load();
	}

    /*————————————————————————————————————————————————————————————————————————————
	  PROP:	alt : string.
	  GET : Gets the image alt string.
	  SET : Sets the image alt string.
	————————————————————————————————————————————————————————————————————————————*/
	get alt() {
		return this._alt;
	}

	set alt(val = null) {
        if (typeof val !== 'string' &&  val !== null)
            return;
        if (this._alt === val)
            return;
        this._alt = val;
        this._element.alt = val;
	}
	
    /*————————————————————————————————————————————————————————————————————————————
	  PROP:	title : string.
	  GET : Gets the image title string.
	  SET : Sets the image title string.
	————————————————————————————————————————————————————————————————————————————*/
	get title() {
		return this._title;
	}

	set title(val = null) {
        if (typeof val !== 'string' &&  val !== null)
            return;
        if (this._title === val)
            return;
        this._title = val;
        this._element.title = val;
	}

    /*————————————————————————————————————————————————————————————————————————————
	  PROP:	loader : function.
	  GET : Gets the loader function.
	  SET : Sets the loader function.
	  INFO: 
		* At set and get if invalid, it will default to TCtl.imageLoader(). 
	————————————————————————————————————————————————————————————————————————————*/
	get loader() {
		return (this._loader instanceof Function) ? this._loader : TCtl.imageLoader;
	}

	set loader(val = null) {
        this._loader = (val instanceof Function) ? val : TCtl.imageLoader;
	}

    /*————————————————————————————————————————————————————————————————————————————
	  PROP:	strategy : string.
	  GET : Gets the loading strategy.
	  SET : Sets the loading strategy.
	  INFO: 
        *   Valid values:
            'auto' -> automatic management of image load, when needed.
            'manual'-> programmer manages loading.
            'agressive' -> preloads everything.     
	————————————————————————————————————————————————————————————————————————————*/
	get strategy() {
		return this._strategy;
	}

	set strategy(val = null) {
        if (!sys.str(val) || val === this._strategy)
            return;
        if (val === 'auto' || val === 'manual' || val === 'agressive') {
            this._strategy = val;
            if (this._sta !== sys.LOAD && val !== 'manual')
                this.load();
        }
	}
	
	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	naturalWidth : int.
	  GET : Gets the natural width of image.
	  INFO: If image is not loaded returns 0. 
    ————————————————————————————————————————————————————————————————————————————*/
	get naturalWidth() {
		const nw = this._element.naturalWidth;
		return (nw === 'undefined' ? 0 : nw);
	}

	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	naturalHeight : int.
	  GET : Gets the natural height of image.
	  INFO: If image is not loaded returns 0.
	————————————————————————————————————————————————————————————————————————————*/
	get naturalHeight() {
		const nh = this._element.naturalWidth;
		return (nh === 'undefined' ? 0 : nh);
	}

}

sys.registerClass(TImage);

export { TImage }
