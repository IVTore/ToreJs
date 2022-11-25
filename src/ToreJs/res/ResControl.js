/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 20220706
  Author	: IVT : İhsan V. Töre
  About		: ResControl.js: 
				Tore Js base visual control with resource component class.
  License	: MIT.
————————————————————————————————————————————————————————————————————————————*/

import { exc } from "../lib";
import { Resource } from "./Resource.js";

/*———————————————————————————————————————————————————————————————————————————— 
  CLASS: ResControl
  TASKS: Defines basic behaviours of Tore JS controls with resources.
  NOTES:
	*	Controls with resources such as image, sound, video are linked to
		resource management system of ToreJS. 
	*	ResControl class adds basic integration with resource management 
		system.
————————————————————————————————————————————————————————————————————————————*/

export class ResControl extends Control {

	static cdta = {
		resource:		{value: null},
		resViewportTag: {value: null},
		onResAttach:	{event: true},
		onResDetach:	{event: true},
		onResLoaded:	{event: true},
		onResProgress:	{event: true},
		onResError:		{event: true}
	}

	_res = null;		// resource component.
	_rvp = null;		// resource viewport name, null = all.
	
	/*——————————————————————————————————————————————————————————————————————————
      CTOR: constructor.
      TASK: Constructs a ResControl component, attaches it to its owner if any.
      ARGS: 
        name    : string    : Name of new panel :DEF: null.
                              if sys.LOAD, construction is by deserialization.
        owner   : Component : Owner of the new button if any :DEF: null.
        data    : Object    : An object containing instance data :DEF: null.
		init	: boolean	: If true, initialize control here. 
    ——————————————————————————————————————————————————————————————————————————*/
    constructor(name = null, owner = null, data = null, init = true) {
        super(name, null, null, false);
        this._initControl(name, owner, data, init);
    }

	/*————————————————————————————————————————————————————————————————————————————
	  DTOR: destroy.
	  TASK: Destroys the ResControl instance.
	————————————————————————————————————————————————————————————————————————————*/
	destroy() {
		if (!this._sta)
			return;
		this.resource = null;
		super.destroy();		// inherited destroy
	}


	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doResourceAttach
	  TASK: Flags the ResControl that resource is attaching to it.
	  ARGS: res : Resource : The resource to attach
	  INFO: Here the ResControl must set its resource hook.
	  WARN: Internal. This is called by resource.
	——————————————————————————————————————————————————————————————————————————*/
	doResourceAttach(res = null) {
		var e = this._eve.onResAttach;

		if (!(res instanceof Resource) || !res.hasLink(this) ) 
			exc('E_INV_RES', 'res');
		this._res = res;
		return ((e) ? e.dispatch([this, res]) : null);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: doResourceDetach
	  TASK: Flags the ResControl that resource is detaching from it.
	  ARGS: res : Resource : Just for checking purposes.
	  INFO: Here the ResControl must remove its resource hook.
	  WARN: Internal. This is called by resource.
	——————————————————————————————————————————————————————————————————————————*/
	doResourceDetach(res = null) {
		var r,
			e = this._eve.onResDetach;

		if (res !== this._res)
			return null;
		r = ((e) ? e.dispatch([this, res]) : null);
		this._res = null;
		return r;
	}

	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	resource : Resource.
	  GET : Returns the Resource component.
	  SET : Sets    the Resource.
	  INFO: Property setter can also be the name of resource component.
	————————————————————————————————————————————————————————————————————————————*/
	get resource() {
		return this._res;
	}

	set resource(val = null) {
		if (val === this._res)
			return;
		if (this._res)
			this._res.delLink(this);
		if (val === null)
			return;
		if (typeof val === 'string') {
			if (!resources[val])
				exc('E_INV_RES', val);
			val = resources[val];
		}
		if (!(val instanceof Resource)) 
			exc('E_INV_RES', 'val');
		val.addLink(this);
	}




}