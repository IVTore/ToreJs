/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	:   20220706
  Author	:   IVT : İhsan V. Töre
  About		:   TImageLoader.js: 
			    Tore Js image loader function component class.
  License	:   MIT.
————————————————————————————————————————————————————————————————————————————*/

import { exc, is, sys, resources, TComponent, chk } from "../lib/index.js";

/*————————————————————————————————————————————————————————————————————————————
  CLASS: TImageLoader.
  TASKS: Instances keep an image loader method in loaderFunc property. 
		 load(image) method calls the loader function with image as 
		 parameter.
————————————————————————————————————————————————————————————————————————————*/
export class TImageLoader extends TComponent {
    
    static allowMemberClass = null;

	_func = null;
    /*——————————————————————————————————————————————————————————————————————————
	  CTOR: constructor.
	  TASK: Constructs a TImageLoader component instance, 
            attaches it to core.imageLoaders.
	  ARGS: 
		name 		: string	: Name of new component :DEF: null.
								  if Sys.LOAD construction is by 
								  deserialization.
		loaderFunc	: function	: loader function :DEF: null. 
	——————————————————————————————————————————————————————————————————————————*/
    constructor(name = null, loaderFunc = null) {
		super(name, core.TImageLoaders);
		if (!loaderFunc)
			return;
		loaderFunction = loaderFunc; 
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC:	load.
	  TASK:	
		Loads an image for TImage control given.
	  ARGS:
		image   : TImage    : TImage control, requesting load :DEF: null.
	  RETV: 
                : Image	    : A js native Image object containing image loaded.
      INFO: 
            If loading method supports progress 
	——————————————————————————————————————————————————————————————————————————*/
    load(image = null) {
		if (!this._func)
        	exc('E_FUNC_NULL', this.namePath+'.loaderFunction');
		if (!(image instanceof TImage))
			exc('E_INV_ARG', 'image');
		return this._func.apply(null,[image]);
    }

	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	loaderFunction : function.
	  GET : Returns the loader function.
	  SET : Sets    the loader function.
	  INFO: Loader function can be set only once per instance.
	————————————————————————————————————————————————————————————————————————————*/
	get loaderFunction() {
		return this._func;
	} 

	set loaderFunction(val = null) {
		if (val === this._func)
			return;
		if (this._func !== null)	
			exc('E_SET_ONLY_ONCE', 'loaderFunction');
		if (typeof val !== 'function')
			exc('E_INV_VAL','loaderFunction !function');
		this._func = val;
	}  
}

/*————————————————————————————————————————————————————————————————————————————
  CLASS: TImageLoaders.
  TASKS: Class for imageLoaders singleton managing image loader methods. 
————————————————————————————————————————————————————————————————————————————*/
class TImageLoaders extends TComponent {
  
    static allowMemberClass = TImageLoader;

	/*——————————————————————————————————————————————————————————————————————————
	  CTOR: constructor.
	  TASK: Constructs imageLoaders singleton component, attaches it to core.
	——————————————————————————————————————————————————————————————————————————*/
	constructor(){
		if (core["imageLoaders"])
		    exc("E_SINGLETON", "core.imageLoaders");
		super("imageLoaders", core);
	}

    /*——————————————————————————————————————————————————————————————————————————
	  DTOR: destroy.
	  TASK: Removes functions list, destroys component.
	  INFO: It is not recommended to destroy imageLoaders component.
            If you are completely getting rid of ToreJs use core.destroy();
            Loader functions are not destroyed but named function links 
            are lost.
	——————————————————————————————————————————————————————————————————————————*/
	destroy() {
		super.destroy();
	}
}

sys.registerClass(TImageLoader);
export const imageLoaders = new TImageLoaders();