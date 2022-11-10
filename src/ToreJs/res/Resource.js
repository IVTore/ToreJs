/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	IVT : İhsan V. Töre
  About		: 	Resource.js: Tore Js Resource component class.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/

import { exc, is, sys } from "../lib/index.js";
import { ctl, ResControl } from "../ctl/index.js";
import { resources } from "./Resources.js";

/*——————————————————————————————————————————————————————————————————————————
  CLASS: Resource
  TASKS: Resource is base component for application assets.
——————————————————————————————————————————————————————————————————————————*/
export class Resource extends Component {

	static allowMemberClass = null;	// a resource does not have members.

	static cdta = {
		links: {value: null},
		source: {value: null},
		alwaysLoad: {value: true},
	}

	_lnk = null;			// linked controls array.
	_src = null;			// source data.
	_alwaysLoad = true;		// When viewport gets smaller force loading
							// of a smaller resource even though a higher
							// viewport resource is present.

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

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: addLink.
	  TASK: Links a control to resource.
	  ARGS: control	: Control : The control to link to resource.
	  INFO: Throws exception if control is invalid.
	——————————————————————————————————————————————————————————————————————————*/
	addLink(resCtl = null) {
		if (!(resCtl instanceof ResControl))
			exc('E_INV_ARG', 'control');
		if (!resCtl.state)
			exc('E_INV_ARG', 'control: '+ resCtl._nam + ' destroyed.');
		this._lnk = this._lnk || [];
		sys.addUnique(this._lnk, resCtl);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: delLink.
	  TASK: Deletes the link between the control and resource.
	  ARGS: control	: Control : The control to delete link to resource.
	——————————————————————————————————————————————————————————————————————————*/
	delLink(control = null) {
	var i;

		if (!control || !this._lnk)
			return;
		i = this._lnk.indexOf(control);
		if (i === -1)
			return;
		this._lnk.splice(i, 1);
	}

	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	links : array.
	  GET : Returns a copy of linked controls array.
	  SET : Sets the linked controls array.
	  INFO: addLink and delLink are preferred methods.
	————————————————————————————————————————————————————————————————————————————*/
	get links() {
		if (this._lnk === null || this.lnk.length === 0)
			return null;
		return this._lnk.concat();
	}

	set links(val = null) {
		if (val === null){
			if (this._lnk)
		}
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
				xs: "myImages/extraSmallImage.png", // for extra small viewport.
				sm: "myImages/smallImage.png",		// for small viewport.
				md: "myImages/mediumImage.png",		// for medium viewport.
				df: "myImages/largeImage.png"		// for other viewports (default).
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
		if (is.plain(val))
			this._src = Object.assign({}, r);
	}

}

sys.registerClass(Resource);