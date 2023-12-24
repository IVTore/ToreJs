/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20230301
  Author	: 	İhsan V. Töre
  About		: 	TObject.js: Tore Js base object class.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/
import { sys, exc, core} from "./TSystem.js"

/*——————————————————————————————————————————————————————————————————————————— 
  CLASS: TObject
  TASKS: This is the Tore Js base object class.
———————————————————————————————————————————————————————————————————————————*/
export class TObject extends Object{

	static serializable = true;
    static get class() { return this;}
    
    _sta = sys.CTOR;
    _resLst = [];

    /*———————————————————————————————————————————————————————————————————————————
	  CTOR: constructor.
	  TASK: Constructs a TObject instance.
	  ARGS: 
	  	data : Object: An object containing instance property data[d=null].
					   if == Sys.LOAD construction is by deserialization.
	———————————————————————————————————————————————————————————————————————————*/
	constructor(data = null) {
        super();
		//—————————————————————————————————————————————————————————————————————
		this._sta = sys.LIVE;
		//—————————————————————————————————————————————————————————————————————
		if (!data)
			return;
		if (data === sys.LOAD)
			this._sta = sys.LOAD;
		else
			sys.propSet(this, data);
	}

	/*———————————————————————————————————————————————————————————————————————————
	  DTOR: destroy.
	  TASK: Destroys the object logically.
	  INFO:	A destroy() call destroys the object logically setting the object 
			state to DEAD. Every descendant should define destroy and call
			super.destroy();
	———————————————————————————————————————————————————————————————————————————*/
	destroy() {
		var c = this.constructor.cdta || {},
			i;
		
		if (!this._sta)					// dead already
			return;
        if (this._resLst.length > 0)    // unlink resources
            core.resources.removeTarget(this);    
        this._sta = sys.DEAD;
		for(i in this){					// wipe dynamics
			if (c[i] || i[0] === '_')
				continue;
			delete this[i];
		}
	}

	/*———————————————————————————————————————————————————————————————————————————
	  FUNC:	saveState. 
	  TASK:	Saves published and dynamic properties to a generic Array.
	  RETV:		: Object 
	  INFO:	Published properties with the default values are not saved.
			Dynamic properties are saved without such optimization.
	———————————————————————————————————————————————————————————————————————————*/
	saveState() {
	var cdta = this.constructor.cdta,		// get class data
		stat = this._sta,					// get current state
		prop,
		i,
		v,
		r = {};
		
		this.checkDead()
		this._sta = sys.SAVE;			// set state to SAVE
		for(i in cdta) {
			prop = cdta[i];				// get prop info at class data
			if (!prop.store)			// if not storable, ignore
				continue;
			v = this[i];				// get value
			if (prop.value === v)		// if value is default, ignore
				continue;
			r[i] = v;
		}
		for(i in this){
			if (i[0] === '_') 			// skip if protected.
				continue;
			if (cdta[i])				// skip if property.
				continue;
			r[i] = this[i];
		}
		this._sta = stat;				// set state back
		return({p:r});					// props
	}

	/*———————————————————————————————————————————————————————————————————————————
	  FUNC:	doLoadComplete.
	  TASK:	Used to signal object that loading is complete.
      INFO: This is called when sys.deserialize or sys.propSet is completed.
	———————————————————————————————————————————————————————————————————————————*/
	doDeserializeEnd(){
		if (this._sta !== sys.LOAD)
            return;
        this._sta = sys.LIVE;
	}

    /*——————————————————————————————————————————————————————————————————————————
	  FUNC:	doResourcelinkRemoved.
	  TASK:	Signals object that a resource with name is no more linked.
	  ARGS:	resourceName : string	: resource name.
	  INFO: This is to be overridden.
	——————————————————————————————————————————————————————————————————————————*/
	doResourceLinkRemoved(resourceName = null) {
		
	}

	/*———————————————————————————————————————————————————————————————————————————
	  FUNC:	checkDead.
	  TASK:	Raises exception if object is logically dead.
	———————————————————————————————————————————————————————————————————————————*/
	checkDead(){
		if (!this._sta)
			exc('E_OBJ_DEAD');
	}

	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	class.
	  TASK:	GET : Returns object class (constructor).
	————————————————————————————————————————————————————————————————————————————*/
	get class(){
		return this.constructor;
	}

	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	state.
	  TASK:	GET : Returns object state.
	————————————————————————————————————————————————————————————————————————————*/
	get state() {
		return this._sta; 
	}
}

// register class at sys.