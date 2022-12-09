/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	IVT : İhsan V. Töre
  About		: 	TResources.js: Tore Js Resource manager component class.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/

import { is, sys, core } from "../lib/index.js";
import { ctl, TControl } from "../ctl/index.js";

/*——————————————————————————————————————————————————————————————————————————
  CLASS: TResources
  TASKS: TResources class instance resources is a singleton component 
  		 which manages application assets.
——————————————————————————————————————————————————————————————————————————*/
class TResources extends TComponent {

	/*——————————————————————————————————————————————————————————————————————————
		static allowMemberClass		: (used in attach method).
			The allowed anchestor class of member.
			When null component is not allowed to have members.
	——————————————————————————————————————————————————————————————————————————*/
	static allowMemberClass = null;

	_name = [];
	_link = [];
	_data = [];
	/*——————————————————————————————————————————————————————————————————————————
	  CTOR: constructor.
	  TASK: Constructs resources singleton component, attaches it to core.
	——————————————————————————————————————————————————————————————————————————*/
	constructor() {
		if (core["resources"])
			exc("E_SINGLETON", "core.resources");
		super("resources", core);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  DTOR: destructor.
	  TASK: Destroys component.
	  INFO: Do not destroy resources.
	  		If you are completely getting rid of ToreJs use core.destroy();
	——————————————————————————————————————————————————————————————————————————*/
	destroy() {
		super.destroy();
	}

}

export const resources = new TResources();