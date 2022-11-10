/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 20220706
  Author	: IVT : İhsan V. Töre
  About		: ResControl.js: 
				Tore Js base visual control with resource component class.
  License	: MIT.
————————————————————————————————————————————————————————————————————————————*/

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
	
	/*——————————————————————————————————————————————————————————————————————————
      CTOR: constructor.
      TASK: Constructs a ResControl component, attaches it to its owner if any.
      ARGS: 
        name    : string    : Name of new panel :DEF: null.
                              if Sys.LOAD, construction is by deserialization.
        owner   : Component : Owner of the new button if any :DEF: null.
        data    : Object    : An object containing instance data :DEF: null.
		init	: boolean	: If true, initialize control here. 
    ——————————————————————————————————————————————————————————————————————————*/
    constructor(name = null, owner = null, data = null, init = true) {
        super(name, null, null, false);
        this._initControl(name, owner, data, init);
    }


}