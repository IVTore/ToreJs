/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	IVT : İhsan V. Töre
  About		: 	Resource.js: Tore Js Resource component class.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/

import { exc, is, sys } from "../lib/index.js";
import { ctl, Control, Container } from "../ctl/index.js";
import { resources } from "./Resources.js";

/*——————————————————————————————————————————————————————————————————————————
  CLASS: Resource
  TASKS: Resource is base component for application assets.
——————————————————————————————————————————————————————————————————————————*/
export class Resource extends Component {

	static cdta = {
		links: {value: null},
		source: {value: null}
	}

	_lnk = null;			// linked controls array.
	_src = null;

	/*——————————————————————————————————————————————————————————————————————————
	  CTOR: constructor.
	  TASK: Constructs a resource component, attaches it to resources.
	——————————————————————————————————————————————————————————————————————————*/
	constructor(name = null, data = null) {
		super(name);
		if (name === sys.LOAD)
			return;
		resources.attach(this);
		if (data)
			sys.propSet(this, data);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  DTOR: destructor.
	  TASK: Destroys resource component along with asset data.
	——————————————————————————————————————————————————————————————————————————*/
	destroy() {
		super.destroy();
	}

	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	source : null, string or Object.
	  GET : Gets the source url data.
	  SET : Sets the source url data.
	  INFO: 
		* Source url data can be set once.
		* It can be a string like : "myImages/theImage.png".
		* It can be a viewport sources object like :
			{
				xs: "myImages/extraSmallImage.png",
				sm: "myImages/smallImage.png",
				md: "myImages/mediumImage.png",
				
			}
	————————————————————————————————————————————————————————————————————————————*/
	get source() {
		return this._src;
	}

	set source(val = null) {
		if (this._src === val)
			return;
		if (this._src !== null)
			exc("E_RES_SRC_SET", this._nam);
		if (typeof val === 'string') {
			this._src = val;
			return;
		}

	}

}

sys.registerClass(Resource);