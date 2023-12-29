/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	IVT : İhsan V. Töre
  About		: 	TCtlSys.js: Tore Js visual control component helpers.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/
import {
        sys, 
        exc, 
        core, 
        TObject,
        TComponent, 
        resources 
    }               from "../lib/index.js";
import { display }  from "./index.js";

/*————————————————————————————————————————————————————————————————————————————
  CLASS:    TCtlSys [static singleton]
  TASKS:    Control system framework with 
            Visual control constants settings and helpers. 
————————————————————————————————————————————————————————————————————————————*/

// private viewport sizes array.
var vpSiz = [ 576, 768, 992, 1200, 1400];
// private viewport names array.
var vpNam = ['xs','sm','md','lg','xl','xxl'];


const TCtl = {
				
	// TControl States
	DYING: 0,	// exiting or dead	
	ALIVE: 1,	// normal, idle
	HOVER: 2,	// pointer over 
	FOCUS: 3,	// selected, focused 
	SLEEP: 4,	// disabled

    // TControl state names
    stateNames : [		
        'Dying',
        'Alive',
        'Hover',
        'Focus',
        'Sleep'
    ],
	

    /*——————————————————————————————————————————————————————————————————————————
	  PROP: vpInfo. [static]
	  SET : Sets viewport names and sizes all at once via a plain object.
      GET : Gets viewport names and sizes as a plain object.
	  INFO: 
        *   A valid viewport info object is formed as:
            {
                <viewportName 1>: max number of css pixels in width,
                <viewportName 2>: max number of css pixels in width,
                .
                <viewportName n>: null (means no upper bound, mandatory) 
            }
        *   Example:
            {xs: 576, sm: 768, md: 992, lg: 1200, xl: 1400, xxl: null}
            in which xxl is the upper bound (null).
        *   Viewport names will be sorted according to sizes then assigned to
            vpSizes and vpNames arrays. 
        *   Only one null size value will be accepted as upper bound.
      WARN: 
        *   Exceptions:
            E_INV_VAL     -> If val is not a plain javascript object.
            E_VP_REQ_UBND -> If upper bound is not given.
            E_VP_MUL_UBND -> If multiple upper bounds given.
            E_VP_INV_SIZE -> If invalid size (NAN or < 16) given.
            E_VP_DUP_SIZE -> If same size with different names given.
            E_VP_REQ_SIZE -> If no numeric size value is given.
    ———————————————————————————————————————————————————————————————————————————*/
    set vpInfo(val = null) {
        var nm = [],
            sz = [],
            ub = null,
            sn,
            sv,
            ix,
            ln;

        if (!sys.isPlain(val))
            exc('E_INV_VAL', "viewportInfo");
        for(sn in val) {
            if (!val.hasOwnProperty(sn))    // Filter ancestral props.
                continue;
            sv = val[sn];
            if (sv === null) {              // Fetch upper bound.
                if (ub) 
                    exc('E_VP_MUL_UBND', sn + ' = ' + ub + ' = null.');
                ub = sn;
                continue;
            }
            if (typeof sv !== 'number' || sv < 16 || isNaN(sv))
                exc('E_VP_INV_SIZE', sn +': '+ sv);
            ix = sz.indexOf(sv);
            if (ix > -1)
                exc('E_VP_DUP_SIZE', sn + ' = ' + nm[ix] + ' = ' + sv);
            ln = sz.length;
            for(ix = 0; ix < ln; ix++) {
                if (sv < sz[ix])
                    break;
            }
            nm.splice(ix, 0, sn);
            sz.splice(ix, 0, sv);
        }
        if (sz.length === 0)
            exc('E_VP_REQ_SIZE');
        if (ub === null)
            exc('E_VP_REQ_UBND');
        nm.push(ub);
        vpNam = nm;
        vpSiz = sz;
    },

    get vpInfo() {
        var rv = {},
            ln = vpSiz.length,   
            ix;
             
        for(ix = 0; ix < ln; ix++) 
            rv[vpNam[ix]] = vpSiz[ix];
        rv[vpNam[ln]] = null;
        return rv;
    },

    /*——————————————————————————————————————————————————————————————————————————
	  PROP: vpSizes. [static]
	  GET : Gets viewport sizes as an array.
    ———————————————————————————————————————————————————————————————————————————*/
    get vpSizes() {
        return vpSiz.concat();
    },

    /*——————————————————————————————————————————————————————————————————————————
	  PROP: vpNames. [static]
	  GET : Gets viewport sizes as an array.
    ———————————————————————————————————————————————————————————————————————————*/
	get vpNames() {
        return vpNam.concat();
    },

    /*—————————————————————————————————————————————————————————————————————————
      FUNC: calcVpName
      TASK: Returns the viewport size name.
      ARGS: w   : number : Viewport width in pixels or null for auto.
      RETV:		: string : viewport size name.
    —————————————————————————————————————————————————————————————————————————*/
    calcVpName(w = null) {
        var s = TCtl.vpSizes,
            i,
            l = s.length;

        if (w === null)
            w = document.documentElement.clientWidth;
        for(i = 0; i < l; i++) {
            if (w < s[i])
                break;
        }
        return TCtl.vpNames[i];
    },
    

    /*——————————————————————————————————————————————————————————————————————————
  	  FUNC: vpValue.
  	  TASK: 
  		Gets a value corresponding to current viewport from a 
		viewport values object in a property of a component.
  	  ARGS:
		c		: TComponent	: For exception data. Generally a TControl.
		v		: Object		: Viewport Values object.
		name	: String		: Property name for exception message.
		force	: String		: Viewport name forced or null for current name.
  	  RETV: 	: * 			: Extracted string or number.
	——————————————————————————————————————————————————————————————————————————*/
	vpValue(c = null, v = null, name = '', force = null) {
		var vp = (force === null) ? display.viewportName : force;

		if (!c || !(c instanceof TComponent)) 
			exc('E_INV_ARG', 'c');
		if (!v || !(v.constructor === Object))
			exc('E_INV_ARG', 'v');
		v = (v[vp]) ? v[vp] : v.df;
		if (!v)
			exc('E_INV_VP_VAL', c.namePath+'.'+ name + ':{'+ vp +': ?, df: ?}');
		return v;
	},

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC: vpCheck.
	  TASK: Returns true if object is a valid viewport value object.
	  ARGS:	o	: object    : presumed valid viewport value object.
	  RETV:	    : boolean   : true if object is a valid viewport value object.
      INFO: A valid viewport object :
            * Must be plain.
            * Should contain a df (default) value and / or all other values.
            * This routine is used during assignments.
    ———————————————————————————————————————————————————————————————————————————*/
    vpCheck(v = null) {
        var i,
            n,
            l;
    
        if (!sys.isPlain(v))
            return false;
        if (v.df !== undefined)
            return true;
        n = vpNam;
        l = n.length;
        for(i = 0; i < l; i++) {
            if (v[n[i]] === undefined)
                return false;
        }
        return true;
    },

    /*——————————————————————————————————————————————————————————————————————————
  	  FUNC: autoValue.
  	  TASK: 
  		Gets an auto value corresponding to the value given.
        This gives no error.
  	  ARGS:
		v		: *		: auto value.
  	  RETV: 	: * 	: Extracted string, number or null.
	——————————————————————————————————————————————————————————————————————————*/
    autoValue(v = null) {
        var n;

        if (v === null)
            return null;
        if (v.constructor === Object) {
            n = core.display.viewportName;
            v = (v[n]) ? v[n] : v.df;
        }	
        return v;
    },

    /*———————————————————————————————————————————————————————————————————————————— 
        Default Image Loader and Image XHR loader.
        These are here instead of TImage since various controls can use images.
    ————————————————————————————————————————————————————————————————————————————*/

    /*——————————————————————————————————————————————————————————————————————————
      FUNC: imageLoader [public].
      TASK: This loads an image into resources via an Image object.
            Events are proxied to tar.
      ARGS: src : string  : image url.
            tar : TObject : Event target object.
            par : Object  : Extra parameters. Irrelevant here.
      RETV      : Promise : promise resolve(src) reject(errorMessage) 
      INFO: 
        *   Can be used standalone, target (tar) can be null.
        *   Theoretically non-blocking :).
        *   When image is loaded, it can be obtained from resources.
        *   If the image is previously loaded and target is non null
            triggers doLoadStart, doProgress, doLoad and doLoadEnd on target.
    ——————————————————————————————————————————————————————————————————————————*/
    imageLoader(src = '', tar = null, par = null) {
        return imageLoaderCommon(src, tar, imageLoaderPromise, src, tar);
    },

    /*————————————————————————————————————————————————————————————————————————————
      FUNC: imageLoaderXhr [public][export].
      TASK: This loads an image into resources using XMLHttpRequest.
      ARGS: src : string  : image url.
            tar : TObject : Target TObject for events (resource claimer).
            par : Object  : Extra parameters. Used for TXhrClient properties.
      RETV      : Promise : promise resolve(src) reject(errorMessage) 
      INFO: 
        *   Can be used standalone, target (tar) can be null.
        *   Non-blocking.
        *   Theoretically non-blocking :).
        *   When image is loaded, it can be obtained from resources.
        *   If the image is previously loaded and target is non null
            triggers doLoadStart, doProgress, doLoad and doLoadEnd on target.
        *   This uses FileReader. Looks stable. Very slow for big images, 
            since FileReader converts the image blob to base64 data before 
            assigning. 
        *   The use of URL createObjectURL() and revokeObjectURL() was messy. 
            This may change when browsers support srcObject property.
    ————————————————————————————————————————————————————————————————————————————*/
    imageLoaderXhr(src = '', tar = null, par = null) {
    	return imageLoaderCommon(src, tar, imageLoaderXhrPromise, src, par);
    }    

}

// Internal:
// This DRY routine contains common prelude for loading an image.
function imageLoaderCommon(src, tar, promiseFunc, par) {
    const r = resources;

    sys.str(src, 'src');
    tar = (tar instanceof TObject) ? tar : null;
    if (r.hasAsset(src)) {
        return new Promise((resolve) => {
            if (tar && tar._sta)
                ImageLoaderMethodTrigger(src, tar, ['LoadStart', 'Progress', 'Load', 'LoadEnd']);
            resolve(src);
        });
    }
    if (r.hasClaim(src)) 
        return r.addClaim(src, tar);        
    return r.newClaim(src, tar, promiseFunc(src, tar, par)) ;  
}

// Internal:
// This DRY routine tries to compensate methods that are not normally triggered. 
function ImageLoaderMethodTrigger(src, tar, def) {
    var met, 
        eve;

    if (!tar || !tar._sta)
        return;
    for (met in def) {
        eve = met.toLowerCase();
        met = 'do' + met; 
        if (tar[met] instanceof Function) 
            tar[met](src, new ProgressEvent(eve))
    }
} 

// internal.
// Used in TCtl.imageLoader.
function imageLoaderPromise(src, tar, par) {
    var img = new Image(),
        res = resources;

    return new Promise((resolve, reject) => {
        img.onabort = hndProblem; 
        img.onerror = hndProblem;
        img.onload = hndLoad;
        img.onloadend = hndLoadEnd;
        if (tar && tar._sta) 
            ImageLoaderMethodTrigger(src, tar, ['LoadStart', 'Progress']);   
        img.src = src;

        function hndProblem(e) { 
            var nm = e.type[0].toUpperCase() + e.type.substring(1);

            res.trigger(src, 'do' + nm, e); 
            reject('Image Load ' + nm + ' ['+ src + '].');
        }

        function hndLoad(e) {
            res.add(src, img);
            res.trigger(src, 'doLoad', e); 
            resolve(src);
        }

        function hndLoadEnd(e) {
            res.trigger(src, 'doLoadEnd', e);   // this is the last event.
            res.delClaims(src);                 // so clear claims.
            img.onabort = null; 
            img.onerror = null;
            img.onload = null;
            img.onloadend = null;
        }
    });
}

// internal.
// Used in TCtl.imageLoaderXhr.
function imageLoaderXhrPromise(src, tar, par) {
    var client = null,
        reader = null,
        xhr,
        res = resources,        
        img;

    return new Promise((resolve, reject) => {  

        client = new TXhrClient('GET', src, null, 'blob');
        if (par)
            sys.propSet(client, par);
        xhr = client.xhr;
        xhr.onloadstart = xhrLoadStart;
        xhr.onload      = xhrLoad;
        xhr.onloadend   = xhrLoadEnd;
        xhr.onprogress  = hndProgress;
        xhr.onabort     = hndProblem;       // Might be necessary.
        xhr.ontimeout   = hndProblem;       // Might be necessary.
        xhr.onerror     = hndProblem;
        client.send();

        // xhr handlers.
        function xhrLoadStart(e) { 
            res.trigger(src, 'doLoadStart', e); 
        }

        function xhrLoad(e) {  
            if (xhr.status < 200 || xhr.status > 299) {
                hndProblem({type: 'error'});
                return;
            }
            reader = new FileReader();
            reader.onprogress  = hndProgress;
            reader.onabort     = hndProblem;
            reader.onerror     = hndProblem;
            reader.onload      = frdLoad;
            reader.onloadend   = frdLoadEnd;
            reader.readAsDataURL(xhr.response); 
        }

        function xhrLoadEnd(e) {
            if (reader === null)                // If load failed,
                cleanUp(e);                     // bailout.
        }

        // common handlers.
        function hndProgress(e)  { res.trigger(src, 'doProgress', e); }

        function hndProblem(e) { 
            var nm = e.type[0].toUpperCase() + e.type.substring(1);

            res.trigger(src, 'do' + nm, e); 
            reject('Image Load ' + nm + ' ['+ src + '].');
        }

        // File reader handlers.
        function frdLoad(e) {
            img = new Image();
            img.src = reader.result;
            res.add(src, img);
            res.trigger(src, 'doLoad', e);
            resolve(src); 
        }

        function frdLoadEnd(e) {
            cleanUp(e);           
        }

        // note: Xhr Client clears its events during destroy.
        function cleanUp(e) {
            res.trigger(src, 'doLoadEnd', e);   // this is the last event.
            res.delClaims(src);                 // Clear claims.
            client.destroy();                   // Destroy xhr client.
            client = null;                      // XhrClient to GC.
            if (!reader)                        // If client failed,
                return;                         // no reader, so return.
            reader.onprogress  = null;
            reader.onabort     = null;
            reader.onerror     = null;
            reader.onload      = null;
            reader.onloadend   = null;
            reader = null;                      // File reader to GC.
        }
    });    
}

Object.freeze(TCtl);

export { TCtl };
