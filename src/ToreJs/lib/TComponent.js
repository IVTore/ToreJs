/*————————————————————————————————————————————————————————————————————————————
  Tore Js

  Version	: 	20220706
  Author	: 	IVT : İhsan V. Töre
  About		: 	TComponent.js: Tore Js base component class.
  License 	:	MIT.
————————————————————————————————————————————————————————————————————————————*/
import { sys, is, exc } from "./system.js";
import { TObject } from "./TObject.js";
import { TEventHandler } from "./TEventHandler.js";


/*——————————————————————————————————————————————————————————————————————————
  CLASS: TComponent.
  TASKS: This is the component class for Tore Js providing.
		1)	TComponent hierachy with ownership / membership relations.
		2)	Easy to use event notification mechanism.
——————————————————————————————————————————————————————————————————————————*/
export class TComponent extends TObject {

	/*——————————————————————————————————————————————————————————————————————————
		static allowMemberClass		: (used in attach method).
			The allowed anchestor class of member.
			When null component is not allowed to have members.
	——————————————————————————————————————————————————————————————————————————*/
	static allowMemberClass = TComponent;
	/*——————————————————————————————————————————————————————————————————————————
		static allowMemberOverwrite	: (used in attach method).
			When the name of new member clashes	with an existing member name.
			true	:	Old member is destroyed first, new member is added.
			false	:	Raises exception.
	——————————————————————————————————————————————————————————————————————————*/
	static allowMemberOverwrite = true;

	static cdta = {
		name: {value:''},
		onAttach: {event: true},
		onDetach: {event: true},
		onLoadComplete: {event: true},
		onLanguageChange: {event: true}
	}

	_nam = '';		// name
	_own = null;	// owner
	_mem = {};		// members
	_eve = {};		// event handler links
	_hdt = [];		// event hook data

	/*——————————————————————————————————————————————————————————————————————————
	  CTOR: constructor.
	  TASK: Constructs a TComponent object, attaches it to its owner if any.
	  ARGS: 
		name 	: string	: Name of new component :DEF: null.
							  if Sys.LOAD construction is by deserialization.
		owner	: TComponent	: Owner of the new component if any :DEF: null.
		data	: Object	: An object containing instance data:DEF: null.
	——————————————————————————————————————————————————————————————————————————*/
	constructor(name = null, owner = null, data = null) {
		if (name === sys.LOAD && super(sys.LOAD))
			return;
		super();
		if (name)
			this.name = name;
		if (is.component(owner)) 
			owner.attach(this);
		if (data)
			sys.propSet(data);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  DTOR: destroy.
	  TASK: Destroys the component.
	  INFO: Detaches events, owner and all members. Destroys all members.
	——————————————————————————————————————————————————————————————————————————*/
	destroy() {
	var k;
	
		if(!this._sta)						// already dead
			return;
		if (this._own)						// detach from owner
			this._own.detach(this);
		for(k in this._hdt)					// unhook incoming events
			this._hdt[k].destroy();
		for(k in this._eve)					// unhook outgoing events
			this.setEvent(k, null);
		for(k in this._mem)					// destroy members
			this._mem[k].destroy();
		this._hdt = null;
		this._eve = null;
		this._mem = null;
		super.destroy();					// inherited destroy
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: autoname.
	  TASK: Generates and assigns a name for component automatically.
	  ARGS:
		ownerCandidate : TComponent : Owner candidate of the component.
	  INFO:
		Without owner candidate, name can not be computed.
	——————————————————————————————————————————————————————————————————————————*/
	autoname(ownerCandidate = null) {
		var i = 1,
			n;

		if (!ownerCandidate)
			return;
		n = this.class.name.toLowerCase();
		while(true) {
			if (!ownerCandidate[ n + i ]) {
				this.name = n + i;
				return;
			}
			i++;
		}
	}

	/*——————————————————————————————————————————————————————————————————————————
		Member subsystem
		
		Member subsystem introduces owner dependant components.
		Member components are like dynamic variables with five exceptions;

		1)	Member components are owned.
			They are destroyed if owner gets destroyed.
		2)	They can not be assigned or removed directly. 
			This should be done via attach and detach methods.
		3)	They should be TComponent or descendant class instances.
		4)	Member chain is strictly hierarchical. 
			An owner be a member in one of the components in its member chain.
		5)	Members are accessed by their names. 
			Member names should be identifiers.
			A getter for this.memberName is defined.
	——————————————————————————————————————————————————————————————————————————*/
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC:	attach
	  TASK:	Attaches a member component to the component.
	  ARGS:
		component	: TComponent	: new member component.
	  RETV: 		: Boolean	: True on success
	  INFO:	
		Member components are added to _mem object and a getter
		is constructed for the this.<memberName> getting member component.
		onAttach event is dispatched after attachment.

		static allowMemberClass		:
			The allowed anchestor class of member.
			When null, component is not allowed have members.
		static allowMemberOverwrite	:	
			When the name of new member clashes	with an existing member name.
			true	:	Old member is destroyed first, new member is added.
			false	:	Raises exception.
	——————————————————————————————————————————————————————————————————————————*/
	attach(component = null) {
	var allow = this.class.allowMemberClass,
		write = this.class.allowMemberOverwrite,
		event = this.onAttach,
		c = component,
		o,
		n;
		
		this.checkDead();
		if (!c)
			exc('E_MEM_NULL', 'component');
		if (!allow)
			exc('E_MEM_NOT_ALLOWED', this.class.name);
		if (!(c instanceof allow))			// if c is not permitted
			exc('E_MEM_RESTRICTED', 'component: ! '+ allow.class.name);
		if (c._own === this)				// if already attached to this
			return(false);
		o = this;
		while(o) {							// test if biting own tail
			if (c === o)
				exc('E_MEM_RING', this.namePath +"<-"+ c._nam);
			o = o._own;
		}
		if (!c._nam)						// If component is not named.
			c.autoname(this);				// give it a name.
		n = c._nam;							// get name
		if (write && this._mem[n])			// if overwritable and has member
			this._mem[n].destroy();			// destroy old member
		if (n in this)						// If has element with same name
			exc('E_MEM_NAME', n);
		if (c._own)							// If has an owner.
			c._own.detach(c);				// detach from it.
		c._own = this;
		this._mem[n] = c;
		Object.defineProperty( this, n, {
				get:function(){return(this._mem[n]);},
				enumerable: false,
				configurable: true			// deletable.
			}
		);
		c.doAttached();						// Inform component.
		if (event)
			event.dispatch([this, c]);
		return(true);
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC:	detach
	  TASK:	Detaches a member component from the component.
	  ARGS:	
	  	component	: TComponent : member component to detach.
		kill		: Boolean	 : When true, detached component gets destroyed.
								   :DEF: false.
	  RETV: 		: Boolean	 : True on success
	——————————————————————————————————————————————————————————————————————————*/
	detach(component = null, kill = false) {
	var c = component,
		event = this._eve.onDetach;
		
		this.checkDead();
		if (!(c instanceof TComponent))		// if not a component exception
			exc('E_ARG_INV','component');
		if (c._own !== this)				// if barking at the wrong tree
			return false;
		if (event)							// dispatch if event exists
			event.dispatch([this, c]);
		c._own = null;						// detach member.
		delete this[c._nam];				// delete getter.
		delete this._mem[c._nam];			// remove.
		c.doDetached(this);					// Inform component.
		if (kill)							// If kill required do it.
			c.destroy();
		return true;
	}

	/*———————————————————————————————————————————————————————————————————————————
	  FUNC:	doAttached.
	  TASK:	Method to override to handle when "this" is attached to an owner.
	———————————————————————————————————————————————————————————————————————————*/
	doAttached() {}

	/*———————————————————————————————————————————————————————————————————————————
	  FUNC:	doDetached.
	  TASK:	Method to override to handle when "this" is detached from an owner.
	  ARGS:
	  	exOwner	: TComponent : owner that "this" is detached from. :DEF: null
	———————————————————————————————————————————————————————————————————————————*/
	doDetached(exOwner = null) {}

	/*———————————————————————————————————————————————————————————————————————————
	  FUNC:	members
	  TASK:	Returns an array filled with member components.
	  ARGS:
	  	ofClass	: Object : class filter (ctor) 	:DEF: TComponent.
		filter	: Object : key-value filter  	:DEF: null.
	  RETV:		: Array  : member components.
	  INFO: 
	  	This is a shallow copy of members and any manipulation on array
		has no effect on members.
	———————————————————————————————————————————————————————————————————————————*/
	members(ofClass = TComponent, filter = null) {
	var r = [],
		nam,
		itm;	

		function collect(mem){
			if (!(mem instanceof ofClass))	// if class is not ok
				return;
			for(itm in filter) {
				if (filter[itm] !== mem[itm])
					return;
			}
			r.push(mem);
		}
	
		this.checkDead();
		if(!ofClass)						// check class filter
			ofClass = TComponent;	
		for(nam in this._mem)				// look members
			collect(this._mem[nam]);		// collect if possible.
		return(r);
	}

	/*——————————————————————————————————————————————————————————————————————————
		Event subsystem
		
		WARNING: System automatically defines getters and setters for events.
		
		*	This subsystem adds event support to Tore Js components.
		*	Two main types of events are supported:
			1) Native Js events originating from any asset of the TComponent.
			2) Events originating from Components.
		*	The native events are translated to TComponent event subsystem.
		*	The TComponent events are not translated to native event flow.
		*	Event definitions are made in the class cdta.
		
			1)	TComponent events	: <eventName>: {event: true}
				Example: onAttachMember : {event: true},
			2)	Native events		: <eventName>: {
										event: true, 
										typ: <native event type name>, 
										src: <source object name>
									}
				Example: onOpen	: {event: true, typ:'open', src:'loader'}.
		*	Using events is straightforward: 
			To attach an event c1.onOpen to function c2.handler : 
				c1.onOpen = new TEventHandler(c2,'handler');	
			To detach that event: 
				c1.onOpen = null;
		*	Events are designed carefully to avoid memory leaks. 
			An event connection is monitored by both source and target sides.
			If one side gets destroyed the event connection is destroyed, 
			this is done by hook subsystem automatically.
	——————————————————————————————————————————————————————————————————————————*/

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC: setEvent
	  TASK:	Event assignment procedure.
	  ARGS:	
		name	: String		: name of the event.
		handler	: TEventHandler	: Event handler target object.
	  INFO:
		* This checks the event and the handler then assigns them.
		* This method is used internally, direct calls are unnecessary.
	——————————————————————————————————————————————————————————————————————————*/
	setEvent(name = null, handler = null){
	var h = this._eve[name],
		d = this.constructor.cdta[name],
		hndNul = (handler === null),
		hndIns = (handler instanceof TEventHandler);

		this.checkDead();
		if (!d || !d.event)					// if not an event, exception
			exc('E_EVENT_INV', name);
		if (!hndNul && h && h === handler)	// Same?.
			return;
		if (!(hndNul || hndIns))			// Valid parameter?
			exc('E_EVENT_ARG', "handler");
		if (h)								// if assigned, clear
			h.destroy();
		if (hndNul)							// if handler null,
			return;							// we just clear.
		if (handler.source) 				// if handler is in use, clone it.
			handler = new TEventHandler(handler.target, handler.method); 
		handler.assign(this, name);
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROC: getEvent
	  TASK:	Returns the event handler assigned to an event if any.
	  ARGS:	
		name	: String		: name of the event.
	  RETV: 	: TEventHandler	: event handler object or null.
	——————————————————————————————————————————————————————————————————————————*/
	getEvent(name = null) {
		var r;
		if (typeof name !== 'string')
			return null;
		r = this._eve[name];
		return (r) ? r : null;
	}

	/*———————————————————————————————————————————————————————————————————————————
	  FUNC:	saveState 
	  TASK:	Saves published and dynamic properties to a generic object.
	  RETV:		: Object 
	  INFO:	Published properties with the default values are not saved.
			Dynamic properties are saved without such optimization.
			result data is:
			{
				p: {published properties with non default values and 
					dynamic variables},
				m: {members},
				e: {events}
			}
	———————————————————————————————————————————————————————————————————————————*/
	saveState() {
	var r = super.saveState(); 	// call inherited
		
		r['m'] = this._mem;
		r['e'] = this._eve;
		return(r);
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC:	doLoadComplete
	  TASK:	Signals component that loading (deserialization) is complete.
	——————————————————————————————————————————————————————————————————————————*/
	doLoadComplete() {
	var d = this.onLoadComplete;
		
		if (d)
			d.dispatch([this]);
		super.doLoadComplete();
	}
	
	/*——————————————————————————————————————————————————————————————————————————
	  FUNC:	doLanguageChange
	  TASK:	Signals component that language has changed.
	——————————————————————————————————————————————————————————————————————————*/
	doLanguageChange() {
	var event = this.onLanguageChange,
		n;

		if (event)
			event.dispatch([this]);
		for(n in this._mem)					// propagate to members
			this._mem[n].doLanguageChange();
	}

	/*——————————————————————————————————————————————————————————————————————————
	  FUNC:	doResourcelinkRemoved
	  TASK:	Signals component that a resource with name is no more linked.
	  ARGS:	name : string	: resource name.
	  INFO: This is to be overridden.
	——————————————————————————————————————————————————————————————————————————*/
	doResourceLinkRemoved(name = null) {
		
	}

	/*——————————————————————————————————————————————————————————————————————————
	  PROP:	name : String;
	  GET : Returns component name.
	  SET : Checks name validity, then sets the name of the component.
	——————————————————————————————————————————————————————————————————————————*/
	get name() {
		return(this._nam);
	}
		
	set name(val) {
		if (val == this._nam)
			return;
		if (!is.ident(val))
			exc('E_NAME_SYNTAX', val);
		if (this._own){
			if (val in this._own)
				exc('E_NAME_CLASH', this.own.name + "." + val);
			delete this._own[this._nam];
			delete this._own._mem[this._nam];
			this._own._mem[val] = this;
			Object.defineProperty( this, val, {
					get:function(){return(this._mem[val]);},
					enumerable: false,
					configurable: true			// deletable.
				}
			);
		}
		this._nam = val;
	}

	/*————————————————————————————————————————————————————————————————————————————
	  PROP:	namePath : String 
	  GET : Returns the global component name path string.
	————————————————————————————————————————————————————————————————————————————*/
	get namePath(){
		return((this._own ? this._own.namePath + '.' : '') + this._nam);
	}
	/*————————————————————————————————————————————————————————————————————————————
	  PROP: owner
	  GET : Get owner of the component.
	 ———————————————————————————————————————————————————————————————————————————*/
	get owner(){
		return(this._own);
	}
}
