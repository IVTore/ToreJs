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
		loadSmall: {value: true},
	}

	_lnk = null;			// linked controls array.
	_src = null;			// source data.
	_loadSmall = true;		// When viewport gets smaller force loading
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
		this.links = null;
		super.destroy();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: addLink.
	  TASK: Links a resourced control to resource.
	  ARGS: resCtl : ResControl : The resourced control to attach to resource.
	  INFO: Throws exception if resourced control is invalid.
	——————————————————————————————————————————————————————————————————————————*/
	addLink(resCtl = null) {
		var i;

		if (!(resCtl instanceof ResControl))
			exc('E_INV_ARG', 'resCtl !ResControl');
		if (!resCtl.state)
			exc('E_INV_ARG', 'resCtl: '+ resCtl._nam + ' destroyed.');
		this._lnk = this._lnk || [];
		i = this._lnk.indexOf(resCtl);
		if (i !== -1)
			return;
		this._lnk.push(resCtl);
		resCtl.doResourceAttach(this);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: delLink.
	  TASK: Deletes the link between the resourced control and resource.
	  ARGS: resCtl : ResControl : The resourced control to detach from resource.
	——————————————————————————————————————————————————————————————————————————*/
	delLink(resCtl = null) {
		if (!resCtl || !this._lnk)
			return;
		i = this._lnk.indexOf(resCtl);
		if (i === -1)
			return;
		resCtl.doResourceDetach(this);
		this._lnk.splice(i, 1);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: hasLink.
	  TASK: Returns true if resCtl is linked to resource.
	  ARGS: resCtl : Control : The control to check link to resource.
	——————————————————————————————————————————————————————————————————————————*/
	hasLink(resCtl = null) {
		return this._lnk ? this._lnk.indexOf(resCtl) > -1 : false;
	}

	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	links : array.
	  GET : Returns a copy of linked controls array.
	  SET : Sets the linked controls array.
	  INFO: Set method serves for; 
			1] Assignment with a single command.
			2] sys.propSet() or constructor data parameter. 
			3] Deserialization.
	————————————————————————————————————————————————————————————————————————————*/
	get links() {
		if (this._lnk === null || this.lnk.length === 0)
			return null;
		return this._lnk.concat();
	}

	set links(val = null) {
		var i,
			l;

		if (val !== null && !Array.isArray(val))
			exc('E_INV_ARG', 'val != null && class != Array');
		if (this._lnk) {
			l = this._lnk.length();
			for(i = 0; i < l; i++)
				this._lnk[i].doResourceDetach(this);
			this._lnk = null;
		}
		if (val === null)
			return;
		l = val.length();
		for(i = 0; i < l; i++)
			this.addLink(val[i]);
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