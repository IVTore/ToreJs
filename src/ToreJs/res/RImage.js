/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	IVT : İhsan V. Töre
  About		: 	RImage.js: Tore Js Image Resource component class.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/

import { is, sys } from "../lib/index.js";
import { ctl, Control, Container } from "../ctl/index.js";
import { Resource } from "./Resource.js";
import { resources } from "./Resources.js";

/*——————————————————————————————————————————————————————————————————————————
  CLASS: RImage
  TASKS: RImage is for application image assets.
——————————————————————————————————————————————————————————————————————————*/
export class RImage extends Resource {

	_img = null;

	/*——————————————————————————————————————————————————————————————————————————
	  CTOR: constructor.
	  TASK: Constructs a resource component, attaches it to resources.
	——————————————————————————————————————————————————————————————————————————*/
	constructor(name = null, data = null) {
		super(name, data);
	}

		
	/*——————————————————————————————————————————————————————————————————————————
	  DTOR: destructor.
	  TASK: Destroys component.
	——————————————————————————————————————————————————————————————————————————*/
	destroy() {
		super.destroy();
	}

}
sys.registerClass(RImage);