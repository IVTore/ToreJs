/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	IVT : İhsan V. Töre
  About		: 	Resource.js: Tore Js Resource component class.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/

import { is, sys } from "../lib/index.js";
import { ctl, Control, Container } from "../ctl/index.js";
import { resources } from "./Resources.js";

/*——————————————————————————————————————————————————————————————————————————
  CLASS: Resource
  TASKS: Resource is base component for application assets.
——————————————————————————————————————————————————————————————————————————*/
export class Resource extends Component {

	/*——————————————————————————————————————————————————————————————————————————
	  CTOR: constructor.
	  TASK: Constructs a resource component, attaches it to resources.
	——————————————————————————————————————————————————————————————————————————*/
	constructor(name = null, uri = null){
		super(name, resources);
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

sys.registerClass(Resource);