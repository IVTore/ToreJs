/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	IVT : İhsan V. Töre
  About		: 	TResources.js: Tore Js Resource manager component class.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/

import { is, sys, core, exc, chk, TComponent } from "../lib/index.js";

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
	  DTOR: destroy.
	  TASK: Removes all resources and links, destroys component.
	  INFO: It is not recommended to destroy resources component.
	  		If you are completely getting rid of ToreJs use core.destroy();
	——————————————————————————————————————————————————————————————————————————*/
	destroy() {
		var name;

		for(name in this._name)
			this.remove(name);
		super.destroy();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: add.
	  TASK: Stores a resource.
	  ARGS: 
	  	name	: string	: Resource name such as an url. :DEF: null.
		data	: *			: Resource such as an Image.	:DEF: null.
		keep	: boolean	: If true, resource will be kept even if there will
							  be no linked targets left.	:DEF: false.
	  INFO: 
		If name or data is missing, raises 'E_INV_ARG'. 
	  	If another resource with same name is present raises 'E_RES_OVR'.
		If data already exists raises 'E_RES_DUP’
		If keep is true, 
			removeLink(name, target) will not automatically 
			remove the resource when all links are removed, that is done via
			an additional link back to resources component, but remove(name) 
			will remove the resource even if it is true.
	——————————————————————————————————————————————————————————————————————————*/
	add(name = null, data = null, keep = false) {
		var i;

		chk(name, 'name');
		chk(data, 'data');
		if (this._name.indexOf(_name) > -1)
			exc('E_RES_OVR', name);
		i = this._data.indexOf(data);
		if (i > -1)
			exc('E_RES_DUP', name + ' = ' + this._name[i]);
		this._name.push(name);
		this._data.push(data);
		this._link.push([]);
		if (keep)
			this.addLink(name, this);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: remove.
	  TASK: Removes a resource.
	  ARGS: 
	  	name	: string	: Resource name such as an url. :DEF: null.
	  INFO: 
	  	This method never raises any exception.
		If a resource with the name exists 
			1] doResourceDetached(name) method on all linked and alive 
				targets	are	searched and called if exists.
			2] resource is deleted. 
	——————————————————————————————————————————————————————————————————————————*/
	remove(name = null) {
		var i,
			l,
			t;

		if (!name)
			return;
		i = this._name.indexOf(name);
		if (i < 0)
			return;
		l = this._link[i];
		for(t in l) {
			if (t.state)
				t.doResourceDetached(name);
		}
		this._name[i] = null;
		this._data[i] = null;
		this._link[i] = null;
		this._name.splice(i, 1);
		this._data.splice(i, 1);
		this._link.splice(i, 1);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: addLink.
	  TASK: Links a resource to a target component. Returns resource data.
	  ARGS: 
	  	name	: string		: Resource name such as an url. 	:DEF: null.
		target  : TComponent	: TComponent to link the resource. 	:DEF: null.
	  RETV:
		data	: *				: Resource data such as an Image or null.
	  INFO: 
		If name is missing or target is not a TComponent raises 'E_INV_ARG'. 
	  	If a resource with the name does not exist returns null.
		Adds target to resource links if not added already. 
		Returns data.
	——————————————————————————————————————————————————————————————————————————*/
	addLink(name = null, target = null) {
		var i = check(name, target);

		if (i < 0)
			return null;
		if (this._link[i].indexOf(target) < 0)
			this._link[i].push(target);
		return this._data[i];
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: removeLink.
	  TASK: Removes the link of a resource from a target component.
	  ARGS: 
	  	name	: string	 : Resource name such as an url. 	:DEF: null.
		target  : TComponent : TComponent to remove link of the resource.
							   :DEF: null.
	  INFO: 
		If name is missing or target is not a TComponent raises 'E_INV_ARG'. 
	  	If a resource with the name doesn't exists it returns.
		If target is in the links of resource,
			1] 	if target is alive, target.doResourceDetached(name) 
				method is called.
			2]  The link is deleted.,
		If there is no link left for resource, it is deleted. 	
	——————————————————————————————————————————————————————————————————————————*/
	removeLink(name = null, target = null) {
		var l,
			i = check(name, target);

		if (i < 0)
			return;
		l = this._link[i].indexOf(target);
		if (l < 0)
			return;
		this._link[i].splice(l, 1);
		if (target.state)
			target.doResourceDetached(name);		
		if (this._link[i].length === 0)
			this.remove(name);
	}
}

/*——————————————————————————————————————————————————————————————————————————
  FUNC: check [private].
  TASK: Checks name, target parameters and returns index of named resource.
  ARGS: 
  	name	: string	 : Resource name such as an url. 	:DEF: null.
	target  : TComponent : TComponent     				   	:DEF: null.
  INFO: 
	If name is missing or target is not a TComponent raises 'E_INV_ARG'. 
  	If a resource with the name doesn't exists it returns -1.
	Otherwise returns the index of resource.
——————————————————————————————————————————————————————————————————————————*/
function check(name = null, target = null) {
	chk(name, 'name');
	if (!(target instanceof TComponent))
		exc('E_INV_ARG', 'target');
	return core.resources._name.indexOf(name);
}
 

export const resources = new TResources();