/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	İhsan V. Töre
  About		: 	TObject.js: Tore Js base object class.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/
import { sys, is, exc} from "./system.js"

/*——————————————————————————————————————————————————————————————————————————— 
  CLASS: TObject
  TASKS: This is the Tore Js base object class.
———————————————————————————————————————————————————————————————————————————*/
export class TObject {

	static get class() { return this;}

	/*———————————————————————————————————————————————————————————————————————————
	  CTOR: constructor.
	  TASK: Constructs a TObject instance.
	  ARGS: 
	  	data : Object: An object containing instance property data[d=null].
					   if == Sys.LOAD construction is by deserialization.
	———————————————————————————————————————————————————————————————————————————*/
	constructor(data = null) {
		//—————————————————————————————————————————————————————————————————————
		this._sta = sys.LIVE;
		//—————————————————————————————————————————————————————————————————————
		if (!data)
			return;
		if (data == sys.LOAD)
			this._sta = sys.LOAD;
		else
			sys.propSet(this, data);
	}

	/*———————————————————————————————————————————————————————————————————————————
	  DTOR: destroy
	  TASK: Destroys the object logically.
	  INFO:	A destroy() call destroys the object logically setting the object 
			state to DEAD. Every descendant should define destroy and call
			super.destroy();
	———————————————————————————————————————————————————————————————————————————*/
	destroy(){
		var t = this,
			c = t.constructor.cdta || {},
			i;
		
		if (!t._sta)					// dead already
			return;
		t._sta = sys.DEAD;
		for(i in t){					// wipe dynamics
			if (c[i] || (i[0]==='_'))
				continue;
			delete t[i];
		}
	}

	/*———————————————————————————————————————————————————————————————————————————
	  FUNC:	saveState 
	  TASK:	Saves published and dynamic properties to a generic Array.
	  RETV:		: Object 
	  INFO:	Published properties with the default values are not saved.
			Dynamic properties are saved without such optimization.
	———————————————————————————————————————————————————————————————————————————*/
	saveState(){
	var t = this,						// fetch self
		cdta = t.constructor.cdta,		// get class data
		stat = t._sta,					// get current state
		prop,
		i,
		v,
		r = {};
		
		t.checkDead()
		t._sta = sys.SAVE;				// set state to SAVE
		for(i in cdta) {
			prop = cdta[i];				// get prop info at class data
			if (!prop.store)			// if not storable, ignore
				continue;
			v = t[i];					// get value
			if (prop.value === v)		// if value is default, ignore
				continue;
			r[i] = v;
		}
		for(i in t){
			if (i[0] === '_') 			// if hidden.
				continue;
			if (cdta[i])				// if prop.
				continue;
			r[i] = t[i];
		}
		t._sta = stat;					// set state back
		return({p:r});					// props
	}

	/*———————————————————————————————————————————————————————————————————————————
	  FUNC:	doLoadComplete
	  TASK:	Used to signal object that loading is complete.
	———————————————————————————————————————————————————————————————————————————*/
	doLoadComplete(){
		if (this._sta == sys.LOAD)
			this._sta = sys.LIVE;
	}

	/*———————————————————————————————————————————————————————————————————————————
	  FUNC:	checkDead
	  TASK:	Raises exception if object is logically dead.
	———————————————————————————————————————————————————————————————————————————*/
	checkDead(){
		if (!this._sta)
			exc('E_OBJ_DEAD');
	}

	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	class
	  TASK:	GET : Returns object class (constructor).
	————————————————————————————————————————————————————————————————————————————*/
	get class(){
		return this.constructor;
	}

	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	state
	  TASK:	GET : Returns object state.
	————————————————————————————————————————————————————————————————————————————*/
	get state() {
		return this._sta; 
	}
}